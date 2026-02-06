import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Edit, Trash2, MoreHorizontal, Shield, Award, Clock, Globe } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface User {
    id: number;
    name: string;
    nickname: string | null;
    email: string;
    phone: string | null;
    student_id: string | null;
    grade: string | null;
    class: string | null;
    last_login_at: string | null;
    last_login_ip: string | null;
    roles: Role[];
    points?: {
        total_points: number;
        redeemable_points: number;
    } | null;
}

interface Paginator {
    data: User[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PageProps {
    users: Paginator;
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '用户管理', href: '/admin/users' },
];

export default function UserIndex({ users, roles, filters }: PageProps) {
    const { get, processing } = useForm({
        search: filters.search || '',
        role: filters.role || 'all',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/users', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const { auth } = usePage().props as any;
    const currentUserId = auth.user?.id;

    // Helper function to get display name
    const getDisplayName = (user: User) => {
        return user.nickname || user.name;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="用户管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="用户管理"
                        description="管理系统用户和角色权限"
                    />
                    <Link href="/admin/users/create">
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            添加用户
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            筛选用户
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="search">搜索</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="姓名或邮箱..."
                                    value={filters.search || ''}
                                    onChange={(e) => get('/admin/users', {
                                        data: { ...filters, search: e.target.value || null },
                                        preserveScroll: true,
                                    })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">角色</Label>
                                <Select
                                    value={filters.role || 'all'}
                                    onValueChange={(value) => get('/admin/users', {
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

                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    搜索
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>用户列表</CardTitle>
                        <CardDescription>
                            显示 {users.from} 到 {users.to}，共 {users.total} 名用户
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <UserPlus className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold truncate">{getDisplayName(user)}</p>
                                                {user.id === currentUserId && (
                                                    <Badge variant="outline" className="text-xs">
                                                        当前用户
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-xs">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                            {user.last_login_at && (
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>最后登录: {new Date(user.last_login_at).toLocaleDateString('zh-CN')}</span>
                                                    </div>
                                                    {user.last_login_ip && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            <span>IP: {user.last_login_ip}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {user.points && (
                                            <div className="flex items-center gap-1 text-primary font-semibold mb-1">
                                                <Award className="h-4 w-4" />
                                                {user.points.total_points.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {user.id !== currentUserId && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
                                                            window.location.href = `/admin/users/${user.id}`;
                                                        }
                                                    }}
                                                    className="hover:bg-destructive hover:text-destructive-foreground"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                                window.location.href = link.url;
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
