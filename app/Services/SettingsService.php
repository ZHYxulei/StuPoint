<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Setting::get($key, $default);
    }

    /**
     * Set a setting value.
     */
    public static function set(string $key, mixed $value, string $type = 'string', ?string $group = null, ?string $description = null): \App\Models\Setting
    {
        return Setting::set($key, $value, $type, $group, $description);
    }

    /**
     * Get all settings by group.
     */
    public static function getByGroup(string $group): array
    {
        return Setting::getByGroup($group);
    }

    /**
     * Get site name.
     */
    public static function getSiteName(): string
    {
        return self::get('site_name', config('app.name', 'StuPoint'));
    }

    /**
     * Get site logo.
     */
    public static function getSiteLogo(): ?string
    {
        return self::get('site_logo');
    }

    /**
     * Get site favicon.
     */
    public static function getSiteFavicon(): ?string
    {
        return self::get('site_favicon');
    }

    public static function getSiteFaviconData(): ?string
    {
        return self::get('site_favicon_data');
    }

    public static function getSiteFaviconHref(): string
    {
        return self::getSiteFaviconData()
            ?? self::getSiteFavicon()
            ?? '/favicon.ico';
    }

    /**
     * Get footer ICP number.
     */
    public static function getFooterIcp(): ?string
    {
        return self::get('footer_icp');
    }

    /**
     * Get footer police number.
     */
    public static function getFooterPolice(): ?string
    {
        return self::get('footer_police');
    }

    /**
     * Get footer copyright.
     */
    public static function getFooterCopyright(): ?string
    {
        return self::get('footer_copyright');
    }

    /**
     * Get contact email.
     */
    public static function getContactEmail(): ?string
    {
        return self::get('contact_email');
    }

    /**
     * Get contact phone.
     */
    public static function getContactPhone(): ?string
    {
        return self::get('contact_phone');
    }
}
