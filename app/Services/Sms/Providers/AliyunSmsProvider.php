<?php

namespace App\Services\Sms\Providers;

use App\Models\Setting;
use App\Services\Sms\Contracts\SmsProvider;

class AliyunSmsProvider implements SmsProvider
{
    public function sendCode(string $phone, string $code, string $template = ''): bool
    {
        $accessKeyId = Setting::get('sms_aliyun_access_key_id');
        $accessKeySecret = Setting::get('sms_aliyun_access_key_secret');
        $signName = Setting::get('sms_aliyun_sign_name');
        $templateCode = $template ?: Setting::get('sms_aliyun_template_code', '');

        if (! $accessKeyId || ! $accessKeySecret || ! $signName || ! $templateCode) {
            return false;
        }

        // Alibaba Cloud SMS API v3
        $params = [
            'Action' => 'SendSms',
            'PhoneNumbers' => $phone,
            'SignName' => $signName,
            'TemplateCode' => $templateCode,
            'TemplateParam' => json_encode(['code' => $code]),
            'AccessKeyId' => $accessKeyId,
            'Format' => 'JSON',
            'SignatureMethod' => 'HMAC-SHA1',
            'SignatureNonce' => uniqid(),
            'SignatureVersion' => '1.0',
            'Timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            'Version' => '2017-05-25',
        ];

        // Sort and sign
        $sorted = [];
        foreach ($params as $k => $v) {
            $sorted[rawurlencode($k)] = rawurlencode($v);
        }
        ksort($sorted);
        $stringToSign = 'GET&' . rawurlencode('/') . '&' . rawurlencode(implode('&', array_map(fn($k, $v) => "{$k}={$v}", array_keys($sorted), array_values($sorted))));
        $signature = base64(hash_hmac('sha1', $stringToSign, $accessKeySecret . '&', true));
        $params['Signature'] = $signature;

        $url = 'https://dysmsapi.aliyuncs.com/?' . http_build_query($params);
        $response = @file_get_contents($url);

        return $response !== false;
    }

    public function getName(): string
    {
        return 'aliyun';
    }
}
