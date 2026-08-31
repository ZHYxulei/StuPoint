import { Link, router } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: edit(), icon: null },
    { title: 'Password', href: editPassword(), icon: null },
    { title: 'Two-Factor Auth', href: show(), icon: null },
    { title: 'Appearance', href: editAppearance(), icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { currentUrl, isCurrentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="mt-6 lg:hidden">
                <Select
                    value={currentUrl}
                    onValueChange={(url) => router.visit(url)}
                >
                    <SelectTrigger aria-label="Settings section">
                        <SelectValue placeholder="Choose a settings section" />
                    </SelectTrigger>
                    <SelectContent>
                        {sidebarNavItems.map((item) => (
                            <SelectItem key={toUrl(item.href)} value={toUrl(item.href)}>
                                {item.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-6 flex flex-col lg:flex-row lg:gap-12">
                <aside className="hidden w-48 shrink-0 lg:block">
                    <nav className="grid gap-1" aria-label="Settings">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={toUrl(item.href)}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted text-foreground': isCurrentUrl(item.href),
                                })}
                            >
                                <Link
                                    href={item.href}
                                    aria-current={isCurrentUrl(item.href) ? 'page' : undefined}
                                >
                                    {item.icon && <item.icon className="size-4" />}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="min-w-0 flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
