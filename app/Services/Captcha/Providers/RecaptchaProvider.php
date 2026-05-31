<?php

namespace App\Services\Captcha\Providers;

use App\Models\Setting;
use App\Services\Captcha\Contracts\CaptchaProvider;

class RecaptchaProvider implements CaptchaProvider
{
    private string $secretKey;

    public function __construct()
    {
        $this->secretKey = Setting::get('captcha_google_secret_key', '');
    }

    public function verify(string $token, ?string $ip = null): bool
    {
        if (! $this->secretKey || ! $token) {
            return false;
        }

        $response = \Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $this->secretKey,
            'response' => $token,
            'remoteip' => $ip,
        ]);

        return $response->json('success', false);
    }

    public function getSiteKey(): string
    {
        return Setting::get('captcha_google_site_key', '');
    }

    public function getName(): string
    {
        return 'google';
    }
}
