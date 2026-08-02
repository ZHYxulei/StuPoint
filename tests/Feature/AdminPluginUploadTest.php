<?php

use App\Models\Plugin;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    File::deleteDirectory(storage_path('app/plugins/packages'));
    File::deleteDirectory(storage_path('app/temp/plugins'));
    File::deleteDirectory(base_path('plugins/evil-plugin'));
    @unlink(storage_path('framework/testing/plugin-index-marker.txt'));
    @unlink(storage_path('framework/testing/plugin-install-marker.txt'));
});

afterEach(function () {
    File::deleteDirectory(storage_path('app/plugins/packages'));
    File::deleteDirectory(storage_path('app/temp/plugins'));
    File::deleteDirectory(base_path('plugins/evil-plugin'));
    @unlink(storage_path('framework/testing/plugin-index-marker.txt'));
    @unlink(storage_path('framework/testing/plugin-install-marker.txt'));
});

function adminUser(): User
{
    $role = Role::firstOrCreate(
        ['slug' => 'admin'],
        [
            'name' => 'Admin',
            'description' => 'Admin',
            'is_system' => false,
            'level' => 90,
        ],
    );

    $user = User::factory()->approved()->create();
    $user->assignRole($role);

    return $user;
}

function validAdminPluginManifest(array $overrides = []): array
{
    return array_replace_recursive([
        'name' => 'Evil Plugin',
        'slug' => 'evil-plugin',
        'directory' => 'evil-plugin',
        'version' => '1.0.0',
        'description' => 'A plugin used for security tests',
        'authors' => [
            ['name' => 'Red Team'],
        ],
        'class' => 'EvilPlugin',
        'dependencies' => [
            'composer' => [],
            'plugins' => [],
        ],
    ], $overrides);
}

function makeAdminPluginZip(array $entries, string $originalName = 'plugin.zip'): UploadedFile
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

it('uploads plugin zips inertly and registers an installed plugin', function () {
    $user = adminUser();
    $marker = storage_path('framework/testing/plugin-install-marker.txt');
    @unlink($marker);

    Artisan::spy();

    $file = makeAdminPluginZip([
        'evil-plugin/manifest.json' => json_encode(validAdminPluginManifest(), JSON_THROW_ON_ERROR),
        'evil-plugin/EvilPlugin.php' => "<?php file_put_contents('".addslashes($marker)."', 'autoloaded'); class EvilPlugin { public function install(): void { file_put_contents('".addslashes($marker)."', 'installed'); } }",
        'evil-plugin/database/migrations/2026_01_01_000000_create_bad_table.php' => '<?php',
    ]);

    actingAs($user)
        ->from(route('admin.plugins.index'))
        ->post(route('admin.plugins.upload'), ['plugin' => $file])
        ->assertRedirect(route('admin.plugins.index'))
        ->assertSessionHas('success', '插件上传成功');

    $plugin = Plugin::where('slug', 'evil-plugin')->first();

    expect($plugin)->not->toBeNull()
        ->and($plugin?->status)->toBe('installed')
        ->and(File::exists(storage_path('app/plugins/packages/evil-plugin/manifest.json')))->toBeTrue()
        ->and(File::exists(storage_path('app/plugins/packages/evil-plugin/EvilPlugin.php')))->toBeTrue()
        ->and(File::exists(base_path('plugins/evil-plugin')))->toBeFalse()
        ->and(file_exists($marker))->toBeFalse()
        ->and(class_exists('EvilPlugin', false))->toBeFalse();

    Artisan::shouldNotHaveReceived('call', ['migrate', Mockery::any()]);
});

it('rejects invalid manifests from the admin upload route', function () {
    $user = adminUser();

    $file = makeAdminPluginZip([
        'evil-plugin/manifest.json' => json_encode(validAdminPluginManifest([
            'slug' => 'Invalid Slug',
            'directory' => 'evil-plugin',
        ]), JSON_THROW_ON_ERROR),
    ]);

    actingAs($user)
        ->from(route('admin.plugins.index'))
        ->post(route('admin.plugins.upload'), ['plugin' => $file])
        ->assertRedirect(route('admin.plugins.index'))
        ->assertSessionHas('error');

    expect(Plugin::where('slug', 'Invalid Slug')->exists())->toBeFalse()
        ->and(File::exists(storage_path('app/plugins/packages/Invalid Slug')))->toBeFalse();
});

it('does not auto register or execute filesystem plugins on the index page', function () {
    $user = adminUser();
    $marker = storage_path('framework/testing/plugin-index-marker.txt');
    @unlink($marker);

    File::ensureDirectoryExists(base_path('plugins/evil-plugin'));
    File::put(
        base_path('plugins/evil-plugin/manifest.json'),
        json_encode(validAdminPluginManifest(), JSON_THROW_ON_ERROR),
    );
    File::put(
        base_path('plugins/evil-plugin/EvilPlugin.php'),
        "<?php file_put_contents('".addslashes($marker)."', 'loaded'); class EvilPlugin {}",
    );

    actingAs($user)
        ->get(route('admin.plugins.index'))
        ->assertSuccessful();

    expect(Plugin::where('slug', 'evil-plugin')->exists())->toBeFalse()
        ->and(file_exists($marker))->toBeFalse()
        ->and(class_exists('EvilPlugin', false))->toBeFalse();
});

it('keeps install inert and does not run composer or plugin code', function () {
    $user = adminUser();
    $marker = storage_path('framework/testing/plugin-install-marker.txt');
    @unlink($marker);

    File::ensureDirectoryExists(storage_path('app/plugins/packages/evil-plugin'));
    File::put(
        storage_path('app/plugins/packages/evil-plugin/manifest.json'),
        json_encode(validAdminPluginManifest(), JSON_THROW_ON_ERROR),
    );
    File::put(
        storage_path('app/plugins/packages/evil-plugin/EvilPlugin.php'),
        "<?php file_put_contents('".addslashes($marker)."', 'loaded'); class EvilPlugin { public function install(): void { file_put_contents('".addslashes($marker)."', 'installed'); } }",
    );

    $plugin = Plugin::create([
        'name' => 'Evil Plugin',
        'slug' => 'evil-plugin',
        'version' => '1.0.0',
        'description' => 'A plugin used for security tests',
        'author' => 'Red Team',
        'status' => 'disabled',
        'dependencies' => ['composer' => [], 'plugins' => []],
        'config' => [],
        'installed_at' => now(),
    ]);

    Process::fake();
    Artisan::spy();

    actingAs($user)
        ->from(route('admin.plugins.index'))
        ->post(route('admin.plugins.install'), ['slug' => $plugin->slug])
        ->assertRedirect(route('admin.plugins.index'))
        ->assertSessionHas('success', '插件安装成功');

    $plugin->refresh();

    expect($plugin->status)->toBe('installed')
        ->and(file_exists($marker))->toBeFalse()
        ->and(class_exists('EvilPlugin', false))->toBeFalse();

    Process::assertNothingRan();
    Artisan::shouldNotHaveReceived('call', ['migrate', Mockery::any()]);
});
