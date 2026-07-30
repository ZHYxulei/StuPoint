<?php

use App\Models\Plugin;
use App\Services\PluginUploader;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    File::deleteDirectory(storage_path('app/plugins/packages'));
    File::deleteDirectory(storage_path('app/temp/plugins'));
    File::deleteDirectory(base_path('plugins/demo-plugin'));
});

afterEach(function () {
    File::deleteDirectory(storage_path('app/plugins/packages'));
    File::deleteDirectory(storage_path('app/temp/plugins'));
    File::deleteDirectory(base_path('plugins/demo-plugin'));
});

function validPluginManifest(array $overrides = []): array
{
    return array_replace_recursive([
        'name' => 'Demo Plugin',
        'slug' => 'demo-plugin',
        'directory' => 'demo-plugin',
        'version' => '1.2.3',
        'description' => 'Safe demo plugin',
        'authors' => [
            ['name' => 'Security Team', 'email' => 'security@example.com'],
        ],
        'class' => 'DemoPlugin',
        'dependencies' => [
            'composer' => [],
            'plugins' => [],
        ],
    ], $overrides);
}

function makePluginZip(array $entries, string $originalName = 'plugin.zip'): UploadedFile
{
    $zipPath = tempnam(sys_get_temp_dir(), 'plugin_zip_');
    if ($zipPath === false) {
        throw new RuntimeException('Unable to create temporary ZIP path.');
    }

    $finalPath = $zipPath.'.zip';
    rename($zipPath, $finalPath);

    $zip = new ZipArchive;
    $openResult = $zip->open($finalPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    if ($openResult !== true) {
        throw new RuntimeException('Unable to open ZIP archive.');
    }

    foreach ($entries as $entryName => $contents) {
        $zip->addFromString($entryName, $contents);
    }

    $zip->close();

    return new UploadedFile($finalPath, $originalName, 'application/zip', null, true);
}

it('rejects traversal archive entries', function (string $entryName) {
    $file = makePluginZip([
        $entryName => '<?php',
        'demo-plugin/manifest.json' => json_encode(validPluginManifest(), JSON_THROW_ON_ERROR),
    ]);

    expect(fn () => app(PluginUploader::class)->upload($file))
        ->toThrow(RuntimeException::class, 'ZIP 文件包含非法路径');

    expect(Plugin::count())->toBe(0);
})->with([
    '../escape.php',
    'demo-plugin/../../escape.php',
    'demo-plugin\\..\\..\\escape.php',
    '/tmp/escape.php',
    'C:/Windows/escape.php',
    'C:\\Windows\\escape.php',
]);

it('rejects detectable symlink entries', function () {
    $zipPath = tempnam(sys_get_temp_dir(), 'plugin_zip_');
    if ($zipPath === false) {
        throw new RuntimeException('Unable to create temporary ZIP path.');
    }

    $finalPath = $zipPath.'.zip';
    rename($zipPath, $finalPath);

    $zip = new ZipArchive;
    $openResult = $zip->open($finalPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    if ($openResult !== true) {
        throw new RuntimeException('Unable to open ZIP archive.');
    }

    if (! method_exists($zip, 'setExternalAttributesName')) {
        $this->markTestSkipped('ZIP external attribute APIs are unavailable.');
    }

    $zip->addFromString('demo-plugin/manifest.json', json_encode(validPluginManifest(), JSON_THROW_ON_ERROR));
    $zip->addFromString('demo-plugin/link', '../outside');
    $zip->setExternalAttributesName('demo-plugin/link', ZipArchive::OPSYS_UNIX, 0120000 << 16);
    $zip->close();

    $file = new UploadedFile($finalPath, 'plugin.zip', 'application/zip', null, true);

    expect(fn () => app(PluginUploader::class)->upload($file))
        ->toThrow(RuntimeException::class, 'ZIP 文件包含符号链接');
});

it('rejects invalid manifest data without storing files', function () {
    $manifest = validPluginManifest([
        'slug' => 'Bad Slug',
        'directory' => 'bad-slug',
    ]);

    $file = makePluginZip([
        'demo-plugin/manifest.json' => json_encode($manifest, JSON_THROW_ON_ERROR),
    ]);

    expect(fn () => app(PluginUploader::class)->upload($file))
        ->toThrow(RuntimeException::class, '插件标识符格式无效');

    expect(File::exists(storage_path('app/plugins/packages/bad-slug')))->toBeFalse();
    expect(Plugin::count())->toBe(0);
});

it('stores a safe archive under the validated slug and registers it as installed', function () {
    $marker = storage_path('framework/testing/plugin-marker.txt');
    @unlink($marker);

    $file = makePluginZip([
        'demo-plugin/manifest.json' => json_encode(validPluginManifest(), JSON_THROW_ON_ERROR),
        'demo-plugin/DemoPlugin.php' => "<?php file_put_contents('".addslashes($marker)."', 'loaded'); class DemoPlugin {}",
    ]);

    $plugin = app(PluginUploader::class)->upload($file)['plugin'];

    $plugin->refresh();

    expect($plugin->slug)->toBe('demo-plugin')
        ->and($plugin->status)->toBe('installed')
        ->and($plugin->author)->toBe('Security Team')
        ->and(File::exists(storage_path('app/plugins/packages/demo-plugin/manifest.json')))->toBeTrue()
        ->and(File::exists(storage_path('app/plugins/packages/demo-plugin/DemoPlugin.php')))->toBeTrue()
        ->and(File::exists(base_path('plugins/demo-plugin')))->toBeFalse()
        ->and(file_exists($marker))->toBeFalse()
        ->and(class_exists('Plugins\\demo_plugin\\DemoPlugin', false))->toBeFalse()
        ->and(class_exists('DemoPlugin', false))->toBeFalse();
});
