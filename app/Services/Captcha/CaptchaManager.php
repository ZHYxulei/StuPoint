<?php

namespace App\Services\Captcha;

use App\Models\Setting;
use App\Services\Captcha\Contracts\CaptchaProvider;
use App\Services\Captcha\Providers\LogCaptchaProvider;
use App\Services\Captcha\Providers\RecaptchaProvider;
use App\Services\Captcha\Providers\TurnstileProvider;

class CaptchaManager
{
    public function driver(): CaptchaProvider
    {
        $provider = Setting::get('captcha_provider', 'log');

        return match ($provider) {
            'cloudflare' => new TurnstileProvider,
            'google' => new RecaptchaProvider,
            default => new LogCaptchaProvider,
        };
    }

    public function verify(string $token, ?string $ip = null): bool
    {
        return $this->driver()->verify($token, $ip);
    }

    public function getSiteKey(): string
    {
        return $this->driver()->getSiteKey();
    }
}
