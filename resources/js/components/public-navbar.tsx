import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Home,
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    Trophy,
    User,
    UserPlus,
    X,
} from 'lucide-react';
import { useId, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { dashboard, login, register, ranking } from '@/routes';
import type { SharedData } from '@/types';

export interface PublicNavbarProps {
    className?: string;
}

const publicNavigation = [
    { label: '主页', href: '/', icon: Home },
    { label: '积分排行', href: ranking(), icon: Trophy },
];

const accountNavigation = [
    { label: '仪表盘', href: dashboard(), icon: LayoutDashboard },
    { label: '账户信息', href: '/profile', icon: User },
    { label: '编辑账户', href: '/settings/profile', icon: User },
];

export default function PublicNavbar({ className }: PublicNavbarProps) {
    const { auth, siteSettings } = usePage<SharedData>().props;
    const user = auth.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuId = useId();
    const displayName = user ? user.nickname || user.name : '';

    return (
        <nav
            className={cn(
                'sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75',
                className,
            )}
        >
            <div className="container flex h-16 items-center gap-6">
                <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
                        S
                    </span>
                    <span className="truncate">
                        {siteSettings?.site_name || '学生积分管理系统'}
                    </span>
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {publicNavigation.map(({ label, href, icon: Icon }) => (
                        <Button key={label} asChild variant="ghost" size="sm">
                            <Link href={href}>
                                <Icon className="size-4" />
                                {label}
                            </Link>
                        </Button>
                    ))}
                </div>

                <div className="ml-auto hidden items-center gap-2 md:flex">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 px-2">
                                    <Avatar className="size-8">
                                        <AvatarImage
                                            src={user.avatar || undefined}
                                            alt={displayName}
                                        />
                                        <AvatarFallback>
                                            {displayName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="max-w-36 truncate">{displayName}</span>
                                    <ChevronDown className="size-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {accountNavigation.map(({ label, href, icon: Icon }) => (
                                    <DropdownMenuItem key={label} asChild>
                                        <Link href={href}>
                                            <Icon className="size-4" />
                                            {label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="w-full">
                                        <LogOut className="size-4" />
                                        登出
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button asChild variant="ghost">
                                <Link href={login()}>
                                    <LogIn className="size-4" />
                                    登录
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={register()}>
                                    <UserPlus className="size-4" />
                                    注册
                                </Link>
                            </Button>
                        </>
                    )}
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto md:hidden"
                    aria-label={mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
                    aria-expanded={mobileMenuOpen}
                    aria-controls={mobileMenuId}
                    onClick={() => setMobileMenuOpen((open) => !open)}
                >
                    {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </Button>
            </div>

            {mobileMenuOpen && (
                <div id={mobileMenuId} className="border-t bg-background md:hidden">
                    <div className="container grid gap-1 py-3">
                        {publicNavigation.map(({ label, href, icon: Icon }) => (
                            <Button
                                key={label}
                                asChild
                                variant="ghost"
                                className="justify-start"
                            >
                                <Link href={href} onClick={() => setMobileMenuOpen(false)}>
                                    <Icon className="size-4" />
                                    {label}
                                </Link>
                            </Button>
                        ))}
                        {user ? (
                            <>
                                {accountNavigation.map(({ label, href, icon: Icon }) => (
                                    <Button
                                key={label}
                                asChild
                                variant="ghost"
                                className="justify-start"
                            >
                                        <Link href={href} onClick={() => setMobileMenuOpen(false)}>
                                            <Icon className="size-4" />
                                            {label}
                                        </Link>
                                    </Button>
                                ))}
                                <Button asChild variant="ghost" className="justify-start">
                                    <Link href="/logout" method="post" as="button" className="w-full">
                                        <LogOut className="size-4" />
                                        登出
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild variant="ghost" className="justify-start">
                                    <Link href={login()}>
                                        <LogIn className="size-4" />
                                        登录
                                    </Link>
                                </Button>
                                <Button asChild className="justify-start">
                                    <Link href={register()}>
                                        <UserPlus className="size-4" />
                                        注册
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
