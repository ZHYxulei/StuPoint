<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'You do not have the required permission.');
        }

        if ($permission === 'student_council' && $user->hasRole('student_council')) {
            return $next($request);
        }

        if (! $user->hasPermission($permission)) {
            abort(403, 'You do not have the required permission.');
        }

        return $next($request);
    }
}
