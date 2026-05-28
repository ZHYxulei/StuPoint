<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\Contracts\SmsProvider;

class LogSmsProvider implements SmsProvider
{
    public function sendCode(string $phone, string $code, string $template = ''): bool
    {
        \Log::info("[SMS - Log] To: {$phone}, Code: {$code}, Template: {$template}");

        return true;
    }

    public function getName(): string
    {
        return 'log';
    }
}
