<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRegistrationStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = $request->user();

            // Check if user's registration status is pending
            if ($user->registration_status === 'pending') {
                auth()->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->with('error', '您的账号正在审核中，暂时无法登录');
            }

            // Check if user's registration status is rejected
            if ($user->registration_status === 'rejected') {
                auth()->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->with('error', '您的账号审核未通过，无法登录。原因：'.$user->rejection_reason);
            }
        }

        return $next($request);
    }
}
