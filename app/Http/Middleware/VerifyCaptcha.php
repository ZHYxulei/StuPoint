<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\Captcha\CaptchaManager;

class VerifyCaptcha
{
    public function handle(Request $request, Closure $next)
    {
        // Skip captcha in testing / log mode
        $provider = \App\Models\Setting::get('captcha_provider', 'log');
        if ($provider === 'log') {
            return $next($request);
        }

        $token = $request->input('captcha_token') ?? $request->header('X-Captcha-Token');

        if (! $token) {
            return response()->json(['success' => false, 'message' => '请完成人机验证'], 422);
        }

        $manager = app(CaptchaManager::class);
        if (! $manager->verify($token, $request->ip())) {
            return response()->json(['success' => false, 'message' => '人机验证失败，请重试'], 422);
        }

        return $next($request);
    }
}
