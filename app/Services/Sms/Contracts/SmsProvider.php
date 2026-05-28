<?php

namespace App\Services\Sms\Contracts;

interface SmsProvider
{
    /**
     * Send an SMS verification code.
     */
    public function sendCode(string $phone, string $code, string $template = ''): bool;

    /**
     * Get provider display name.
     */
    public function getName(): string;
}
