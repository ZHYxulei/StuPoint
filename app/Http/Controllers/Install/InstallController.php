<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
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
        return inertia('install/database');
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

        $this->updateEnvFile([
            'DB_CONNECTION' => $validated['connection'],
            'DB_HOST' => $validated['host'] ?? '127.0.0.1',
            'DB_PORT' => $validated['port'] ?? '3306',
            'DB_DATABASE' => $validated['database'],
            'DB_USERNAME' => $validated['username'] ?? 'root',
            'DB_PASSWORD' => $validated['password'] ?? '',
        ]);

        session(['install_db_config' => [
            'connection' => $validated['connection'],
            'host' => $validated['host'] ?? '127.0.0.1',
            'port' => $validated['port'] ?? '3306',
            'database' => $validated['database'],
            'username' => $validated['username'] ?? 'root',
            'password' => $validated['password'] ?? '',
        ]]);

        // Ensure config cache is cleared so updated .env takes effect on next request.
        Artisan::call('config:clear');

        // Validate the database connection now to avoid breaking later install steps.
        try {
            $connection = $validated['connection'];

            if ($connection !== 'sqlite') {
                Config::set("database.connections.{$connection}.host", $validated['host'] ?? '127.0.0.1');
                Config::set("database.connections.{$connection}.port", $validated['port'] ?? '3306');
                Config::set("database.connections.{$connection}.database", $validated['database']);
                Config::set("database.connections.{$connection}.username", $validated['username'] ?? 'root');
                Config::set("database.connections.{$connection}.password", $validated['password'] ?? '');

                DB::purge($connection);
                DB::connection($connection)->getPdo();
            }
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['database' => '数据库连接失败，请检查用户名/密码/数据库名'])
                ->withInput();
        }

        return redirect()->route('install.redis');
    }

    /**
     * Show Redis configuration page.
     */
    public function redis()
    {
        return inertia('install/redis');
    }

    /**
     * Store Redis configuration.
     */
    public function storeRedis(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'host' => 'required_if:enabled,true',
            'port' => 'required_if:enabled,true',
            'password' => 'nullable',
            'database' => 'required_if:enabled,true|integer|min:0|max:15',
        ]);

        if ($validated['enabled']) {
            try {
                Config::set('database.redis.default.host', $validated['host'] ?? '127.0.0.1');
                Config::set('database.redis.default.port', $validated['port'] ?? '6379');
                Config::set('database.redis.default.password', $validated['password'] ?? null);
                Config::set('database.redis.default.database', (string) ($validated['database'] ?? '0'));
                Config::set('database.redis.cache.host', $validated['host'] ?? '127.0.0.1');
                Config::set('database.redis.cache.port', $validated['port'] ?? '6379');
                Config::set('database.redis.cache.password', $validated['password'] ?? null);
                Config::set('database.redis.cache.database', (string) ($validated['database'] ?? '0'));

                app('redis')->connection('default')->ping();
            } catch (\Throwable $e) {
                return back()
                    ->withErrors(['redis' => 'Redis 连接失败，请检查主机/端口/密码/数据库'])
                    ->withInput();
            }

            $this->updateEnvFile([
                'REDIS_HOST' => $validated['host'] ?? '127.0.0.1',
                'REDIS_PASSWORD' => $validated['password'] ?? 'null',
                'REDIS_PORT' => $validated['port'] ?? '6379',
                'REDIS_DB' => $validated['database'] ?? '0',
                'REDIS_CACHE_DB' => $validated['database'] ?? '0',
                'CACHE_STORE' => 'redis',
            ]);

            session(['install_redis_config' => [
                'enabled' => true,
                'host' => $validated['host'] ?? '127.0.0.1',
                'port' => $validated['port'] ?? '6379',
                'password' => $validated['password'] ?? null,
                'database' => $validated['database'] ?? '0',
            ]]);
        } else {
            session(['install_redis_config' => ['enabled' => false]]);
            $this->updateEnvFile([
                'CACHE_STORE' => 'file',
            ]);
        }

        return redirect()->route('install.cache');
    }

    /**
     * Show cache configuration page.
     */
    public function cache()
    {
        return inertia('install/cache');
    }

    /**
     * Store cache configuration.
     */
    public function storeCache(Request $request)
    {
        $validated = $request->validate([
            'driver' => 'required|in:file,database,redis',
        ]);

        if ($validated['driver'] === 'redis') {
            $redisConfig = session('install_redis_config');

            if (! is_array($redisConfig) || ! ($redisConfig['enabled'] ?? false)) {
                return back()->withErrors([
                    'driver' => '选择 Redis 缓存前，请先在上一步完成 Redis 配置并连接成功',
                ])->withInput();
            }

            try {
                Config::set('database.redis.cache.host', $redisConfig['host'] ?? '127.0.0.1');
                Config::set('database.redis.cache.port', $redisConfig['port'] ?? '6379');
                Config::set('database.redis.cache.password', $redisConfig['password'] ?? null);
                Config::set('database.redis.cache.database', (string) ($redisConfig['database'] ?? '0'));

                app('redis')->connection('cache')->ping();
            } catch (\Throwable $e) {
                return back()->withErrors([
                    'driver' => 'Redis 缓存连接失败，请返回上一步检查 Redis 配置',
                ])->withInput();
            }
        }

        $this->updateEnvFile([
            'CACHE_STORE' => $validated['driver'],
            'SESSION_DRIVER' => 'file',
            'QUEUE_CONNECTION' => 'database',
        ]);

        return redirect()->route('install.site');
    }

    /**
     * Show site configuration page.
     */
    public function site()
    {
        return inertia('install/site');
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

        $this->updateEnvFile([
            'APP_NAME' => $validated['app_name'],
            'APP_URL' => $validated['app_url'],
            'APP_LOCALE' => $validated['locale'],
            'APP_FALLBACK_LOCALE' => $validated['locale'],
        ]);

        // Store locale and site options in session for later steps.
        session([
            'install_locale' => $validated['locale'],
            'install_class_points_mode' => $validated['class_points_mode'],
        ]);

        return redirect()->route('install.account');
    }

    /**
     * Show admin account creation page.
     */
    public function account()
    {
        return inertia('install/account');
    }

    /**
     * Create admin account and complete installation.
     */
    public function storeAccount(Request $request)
    {
        $emailRules = ['required', 'string', 'email', 'max:255'];

        // Only check uniqueness if the users table exists
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

        try {
            // Only run migrations if tables don't exist yet
            if (! Schema::hasTable('users') || User::count() === 0) {
                // Run migrations
                Artisan::call('migrate', ['--force' => true]);

                // Run seeders to create roles and permissions
                Artisan::call('db:seed', ['--force' => true]);
            }

            // Persist site-level install options now that tables exist.
            $classPointsMode = session('install_class_points_mode');
            if ($classPointsMode && Schema::hasTable('settings')) {
                Setting::set('class_points_mode', $classPointsMode, 'string', 'site');
            }

            // Create admin user
            $user = User::create([
                'name' => $validated['nickname'],
                'nickname' => $validated['nickname'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);

            // Assign super admin role
            $superAdminRole = Role::where('slug', 'super_admin')->first();
            if ($superAdminRole) {
                $user->roles()->attach($superAdminRole->id);
            }

            // Create installed lock file
            File::put(storage_path('installed'), date('Y-m-d H:i:s'));

            return redirect()->route('install.complete');
        } catch (\Exception $e) {
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
            if (str_contains($envContent, "{$key}=")) {
                $envContent = preg_replace(
                    "/^{$key}=.*/m",
                    "{$key}=\"{$value}\"",
                    $envContent
                );
            } else {
                // Add the key if it doesn't exist
                $envContent .= "\n{$key}=\"{$value}\"";
            }
        }

        File::put($envFile, $envContent);
    }
}
