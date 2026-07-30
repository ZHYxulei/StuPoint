<?php

namespace App\Services;

use App\Models\Plugin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use RuntimeException;
use ZipArchive;

class PluginUploader
{
    protected string $packagesPath;

    protected string $tempPath;

    protected int $maxArchiveSize = 50 * 1024 * 1024;

    protected int $maxArchiveEntries = 500;

    protected int $maxUncompressedSize = 100 * 1024 * 1024;

    public function __construct()
    {
        $this->packagesPath = storage_path('app/plugins/packages');
        $this->tempPath = storage_path('app/temp/plugins');
    }

    /**
     * Upload and register a plugin from a ZIP file without executing plugin code.
     *
     * @return array{success: bool, plugin: Plugin, message: string}
     */
    public function upload(UploadedFile $file): array
    {
        $this->validateFile($file);
        $this->ensureDirectory($this->tempPath);
        $this->ensureDirectory($this->packagesPath);

        $tempDir = $this->tempPath.'/'.Str::uuid();
        $tempPackagePath = $tempDir.'/package';
        $finalPackagePath = null;

        try {
            $inspection = $this->inspectArchive($file);
            $manifest = $this->validateManifest($inspection['manifest']);
            $finalPackagePath = $this->packagePath($manifest['slug']);

            $existingPlugin = Plugin::where('slug', $manifest['slug'])->first();
            if ($existingPlugin && $existingPlugin->isInstalled()) {
                throw new RuntimeException('插件已安装，请先卸载现有版本');
            }

            if (File::exists($finalPackagePath)) {
                File::deleteDirectory($finalPackagePath);
            }

            $this->extractValidatedArchive($file, $inspection['root_directory'], $tempPackagePath);
            $this->ensureDirectory(dirname($finalPackagePath));

            if (! File::moveDirectory($tempPackagePath, $finalPackagePath)) {
                throw new RuntimeException('无法保存插件文件');
            }

            DB::beginTransaction();

            try {
                $plugin = $this->registerPlugin($manifest);
                DB::commit();
            } catch (\Throwable $throwable) {
                DB::rollBack();

                if ($finalPackagePath && File::exists($finalPackagePath)) {
                    File::deleteDirectory($finalPackagePath);
                }

                throw $throwable;
            }

            return [
                'success' => true,
                'plugin' => $plugin,
                'message' => '插件上传成功',
            ];
        } catch (\Throwable $throwable) {
            if ($finalPackagePath && File::exists($finalPackagePath)) {
                File::deleteDirectory($finalPackagePath);
            }

            throw $throwable;
        } finally {
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }
        }
    }

    public function hasStoredPackage(string $slug): bool
    {
        $manifestPath = $this->packagePath($slug).'/manifest.json';

        return File::exists($manifestPath);
    }

    public function packagePath(string $slug): string
    {
        return $this->packagesPath.'/'.$slug;
    }

    /**
     * @return array<string, mixed>
     */
    public function readStoredManifest(string $slug): ?array
    {
        $manifestPath = $this->packagePath($slug).'/manifest.json';

        if (! File::exists($manifestPath)) {
            return null;
        }

        $manifest = json_decode(File::get($manifestPath), true);

        if (! is_array($manifest)) {
            return null;
        }

        return $this->validateManifest($manifest);
    }

    protected function validateFile(UploadedFile $file): void
    {
        if (! $file->isValid()) {
            throw new RuntimeException('文件上传失败');
        }

        $extension = strtolower($file->getClientOriginalExtension());
        if ($extension !== 'zip') {
            throw new RuntimeException('只支持 ZIP 格式文件');
        }

        if (($file->getSize() ?? 0) > $this->maxArchiveSize) {
            throw new RuntimeException('文件大小不能超过 50MB');
        }
    }

    /**
     * @return array{root_directory: string, manifest: array<string, mixed>}
     */
    protected function inspectArchive(UploadedFile $file): array
    {
        $zip = new ZipArchive;
        $openResult = $zip->open($file->getRealPath());

        if ($openResult !== true) {
            throw new RuntimeException('无法打开 ZIP 文件');
        }

        try {
            if ($zip->numFiles < 1) {
                throw new RuntimeException('ZIP 文件不能为空');
            }

            if ($zip->numFiles > $this->maxArchiveEntries) {
                throw new RuntimeException('ZIP 文件内容过多');
            }

            $rootDirectory = null;
            $totalUncompressedSize = 0;

            for ($index = 0; $index < $zip->numFiles; $index++) {
                $stat = $zip->statIndex($index);
                if (! is_array($stat) || ! isset($stat['name'])) {
                    throw new RuntimeException('ZIP 文件结构无效');
                }

                $entryName = $this->normalizeEntryName($stat['name']);
                $this->assertSafeEntryName($entryName);
                $this->assertNotSymlink($zip, $index, $entryName);

                $trimmedEntry = trim($entryName, '/');
                if ($trimmedEntry === '') {
                    continue;
                }

                $segments = explode('/', $trimmedEntry);
                if (count($segments) < 2) {
                    throw new RuntimeException('ZIP 文件必须包含单一插件根目录');
                }

                $topLevelDirectory = $segments[0];
                if ($rootDirectory === null) {
                    $rootDirectory = $topLevelDirectory;
                } elseif ($rootDirectory !== $topLevelDirectory) {
                    throw new RuntimeException('ZIP 文件必须包含单一插件根目录');
                }

                if (! str_ends_with($entryName, '/')) {
                    $totalUncompressedSize += (int) ($stat['size'] ?? 0);
                    if ($totalUncompressedSize > $this->maxUncompressedSize) {
                        throw new RuntimeException('ZIP 文件解压后体积过大');
                    }
                }
            }

            if ($rootDirectory === null) {
                throw new RuntimeException('ZIP 文件必须包含单一插件根目录');
            }

            $manifestPath = $rootDirectory.'/manifest.json';
            $legacyManifestPath = $rootDirectory.'/plugin.json';

            if ($zip->locateName($manifestPath) === false) {
                throw new RuntimeException('缺少 manifest.json 配置文件');
            }

            if ($zip->locateName($legacyManifestPath) !== false) {
                throw new RuntimeException('只支持 manifest.json 配置文件');
            }

            $manifestContent = $zip->getFromName($manifestPath);
            if (! is_string($manifestContent)) {
                throw new RuntimeException('无法读取 manifest.json 配置文件');
            }

            $manifest = json_decode($manifestContent, true);
            if (! is_array($manifest)) {
                throw new RuntimeException('manifest.json 格式错误');
            }

            return [
                'root_directory' => $rootDirectory,
                'manifest' => $manifest,
            ];
        } finally {
            $zip->close();
        }
    }

    protected function extractValidatedArchive(UploadedFile $file, string $rootDirectory, string $destination): void
    {
        $zip = new ZipArchive;
        $openResult = $zip->open($file->getRealPath());

        if ($openResult !== true) {
            throw new RuntimeException('无法打开 ZIP 文件');
        }

        try {
            $this->ensureDirectory($destination);

            for ($index = 0; $index < $zip->numFiles; $index++) {
                $stat = $zip->statIndex($index);
                if (! is_array($stat) || ! isset($stat['name'])) {
                    throw new RuntimeException('ZIP 文件结构无效');
                }

                $entryName = $this->normalizeEntryName($stat['name']);
                $this->assertSafeEntryName($entryName);
                $this->assertNotSymlink($zip, $index, $entryName);

                $trimmedEntry = trim($entryName, '/');
                if ($trimmedEntry === '') {
                    continue;
                }

                if (! str_starts_with($trimmedEntry, $rootDirectory.'/')) {
                    throw new RuntimeException('ZIP 文件必须包含单一插件根目录');
                }

                $relativePath = substr($trimmedEntry, strlen($rootDirectory) + 1);
                if ($relativePath === false || $relativePath === '') {
                    continue;
                }

                $targetPath = $destination.'/'.$relativePath;
                $this->assertSafeTargetPath($destination, $targetPath);

                if (str_ends_with($entryName, '/')) {
                    $this->ensureDirectory($targetPath);

                    continue;
                }

                $contents = $zip->getFromIndex($index);
                if ($contents === false) {
                    throw new RuntimeException('无法提取 ZIP 文件内容');
                }

                $this->ensureDirectory(dirname($targetPath));
                file_put_contents($targetPath, $contents);
            }
        } finally {
            $zip->close();
        }
    }

    /**
     * @param  array<string, mixed>  $manifest
     * @return array<string, mixed>
     */
    protected function validateManifest(array $manifest): array
    {
        $name = trim((string) ($manifest['name'] ?? ''));
        $slug = trim((string) ($manifest['slug'] ?? ''));
        $version = trim((string) ($manifest['version'] ?? ''));
        $description = trim((string) ($manifest['description'] ?? ''));
        $class = trim((string) ($manifest['class'] ?? ''));
        $directory = trim((string) ($manifest['directory'] ?? $slug));

        if ($name === '' || $slug === '' || $version === '' || $description === '' || $class === '') {
            throw new RuntimeException('manifest.json 缺少必需字段');
        }

        if (! preg_match('/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/', $slug)) {
            throw new RuntimeException('插件标识符格式无效');
        }

        if (! preg_match('/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/', $version)) {
            throw new RuntimeException('版本号格式错误，应为 x.y.z 格式');
        }

        if (! preg_match('/^[A-Za-z_][A-Za-z0-9_\\\\]*$/', $class) || str_contains($class, '..') || str_starts_with($class, '\\')) {
            throw new RuntimeException('插件主类格式无效');
        }

        if ($directory === '' || ! preg_match('/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/', $directory)) {
            throw new RuntimeException('插件目录格式无效');
        }

        if ($directory !== $slug) {
            throw new RuntimeException('插件目录必须与 slug 一致');
        }

        $authors = $this->normalizeAuthors($manifest);
        $dependencies = $this->normalizeDependencies($manifest['dependencies'] ?? []);

        return [
            'name' => $name,
            'slug' => $slug,
            'version' => $version,
            'description' => $description,
            'class' => $class,
            'directory' => $directory,
            'authors' => $authors,
            'author' => implode(', ', array_column($authors, 'name')),
            'dependencies' => $dependencies,
        ];
    }

    /**
     * @param  array<string, mixed>  $manifest
     * @return array<int, array{name: string, email?: string}>
     */
    protected function normalizeAuthors(array $manifest): array
    {
        $authors = $manifest['authors'] ?? null;

        if (is_array($authors) && $authors !== []) {
            $normalizedAuthors = [];

            foreach ($authors as $author) {
                if (! is_array($author)) {
                    throw new RuntimeException('manifest.json 作者信息格式无效');
                }

                $authorName = trim((string) ($author['name'] ?? ''));
                if ($authorName === '') {
                    throw new RuntimeException('manifest.json 作者名称不能为空');
                }

                $normalizedAuthor = ['name' => $authorName];
                $authorEmail = trim((string) ($author['email'] ?? ''));
                if ($authorEmail !== '') {
                    $normalizedAuthor['email'] = $authorEmail;
                }

                $normalizedAuthors[] = $normalizedAuthor;
            }

            return $normalizedAuthors;
        }

        $legacyAuthor = trim((string) ($manifest['author'] ?? ''));
        if ($legacyAuthor !== '') {
            return [['name' => $legacyAuthor]];
        }

        throw new RuntimeException('manifest.json 缺少作者信息');
    }

    /**
     * @return array{composer: array<string, string>, plugins: array<int, string>}
     */
    protected function normalizeDependencies(mixed $dependencies): array
    {
        if ($dependencies === null) {
            return ['composer' => [], 'plugins' => []];
        }

        if (! is_array($dependencies)) {
            throw new RuntimeException('manifest.json 依赖格式无效');
        }

        $composerDependencies = $dependencies['composer'] ?? [];
        if (! is_array($composerDependencies)) {
            throw new RuntimeException('manifest.json composer 依赖格式无效');
        }

        foreach ($composerDependencies as $package => $constraint) {
            if (! is_string($package) || trim($package) === '' || ! is_string($constraint) || trim($constraint) === '') {
                throw new RuntimeException('manifest.json composer 依赖格式无效');
            }
        }

        $pluginDependencies = $dependencies['plugins'] ?? [];
        if (! is_array($pluginDependencies)) {
            throw new RuntimeException('manifest.json 插件依赖格式无效');
        }

        $normalizedPluginDependencies = [];
        foreach ($pluginDependencies as $pluginDependency) {
            if (! is_string($pluginDependency) || trim($pluginDependency) === '') {
                throw new RuntimeException('manifest.json 插件依赖格式无效');
            }

            $normalizedPluginDependencies[] = trim($pluginDependency);
        }

        return [
            'composer' => $composerDependencies,
            'plugins' => $normalizedPluginDependencies,
        ];
    }

    protected function registerPlugin(array $manifest): Plugin
    {
        return Plugin::updateOrCreate(
            ['slug' => $manifest['slug']],
            [
                'name' => $manifest['name'],
                'version' => $manifest['version'],
                'description' => $manifest['description'],
                'author' => $manifest['author'],
                'status' => 'installed',
                'dependencies' => $manifest['dependencies'],
                'config' => [],
                'installed_at' => now(),
            ]
        );
    }

    protected function normalizeEntryName(string $entryName): string
    {
        return str_replace('\\', '/', $entryName);
    }

    protected function assertSafeEntryName(string $entryName): void
    {
        if (str_contains($entryName, "\0")) {
            throw new RuntimeException('ZIP 文件包含非法路径');
        }

        if (str_starts_with($entryName, '/') || preg_match('/^[A-Za-z]:\//', $entryName) === 1) {
            throw new RuntimeException('ZIP 文件包含非法路径');
        }

        $segments = explode('/', trim($entryName, '/'));
        foreach ($segments as $segment) {
            if ($segment === '.' || $segment === '..') {
                throw new RuntimeException('ZIP 文件包含非法路径');
            }
        }
    }

    protected function assertNotSymlink(ZipArchive $zip, int $index, string $entryName): void
    {
        if (! method_exists($zip, 'getExternalAttributesIndex')) {
            return;
        }

        $operationsSystem = null;
        $attributes = null;

        if (! $zip->getExternalAttributesIndex($index, $operationsSystem, $attributes)) {
            return;
        }

        if ($operationsSystem !== ZipArchive::OPSYS_UNIX) {
            return;
        }

        $fileType = (($attributes ?? 0) >> 16) & 0170000;
        if ($fileType === 0120000) {
            throw new RuntimeException('ZIP 文件包含符号链接: '.$entryName);
        }
    }

    protected function assertSafeTargetPath(string $basePath, string $targetPath): void
    {
        $normalizedBasePath = str_replace('\\', '/', rtrim($basePath, '/\\'));
        $normalizedTargetPath = str_replace('\\', '/', $targetPath);

        if (! str_starts_with($normalizedTargetPath, $normalizedBasePath.'/')) {
            throw new RuntimeException('ZIP 文件包含非法路径');
        }
    }

    protected function ensureDirectory(string $path): void
    {
        if (File::exists($path)) {
            return;
        }

        File::makeDirectory($path, 0755, true);
    }
}
