<?php

namespace App\Services\Captcha\Contracts;

interface CaptchaProvider
{
    /**
     * Verify a captcha token from the client.
     */
    public function verify(string $token, ?string $ip = null): bool;

    /**
     * Get the site key for client-side rendering.
     */
    public function getSiteKey(): string;

    /**
     * Get the provider display name.
     */
    public function getName(): string;
}
