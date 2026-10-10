import { router, usePage } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { t, type AppLocale } from '@/lib/i18n';
import type { SharedData } from '@/types';

/**
 * Language names are autonyms on purpose — they have to be readable to someone
 * who cannot read the language currently in effect.
 */
const OPTIONS: { value: AppLocale; label: string }[] = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en', label: 'English' },
];

export default function LocaleSwitcher() {
    const { locale } = usePage<SharedData>().props;

    return (
        <div className="grid gap-2">
            <Label htmlFor="locale">{t('settings.appearance.language')}</Label>
            <Select
                value={locale}
                onValueChange={(value) =>
                    router.post(
                        '/settings/locale',
                        { locale: value },
                        { preserveScroll: true },
                    )
                }
            >
                <SelectTrigger id="locale" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
                {t('settings.appearance.language_description')}
            </p>
        </div>
    );
}
