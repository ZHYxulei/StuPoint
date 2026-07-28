# Plugin Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make plugin uploads inert and auditable, prevent archive traversal, and ensure only enabled, validated artifacts can enter the live runtime directory.

**Architecture:** Treat uploaded plugins as trusted-code deployment artifacts rather than content. Upload stores a validated archive and manifest snapshot without executing code; enable extracts the archived artifact into the PSR-4 live directory; disable/uninstall remove live code while preserving audit and rollback records. Runtime boot reads only enabled database records.

**Tech Stack:** Laravel 13, PHP 8.4, Eloquent, Filesystem, ZipArchive, Pest 4, existing `Plugins\` PSR-4 mapping.

---

## File Map

- Create `PluginArchiveInspector`, `PluginManifestValidator`, `PluginAuditService`, and `PluginLifecycleService`.
- Create `PluginOperationLog` model/table/factory.
- Extend `plugins` with manifest/artifact metadata.
- Refactor `PluginUploader` into a compatibility facade or remove its unsafe execution responsibilities.
- Refactor `PluginManager` to runtime enabled-only responsibilities.
- Refactor Provider/controller paths to avoid filesystem auto-registration and lifecycle hooks.
- Add unit/feature security tests using real ZIP files.

### Task 1: Prove Zip Slip and Execution Gaps

**Files:**
- Create: `tests/Unit/Services/PluginArchiveInspectorTest.php`
- Create: `tests/Unit/Services/PluginManifestValidatorTest.php`
- Create: `tests/Feature/AdminPluginLifecycleTest.php`

- [ ] **Step 1: Generate tests**

```bash
php artisan make:test --pest --unit Services/PluginArchiveInspectorTest --no-interaction
php artisan make:test --pest --unit Services/PluginManifestValidatorTest --no-interaction
php artisan make:test --pest AdminPluginLifecycleTest --no-interaction
```

- [ ] **Step 2: Add real ZIP test helpers**

In the inspector test file:

```php
function makePluginZip(array $entries, string $originalName = 'plugin.zip'): UploadedFile
{
    $zipPath = tempnam(sys_get_temp_dir(), 'plugin_zip_').'.zip';
    $zip = new ZipArchive();
    $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

    foreach ($entries as $entryName => $contents) {
        $zip->addFromString($entryName, $contents);
    }

    $zip->close();

    return new UploadedFile($zipPath, $originalName, 'application/zip', null, true);
}
```

Also add `validPluginManifest()` returning a manifest with `name`, `slug`, `version`, `description`, `authors`, `class`, and `directory`.

- [ ] **Step 3: Add traversal failing tests**

```php
it('rejects parent traversal archive entries', function () {
    $file = makePluginZip([
        '../escape.php' => '<?php',
        'DemoPlugin/manifest.json' => json_encode(validPluginManifest(), JSON_THROW_ON_ERROR),
    ]);

    expect(fn () => app(PluginArchiveInspector::class)->inspect($file))
        ->toThrow(RuntimeException::class);
});
```

Repeat for `plugin/../../escape.php`, `..\\..\\escape.php`, `/tmp/escape.php`, `C:/Windows/escape.php`, and `C:\\Windows\\escape.php`.

- [ ] **Step 4: Add non-execution feature assertions**

Use `Process::fake()` and `Artisan::spy()` around upload/enable/disable/uninstall requests. Assert no `composer require`, no `migrate`, and no plugin lifecycle hook is called.

- [ ] **Step 5: Run and confirm red**

```bash
php artisan test --compact tests/Unit/Services/PluginArchiveInspectorTest.php
php artisan test --compact tests/Feature/AdminPluginLifecycleTest.php
```

Expected: FAIL because safe services and inert lifecycle do not exist.

- [ ] **Step 6: Commit tests**

```bash
git add tests/Unit/Services/PluginArchiveInspectorTest.php tests/Unit/Services/PluginManifestValidatorTest.php tests/Feature/AdminPluginLifecycleTest.php
git commit -m "test: expose plugin archive and lifecycle risks"
```

### Task 2: Add Artifact and Audit Schema

**Files:**
- Create: `database/migrations/*_add_artifact_and_manifest_fields_to_plugins_table.php`
- Create: `database/migrations/*_create_plugin_operation_logs_table.php`
- Create: `app/Models/PluginOperationLog.php`
- Create: `database/factories/PluginFactory.php`
- Create: `database/factories/PluginOperationLogFactory.php`
- Modify: `app/Models/Plugin.php`

- [ ] **Step 1: Generate schema and models**

```bash
php artisan make:migration add_artifact_and_manifest_fields_to_plugins_table --table=plugins --no-interaction
php artisan make:model PluginOperationLog --factory --no-interaction
php artisan make:migration create_plugin_operation_logs_table --create=plugin_operation_logs --no-interaction
```

If `PluginFactory` is absent, create it with the model command/help-supported option.

- [ ] **Step 2: Extend plugins**

```php
Schema::table('plugins', function (Blueprint $table) {
    $table->string('directory')->nullable()->after('slug');
    $table->json('manifest')->nullable();
    $table->json('metadata')->nullable();
    $table->string('artifact_path')->nullable();
    $table->string('artifact_sha256', 64)->nullable();
    $table->string('disabled_archive_path')->nullable();
});
```

- [ ] **Step 3: Create operation log schema**

```php
Schema::create('plugin_operation_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('plugin_id')->nullable()->constrained()->nullOnDelete();
    $table->string('plugin_slug');
    $table->enum('operation', ['upload', 'enable', 'disable', 'uninstall', 'rollback']);
    $table->enum('status', ['started', 'succeeded', 'failed']);
    $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
    $table->string('artifact_path')->nullable();
    $table->string('artifact_sha256', 64)->nullable();
    $table->json('before_state')->nullable();
    $table->json('after_state')->nullable();
    $table->json('manifest_snapshot')->nullable();
    $table->text('error_message')->nullable();
    $table->timestamps();

    $table->index(['plugin_slug', 'created_at']);
    $table->index(['operation', 'status']);
});
```

- [ ] **Step 4: Update models**

Add fillable/casts for JSON fields and typed `operationLogs()`/`plugin()`/`actor()` relationships. Add `liveDirectoryName(): string` to `Plugin` returning the validated `directory` value.

- [ ] **Step 5: Run schema-focused tests**

```bash
php artisan test --compact --filter=Plugin
```

Expected: no migration/model errors; security tests remain red.

- [ ] **Step 6: Commit**

```bash
git add app/Models/Plugin.php app/Models/PluginOperationLog.php database/factories database/migrations
git commit -m "feat: add plugin artifacts and operation audit log"
```

### Task 3: Implement Safe Archive Inspection

**Files:**
- Create: `app/Services/PluginArchiveInspector.php`
- Create: `app/Services/PluginManifestValidator.php`
- Modify: tests from Task 1

- [ ] **Step 1: Generate classes**

```bash
php artisan make:class Services/PluginArchiveInspector --no-interaction
php artisan make:class Services/PluginManifestValidator --no-interaction
```

- [ ] **Step 2: Implement path normalization and rejection**

`PluginArchiveInspector` public contract:

```php
/**
 * @return array{
 *   temporary_archive_path: string,
 *   sha256: string,
 *   root_directory: string,
 *   manifest: array<string, mixed>,
 *   entries: array<int, string>
 * }
 */
