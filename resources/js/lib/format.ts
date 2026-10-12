import { getLocale } from '@/lib/i18n';

/**
 * Maps an app locale onto the BCP-47 tag `Intl` should format with. They are
 * not the same thing: our `en` should render dates as `en-US`, not as the
 * browser's locale.
 */
const INTL_LOCALES: Record<string, string> = {
    'zh-CN': 'zh-CN',
    en: 'en-US',
};

function intlLocale(): string {
    return INTL_LOCALES[getLocale()] ?? 'zh-CN';
}

/**
 * These replace a mix of bare `.toLocaleString()` calls (which silently follow
 * the *browser* locale) and hardcoded `toLocaleDateString('zh-CN')` calls (which
 * never followed anything). Both made the same screen format differently.
 */
export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '';
    }

    return value.toLocaleString(intlLocale());
}

export function formatDate(value: string | Date | null | undefined): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString(intlLocale());
}

export function formatDateTime(
    value: string | Date | null | undefined,
): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleString(intlLocale());
}
