import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Package, User, Calendar, TrendingUp, ShoppingCart, ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { useState } from 'react';
import InputError from '@/components/input-error';

interface ProductCategory {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    category: ProductCategory | null;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
}

interface Order {
    id: number;
    order_no: string;
    points_spent: number;
    status: string;
    created_at: string;
    verified_at: string | null;
    product: Product;
    user: UserInfo;
}

interface Stats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    total_points_spent: number;
}

interface Paginator {
    data: Order[];
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
    orders: Paginator;
    stats: Stats;
    filters: {
        status?: string;
        search?: string;
        product?: string;
    };
}

type VerificationMethod = 'code' | 'password' | 'id_card' | 'direct';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    pending: { label: '待处理', variant: 'warning' },
    processing: { label: '处理中', variant: 'default' },
    completed: { label: '已完成', variant: 'success' },
    cancelled: { label: '已取消', variant: 'destructive' },
    failed: { label: '失败', variant: 'destructive' },
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '订单管理', href: '/admin/orders' },
];

export default function OrderIndex({ orders, stats, filters }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const [successMessage, setSuccessMessage] = useState('');

    const { get, processing } = useForm({
        status: filters.status || 'all',
        search: filters.search || '',
        product: filters.product || 'all',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/orders', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Check if user has permission to verify orders
    const canVerifyOrder = auth.user && true; // 所有登录的管理员都可以核销订单

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="订单管理" />

            <div className="space-y-6 p-4">
                <Heading
                    title="订单管理"
                    description="查看和管理所有订单"
                />

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">总订单数</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">待处理</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">处理中</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.processing}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">已完成</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-primary">总消耗积分</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{stats.total_points_spent.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            筛选订单
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="search">搜索订单号</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="输入订单号..."
                                    value={filters.search || ''}
                                    onChange={(e) => get('/admin/orders', {
                                        data: { ...filters, search: e.target.value || null },
                                        preserveScroll: true,
                                    })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">订单状态</Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => get('/admin/orders', {
                                        data: { ...filters, status: value === 'all' ? null : value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="所有状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">所有状态</SelectItem>
                                        <SelectItem value="pending">待处理</SelectItem>
                                        <SelectItem value="processing">处理中</SelectItem>
                                        <SelectItem value="completed">已完成</SelectItem>
                                        <SelectItem value="cancelled">已取消</SelectItem>
                                        <SelectItem value="failed">失败</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button type="submit" disabled={processing} className="w-full">
                                    <Search className="mr-2 h-4 w-4" />
                                    搜索
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Orders List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>订单列表</CardTitle>
                        <CardDescription>
                            显示 {orders.from} 到 {orders.to}，共 {orders.total} 个订单
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-semibold font-mono">{order.order_no}</p>
                                                <Badge variant={statusConfig[order.status].variant}>
                                                    {statusConfig[order.status].label}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <p className="text-muted-foreground">
                                                    <Package className="h-4 w-4 inline mr-1" />
                                                    {order.product.name}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    <User className="h-4 w-4 inline mr-1" />
                                                    {order.user.name} ({order.user.email})
                                                </p>
                                                <p className="text-muted-foreground">
                                                    <Calendar className="h-4 w-4 inline mr-1" />
                                                    {new Date(order.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary">
                                                {order.points_spent.toLocaleString()} 积分
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" />
                                                查看详情
                                            </Button>
                                        </Link>
                                        {order.status === 'pending' && (
                                            <UpdateStatusDialog orderId={order.id} currentStatus={order.status} onSuccess={() => setSuccessMessage('订单状态已更新')} />
                                        )}
                                        {canVerifyOrder && !order.verified_at && order.status !== 'cancelled' && (
                                            <VerifyOrderDialog
                                                orderId={order.id}
                                                orderNo={order.order_no}
                                                onSuccess={() => setSuccessMessage('订单核销成功')}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {successMessage && (
                            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-md mt-4">
                                {successMessage}
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {orders.links.map((link, index) => (
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

function UpdateStatusDialog({ orderId, currentStatus, onSuccess }: { orderId: string | number; currentStatus: string; onSuccess: () => void }) {
    const { data, setData, put, processing, reset } = useForm({
        status: currentStatus,
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/orders/${orderId}/status`, {
            onSuccess: () => {
                onSuccess();
                // Reload page after short delay
                setTimeout(() => window.location.reload(), 500);
            },
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    更新状态
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>更新订单状态</DialogTitle>
                    <DialogDescription>
                        更改订单的处理状态
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="status">新状态</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">待处理</SelectItem>
                                <SelectItem value="processing">处理中</SelectItem>
                                <SelectItem value="completed">已完成</SelectItem>
                                <SelectItem value="cancelled">已取消</SelectItem>
                                <SelectItem value="failed">失败</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="note">备注（可选）</Label>
                        <Textarea
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="添加状态变更备注..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" className="flex-1">
                                取消
                            </Button>
                        </DialogTrigger>
                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? '更新中...' : '确认更新'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function VerifyOrderDialog({ orderId, orderNo, onSuccess }: { orderId: string | number; orderNo: string; onSuccess: () => void }) {
    const { data, setData, post, processing, reset } = useForm({
        method: 'code' as VerificationMethod,
        code: '',
        password: '',
        id_number: '',
        name: '',
        admin_password: '',
    });

    const [activeTab, setActiveTab] = useState<VerificationMethod>('code');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('method', activeTab);
        post(`/admin/orders/${orderId}/verify`, {
            onSuccess: () => {
                onSuccess();
                setTimeout(() => window.location.reload(), 500);
            },
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    核销
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>订单核销</DialogTitle>
                    <DialogDescription>
                        订单号: {orderNo}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VerificationMethod)}>
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="code" className="text-xs">验证码</TabsTrigger>
                            <TabsTrigger value="password" className="text-xs">密码</TabsTrigger>
                            <TabsTrigger value="id_card" className="text-xs">身份证</TabsTrigger>
                            <TabsTrigger value="direct" className="text-xs">直接核销</TabsTrigger>
                        </TabsList>

                        <TabsContent value="code" className="space-y-3 mt-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">使用6位验证码进行核销</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">验证码</Label>
                                <Input
                                    id="code"
                                    placeholder="请输入6位验证码"
                                    maxLength={6}
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="font-mono text-center text-lg tracking-wider"
                                />
                                <InputError message={undefined} />
                            </div>
                        </TabsContent>

                        <TabsContent value="password" className="space-y-3 mt-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">使用下单账号的密码进行核销</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">密码</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="请输入用户密码"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={undefined} />
                            </div>
                        </TabsContent>

                        <TabsContent value="id_card" className="space-y-3 mt-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">使用下单人的身份证号和姓名进行核销</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="id_number">身份证号</Label>
                                <Input
                                    id="id_number"
                                    placeholder="请输入身份证号"
                                    value={data.id_number}
                                    onChange={(e) => setData('id_number', e.target.value)}
                                />
                                <InputError message={undefined} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">姓名</Label>
                                <Input
                                    id="name"
                                    placeholder="请输入姓名"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={undefined} />
                            </div>
                        </TabsContent>

                        <TabsContent value="direct" className="space-y-3 mt-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-sm text-muted-foreground text-center">
                                    直接核销需要输入当前管理员密码确认
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_password">管理员密码</Label>
                                <Input
                                    id="admin_password"
                                    type="password"
                                    placeholder="请输入您的密码"
                                    value={data.admin_password}
                                    onChange={(e) => setData('admin_password', e.target.value)}
                                />
                                <InputError message={undefined} />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex gap-3 pt-2">
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" className="flex-1">
                                取消
                            </Button>
                        </DialogTrigger>
                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? '核销中...' : '确认核销'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
