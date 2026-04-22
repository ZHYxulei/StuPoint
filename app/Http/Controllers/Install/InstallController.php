<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules;

class InstallController extends Controller
{
    /**
     * Show welcome page.
     */
    public function welcome()
    {
        return inertia('install/welcome');
    }

    /**
     * Show language selection page.
     */
    public function language()
    {
        return inertia('install/language');
    }

    /**
     * Store selected language.
     */
    public function storeLanguage(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|in:zh,en,ja',
        ]);

        // Store locale in session
        session(['install_locale' => $validated['locale']]);

        return redirect()->route('install.check');
    }

    /**
     * Show environment check page.
     */
    public function check()
    {
        $locale = session('install_locale', 'zh');
        $requirements = $this->getRequirements();

        return inertia('install/check', [
            'locale' => $locale,
            'requirements' => $requirements,
        ]);
    }

    /**
     * Perform environment check.
     */
    public function checkEnvironment(Request $request)
    {
        $locale = $request->input('locale', 'zh');

        return response()->json([
            'requirements' => $this->getRequirements(),
        ]);
    }

    /**
     * Get system requirements for installation.
     */
    protected function getRequirements(): array
    {
        $requirements = [];

        // PHP Version
        $phpVersion = PHP_VERSION;
        $requirements[] = [
            'name' => 'PHP 版本',
            'required' => true,
            'condition' => '>= 8.2',
            'current' => $phpVersion,
            'status' => version_compare($phpVersion, '8.2', '>=') ? 'pass' : 'fail',
        ];

        // Required extensions
        $requiredExtensions = [
            'pdo' => 'PDO',
            'mbstring' => 'Mbstring',
            'xml' => 'XML',
            'ctype' => 'Ctype',
            'json' => 'JSON',
            'bcmath' => 'BCMath',
            'fileinfo' => 'FileInfo',
            'openssl' => 'OpenSSL',
            'tokenizer' => 'Tokenizer',
        ];

        foreach ($requiredExtensions as $ext => $name) {
            $loaded = extension_loaded($ext);
            $requirements[] = [
                'name' => $name,
                'required' => true,
                'condition' => '已启用',
                'current' => $loaded ? '已启用' : '未启用',
                'status' => $loaded ? 'pass' : 'fail',
            ];
        }

        // Optional database extensions
        $optionalExtensions = [
            'pdo_sqlite' => 'PDO SQLite',
            'pdo_mysql' => 'PDO MySQL',
            'pdo_pgsql' => 'PDO PostgreSQL',
        ];

        foreach ($optionalExtensions as $ext => $name) {
            $loaded = extension_loaded($ext);
            $requirements[] = [
                'name' => $name.' (可选)',
                'required' => false,
                'condition' => '已启用',
                'current' => $loaded ? '已启用' : '未启用',
                'status' => $loaded ? 'pass' : 'warning',
            ];
        }

        // Writable directories
        $directories = [
            'storage' => base_path('storage'),
            'bootstrap/cache' => base_path('bootstrap/cache'),
        ];

        foreach ($directories as $name => $path) {
            $writable = is_writable($path);
            $requirements[] = [
                'name' => $name.' 目录',
                'required' => true,
                'condition' => '可写',
                'current' => $writable ? '可写' : '不可写',
                'status' => $writable ? 'pass' : 'fail',
            ];
        }

        return $requirements;
    }

    /**
     * Show database configuration page.
     */
    public function database()
    {
        return inertia('install/database', [
            'form' => $this->getInstallDraft('database', [
                'connection' => 'sqlite',
                'host' => '127.0.0.1',
                'port' => '3306',
                'username' => 'root',
                'password' => '',
                'database' => 'database.sqlite',
            ]),
        ]);
    }

    /**
     * Store database configuration.
     */
    public function storeDatabase(Request $request)
    {
        $validated = $request->validate([
            'connection' => 'required|in:sqlite,mysql,pgsql',
            'host' => 'required_if:connection,mysql,pgsql',
            'port' => 'required_if:connection,mysql,pgsql',
            'database' => 'required',
            'username' => 'required_if:connection,mysql,pgsql',
            'password' => 'nullable',
        ]);

        $databaseDraft = [
            'connection' => $validated['connection'],
            'host' => $validated['host'] ?? '127.0.0.1',
            'port' => $validated['port'] ?? '3306',
            'database' => $validated['database'],
            'username' => $validated['username'] ?? 'root',
            'password' => $validated['password'] ?? '',
        ];

        // Validate the database connection now to avoid breaking later install steps.
        try {
            $connection = $databaseDraft['connection'];

            if ($connection !== 'sqlite') {
                Config::set("database.connections.{$connection}.host", $databaseDraft['host']);
                Config::set("database.connections.{$connection}.port", $databaseDraft['port']);
                Config::set("database.connections.{$connection}.database", $databaseDraft['database']);
                Config::set("database.connections.{$connection}.username", $databaseDraft['username']);
                Config::set("database.connections.{$connection}.password", $databaseDraft['password']);

                DB::purge($connection);
                DB::connection($connection)->getPdo();
            }
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['database' => '数据库连接失败，请检查用户名/密码/数据库名'])
                ->withInput();
        }

        $this->putInstallDraft('database', $databaseDraft);

        return redirect()->route('install.redis');
    }

    /**
     * Show Redis configuration page.
     */
    public function redis()
    {
        return inertia('install/redis', [
            'form' => $this->getInstallDraft('redis', [
                'enabled' => false,
                'host' => '127.0.0.1',
                'port' => '6379',
                'database' => '0',
                'password' => '',
            ]),
        ]);
    }

    /**
     * Store Redis configuration.
     */
    public function storeRedis(Request $request)
    {
        $enabled = $request->boolean('enabled');

        $validated = $request->validate([
            'host' => $enabled ? 'required' : 'nullable',
            'port' => $enabled ? 'required' : 'nullable',
            'password' => 'nullable',
            'database' => $enabled ? 'required|integer|min:0|max:15' : 'nullable|integer|min:0|max:15',
        ]);

        $redisDraft = [
            'enabled' => $enabled,
            'host' => $validated['host'] ?? '127.0.0.1',
            'port' => $validated['port'] ?? '6379',
            'password' => $validated['password'] ?? '',
            'database' => (string) ($validated['database'] ?? '0'),
        ];

        if ($redisDraft['enabled']) {
            try {
                $this->applyRedisConfig($redisDraft);
                app('redis')->connection('default')->ping();
            } catch (\Throwable $e) {
                return back()
                    ->withErrors(['redis' => 'Redis 连接失败，请检查主机/端口/密码/数据库'])
                    ->withInput();
            }
        }

        $this->putInstallDraft('redis', $redisDraft);

        return redirect()->route('install.cache');
    }

    /**
     * Show cache configuration page.
     */
    public function cache()
    {
        return inertia('install/cache', [
            'form' => $this->getInstallDraft('cache', [
                'driver' => 'file',
            ]),
        ]);
    }

    /**
     * Store cache configuration.
     */
    public function storeCache(Request $request)
    {
        $validated = $request->validate([
            'driver' => 'required|in:file,database,redis',
        ]);

        $cacheDraft = [
            'driver' => $validated['driver'],
        ];

        if ($validated['driver'] === 'redis') {
            $redisConfig = $this->getInstallDraft('redis');

            if (! is_array($redisConfig) || ! ($redisConfig['enabled'] ?? false)) {
                return back()->withErrors([
                    'driver' => '选择 Redis 缓存前，请先在上一步完成 Redis 配置并连接成功',
                ])->withInput();
            }

            try {
                $this->validateRedisConnection($redisConfig, 'cache');
            } catch (\Throwable $e) {
                return back()->withErrors([
                    'driver' => 'Redis 缓存连接失败，请返回上一步检查 Redis 配置',
                ])->withInput();
            }
        }

        $this->putInstallDraft('cache', $cacheDraft);

        return redirect()->route('install.site');
    }

    /**
     * Show site configuration page.
     */
    public function site()
    {
        return inertia('install/site', [
            'form' => $this->getInstallDraft('site', [
                'app_name' => '学生积分管理系统',
                'app_url' => config('app.url', 'http://localhost:8000'),
                'locale' => session('install_locale', 'zh'),
                'class_points_mode' => 'avg',
            ]),
        ]);
    }

    /**
     * Store site configuration.
     */
    public function storeSite(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'app_url' => 'required|url',
            'locale' => 'required|in:zh,en,ja',
            'class_points_mode' => 'required|in:avg,sum,separate',
        ]);

        $siteDraft = [
            'app_name' => $validated['app_name'],
            'app_url' => $validated['app_url'],
            'locale' => $validated['locale'],
            'class_points_mode' => $validated['class_points_mode'],
        ];

        $this->putInstallDraft('site', $siteDraft);
        session(['install_locale' => $validated['locale']]);

        return redirect()->route('install.account');
    }

    /**
     * Show admin account creation page.
     */
    public function account()
    {
        return inertia('install/account', [
            'siteConfig' => $this->getInstallDraft('site', []),
        ]);
    }

    /**
     * Create admin account and complete installation.
     */
    public function storeAccount(Request $request)
    {
        $installConfig = session('install_config', []);
        $databaseConfig = Arr::get($installConfig, 'database', []);
        $redisConfig = Arr::get($installConfig, 'redis', []);
        $cacheConfig = Arr::get($installConfig, 'cache', []);
        $siteConfig = Arr::get($installConfig, 'site', []);

        if (empty($databaseConfig) || empty($siteConfig) || empty($cacheConfig)) {
            return redirect()->route('install.database')
                ->withErrors(['install' => '安装配置不完整，请重新完成前面的步骤']);
        }

        $emailRules = ['required', 'string', 'email', 'max:255'];

        $validated = $request->validate([
            'nickname' => 'required|string|max:255',
            'email' => $emailRules,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'nickname.required' => '请输入昵称',
            'email.required' => '请输入邮箱地址',
            'email.email' => '请输入有效的邮箱地址',
            'email.unique' => '该邮箱已被使用',
            'password.required' => '请输入密码',
            'password.confirmed' => '两次输入的密码不一致',
        ]);

        try {
            $this->validateDatabaseDraft($databaseConfig);
            $this->validateRedisAndCacheDrafts($redisConfig, $cacheConfig);

            $this->updateEnvFile(array_merge(
                $this->buildDatabaseEnv($databaseConfig),
                $this->buildRedisEnv($redisConfig),
                $this->buildCacheEnv($cacheConfig),
                $this->buildSiteEnv($siteConfig),
            ));

            Artisan::call('config:clear');
            $this->applyDatabaseConfig($databaseConfig);

            if (! Schema::hasTable('users') || User::count() === 0) {
                Artisan::call('migrate', ['--force' => true]);
                Artisan::call('db:seed', ['--force' => true]);
            }

            if (Schema::hasTable('settings')) {
                Setting::set('class_points_mode', $siteConfig['class_points_mode'], 'string', 'site');
            }

            $emailRules = ['required', 'string', 'email', 'max:255'];
            if (Schema::hasTable('users')) {
                $emailRules[] = 'unique:users';
            }

            $validated = $request->validate([
                'nickname' => 'required|string|max:255',
                'email' => $emailRules,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ], [
                'nickname.required' => '请输入昵称',
                'email.required' => '请输入邮箱地址',
                'email.email' => '请输入有效的邮箱地址',
                'email.unique' => '该邮箱已被使用',
                'password.required' => '请输入密码',
                'password.confirmed' => '两次输入的密码不一致',
            ]);

            $user = User::create([
                'name' => $validated['nickname'],
                'nickname' => $validated['nickname'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
                'registration_status' => 'approved',
                'requires_review' => false,
            ]);

            $superAdminRole = Role::where('slug', 'super_admin')->first();
            if ($superAdminRole) {
                $user->roles()->attach($superAdminRole->id);
            }

            File::put(storage_path('installed'), date('Y-m-d H:i:s'));
            session()->forget('install_config');

            return redirect()->route('install.complete');
        } catch (\Throwable $e) {
            return back()->withErrors([
                'install' => '安装失败: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Show installation complete page.
     */
    public function complete()
    {
        return inertia('install/complete');
    }

    /**
     * Update .env file with given values.
     */
    protected function updateEnvFile(array $data): void
    {
        $envFile = base_path('.env');
        $envContent = File::get($envFile);

        foreach ($data as $key => $value) {
            $escapedKey = preg_quote($key, '/');
            $replacement = sprintf('%s="%s"', $key, addcslashes((string) $value, "\\\""));
            $pattern = '/^\s*#?\s*'.$escapedKey.'\s*=.*$/m';

            if (preg_match($pattern, $envContent) === 1) {
                $envContent = preg_replace($pattern, $replacement, $envContent, 1);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        File::put($envFile, rtrim($envContent)."\n");
    }

    protected function getInstallDraft(string $section, array $defaults = []): array
    {
        $draft = session('install_config', []);

        return array_merge($defaults, Arr::get($draft, $section, []));
    }

    protected function putInstallDraft(string $section, array $values): void
    {
        $draft = session('install_config', []);
        Arr::set($draft, $section, $values);
        session(['install_config' => $draft]);
    }

    protected function applyDatabaseConfig(array $databaseConfig): void
    {
        $connection = $databaseConfig['connection'];

        Config::set('database.default', $connection);

        if ($connection === 'sqlite') {
            Config::set('database.connections.sqlite.database', $databaseConfig['database']);
            DB::purge('sqlite');

            return;
        }

        Config::set("database.connections.{$connection}.host", $databaseConfig['host']);
        Config::set("database.connections.{$connection}.port", $databaseConfig['port']);
        Config::set("database.connections.{$connection}.database", $databaseConfig['database']);
        Config::set("database.connections.{$connection}.username", $databaseConfig['username']);
        Config::set("database.connections.{$connection}.password", $databaseConfig['password']);
        DB::purge($connection);
    }

    protected function applyRedisConfig(array $redisConfig): void
    {
        Config::set('database.redis.default.host', $redisConfig['host'] ?? '127.0.0.1');
        Config::set('database.redis.default.port', $redisConfig['port'] ?? '6379');
        Config::set('database.redis.default.password', $redisConfig['password'] ?? null);
        Config::set('database.redis.default.database', (string) ($redisConfig['database'] ?? '0'));
        Config::set('database.redis.cache.host', $redisConfig['host'] ?? '127.0.0.1');
        Config::set('database.redis.cache.port', $redisConfig['port'] ?? '6379');
        Config::set('database.redis.cache.password', $redisConfig['password'] ?? null);
        Config::set('database.redis.cache.database', (string) ($redisConfig['database'] ?? '0'));
        app('redis')->purge('default');
        app('redis')->purge('cache');
    }

    protected function validateDatabaseDraft(array $databaseConfig): void
    {
        $this->applyDatabaseConfig($databaseConfig);

        if ($databaseConfig['connection'] !== 'sqlite') {
            DB::connection($databaseConfig['connection'])->getPdo();
        }
    }

    protected function validateRedisConnection(array $redisConfig, string $connection = 'default'): void
    {
        if (! ($redisConfig['enabled'] ?? false)) {
            throw new \RuntimeException('Redis 未启用');
        }

        $this->applyRedisConfig($redisConfig);

        app('redis')->connection($connection)->ping();
    }

    protected function validateRedisAndCacheDrafts(array $redisConfig, array $cacheConfig): void
    {
        if (($cacheConfig['driver'] ?? 'file') !== 'redis') {
            return;
        }

        if (! ($redisConfig['enabled'] ?? false)) {
            throw new \RuntimeException('缓存选择了 Redis，但 Redis 配置未启用');
        }

        $this->validateRedisConnection($redisConfig, 'cache');
    }

    protected function buildDatabaseEnv(array $databaseConfig): array
    {
        return [
            'DB_CONNECTION' => $databaseConfig['connection'],
            'DB_HOST' => $databaseConfig['host'] ?? '127.0.0.1',
            'DB_PORT' => $databaseConfig['port'] ?? '3306',
            'DB_DATABASE' => $databaseConfig['database'],
            'DB_USERNAME' => $databaseConfig['username'] ?? 'root',
            'DB_PASSWORD' => $databaseConfig['password'] ?? '',
        ];
    }

    protected function buildRedisEnv(array $redisConfig): array
    {
        if (! ($redisConfig['enabled'] ?? false)) {
            return [
                'REDIS_HOST' => '127.0.0.1',
                'REDIS_PASSWORD' => 'null',
                'REDIS_PORT' => '6379',
                'REDIS_DB' => '0',
                'REDIS_CACHE_DB' => '0',
            ];
        }

        return [
            'REDIS_HOST' => $redisConfig['host'] ?? '127.0.0.1',
            'REDIS_PASSWORD' => $redisConfig['password'] !== '' ? $redisConfig['password'] : 'null',
            'REDIS_PORT' => $redisConfig['port'] ?? '6379',
            'REDIS_DB' => $redisConfig['database'] ?? '0',
            'REDIS_CACHE_DB' => $redisConfig['database'] ?? '0',
        ];
    }

    protected function buildCacheEnv(array $cacheConfig): array
    {
        return [
            'CACHE_STORE' => $cacheConfig['driver'] ?? 'file',
            'SESSION_DRIVER' => 'file',
            'QUEUE_CONNECTION' => 'database',
        ];
    }

    protected function buildSiteEnv(array $siteConfig): array
    {
        return [
            'APP_NAME' => $siteConfig['app_name'],
            'APP_URL' => $siteConfig['app_url'],
            'APP_LOCALE' => $siteConfig['locale'],
            'APP_FALLBACK_LOCALE' => $siteConfig['locale'],
        ];
    }
}
