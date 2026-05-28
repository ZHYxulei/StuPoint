<?php

namespace App\Services\Captcha;

use App\Models\Setting;
use App\Services\Captcha\Contracts\CaptchaProvider;

class CaptchaManager
{
    public function driver(): CaptchaProvider
    {
        $provider = Setting::get('captcha_provider', 'log');

        return match ($provider) {
            'cloudflare' => new \App\Services\Captcha\Providers\TurnstileProvider(),
            'google' => new \App\Services\Captcha\Providers\RecaptchaProvider(),
            default => new \App\Services\Captcha\Providers\LogCaptchaProvider(),
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