public function inspect(UploadedFile $file): array
```

For each ZIP entry:

```php
private function assertSafeEntryName(string $entryName): void
{
    if (str_contains($entryName, "\0")) {
        throw new RuntimeException('ZIP 文件包含非法路径。');
    }

    $normalized = str_replace('\\', '/', $entryName);

    if (str_starts_with($normalized, '/')
        || preg_match('/^[A-Za-z]:\//', $normalized) === 1
        || in_array('..', explode('/', $normalized), true)) {
        throw new RuntimeException('ZIP 文件包含非法路径。');
    }
}
```

Do not call `extractTo()` during inspection.

- [ ] **Step 3: Detect one package root and read `manifest.json`**

Reject archives with files outside one root directory. Read exactly `{root}/manifest.json`; do not support `plugin.json` and `manifest.json` simultaneously.

- [ ] **Step 4: Implement manifest validation without code loading**

```php
/** @return array<string, mixed> */
public function validate(array $manifest): array
```

Validate required fields, slug format, semantic-ish version string, directory equality, relative class path/namespace syntax, and dependency arrays. Never use `class_exists`, reflection, `require`, or plugin instantiation.

- [ ] **Step 5: Run unit tests**

```bash
php artisan test --compact tests/Unit/Services/PluginArchiveInspectorTest.php
php artisan test --compact tests/Unit/Services/PluginManifestValidatorTest.php
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Services/PluginArchiveInspector.php app/Services/PluginManifestValidator.php tests/Unit/Services
git commit -m "feat: validate plugin archives without execution"
```

### Task 4: Make Upload Inert and Auditable

**Files:**
- Create: `app/Services/PluginAuditService.php`
- Create: `app/Services/PluginLifecycleService.php`
- Modify: `app/Services/PluginUploader.php`
- Modify: `app/Http/Controllers/Admin/PluginController.php`
- Modify: `tests/Feature/AdminPluginLifecycleTest.php`

- [ ] **Step 1: Generate services**

```bash
php artisan make:class Services/PluginAuditService --no-interaction
php artisan make:class Services/PluginLifecycleService --no-interaction
```

- [ ] **Step 2: Implement audit lifecycle**

```php
public function started(string $operation, ?Plugin $plugin, int $actorId, array $context = []): PluginOperationLog;
public function succeeded(PluginOperationLog $log, array $context = []): void;
public function failed(PluginOperationLog $log, Throwable $throwable, array $context = []): void;
```

Store a sanitized error class/message; never store archive secrets or plugin configuration values.

- [ ] **Step 3: Implement upload**

```php
public function upload(UploadedFile $file, int $actorId): Plugin
```

Flow:

1. `inspect()` and validate.
2. Store the original ZIP at `storage/app/plugins/artifacts/{slug}/{timestamp}-{sha256}.zip`.
3. Create/update a database record with status `disabled`, manifest snapshot, artifact path, and SHA-256.
4. Write successful audit log.
5. Do not extract into `base_path('plugins')`.
6. Do not run Composer, migrations, `class_exists`, or plugin hooks.

Wrap DB changes and archive cleanup in an exception-safe boundary.

- [ ] **Step 4: Replace controller upload path**

Validate the uploaded file using Laravel's fluent `File::types(['zip'])->max(...)`, authorize before service invocation, and return the response shape expected by the current frontend. Do not change UI in this plan.

- [ ] **Step 5: Remove unsafe upload responsibilities**

`PluginUploader` must no longer run migrations or code validation. Either delegate its public upload method to `PluginLifecycleService` for compatibility or remove callers after verifying references.

- [ ] **Step 6: Run upload feature tests**

```bash
php artisan test --compact --filter="uploads plugin zip"
php artisan test --compact --filter="never runs composer"
```

Expected: upload stores artifact/audit, creates no live directory, and executes no external commands or plugin code.

- [ ] **Step 7: Commit**

```bash
git add app/Services/PluginAuditService.php app/Services/PluginLifecycleService.php app/Services/PluginUploader.php app/Http/Controllers/Admin/PluginController.php tests/Feature/AdminPluginLifecycleTest.php
git commit -m "refactor: make plugin uploads inert and auditable"
```

### Task 5: Boot Enabled Plugins Only

**Files:**
- Modify: `app/Services/PluginManager.php`
- Modify: `app/Providers/PluginServiceProvider.php`
- Modify: `app/Http/Controllers/Admin/PluginController.php`
- Create: `tests/Unit/Services/PluginManagerTest.php`

- [ ] **Step 1: Generate manager tests**

```bash
php artisan make:test --pest --unit Services/PluginManagerTest --no-interaction
```

Add tests for enabled-only boot, missing live directory warning, manifest snapshot preference, and zero Composer/migration calls.

- [ ] **Step 2: Refocus `PluginManager`**

Public API:

```php
public function bootEnabledPlugins(): void;
public function loadPluginInstance(Plugin $plugin): ?object;
public function readManifest(string $slug): ?array;
public function getEnabledPlugins(): Collection;
public function getEnabledPluginSlugs(): array;
```

Remove or stop calling install/disable/uninstall methods that execute plugin hooks, Composer, or migrations.

- [ ] **Step 3: Refactor Provider**

```php
public function boot(PluginManager $pluginManager): void
{
    $pluginManager->bootEnabledPlugins();
}
```

Inside `bootEnabledPlugins`, query `Plugin::enabled()->get()`. Missing live files cause a warning and skip; they do not trigger auto-extraction.

- [ ] **Step 4: Remove index auto-registration**

`Admin\PluginController::index()` must read database records only. Delete filesystem scanning, manifest reading, class extraction, instantiation, and automatic `Plugin::create()` behavior.

- [ ] **Step 5: Run manager and feature tests**

```bash
php artisan test --compact tests/Unit/Services/PluginManagerTest.php
php artisan test --compact tests/Feature/AdminPluginLifecycleTest.php
```

Expected: PASS for enabled-only runtime assertions.

- [ ] **Step 6: Commit**

```bash
git add app/Services/PluginManager.php app/Providers/PluginServiceProvider.php app/Http/Controllers/Admin/PluginController.php tests/Unit/Services/PluginManagerTest.php
git commit -m "refactor: boot enabled plugins only"
```

### Task 6: Implement Enable and Disable Isolation

**Files:**
- Modify: `app/Services/PluginLifecycleService.php`
- Modify: `app/Http/Controllers/Admin/PluginController.php`
- Modify: `tests/Feature/AdminPluginLifecycleTest.php`

- [ ] **Step 1: Add failing tests**

Cover extraction from archive on enable, live directory removal on disable, enabled-dependent rejection, and no lifecycle-code execution.

- [ ] **Step 2: Implement safe extraction to a staging directory**

Never call `ZipArchive::extractTo()` on unverified entries. Iterate verified entries and write them beneath a freshly created staging directory, checking every final path. Atomically rename staging to `base_path('plugins/'.$plugin->liveDirectoryName())` only after all writes succeed.

- [ ] **Step 3: Implement enable**

```php
public function enable(Plugin $plugin, int $actorId): void
```

Check dependencies, extract artifact to live staging, atomically activate directory, update status to enabled, and audit. Do not instantiate the plugin in the admin request.

- [ ] **Step 4: Implement disable**

```php
public function disable(Plugin $plugin, int $actorId): void
```

Check no enabled dependents, move live directory to `storage/app/plugins/disabled/{slug}/{timestamp}`, set status disabled and `disabled_archive_path`, then audit.

- [ ] **Step 5: Update controller methods**

Authorize, resolve the Plugin model, invoke lifecycle service, and preserve current redirect/JSON contract.

- [ ] **Step 6: Run and commit**

```bash
php artisan test --compact tests/Feature/AdminPluginLifecycleTest.php
git add app/Services/PluginLifecycleService.php app/Http/Controllers/Admin/PluginController.php tests/Feature/AdminPluginLifecycleTest.php
git commit -m "feat: isolate plugin enable and disable flows"
```

### Task 7: Implement Guarded Uninstall and Rollback

**Files:**
- Modify: `app/Services/PluginLifecycleService.php`
- Modify: `app/Http/Controllers/Admin/PluginController.php`
- Modify: `routes/admin.php`
- Modify: `tests/Feature/AdminPluginLifecycleTest.php`

- [ ] **Step 1: Add failing uninstall tests**

Cover enabled dependents, assigned plugin-owned roles, `metadata.has_data`, archived code, retained logs, and rollback reconstruction.

- [ ] **Step 2: Implement uninstall guards**

```php
private function assertNoEnabledDependents(Plugin $plugin): void;
private function assertNoAssignedPluginRoles(Plugin $plugin): void;
```

Reject uninstall when an enabled plugin manifest depends on the target, when `Role::where('plugin_slug', $slug)->whereHas('users')` exists, or when `metadata['has_data'] === true`.

- [ ] **Step 3: Implement uninstall**

Move live/disabled code into `storage/app/plugins/uninstalled/{slug}/{timestamp}`, record audit snapshots, then delete the plugin record. Audit rows persist through nullable FK.

- [ ] **Step 4: Implement rollback**

```php
public function rollback(string $slug, int $actorId, ?int $operationLogId = null): Plugin
```

Select an eligible successful log, restore the plugin record/artifact, and optionally restore enabled state only when the log snapshot says enabled. Audit rollback itself.

- [ ] **Step 5: Add backend route**

```php
Route::post('/plugins/{slug}/rollback', [PluginController::class, 'rollback'])
    ->name('plugins.rollback');
```

No new UI is required in this backend plan.

- [ ] **Step 6: Run and commit**

```bash
php artisan test --compact tests/Feature/AdminPluginLifecycleTest.php
git add app/Services/PluginLifecycleService.php app/Http/Controllers/Admin/PluginController.php routes/admin.php tests/Feature/AdminPluginLifecycleTest.php
git commit -m "feat: add guarded plugin uninstall and rollback"
```

### Task 8: Final Plugin Security Verification

**Files:**
- No new files expected

- [ ] **Step 1: Prove external execution never occurs**

```bash
php artisan test --compact --filter="never runs composer or artisan migrate"
```

Expected: PASS.

- [ ] **Step 2: Run plugin suite**

```bash
php artisan test --compact tests/Unit/Services/PluginArchiveInspectorTest.php
php artisan test --compact tests/Unit/Services/PluginManifestValidatorTest.php
php artisan test --compact tests/Unit/Services/PluginManagerTest.php
php artisan test --compact tests/Feature/AdminPluginLifecycleTest.php
```

Expected: all pass.

- [ ] **Step 3: Inspect routes and format**

```bash
php artisan route:list --name=admin.plugins --except-vendor
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 4: Run full PHP suite**

```bash
php artisan test --compact
```

Expected: exit 0.
