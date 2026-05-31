<?php

namespace App\Services\Captcha\Providers;

use App\Models\Setting;
use App\Services\Captcha\Contracts\CaptchaProvider;

class TurnstileProvider implements CaptchaProvider
{
    private string $secretKey;

    public function __construct()
    {
        $this->secretKey = Setting::get('captcha_cloudflare_secret_key', '');
    }

    public function verify(string $token, ?string $ip = null): bool
    {
        if (! $this->secretKey || ! $token) {
            return false;
        }

        $response = \Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $this->secretKey,
            'response' => $token,
            'remoteip' => $ip,
        ]);

        return $response->json('success', false);
    }

    public function getSiteKey(): string
    {
        return Setting::get('captcha_cloudflare_site_key', '');
    }

    public function getName(): string
    {
        return 'cloudflare';
    }
}
