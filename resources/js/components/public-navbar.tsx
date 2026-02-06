import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Trophy, LogIn, UserPlus, LayoutDashboard, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import type { SharedData } from '@/types';
import { dashboard, login, register } from '@/routes';

interface PublicNavbarProps {
    showMobileMenu?: boolean;
    onMobileMenuToggle?: () => void;
}

export default function PublicNavbar({ showMobileMenu = false, onMobileMenuToggle }: PublicNavbarProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Helper function to get display name
    const getDisplayName = (user: any) => {
        return user.nickname || user.name;
    };

    if (user) {
        return (
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center">
                    {/* Left side */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="hidden font-bold sm:inline-block">
                                学生积分管理系统
                            </span>
                        </Link>

                        {/* Desktop navigation */}
                        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                            <Link
                                href="/"
                                className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <Home className="mr-2 h-4 w-4 inline" />
                                主页
                            </Link>
                            <Link
                                href="/ranking"
                                className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <Trophy className="mr-2 h-4 w-4 inline" />
                                积分排行
                            </Link>
                        </div>
                    </div>

                    {/* Right side - User menu */}
                    <div className="ml-auto flex items-center gap-4">
                        {/* Desktop user menu */}
                        <div className="hidden md:flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar || undefined} alt={getDisplayName(user)} />
                                            <AvatarFallback>
                                                {getDisplayName(user)?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{getDisplayName(user)}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem asChild>
                                        <Link href={dashboard()} className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>仪表盘</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>账户信息</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>编辑账户</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/logout" method="post" as="button" className="cursor-pointer w-full">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>登出</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={onMobileMenuToggle}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                {showMobileMenu && (
                    <div className="md:hidden border-t py-4">
                        <div className="flex flex-col space-y-3 px-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <Home className="h-4 w-4" />
                                主页
                            </Link>
                            <Link
                                href="/ranking"
                                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <Trophy className="h-4 w-4" />
                                积分排行
                            </Link>
                            <Link
                                href={dashboard()}
                                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                仪表盘
                            </Link>
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <User className="h-4 w-4" />
                                账户信息
                            </Link>
                            <Link
                                href="/settings/profile"
                                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <User className="h-4 w-4" />
                                编辑账户
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                <LogOut className="h-4 w-4" />
                                登出
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        );
    }

    // Not logged in
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                {/* Left side */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            学生积分管理系统
                        </span>
                    </Link>

                    {/* Desktop navigation */}
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            <Home className="mr-2 h-4 w-4 inline" />
                            主页
                        </Link>
                        <Link
                            href="/ranking"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            <Trophy className="mr-2 h-4 w-4 inline" />
                            积分排行
                        </Link>
                    </div>
                </div>

                {/* Right side - Auth buttons */}
                <div className="ml-auto flex items-center gap-4">
                    {/* Desktop auth buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link href={login()}>
                            <Button variant="ghost">
                                <LogIn className="mr-2 h-4 w-4" />
                                登录
                            </Button>
                        </Link>
                        <Link href={register()}>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                注册
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onMobileMenuToggle}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {showMobileMenu && (
                <div className="md:hidden border-t py-4">
                    <div className="flex flex-col space-y-3 px-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            <Home className="h-4 w-4" />
                            主页
                        </Link>
                        <Link
                            href="/ranking"
                            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            <Trophy className="h-4 w-4" />
                            积分排行
                        </Link>
                        <Link href={login()} className="flex items-center gap-2 text-sm font-medium">
                            <LogIn className="h-4 w-4" />
                            登录
                        </Link>
                        <Link href={register()} className="flex items-center gap-2 text-sm font-medium">
                            <UserPlus className="h-4 w-4" />
                            注册
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
