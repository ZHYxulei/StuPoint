<?php

namespace App\Services;

use App\Models\Setting;

class MailConfigService
{
    /**
     * Apply mail settings from database to Laravel config.
     */
    public static function apply(): void
    {
        $host = Setting::get('mail_host');
        $port = Setting::get('mail_port', '587');
        $username = Setting::get('mail_username');
        $password = Setting::get('mail_password');
        $encryption = Setting::get('mail_encryption', 'tls');
        $fromAddress = Setting::get('mail_from_address');
        $fromName = Setting::get('mail_from_name', config('app.name'));

        if ($host) {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $host,
                'mail.mailers.smtp.port' => (int) $port,
                'mail.mailers.smtp.username' => $username,
                'mail.mailers.smtp.password' => $password,
                'mail.mailers.smtp.encryption' => $encryption,
                'mail.from.address' => $fromAddress ?: config('mail.from.address'),
                'mail.from.name' => $fromName,
            ]);
        }
    }

    /**
     * Send a test email.
     */
    public function testConnection(): bool
    {
        self::apply();

        $to = Setting::get('mail_from_address') ?? config('mail.from.address');

        if (! $to) {
            return false;
        }

        \Mail::raw('StuPoint 邮件测试 — 如果收到此邮件，说明 SMTP 配置成功。', function ($message) use ($to) {
            $message->to($to)
                ->subject('[StuPoint] 邮件服务器测试');
        });

        return true;
    }
}
