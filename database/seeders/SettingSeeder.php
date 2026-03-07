<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Site Settings (站点设置)
            [
                'key' => 'site_name',
                'value' => 'StuPoint 学生积分管理系统',
                'type' => 'string',
                'group' => 'site',
                'description' => '网站名称',
            ],
            [
                'key' => 'site_description',
                'value' => '一个现代化的学生积分管理系统',
                'type' => 'string',
                'group' => 'site',
                'description' => '网站描述',
            ],
            [
                'key' => 'site_keywords',
                'value' => '学生管理,积分系统,校园',
                'type' => 'string',
                'group' => 'site',
                'description' => '网站关键词',
            ],
            [
                'key' => 'site_logo',
                'value' => '',
                'type' => 'string',
                'group' => 'site',
                'description' => '网站 Logo URL',
            ],
            [
                'key' => 'site_favicon',
                'value' => '',
                'type' => 'string',
                'group' => 'site',
                'description' => '网站 Favicon URL',
            ],

            // Contact Settings (联系信息)
            [
                'key' => 'contact_email',
                'value' => '',
                'type' => 'string',
                'group' => 'contact',
                'description' => '联系邮箱',
            ],
            [
                'key' => 'contact_phone',
                'value' => '',
                'type' => 'string',
                'group' => 'contact',
                'description' => '联系电话',
            ],

            // Footer Settings (页脚设置)
            [
                'key' => 'footer_copyright',
                'value' => '© 2024 StuPoint. All rights reserved.',
                'type' => 'string',
                'group' => 'footer',
                'description' => '版权信息',
            ],
            [
                'key' => 'footer_icp',
                'value' => '',
                'type' => 'string',
                'group' => 'footer',
                'description' => 'ICP 备案号',
            ],
            [
                'key' => 'footer_police',
                'value' => '',
                'type' => 'string',
                'group' => 'footer',
                'description' => '公安备案号',
            ],

            // Social Settings (社交媒体)
            [
                'key' => 'social_wechat',
                'value' => '',
                'type' => 'string',
                'group' => 'social',
                'description' => '微信公众号',
            ],
            [
                'key' => 'social_weibo',
                'value' => '',
                'type' => 'string',
                'group' => 'social',
                'description' => '微博',
            ],
            [
                'key' => 'social_qq',
                'value' => '',
                'type' => 'string',
                'group' => 'social',
                'description' => 'QQ',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
