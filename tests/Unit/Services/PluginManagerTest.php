<?php

use App\Models\Plugin as PluginRecord;
use App\Services\PluginManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->pluginManager = app(PluginManager::class);
    $this->createdPluginDirectories = [];

    $this->createRuntimePlugin = function (string $slug): string {
        $directoryName = str_replace('_', '', ucwords($slug, '_'));
        $className = $directoryName.'Plugin';
        $directory = base_path("plugins/{$directoryName}");

        File::ensureDirectoryExists($directory);

        $pluginClass = str_replace(
            ['{{NAMESPACE}}', '{{CLASS}}', '{{DIRECTORY_NAME}}', '{{SLUG}}'],
            [$directoryName, $className, $directoryName, $slug],
            <<<'PHP'
<?php

namespace Plugins\{{NAMESPACE}};

use App\Services\PluginManager;
use Plugins\Plugin;

class {{CLASS}} extends Plugin
{
    public static int $instantiations = 0;

    public static int $boots = 0;

    public function __construct()
    {
        self::$instantiations++;
    }

    public function getName(): string
    {
        return '{{DIRECTORY_NAME}}';
    }

    public function getVersion(): string
    {
        return '1.0.0';
    }

    public function getSlug(): string
    {
        return '{{SLUG}}';
    }

    public function boot(PluginManager $manager): void
    {
        self::$boots++;
    }
}
PHP
        );

        File::put("{$directory}/{$className}.php", $pluginClass);
        File::put("{$directory}/manifest.json", json_encode([
            'name' => $directoryName,
            'slug' => $slug,
            'version' => '1.0.0',
            'class' => $className,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        $this->createdPluginDirectories[] = $directory;

        return "Plugins\\{$directoryName}\\{$className}";
    };
});

afterEach(function () {
    foreach ($this->createdPluginDirectories as $directory) {
        File::deleteDirectory($directory);
    }
});

it('boots only enabled plugins from database records', function () {
    $installedSlug = 'installed_plugin_'.Str::lower(Str::random(8));
    $disabledSlug = 'disabled_plugin_'.Str::lower(Str::random(8));
    $enabledSlug = 'enabled_plugin_'.Str::lower(Str::random(8));

    $installedClass = ($this->createRuntimePlugin)($installedSlug);
    $disabledClass = ($this->createRuntimePlugin)($disabledSlug);
    $enabledClass = ($this->createRuntimePlugin)($enabledSlug);

    PluginRecord::create([
        'name' => 'InstalledPlugin',
        'slug' => $installedSlug,
        'version' => '1.0.0',
        'status' => 'installed',
    ]);

    PluginRecord::create([
        'name' => 'DisabledPlugin',
        'slug' => $disabledSlug,
        'version' => '1.0.0',
        'status' => 'disabled',
    ]);

    PluginRecord::create([
        'name' => 'EnabledPlugin',
        'slug' => $enabledSlug,
        'version' => '1.0.0',
        'status' => 'enabled',
    ]);

    $this->pluginManager->bootEnabledPlugins();

    expect($installedClass::$instantiations)->toBe(0)
        ->and($installedClass::$boots)->toBe(0)
        ->and($disabledClass::$instantiations)->toBe(0)
        ->and($disabledClass::$boots)->toBe(0)
        ->and($enabledClass::$instantiations)->toBe(1)
        ->and($enabledClass::$boots)->toBe(1)
        ->and($this->pluginManager->getPlugins())->toHaveCount(1)
        ->and(get_class(array_values($this->pluginManager->getPlugins())[0]))->toBe($enabledClass);
});

it('skips enabled plugins whose runtime classes are unavailable', function () {
    PluginRecord::create([
        'name' => 'MissingRuntimePlugin',
        'slug' => 'missing_runtime_plugin',
        'version' => '1.0.0',
        'status' => 'enabled',
    ]);

    $this->pluginManager->bootEnabledPlugins();

    expect($this->pluginManager->getPlugins())->toBe([]);
});

it('returns empty enabled plugins when the plugins table is unavailable', function () {
    Schema::drop('plugins');

    expect($this->pluginManager->getEnabledPlugins())->toBeEmpty()
        ->and($this->pluginManager->getEnabledPluginSlugs())->toBe([]);
});
