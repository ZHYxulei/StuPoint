<?php

namespace App\Services;

/**
 * Canonical application locales.
 *
 * The installer and older `.env` files write the bare `zh`, while
 * `config/app.php` and `.env.example` write `zh-CN`. The frontend bundle is
 * keyed `zh-CN` / `en` (resources/js/lib/i18n.ts), so every locale value that
 * reaches the client funnels through here.
 *
 * Keep the alias table in sync with the one in resources/js/lib/i18n.ts.
 */
final class Locale
{
    public const DEFAULT = 'zh-CN';

    /**
     * @var array<string, string>
     */
    private const ALIASES = [
        'zh' => 'zh-CN',
        'zh-cn' => 'zh-CN',
        'zh_cn' => 'zh-CN',
        'zh-hans' => 'zh-CN',
        'zh-hans-cn' => 'zh-CN',
        'en' => 'en',
        'en-us' => 'en',
        'en-gb' => 'en',
    ];

    /**
     * Map any incoming locale code onto a supported one, falling back to the
     * default. Unknown codes (including the retired `ja`, which has no bundle)
     * intentionally collapse rather than erroring.
     */
    public static function normalize(?string $locale): string
    {
        return self::ALIASES[strtolower((string) $locale)] ?? self::DEFAULT;
    }

    /**
     * Locale codes the app can actually render.
     *
     * @return list<string>
     */
    public static function supported(): array
    {
        return ['zh-CN', 'en'];
    }
}
