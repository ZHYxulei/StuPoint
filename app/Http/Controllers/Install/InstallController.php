<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
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
        ]);

        if ($validated['enabled']) {
            $this->updateEnvFile([
                'REDIS_HOST' => $validated['host'] ?? '127.0.0.1',
                'REDIS_PASSWORD' => $validated['password'] ?? 'null',
                'REDIS_PORT' => $validated['port'] ?? '6379',
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
        ]);

        $this->updateEnvFile([
            'APP_NAME' => $validated['app_name'],
            'APP_URL' => $validated['app_url'],
            'APP_LOCALE' => $validated['locale'],
            'APP_FALLBACK_LOCALE' => $validated['locale'],
        ]);

        // Store locale in session for admin creation
        session(['install_locale' => $validated['locale']]);

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
        $validated = $request->validate([
            'nickname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            // Run migrations
            Artisan::call('migrate', ['--force' => true]);

            // Run seeders to create roles and permissions
            Artisan::call('db:seed', ['--force' => true]);

            // Create admin user
            $user = User::create([
                'name' => $validated['nickname'],
                'nickname' => $validated['nickname'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);

            // Assign super admin role
            $superAdminRole = \App\Models\Role::where('slug', 'super_admin')->first();
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
