<?php

namespace App\Services\Sms;

use App\Models\Setting;
use App\Services\Sms\Contracts\SmsProvider;
use App\Services\Sms\Providers\AliyunSmsProvider;
use App\Services\Sms\Providers\LogSmsProvider;
use App\Services\Sms\Providers\TencentSmsProvider;

class SmsManager
{
    public function driver(): SmsProvider
    {
        $provider = Setting::get('sms_provider', 'log');

        return match ($provider) {
            'aliyun' => new AliyunSmsProvider,
            'tencent' => new TencentSmsProvider,
            default => new LogSmsProvider,
        };
    }

    public function sendCode(string $phone, string $code): bool
    {
        return $this->driver()->sendCode($phone, $code);
    }
}
