import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, BarChart3, Award, TrendingUp, Users, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '用户统计', href: '/admin/users/statistics' },
];

export default function UserStatistics({ users, roles, stats, filters }: PageProps) {
    const { get, processing } = useForm({
        search: filters.search || '',
        role: filters.role || 'all',
        sort_by: filters.sort_by || 'total_points',
        sort_order: filters.sort_order || 'desc',
        per_page: filters.per_page || '20',
    });

    const maxPoints = users.data.length > 0
        ? Math.max(...users.data.map(u => u.points?.total_points || 0))
        : 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="用户积分统计" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="用户积分统计"
                        description="查看所有用户的积分数据和排名"
                    />
                </div>

                {/* Statistics Summary */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">系统注册用户</p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">总积分</CardTitle>
                            <Award className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_points.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">累计积分总量</p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">可兑换积分</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.total_redeemable.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">可用于兑换</p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">积分榜首</CardTitle>
                            <BarChart3 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            {stats.top_user ? (
                                <>
                                    <div className="text-lg font-bold truncate">
                                        {stats.top_user.user.name}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.top_user.total_points.toLocaleString()} 分
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">暂无数据</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            筛选条件
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); get('/admin/users/statistics', { preserveScroll: true }); }}
                              className="grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="search">搜索</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="姓名、邮箱或学号..."
                                    value={filters.search || ''}
                                    onChange={(e) => get('/admin/users/statistics', {
                                        data: { ...filters, search: e.target.value || null },
                                        preserveScroll: true,
                                    })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">角色</Label>
                                <Select
                                    value={filters.role || 'all'}
                                    onValueChange={(value) => get('/admin/users/statistics', {
                                        data: { ...filters, role: value === 'all' ? null : value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="所有角色" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">所有角色</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.slug}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sort_by">排序方式</Label>
                                <Select
                                    value={filters.sort_by || 'total_points'}
                                    onValueChange={(value) => get('/admin/users/statistics', {
                                        data: { ...filters, sort_by: value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="sort_by">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="total_points">总积分</SelectItem>
                                        <SelectItem value="redeemable_points">可兑换积分</SelectItem>
                                        <SelectItem value="name">姓名</SelectItem>
                                        <SelectItem value="created_at">注册时间</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="per_page">每页显示</Label>
                                <Select
                                    value={filters.per_page || '20'}
                                    onValueChange={(value) => get('/admin/users/statistics', {
                                        data: { ...filters, per_page: value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="per_page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 条</SelectItem>
                                        <SelectItem value="20">20 条</SelectItem>
                                        <SelectItem value="50">50 条</SelectItem>
                                        <SelectItem value="100">100 条</SelectItem>
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
                            积分排行榜
                        </CardTitle>
                        <CardDescription>
                            显示 {users.from} 到 {users.to}，共 {users.total} 名用户
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.data.map((user, index) => {
                                const totalPoints = user.points?.total_points || 0;
                                const redeemablePoints = user.points?.redeemable_points || 0;
                                const widthPercentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

                                return (
                                    <Link
                                        key={user.id}
                                        href={`/admin/users/${user.id}/transactions`}
                                        className="block"
                                    >
                                        <div className="flex items-center gap-4 p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors cursor-pointer group">
                                            {/* Rank Badge */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                                index === 0
                                                    ? 'bg-yellow-500 text-white'
                                                    : index === 1
                                                        ? 'bg-gray-400 text-white'
                                                        : index === 2
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {users.from ? users.from + index : index + 1}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold truncate group-hover:text-primary transition-colors">
                                                        {user.name}
                                                    </p>
                                                    {user.roles.map((role) => (
                                                        <Badge key={role.id} variant="outline" className="text-xs">
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {user.email}
                                                    {user.student_id && ` · ${user.student_id}`}
                                                    {user.grade && user.class && ` · ${user.grade}${user.class}`}
                                                </p>

                                                {/* Stacked Bar Chart */}
                                                <div className="mt-2">
                                                    <div className="h-6 bg-muted rounded-full overflow-hidden flex">
                                                        {/* Total Points Bar (Primary) */}
                                                        <div
                                                            className="h-full bg-primary flex items-center justify-end pr-2 transition-all duration-500"
                                                            style={{ width: `${widthPercentage}%` }}
                                                        >
                                                            {widthPercentage > 15 && (
                                                                <span className="text-xs font-medium text-primary-foreground">
                                                                    {totalPoints.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1 text-xs">
                                                        <span className="text-muted-foreground">
                                                            总积分: <span className="font-semibold text-primary">{totalPoints.toLocaleString()}</span>
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            可兑换: <span className="font-semibold text-green-600 dark:text-green-400">{redeemablePoints.toLocaleString()}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chevron */}
                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {users.links.map((link, index) => (
                                    <button
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        onClick={() => {
                                            if (link.url) {
                                                get(link.url, { preserveScroll: false });
                                            }
                                        }}
                                        disabled={!link.url || processing}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted hover:bg-muted/80'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
