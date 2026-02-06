<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InstallationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip installation middleware if already on install route
        $isInstallRoute = str_starts_with($request->path(), 'install');
        if ($isInstallRoute) {
            return $next($request);
        }

        $isInstalled = $this->isInstalled();

        // If not installed and not on install route, redirect to install wizard
        if (! $isInstalled && ! $isInstallRoute) {
            return redirect()->route('install.welcome');
        }

        // If installed and on install route, redirect to home (already handled above)
        // This is kept for safety if somehow we get here
        if ($isInstalled && $isInstallRoute) {
            return redirect()->route('home');
        }

        return $next($request);
    }

    /**
     * Check if the system is already installed.
     */
    protected function isInstalled(): bool
    {
        return file_exists(storage_path('installed'));
    }
}
