import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Search,
    BarChart3,
    Award,
    TrendingUp,
    Users,
    ChevronRight,
} from 'lucide-react';
import Heading from '@/components/heading';
import PaginationBar from '@/components/pagination-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface UserPoints {
    total_points: number;
    redeemable_points: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    student_id: string | null;
    grade: string | null;
    class: string | null;
    points: UserPoints | null;
    roles: Role[];
}

interface TopUser {
    user: {
        id: number;
        name: string;
    };
    total_points: number;
}

interface Stats {
    total_users: number;
    total_points: number;
    total_redeemable: number;
    top_user: TopUser | null;
}

interface Paginator {
    data: User[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PageProps {
    users: Paginator;
    roles: Role[];
    stats: Stats;
    filters: {
        search?: string;
        role?: string;
        sort_by?: string;
        sort_order?: string;
        per_page?: string;
    };
}

export default function UserStatistics({
    users,
    roles,
    stats,
    filters,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.user_statistics'), href: '/admin/users/statistics' },
    ];

    const { get } = useForm({
        search: filters.search || '',
        role: filters.role || 'all',
        sort_by: filters.sort_by || 'total_points',
        per_page: filters.per_page || '20',
    });

    const maxPoints =
        users.data.length > 0
            ? Math.max(...users.data.map((u) => u.points?.total_points || 0))
            : 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.users.statistics_title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('admin.users.statistics_title')}
                        description={t(
                            'admin.users.statistics_description',
                        )}
                    />
                </div>

                {/* Statistics Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('admin.users.total_users')}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatNumber(stats.total_users)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.registered_users')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('points.total_points')}
                            </CardTitle>
                            <Award className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatNumber(stats.total_points)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('admin.users.total_points_sum')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('points.redeemable_points')}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">
                                {formatNumber(stats.total_redeemable)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('points.available_for_exchange')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('admin.users.top_user')}
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-warning" />
                        </CardHeader>
                        <CardContent>
                            {stats.top_user ? (
                                <>
                                    <div className="truncate text-lg font-bold">
                                        {stats.top_user.user.name}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.users.points_suffix', {
                                            count: formatNumber(
                                                stats.top_user.total_points,
                                            ),
                                        })}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t('common.no_data')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Search className="h-4 w-4" />
                            {t('admin.users.filter_conditions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                get('/admin/users/statistics', {
                                    preserveScroll: true,
                                });
                            }}
                            className="grid gap-4 md:grid-cols-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="search">
                                    {t('common.search')}
                                </Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder={t(
                                        'admin.users.search_placeholder_full',
                                    )}
                                    value={filters.search || ''}
                                    onChange={(e) =>
                                        router.get(
                                            '/admin/users/statistics',
                                            {
                                                ...filters,
                                                search: e.target.value || null,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">
                                    {t('profile.role')}
                                </Label>
                                <Select
                                    value={filters.role || 'all'}
                                    onValueChange={(value) =>
                                        router.get(
                                            '/admin/users/statistics',
                                            {
                                                ...filters,
                                                role:
                                                    value === 'all'
                                                        ? null
                                                        : value,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue
                                            placeholder={t(
                                                'admin.users.all_roles',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('admin.users.all_roles')}
                                        </SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.slug}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sort_by">
                                    {t('admin.users.sort_by')}
                                </Label>
                                <Select
                                    value={filters.sort_by || 'total_points'}
                                    onValueChange={(value) =>
                                        router.get(
                                            '/admin/users/statistics',
                                            {
                                                ...filters,
                                                sort_by: value,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    <SelectTrigger id="sort_by">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="total_points">
                                            {t('points.total_points')}
                                        </SelectItem>
                                        <SelectItem value="redeemable_points">
                                            {t('points.redeemable_points')}
                                        </SelectItem>
                                        <SelectItem value="name">
                                            {t('auth.name')}
                                        </SelectItem>
                                        <SelectItem value="created_at">
                                            {t('profile.registered_at')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="per_page">
                                    {t('admin.users.per_page')}
                                </Label>
                                <Select
                                    value={filters.per_page || '20'}
                                    onValueChange={(value) =>
                                        router.get(
                                            '/admin/users/statistics',
                                            {
                                                ...filters,
                                                per_page: value,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    <SelectTrigger id="per_page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">
                                            {t('admin.users.per_page_option', {
                                                count: 10,
                                            })}
                                        </SelectItem>
                                        <SelectItem value="20">
                                            {t('admin.users.per_page_option', {
                                                count: 20,
                                            })}
                                        </SelectItem>
                                        <SelectItem value="50">
                                            {t('admin.users.per_page_option', {
                                                count: 50,
                                            })}
                                        </SelectItem>
                                        <SelectItem value="100">
                                            {t('admin.users.per_page_option', {
                                                count: 100,
                                            })}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* User Points Chart */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            {t('ranking.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('admin.users.showing', {
                                from: formatNumber(users.from),
                                to: formatNumber(users.to),
                                total: formatNumber(users.total),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.data.map((user, index) => {
                                const totalPoints =
                                    user.points?.total_points || 0;
                                const redeemablePoints =
                                    user.points?.redeemable_points || 0;
                                const widthPercentage =
                                    maxPoints > 0
                                        ? (totalPoints / maxPoints) * 100
                                        : 0;

                                return (
                                    <Link
                                        key={user.id}
                                        href={`/admin/users/${user.id}/transactions`}
                                        className="block"
                                    >
                                        <div className="group flex cursor-pointer items-center gap-4 rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border">
                                            {/* Rank Badge */}
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                    index === 0
                                                        ? 'bg-yellow-500 text-white'
                                                        : index === 1
                                                          ? 'bg-gray-400 text-white'
                                                          : index === 2
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {users.from
                                                    ? users.from + index
                                                    : index + 1}
                                            </div>

                                            {/* User Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <p className="truncate font-semibold transition-colors group-hover:text-primary">
                                                        {user.name}
                                                    </p>
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role.id}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {user.email}
                                                    {user.student_id &&
                                                        ` · ${user.student_id}`}
                                                    {user.grade &&
                                                        user.class &&
                                                        ` · ${user.grade}${user.class}`}
                                                </p>

                                                {/* Stacked Bar Chart */}
                                                <div className="mt-2">
                                                    <div className="flex h-6 overflow-hidden rounded-full bg-muted">
                                                        {/* Total Points Bar (Primary) */}
                                                        <div
                                                            className="flex h-full items-center justify-end bg-primary pr-2 transition-all duration-500"
                                                            style={{
                                                                width: `${widthPercentage}%`,
                                                            }}
                                                        >
                                                            {widthPercentage >
                                                                15 && (
                                                                <span className="text-xs font-medium text-primary-foreground">
                                                                    {formatNumber(
                                                                        totalPoints,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">
                                                            {t('points.total_points')}:{' '}
                                                            <span className="font-semibold text-primary">
                                                                {formatNumber(totalPoints)}
                                                            </span>
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {t('dashboard.redeemable')}:{' '}
                                                            <span className="font-semibold text-success">
                                                                {formatNumber(redeemablePoints)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chevron */}
                                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <PaginationBar links={users.links} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
