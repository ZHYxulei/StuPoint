<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
            $dbConfig = $request->session()->get('install_db_config');

            if (is_array($dbConfig) && isset($dbConfig['connection'])) {
                $connection = $dbConfig['connection'];

                Config::set('database.default', $connection);
                Config::set("database.connections.{$connection}.host", $dbConfig['host'] ?? '127.0.0.1');
                Config::set("database.connections.{$connection}.port", $dbConfig['port'] ?? '3306');
                Config::set("database.connections.{$connection}.database", $dbConfig['database'] ?? '');
                Config::set("database.connections.{$connection}.username", $dbConfig['username'] ?? 'root');
                Config::set("database.connections.{$connection}.password", $dbConfig['password'] ?? '');

                DB::purge($connection);
            }
        }

        return $next($request);
    }
}
