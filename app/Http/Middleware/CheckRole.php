<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, '请先登录');
        }

        // Support multiple roles: middleware(['role:admin,principal'])
        $allRoles = [];
        foreach ($roles as $role) {
            $allRoles = array_merge($allRoles, explode(',', $role));
        }

        $hasRole = false;
        foreach ($allRoles as $role) {
            if ($user->hasRole(trim($role))) {
                $hasRole = true;
                break;
            }
        }

        if (! $hasRole) {
            abort(403, '权限不足');
        }

        return $next($request);
    }
}
