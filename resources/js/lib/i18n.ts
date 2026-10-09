import en from '@/locales/en';
import type { Translations } from '@/locales/types';
import zhCN from '@/locales/zh-CN';

/** Every dotted path in the Chinese bundle, e.g. 'common.save' | 'shop.status.pending'. */
type Leaves<T> = {
    [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Leaves<typeof zhCN>;

export type AppLocale = 'zh-CN' | 'en';

export const DEFAULT_LOCALE: AppLocale = 'zh-CN';

const messages: Record<AppLocale, Translations> = {
    'zh-CN': zhCN,
    en,
};

/**
 * Locale codes the server may hand us.
 *
 * The installer and older `.env` files write the bare `zh`; `config/app.php`
 * and `.env.example` write `zh-CN`. Keep this table in sync with
 * `app/Support/Locale.php`, which normalises the same codes server-side.
 */
const ALIASES: Record<string, AppLocale> = {
    zh: 'zh-CN',
    'zh-cn': 'zh-CN',
    zh_cn: 'zh-CN',
    'zh-hans': 'zh-CN',
    'zh-hans-cn': 'zh-CN',
    en: 'en',
    'en-us': 'en',
    'en-gb': 'en',
};

export function normalizeLocale(input: unknown): AppLocale | null {
    if (typeof input !== 'string' || input === '') {
        return null;
    }

    return ALIASES[input.toLowerCase()] ?? null;
}

type SharedProps = {
    locale?: string;
    fallback_locale?: string;
};

/**
 * SSR-safe props access. `window` does not exist under `renderToString`, but
 * `globalThis` resolves in both Node and the browser; `app.tsx` and `ssr.tsx`
 * both assign `globalThis.pageProps` before rendering.
 */
function sharedProps(): SharedProps | undefined {
    return (globalThis as { pageProps?: SharedProps }).pageProps;
}

/**
 * Resolved once per render by `setLocale()`.
 *
 * Deliberately a module-level value rather than a props read inside `t()`, so
 * the hot path stays cheap. `renderToString` is synchronous, so a locale
 * cannot be swapped mid-render under SSR.
 */
let activeLocale: AppLocale | null = null;

/** Called from app.tsx / ssr.tsx with the Inertia page props before render. */
export function setLocale(locale?: unknown): void {
    activeLocale = normalizeLocale(locale ?? sharedProps()?.locale);
}

export function getLocale(): AppLocale {
    return (
        activeLocale ?? normalizeLocale(sharedProps()?.locale) ?? DEFAULT_LOCALE
    );
}

export function getFallbackLocale(): AppLocale {
    return normalizeLocale(sharedProps()?.fallback_locale) ?? DEFAULT_LOCALE;
}

export function t(
    key: TranslationKey,
    params?: Record<string, string | number>,
): string {
    const locale = getLocale();
    const dictionary = messages[locale] ?? messages[DEFAULT_LOCALE];

    let value: unknown = dictionary;

    for (const segment of key.split('.')) {
        value = (value as Record<string, unknown> | undefined)?.[segment];
    }

    if (typeof value !== 'string') {
        if (import.meta.env.DEV) {
            console.warn(`[i18n] missing key "${key}" (locale "${locale}")`);
        }

        // Fall back to the key itself; the DEV warning above is what makes
        // this visible, since a raw key still looks like a plausible label.
        return key;
    }

    if (!params) {
        return value;
    }

    // Global, so a placeholder used twice is replaced twice.
    return value.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
}
