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
import { Search, Eye, Package, User, Calendar, TrendingUp, ShoppingCart, ShieldCheck, AlertCircle } from 'lucide-react';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="订单管理" />

            <div className="space-y-6 p-4">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">总订单</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">待处理</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">处理中</p>
                                    <p className="text-2xl font-bold">{stats.processing}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">已完成</p>
                                    <p className="text-2xl font-bold">{stats.completed}</p>
                                </div>
                                <Package className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">消耗积分</p>
                                    <p className="text-2xl font-bold">{stats.total_points_spent.toLocaleString()}</p>
                                </div>
                                <User className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base">搜索和筛选</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">搜索订单</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="订单号..."
                                        value={filters.search || ''}
                                        onChange={(e) => setData('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">订单状态</Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">全部</SelectItem>
                                        <SelectItem value="pending">待处理</SelectItem>
                                        <SelectItem value="processing">处理中</SelectItem>
                                        <SelectItem value="completed">已完成</SelectItem>
                                        <SelectItem value="cancelled">已取消</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product">商品</Label>
                                <Input
                                    id="product"
                                    placeholder="商品名称..."
                                    value={filters.product || ''}
                                    onChange={(e) => setData('product', e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={processing} className="w-full">
                                    搜索
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {successMessage}
                    </div>
                )}

                {/* Orders Table */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>订单列表</CardTitle>
                        <CardDescription>共 {orders.total} 个订单</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium text-sm">订单号</th>
                                        <th className="text-left p-3 font-medium text-sm">商品</th>
                                        <th className="text-left p-3 font-medium text-sm">用户</th>
                                        <th className="text-left p-3 font-medium text-sm">积分</th>
                                        <th className="text-left p-3 font-medium text-sm">状态</th>
                                        <th className="text-left p-3 font-medium text-sm">核销状态</th>
                                        <th className="text-left p-3 font-medium text-sm">下单时间</th>
                                        <th className="text-left p-3 font-medium text-sm">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm hover:underline">
                                                    {order.order_no}
                                                </Link>
                                            </td>
                                            <td className="p-3 text-sm">{order.product.name}</td>
                                            <td className="p-3 text-sm">
                                                <div>{order.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{order.user.email}</div>
                                            </td>
                                            <td className="p-3 text-sm font-medium">{order.points_spent.toLocaleString()}</td>
                                            <td className="p-3">
                                                <Badge variant={statusConfig[order.status]?.variant}>
                                                    {statusConfig[order.status]?.label}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                {order.verified_at ? (
                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                        <Package className="h-3 w-3" />
                                                        已核销
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">未核销</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-sm">{new Date(order.created_at).toLocaleString()}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <Button variant="outline" size="sm">查看详情</Button>
                                                    </Link>
                                                    {order.status === 'pending' && (
                                                        <Link href={`/admin/orders/${order.id}/edit`}>
                                                            <Button variant="outline" size="sm">更新状态</Button>
                                                        </Link>
                                                    )}
                                                    {(!order.verified_at && order.status !== 'cancelled' && order.status !== 'completed') && (
                                                        <VerifyOrderDialog
                                                            orderId={order.id}
                                                            orderNo={order.order_no}
                                                            onSuccess={() => setSuccessMessage('订单核销成功')}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function VerifyOrderDialog({ orderId, orderNo, onSuccess }: { orderId: string | number; orderNo: string; onSuccess: () => void }) {
    const { data, setData, processing, reset } = useForm({
        method: 'code' as VerificationMethod,
        code: '',
        password: '',
        id_number: '',
        name: '',
        admin_password: '',
    });

    const [activeTab, setActiveTab] = useState<VerificationMethod>('code');
    const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const codeInputRefs = Array(6).fill(null).map(() => useState<HTMLInputElement | null>(null));

    const handleCodeChange = (index: number, value: string) => {
        // Only allow numbers
        const numValue = value.replace(/[^0-9]/g, '');

        // Update the digit
        const newDigits = [...codeDigits];
        newDigits[index] = numValue;
        setCodeDigits(newDigits);

        // Update the full code
        const fullCode = newDigits.join('');
        setData('code', fullCode);

        // Auto-focus next input
        if (numValue && index < 5) {
            codeInputRefs[index + 1][0]?.focus();
        }
    };

    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            codeInputRefs[index - 1][0]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            codeInputRefs[index - 1][0]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            codeInputRefs[index + 1][0]?.focus();
        }
    };

    const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

        const newDigits = [...codeDigits];
        numbers.split('').forEach((num, i) => {
            if (i < 6) newDigits[i] = num;
        });
        setCodeDigits(newDigits);
        setData('code', newDigits.join(''));

        // Focus the last filled input or the first empty one
        const lastIndex = Math.min(numbers.length - 1, 5);
        codeInputRefs[lastIndex][0]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setData('method', activeTab);
        setErrors({}); // Clear previous errors

        const url = `/admin/orders/${orderId}/verify`;
        console.log('Verification request:', { url, orderId, activeTab, data });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    method: activeTab,
                    code: data.code,
                    password: data.password,
                    id_number: data.id_number,
                    name: data.name,
                    admin_password: data.admin_password,
                }),
            });

            const result = await response.json();
            console.log('Verification response:', result);

            if (result.success) {
                onSuccess();
                setTimeout(() => window.location.reload(), 500);
            } else {
                // Handle validation errors
                const newErrors: Record<string, string> = {};
                if (result.errors) {
                    Object.keys(result.errors).forEach((key) => {
                        const errorArray = result.errors[key];
                        newErrors[key] = Array.isArray(errorArray) ? errorArray[0] : errorArray;
                    });
                }

                // Add global error message
                if (result.message) {
                    newErrors.__all__ = result.message;
                }

                setErrors(newErrors);
            }
        } catch (error) {
            console.error('Verification failed:', error);
            setErrors({ __all__: '核销失败，请稍后重试' });
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when dialog closes
            reset();
            setCodeDigits(['', '', '', '', '', '']);
            setErrors({});
        }
    };

    return (
        <Dialog onOpenChange={handleOpenChange}>
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

                {/* Show global error if any */}
                {errors.__all__ && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errors.__all__}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs value={activeTab} onValueChange={(v) => {
                        setActiveTab(v as VerificationMethod);
                        // Clear errors when switching tabs
                        setErrors({});
                    }}>
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
                                <Label>验证码 <span className="text-destructive">*</span></Label>
                                <div className="flex gap-2 justify-center">
                                    {codeDigits.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={codeInputRefs[index][1]}
                                            id={`code-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                            onPaste={handleCodePaste}
                                            className="w-12 h-14 text-center text-2xl font-mono tracking-wider"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                <InputError message={errors.code} />
                            </div>
                        </TabsContent>

                        <TabsContent value="password" className="space-y-3 mt-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">使用下单账号的密码进行核销</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">密码 <span className="text-destructive">*</span></Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="请输入用户密码"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} />
                            </div>
                        </TabsContent>

                        <TabsContent value="id_card" className="space-y-3 mt-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">使用下单人的身份证号和姓名进行核销</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="id_number">身份证号 <span className="text-destructive">*</span></Label>
                                <Input
                                    id="id_number"
                                    placeholder="请输入身份证号"
                                    value={data.id_number}
                                    onChange={(e) => setData('id_number', e.target.value)}
                                />
                                <InputError message={errors.id_number} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">姓名 <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="请输入姓名"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>
                        </TabsContent>

                        <TabsContent value="direct" className="space-y-3 mt-4">
                            <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-sm text-muted-foreground text-center">
                                    直接核销需要输入当前管理员密码确认
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_password">管理员密码 <span className="text-destructive">*</span></Label>
                                <Input
                                    id="admin_password"
                                    type="password"
                                    placeholder="请输入您的密码"
                                    value={data.admin_password}
                                    onChange={(e) => setData('admin_password', e.target.value)}
                                />
                                <InputError message={errors.admin_password} />
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
