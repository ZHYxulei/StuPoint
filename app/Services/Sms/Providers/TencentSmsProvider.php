<?php

namespace App\Services\Sms\Providers;

use App\Models\Setting;
use App\Services\Sms\Contracts\SmsProvider;

class TencentSmsProvider implements SmsProvider
{
    public function sendCode(string $phone, string $code, string $template = ''): bool
    {
        $secretId = Setting::get('sms_tencent_secret_id');
        $secretKey = Setting::get('sms_tencent_secret_key');
        $sdkAppId = Setting::get('sms_tencent_sdk_app_id');
        $templateId = $template ?: Setting::get('sms_tencent_template_id', '');
        $signName = Setting::get('sms_tencent_sign_name', '');

        if (! $secretId || ! $secretKey || ! $sdkAppId || ! $templateId) {
            return false;
        }

        // Tencent Cloud SMS API v3
        $service = 'sms';
        $host = 'sms.tencentcloudapi.com';
        $action = 'SendSms';
        $version = '2021-01-11';
        $payload = json_encode([
            'PhoneNumberSet' => ['+86'.$phone],
            'SmsSdkAppId' => $sdkAppId,
            'TemplateId' => $templateId,
            'SignName' => $signName,
            'TemplateParamSet' => [$code],
        ]);

        $timestamp = time();
        $date = gmdate('Y-m-d', $timestamp);
        $nonce = (string) mt_rand();

        // TC3 HMAC-SHA256 signature
        $canonicalRequest = "POST\n/\n\nhost={$host}\n\n".hash('sha256', $payload)."\n{$payload}";
        $stringToSign = "TC3-HMAC-SHA256\n{$timestamp}\n{$date}\n".hash('sha256', $canonicalRequest);

        $secretDate = hash_hmac('sha256', $date, 'TC3'.$secretKey, true);
        $secretService = hash_hmac('sha256', $service, $secretDate, true);
        $secretSigning = hash_hmac('sha256', 'tc3_request', $secretService, true);
        $signature = hash_hmac('sha256', $stringToSign, $secretSigning);

        $headers = [
            'Authorization: TC3-HMAC-SHA256 Credential='.$secretId.'/'.$date.'/'.$service.'/tc3_request, SignedHeaders=host, Signature='.$signature,
            'Content-Type: application/json',
            'Host: '.$host,
            'X-TC-Action: '.$action,
            'X-TC-Timestamp: '.$timestamp,
            'X-TC-Version: '.$version,
            'X-TC-Region: ap-guangzhou',
        ];

        $ch = curl_init("https://{$host}");
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $result = json_decode($response, true);

            return isset($result['Response']['SendStatusSet'][0]['Code']) && $result['Response']['SendStatusSet'][0]['Code'] === 'Ok';
        }

        return false;
    }

    public function getName(): string
    {
        return 'tencent';
    }
}
