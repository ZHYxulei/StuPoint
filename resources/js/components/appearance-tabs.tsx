import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance, ThemeColor } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { t, type TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance, themeColor, updateThemeColor } =
        useAppearance();

    const tabs: {
        value: Appearance;
        icon: LucideIcon;
        labelKey: TranslationKey;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            labelKey: 'settings.appearance.mode_light',
        },
        {
            value: 'dark',
            icon: Moon,
            labelKey: 'settings.appearance.mode_dark',
        },
        {
            value: 'system',
            icon: Monitor,
            labelKey: 'settings.appearance.mode_system',
        },
    ];

    // Keys are spelled out rather than built from `value` so the compiler can
    // check them; a template literal would defeat the TranslationKey union.
    const colors: {
        value: ThemeColor;
        labelKey: TranslationKey;
        swatch: string;
    }[] = [
        {
            value: 'emerald',
            labelKey: 'settings.appearance.color.emerald',
            swatch: 'bg-emerald-500',
        },
        {
            value: 'teal',
            labelKey: 'settings.appearance.color.teal',
            swatch: 'bg-teal-500',
        },
        {
            value: 'blue',
            labelKey: 'settings.appearance.color.blue',
            swatch: 'bg-blue-500',
        },
        {
            value: 'indigo',
            labelKey: 'settings.appearance.color.indigo',
            swatch: 'bg-indigo-500',
        },
        {
            value: 'violet',
            labelKey: 'settings.appearance.color.violet',
            swatch: 'bg-violet-500',
        },
        {
            value: 'rose',
            labelKey: 'settings.appearance.color.rose',
            swatch: 'bg-rose-500',
        },
        {
            value: 'amber',
            labelKey: 'settings.appearance.color.amber',
            swatch: 'bg-amber-500',
        },
        {
            value: 'slate',
            labelKey: 'settings.appearance.color.slate',
            swatch: 'bg-slate-500',
        },
    ];

    return (
        <div className={cn('space-y-4', className)} {...props}>
            <div>
                <div className="mb-2 text-sm font-medium">
                    {t('settings.appearance.mode')}
                </div>
                <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
                    {tabs.map(({ value, icon: Icon, labelKey }) => (
                        <button
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className={cn(
                                'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                                appearance === value
                                    ? 'bg-background shadow-xs dark:bg-muted dark:text-foreground'
                                    : 'text-muted-foreground hover:bg-neutral-200/60 hover:text-black dark:text-muted-foreground dark:hover:bg-neutral-700/60',
                            )}
                        >
                            <Icon className="-ml-1 h-4 w-4" />
                            <span className="ml-1.5 text-sm">
                                {t(labelKey)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Palette className="h-4 w-4" />
                    {t('settings.appearance.theme_color')}
                </div>
                <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => updateThemeColor(c.value)}
                            className={cn(
                                'group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                                themeColor === c.value
                                    ? 'border-primary bg-primary/10 text-foreground'
                                    : 'border-border bg-background hover:bg-accent',
                            )}
                        >
                            <span
                                className={cn(
                                    'h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-background',
                                    c.swatch,
                                    themeColor === c.value
                                        ? 'ring-primary'
                                        : 'ring-transparent group-hover:ring-primary/40',
                                )}
                            />
                            {t(c.labelKey)}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    {t('settings.appearance.theme_help')}
                </p>
            </div>
        </div>
    );
}
