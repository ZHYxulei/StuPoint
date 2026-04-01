import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance, ThemeColor } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance, themeColor, updateThemeColor } =
        useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const colors: { value: ThemeColor; label: string; swatch: string }[] = [
        { value: 'emerald', label: '翠绿', swatch: 'bg-emerald-500' },
        { value: 'teal', label: '青绿', swatch: 'bg-teal-500' },
        { value: 'blue', label: '蓝色', swatch: 'bg-blue-500' },
        { value: 'indigo', label: '靛蓝', swatch: 'bg-indigo-500' },
        { value: 'violet', label: '紫罗兰', swatch: 'bg-violet-500' },
        { value: 'rose', label: '玫红', swatch: 'bg-rose-500' },
        { value: 'amber', label: '琥珀', swatch: 'bg-amber-500' },
        { value: 'slate', label: '石板灰', swatch: 'bg-slate-500' },
    ];

    return (
        <div className={cn('space-y-4', className)} {...props}>
            <div>
                <div className="mb-2 text-sm font-medium">模式</div>
                <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                    {tabs.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className={cn(
                                'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                                appearance === value
                                    ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                    : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                            )}
                        >
                            <Icon className="-ml-1 h-4 w-4" />
                            <span className="ml-1.5 text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Palette className="h-4 w-4" />
                    主题颜色
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
                            {c.label}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    颜色会保存到本地（localStorage）并同步到 Cookie，刷新/SSR 也能保持。
                </p>
            </div>
        </div>
    );
}
