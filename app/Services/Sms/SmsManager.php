<?php

namespace App\Services\Sms;

use App\Models\Setting;
use App\Services\Sms\Contracts\SmsProvider;

class SmsManager
{
    public function driver(): SmsProvider
    {
        $provider = Setting::get('sms_provider', 'log');

        return match ($provider) {
            'aliyun' => new \App\Services\Sms\Providers\AliyunSmsProvider(),
            'tencent' => new \App\Services\Sms\Providers\TencentSmsProvider(),
            default => new \App\Services\Sms\Providers\LogSmsProvider(),
        };
    }

    public function sendCode(string $phone, string $code): bool
    {
        return $this->driver()->sendCode($phone, $code);
    }
}
