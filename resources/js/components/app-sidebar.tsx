import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Coins,
    Package,
    Users,
    Puzzle,
    ShoppingCart,
    PackageSearch,
    BarChart3,
    ChevronRight,
    MoreHorizontal,
    UserCircle,
    History,
    Settings,
    GraduationCap,
    Baby,
    ShieldCheck,
    Info,
    Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { t } from '@/lib/i18n';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types';
import AppLogo from './app-logo';

const STORAGE_KEY = 'sidebar_groups_state';

export function AppSidebar() {
    const { auth, enabledPlugins } = usePage<SharedData>().props;

    // Check if user has admin roles
    const isAdmin = auth.user?.roles?.some((role: any) =>
        ['super_admin', 'principal', 'grade_director'].includes(role.slug),
    );

    const canApprove =
        auth.user?.roles?.some((role: any) =>
            ['super_admin', 'admin', 'grade_director'].includes(role.slug),
        ) || auth.user?.is_head_teacher;

    // Check if student council plugin is enabled
    const isStudentCouncilEnabled =
        enabledPlugins?.includes('student_council') || false;

    // Check if user has student council role
    const hasStudentCouncilRole = auth.user?.roles?.some((role: any) =>
        ['student_council'].includes(role.slug),
    );

    // Initialize state from localStorage or default - changed to default open
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
        () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    try {
                        return JSON.parse(saved);
                    } catch {
                        return {
                            user: true,
                            system: true,
                            studentCouncil: false,
                        };
                    }
                }
            }
            return {
                user: true,
                system: true,
                studentCouncil: false,
            };
        },
    );

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
        }
    }, [openGroups]);

    const toggleGroup = (group: string) => {
        setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={dashboard()}>
                                        <LayoutGrid className="h-4 w-4" />
                                        <span>{t('nav.dashboard')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/points">
                                        <Coins className="h-4 w-4" />
                                        <span>{t('nav.my_points')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/shop">
                                        <Package className="h-4 w-4" />
                                        <span>{t('nav.shop')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/parent/children">
                                        <Baby className="h-4 w-4" />
                                        <span>{t('nav.parent_center')}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Student Council Section */}
                {isStudentCouncilEnabled && hasStudentCouncilRole && (
                    <>
                        <SidebarGroup>
                            <Collapsible
                                open={openGroups.studentCouncil || false}
                                onOpenChange={() =>
                                    toggleGroup('studentCouncil')
                                }
                                className="group/collapsible"
                            >
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger>
                                        <span>{t('nav.student_council')}</span>
                                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/student-council">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span>
                                                            {t(
                                                                'nav.council_panel',
                                                            )}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarGroup>
                        <SidebarSeparator />
                    </>
                )}

                {/* User Management Section */}
                <Collapsible
                    open={openGroups.user || false}
                    onOpenChange={() => toggleGroup('user')}
                    className="group/collapsible"
                >
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger>
                                <span>{t('nav.user_management')}</span>
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {canApprove && (
                                        <>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/approvals">
                                                        <ShieldCheck className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.approvals')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/users/statistics">
                                                        <BarChart3 className="h-4 w-4" />
                                                        <span>
                                                            {t(
                                                                'nav.user_statistics',
                                                            )}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/quick-grading">
                                                        <Zap className="h-4 w-4" />
                                                        <span>
                                                            {t(
                                                                'nav.quick_grading',
                                                            )}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/users">
                                                        <Users className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.user_list')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </>
                                    )}
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/points/history">
                                                <History className="h-4 w-4" />
                                                <span>
                                                    {t('nav.point_history')}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>

                <SidebarSeparator />

                {/* System Management Section */}
                {isAdmin && (
                    <>
                        <Collapsible
                            open={openGroups.system || false}
                            onOpenChange={() => toggleGroup('system')}
                            className="group/collapsible"
                        >
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger>
                                        <span>
                                            {t('nav.system_operations')}
                                        </span>
                                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/products">
                                                        <PackageSearch className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.products')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/orders">
                                                        <ShoppingCart className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.orders')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/classes">
                                                        <GraduationCap className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.classes')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/subjects">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.subjects')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/plugins">
                                                        <Puzzle className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.plugins')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <Link href="/admin/settings">
                                                        <Settings className="h-4 w-4" />
                                                        <span>
                                                            {t('nav.settings')}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                        <SidebarSeparator />
                    </>
                )}

                {/* Footer Links */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href="https://github.com/laravel/react-starter-kit"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Folder className="h-4 w-4" />
                                        <span>{t('nav.repository')}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href="https://laravel.com/docs/starter-kits#react"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        <span>{t('nav.docs')}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="/about">
                                        <Info className="h-4 w-4" />
                                        <span>{t('nav.about')}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
