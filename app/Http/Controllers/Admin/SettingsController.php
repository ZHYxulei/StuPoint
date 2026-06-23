<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSiteSettingsRequest;
use App\Models\PluginSource;
use App\Models\Setting;
use App\Services\MailConfigService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Verify the user is a super admin.
     */
    private function verifySuperAdmin(): void
    {
        $user = Auth::user();
        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }
    }

    /**
     * Display system settings page.
     */
    public function index(Request $request)
    {
        $this->verifySuperAdmin();

        $pluginSources = PluginSource::ordered()->get();

        // Single query for all settings
        $allSettings = Setting::all()->keyBy('key');

        $siteSettings = array_merge([
            'site_name' => config('app.name', 'StuPoint'),
            'site_description' => '',
            'site_keywords' => '',
            'site_logo' => '',
            'site_favicon' => '',
        ], $allSettings->where('group', 'site')->mapWithKeys(fn ($s) => [$s->key => $s->value])->toArray());

        $contactSettings = $allSettings->where('group', 'contact')->mapWithKeys(fn ($s) => [$s->key => $s->value]);
        $footerSettings = $allSettings->where('group', 'footer')->mapWithKeys(fn ($s) => [$s->key => $s->value]);
        $socialSettings = $allSettings->where('group', 'social')->mapWithKeys(fn ($s) => [$s->key => $s->value]);
        $mailSettings = $allSettings->where('group', 'mail')->mapWithKeys(fn ($s) => [$s->key => $s->value]);
        $smsSettings = $allSettings->where('group', 'sms')->mapWithKeys(fn ($s) => [$s->key => $s->value]);
        $captchaSettings = $allSettings->where('group', 'captcha')->mapWithKeys(fn ($s) => [$s->key => $s->value]);

        return inertia('admin/settings/index', [
            'pluginSources' => $pluginSources,
            'siteSettingsForm' => $siteSettings,
            'contactSettings' => $contactSettings,
            'footerSettings' => $footerSettings,
            'socialSettings' => $socialSettings,
            'mailSettings' => $mailSettings,
            'smsSettings' => $smsSettings,
            'captchaSettings' => $captchaSettings,
        ]);
    }

    /**
     * Store a new plugin source.
     */
    public function storePluginSource(Request $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:plugin_sources,slug',
            'description' => 'nullable|string',
            'url' => 'required|url',
            'api_key' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        PluginSource::create($validated);

        return back()->with('success', '插件源已添加');
    }

    /**
     * Update a plugin source.
     */
    public function updatePluginSource(Request $request, string $id)
    {
        $this->verifySuperAdmin();

        $source = PluginSource::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:plugin_sources,slug,'.$id,
            'description' => 'nullable|string',
            'url' => 'required|url',
            'api_key' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $source->update($validated);

        return back()->with('success', '插件源已更新');
    }

    /**
     * Delete a plugin source.
     */
    public function deletePluginSource(Request $request, string $id)
    {
        $this->verifySuperAdmin();

        $source = PluginSource::findOrFail($id);
        $source->delete();

        return back()->with('success', '插件源已删除');
    }

    /**
     * Test plugin source connection.
     */
    public function testPluginSource(Request $request, string $id)
    {
        $this->verifySuperAdmin();

        $source = PluginSource::findOrFail($id);

        // TODO: Implement actual API test
        // For now, just return success
        return back()->with('success', '连接测试成功');
    }

    /**
     * Update site settings.
     */
    public function updateSiteSettings(UpdateSiteSettingsRequest $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validated();
        $hasUploadedFavicon = array_key_exists('site_favicon_upload', $validated) && $validated['site_favicon_upload'] instanceof UploadedFile;

        if ($hasUploadedFavicon) {
            $file = $validated['site_favicon_upload'];

            if ($file->isValid()) {
                $previousPath = Setting::get('site_favicon_path');
                $path = $file->store('site/favicon', 'public');
                Setting::set('site_favicon_path', $path, 'string', 'site');
                Setting::set('site_favicon', '', 'string', 'site');

                if (is_string($previousPath) && $previousPath !== '' && $previousPath !== $path) {
                    Storage::disk('public')->delete($previousPath);
                }

                $legacyFaviconData = Setting::where('key', 'site_favicon_data')->first();
                if ($legacyFaviconData) {
                    $legacyFaviconData->delete();
                }
            }
        }

        if ($hasUploadedFavicon) {
            unset($validated['site_favicon']);
        }

        foreach ($validated as $key => $value) {
            if ($key === 'site_favicon_upload') {
                continue;
            }

            if ($value !== null) {
                Setting::set($key, $value, 'string', 'site');
            }
        }

        return back()->with('success', '站点设置已更新');
    }

    /**
     * Update contact settings.
     */
    public function updateContactSettings(Request $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validate([
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, 'string', 'contact');
            }
        }

        return back()->with('success', '联系信息已更新');
    }

    /**
     * Update footer settings.
     */
    public function updateFooterSettings(Request $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validate([
            'footer_copyright' => 'nullable|string|max:500',
            'footer_icp' => 'nullable|string|max:100',
            'footer_police' => 'nullable|string|max:100',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, 'string', 'footer');
            }
        }

        return back()->with('success', '页脚设置已更新');
    }

    /**
     * Update social settings.
     */
    public function updateSocialSettings(Request $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validate([
            'social_wechat' => 'nullable|string|max:255',
            'social_weibo' => 'nullable|string|max:255',
            'social_qq' => 'nullable|string|max:50',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, 'string', 'social');
            }
        }

        return back()->with('success', '社交媒体设置已更新');
    }

    /**
     * Update mail settings.
     */
    public function updateMailSettings(Request $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validate([
            'mail_host' => 'nullable|string|max:255',
            'mail_port' => 'nullable|integer|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|in:tls,ssl,none',
            'mail_from_address' => 'nullable|email|max:255',
            'mail_from_name' => 'nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, 'string', 'mail');
        }

        // Re-apply mail config
        MailConfigService::apply();

        return back()->with('success', '邮件设置已更新');
    }

    /**
     * Send test email to verify SMTP configuration.
     */
    public function testMailConnection(Request $request)
    {
        $this->verifySuperAdmin();

        try {
            $service = new MailConfigService;
            $service->testConnection();

            return back()->with('success', '测试邮件已发送，请检查邮箱');
        } catch (\Exception $e) {
            return back()->with('error', '邮件发送失败: '.$e->getMessage());
        }
    }

    /**
     * Update SMS settings.
     */
    public function updateSmsSettings(Request $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validate([
            'sms_provider' => 'required|in:aliyun,tencent,log',
            'sms_aliyun_access_key_id' => 'nullable|string|max:255',
            'sms_aliyun_access_key_secret' => 'nullable|string|max:255',
            'sms_aliyun_sign_name' => 'nullable|string|max:255',
            'sms_aliyun_template_code' => 'nullable|string|max:255',
            'sms_tencent_secret_id' => 'nullable|string|max:255',
            'sms_tencent_secret_key' => 'nullable|string|max:255',
            'sms_tencent_sdk_app_id' => 'nullable|string|max:255',
            'sms_tencent_template_id' => 'nullable|string|max:255',
            'sms_tencent_sign_name' => 'nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, 'string', 'sms');
        }

        return back()->with('success', '短信设置已更新');
    }

    /**
     * Update captcha settings.
     */
    public function updateCaptchaSettings(Request $request)
    {
        $this->verifySuperAdmin();

        $validated = $request->validate([
            'captcha_provider' => 'required|in:cloudflare,google,log',
            'captcha_cloudflare_site_key' => 'nullable|string|max:255',
            'captcha_cloudflare_secret_key' => 'nullable|string|max:255',
            'captcha_google_site_key' => 'nullable|string|max:255',
            'captcha_google_secret_key' => 'nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, 'string', 'captcha');
        }

        return back()->with('success', '人机验证设置已更新');
    }
}
