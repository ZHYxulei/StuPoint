<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class UseFileSessionDuringInstallation
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // Force file session driver during installation
        config(['session.driver' => 'file']);

        if ($request->is('install*')) {
            $databaseConfig = Arr::get($request->session()->get('install_config', []), 'database');

            if (is_array($databaseConfig) && isset($databaseConfig['connection'])) {
                $connection = $databaseConfig['connection'];

                Config::set('database.default', $connection);

                if ($connection === 'sqlite') {
                    Config::set('database.connections.sqlite.database', $databaseConfig['database'] ?? database_path('database.sqlite'));
                    DB::purge('sqlite');
                } else {
                    Config::set("database.connections.{$connection}.host", $databaseConfig['host'] ?? '127.0.0.1');
                    Config::set("database.connections.{$connection}.port", $databaseConfig['port'] ?? '3306');
                    Config::set("database.connections.{$connection}.database", $databaseConfig['database'] ?? '');
                    Config::set("database.connections.{$connection}.username", $databaseConfig['username'] ?? 'root');
                    Config::set("database.connections.{$connection}.password", $databaseConfig['password'] ?? '');
                    DB::purge($connection);
                }
            }
        }

        return $next($request);
    }
}
