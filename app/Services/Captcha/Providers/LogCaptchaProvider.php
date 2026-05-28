<?php

namespace App\Services\Captcha\Providers;

use App\Services\Captcha\Contracts\CaptchaProvider;

class LogCaptchaProvider implements CaptchaProvider
{
    public function verify(string $token, ?string $ip = null): bool
    {
        \Log::info("[CAPTCHA - Log] Token: {$token}, IP: {$ip}");

        return true;
    }

    public function getSiteKey(): string
    {
        return 'log-test-key';
    }

    public function getName(): string
    {
        return 'log';
    }
}
