import zhCN from '@/locales/zh-CN';
import en from '@/locales/en';

type Translations = typeof zhCN;

const messages: Record<string, Translations> = {
    'zh-CN': zhCN,
    'en': en,
};

export function t(key: string, params?: Record<string, string | number>): string {
    // Get locale from page props or default to zh-CN
    const locale = (window as any).pageProps?.locale || 'zh-CN';
    const keys = key.split('.');
    let value: any = messages[locale] || messages['zh-CN'];

    for (const k of keys) {
        value = value?.[k];
    }

    if (typeof value !== 'string') {
        return key;
    }

    // Replace parameters like {{count}}
    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            value = value.replace(`{{${paramKey}}}`, String(paramValue));
        });
    }

    return value;
}

export function getLocale(): string {
    return (window as any).pageProps?.locale || 'zh-CN';
}

export function getFallbackLocale(): string {
    return (window as any).pageProps?.fallback_locale || 'zh-CN';
}
