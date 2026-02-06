<?php

namespace App\Services;

use App\Models\Plugin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use ZipArchive;

class PluginUploader
{
    protected string $pluginsPath;

    protected string $tempPath;

    public function __construct()
    {
        $this->pluginsPath = base_path('plugins');
        $this->tempPath = storage_path('app/temp/plugins');
    }

    /**
     * Upload and install a plugin from ZIP file.
     */
    public function upload(UploadedFile $file): array
    {
        // Validate file
        $this->validateFile($file);

        // Create temp directory if not exists
        if (! File::exists($this->tempPath)) {
            File::makeDirectory($this->tempPath, 0755, true);
        }

        // Generate unique temp directory
        $tempDir = $this->tempPath.'/'.Str::uuid();

        try {
            // Extract ZIP file
            $extractPath = $this->extractZip($file, $tempDir);

            // Parse plugin.json
            $config = $this->parsePluginConfig($extractPath);

            // Validate plugin config
            $this->validatePluginConfig($config);

            // Check dependencies
            $dependencyErrors = $this->checkDependencies($config['dependencies'] ?? []);
            if (! empty($dependencyErrors)) {
                throw new \Exception('依赖检查失败: '.implode(', ', $dependencyErrors));
            }

            // Check if plugin already exists
            $existingPlugin = Plugin::where('slug', $config['slug'])->first();
            if ($existingPlugin && $existingPlugin->isInstalled()) {
                throw new \Exception('插件已安装，请先卸载现有版本');
            }

            // Move plugin to destination
            $pluginPath = $this->pluginsPath.'/'.$config['name'];
            if (File::exists($pluginPath)) {
                File::deleteDirectory($pluginPath);
            }
            File::move($extractPath, $pluginPath);

            // Register plugin in database
            $plugin = $this->registerPlugin($config);

            // Run migrations if exists
            $this->runMigrations($plugin);

            // Clear temp directory
            File::deleteDirectory($tempDir);

            return [
                'success' => true,
                'plugin' => $plugin,
                'message' => '插件上传成功',
            ];
        } catch (\Exception $e) {
            // Clean up on error
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }

            throw $e;
        }
    }

    /**
     * Validate uploaded file.
     */
    protected function validateFile(UploadedFile $file): void
    {
        if (! $file->isValid()) {
            throw new \Exception('文件上传失败');
        }

        $extension = $file->getClientOriginalExtension();
        if ($extension !== 'zip') {
            throw new \Exception('只支持 ZIP 格式文件');
        }

        $maxSize = 50 * 1024 * 1024; // 50MB
        if ($file->getSize() > $maxSize) {
            throw new \Exception('文件大小不能超过 50MB');
        }
    }

    /**
     * Extract ZIP file.
     */
    protected function extractZip(UploadedFile $file, string $destination): string
    {
        $zip = new ZipArchive;
        $openResult = $zip->open($file->getRealPath());

        if ($openResult !== true) {
            throw new \Exception('无法打开 ZIP 文件');
        }

        // Extract to temp directory
        $zip->extractTo($destination);
        $zip->close();

        // Find the plugin root directory (first directory or current directory)
        $extractedContents = scandir($destination);
        $pluginRoot = $destination;

        // Skip . and ..
        $directories = array_filter($extractedContents, function ($item) {
            return $item !== '.' && $item !== '..' && is_dir($destination.'/'.$item);
        });

        // If there's only one directory, use it as plugin root
        if (count($directories) === 1) {
            $pluginRoot = $destination.'/'.reset($directories);
        }

        return $pluginRoot;
    }

    /**
     * Parse plugin.json configuration file.
     */
    protected function parsePluginConfig(string $pluginPath): array
    {
        $configFile = $pluginPath.'/plugin.json';

        if (! File::exists($configFile)) {
            throw new \Exception('缺少 plugin.json 配置文件');
        }

        $config = json_decode(File::get($configFile), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('plugin.json 格式错误: '.json_last_error_msg());
        }

        return $config;
    }

    /**
     * Validate plugin configuration.
     */
    protected function validatePluginConfig(array $config): void
    {
        $required = ['name', 'version', 'slug', 'description', 'author'];
        foreach ($required as $field) {
            if (empty($config[$field])) {
                throw new \Exception("缺少必需字段: {$field}");
            }
        }

        // Validate slug format
        if (! preg_match('/^[a-z0-9_-]+$/', $config['slug'])) {
            throw new \Exception('插件标识符只能包含小写字母、数字、下划线和连字符');
        }

        // Validate version
        if (! preg_match('/^\d+\.\d+\.\d+$/', $config['version'])) {
            throw new \Exception('版本号格式错误，应为 x.y.z 格式');
        }

        // Check if plugin main class exists
        $pluginClass = $config['class'] ?? null;
        if ($pluginClass && ! class_exists($pluginClass)) {
            throw new \Exception("插件主类 {$pluginClass} 不存在");
        }
    }

    /**
     * Check plugin dependencies.
     */
    protected function checkDependencies(array $dependencies): array
    {
        $errors = [];

        foreach ($dependencies as $dependency) {
            $slug = $dependency['slug'] ?? null;
            $version = $dependency['version'] ?? null;

            if (! $slug) {
                $errors[] = '依赖项缺少 slug';

                continue;
            }

            // Check if dependency is installed
            $installedPlugin = Plugin::where('slug', $slug)
                ->whereIn('status', ['installed', 'enabled', 'disabled'])
                ->first();

            if (! $installedPlugin) {
                $errors[] = "缺少依赖插件: {$slug}".($version ? " (版本 {$version})" : '');

                continue;
            }

            // Check version constraint if specified
            if ($version && ! $this->checkVersion($installedPlugin->version, $version)) {
                $errors[] = "依赖插件 {$slug} 版本不满足要求，需要 {$version}，当前 {$installedPlugin->version}";
            }

            // Check if dependency is enabled
            if (! $installedPlugin->isEnabled()) {
                $errors[] = "依赖插件 {$slug} 未启用";
            }
        }

        return $errors;
    }

    /**
     * Check if installed version satisfies version constraint.
     */
    protected function checkVersion(string $installed, string $constraint): bool
    {
        // Simple version comparison (can be enhanced with composer/semver)
        // Supports: >=1.0.0, ^1.0.0, ~1.0.0, 1.0.0

        if (str_starts_with($constraint, '>=')) {
            $required = substr($constraint, 2);

            return version_compare($installed, $required, '>=');
        }

        if (str_starts_with($constraint, '^')) {
            $required = substr($constraint, 1);
            $requiredParts = explode('.', $required);
            $installedParts = explode('.', $installed);

            // Caret version: ^1.2.3 means >=1.2.3 and <2.0.0
            return version_compare($installed, $required, '>=')
                && $installedParts[0] === $requiredParts[0];
        }

        if (str_starts_with($constraint, '~')) {
            $required = substr($constraint, 1);
            $requiredParts = explode('.', $required);
            $installedParts = explode('.', $installed);

            // Tilde version: ~1.2.3 means >=1.2.3 and <1.3.0
            return version_compare($installed, $required, '>=')
                && $installedParts[0] === $requiredParts[0]
                && $installedParts[1] === $requiredParts[1];
        }

        // Exact version match
        return version_compare($installed, $constraint, '=');
    }

    /**
     * Register plugin in database.
     */
    protected function registerPlugin(array $config): Plugin
    {
        return DB::transaction(function () use ($config) {
            return Plugin::updateOrCreate(
                ['slug' => $config['slug']],
                [
                    'name' => $config['name'],
                    'version' => $config['version'],
                    'description' => $config['description'],
                    'author' => $config['author'],
                    'status' => 'installed',
                    'dependencies' => $config['dependencies'] ?? [],
                    'config' => $config['config'] ?? [],
                    'installed_at' => now(),
                ]
            );
        });
    }

    /**
     * Run plugin migrations if exists.
     */
    protected function runMigrations(Plugin $plugin): void
    {
        $migrationPath = $this->pluginsPath.'/'.$plugin->name.'/database/migrations';

        if (File::exists($migrationPath) && count(File::files($migrationPath)) > 0) {
            // Run migrations for this plugin
            // This is a simplified version - in production you might want more sophisticated handling
            try {
                \Artisan::call('migrate', [
                    '--path' => 'app/Plugins/'.$plugin->name.'/database/migrations',
                    '--force' => true,
                ]);
            } catch (\Exception $e) {
                // Log error but don't fail the installation
                \Log::error("Plugin migration failed: {$e->getMessage()}");
            }
        }
    }

    /**
     * Uninstall a plugin.
     */
    public function uninstall(Plugin $plugin): void
    {
        DB::transaction(function () use ($plugin) {
            // Check for dependents
            $dependents = Plugin::whereJsonContains('dependencies', [
                ['slug' => $plugin->slug],
            ])->whereIn('status', ['installed', 'enabled', 'disabled'])->get();

            if ($dependents->count() > 0) {
                $names = $dependents->pluck('name')->implode(', ');
                throw new \Exception("无法卸载：以下插件依赖此插件: {$names}");
            }

            // Delete plugin directory
            $pluginPath = $this->pluginsPath.'/'.$plugin->name;
            if (File::exists($pluginPath)) {
                File::deleteDirectory($pluginPath);
            }

            // Delete from database
            $plugin->delete();
        });
    }
}
