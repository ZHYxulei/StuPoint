import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Package, User, MapPin, Phone, Calendar, Coins, Clock, CheckCircle2, AlertCircle, Shield, ShieldCheck, ShieldX } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

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

interface Operator {
    id: number;
    name: string;
}

interface StatusHistory {
    id: number;
    from_status: string | null;
    to_status: string;
    note: string | null;
    created_at: string;
    operator: Operator | null;
}

interface Order {
    id: number;
    order_no: string;
    points_spent: number;
    status: string;
    shipping_info: {
        name: string;
        phone: string;
        address: string;
    };
    third_party_order_id: string | null;
    verified_at: string | null;
    verified_by: number | null;
    created_at: string;
    updated_at: string;
    product: Product;
    user: UserInfo;
    verifiedBy?: UserInfo | null;
    statusHistory: StatusHistory[];
}

interface PageProps {
    order: Order;
    verification_code: string | null;
    verification_code_expired: boolean;
}

type VerificationMethod = 'code' | 'password' | 'id_card' | 'direct';

const statusConfig: Record<string, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
    icon: React.ElementType;
    color: string;
}> = {
    pending: {
        label: '待处理',
        variant: 'warning',
        icon: Clock,
        color: 'text-yellow-600 dark:text-yellow-400',
    },
    processing: {
        label: '处理中',
        variant: 'default',
        icon: AlertCircle,
        color: 'text-blue-600 dark:text-blue-400',
    },
    completed: {
        label: '已完成',
        variant: 'success',
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
    },
    cancelled: {
        label: '已取消',
        variant: 'destructive',
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
    },
    failed: {
        label: '失败',
        variant: 'destructive',
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
    },
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '订单管理', href: '/admin/orders' },
    { title: '订单详情', href: '' },
];

export default function OrderShow({ order, verification_code, verification_code_expired }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const StatusIcon = statusConfig[order.status].icon;
    const currentUser = auth.user;

    // Check if user has permission to verify orders (admin, head_teacher, grade_director, etc.)
    const canVerifyOrder = currentUser && (
        currentUser.email === 'admin@example.com' ||
        currentUser.is_head_teacher ||
        (currentUser as any).roles?.some((r: any) => ['admin', 'head_teacher', 'grade_director'].includes(r.slug))
    );

    const isOrderVerified = !!order.verified_at;
    const canVerifyThisOrder = canVerifyOrder && !isOrderVerified && order.status !== 'cancelled';

    // Verification form state
    const verificationForm = useForm({
        method: 'code' as VerificationMethod,
        code: '',
        password: '',
        id_number: '',
        name: '',
        admin_password: '',
    });

    const [activeTab, setActiveTab] = React.useState<VerificationMethod>('code');
    const [showDirectVerifyDialog, setShowDirectVerifyDialog] = React.useState(false);

    const handleVerification = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'direct') {
            setShowDirectVerifyDialog(true);
            return;
        }

        verificationForm.setData('method', activeTab);
        verificationForm.post(`/admin/orders/${order.id}/verify`, {
            onSuccess: () => {
                verificationForm.reset();
            },
        });
    };

    const handleDirectVerify = () => {
        verificationForm.setData('method', 'direct');
        verificationForm.post(`/admin/orders/${order.id}/verify`, {
            onSuccess: () => {
                setShowDirectVerifyDialog(false);
                verificationForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`订单: ${order.order_no}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Link href="/admin/orders">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            返回
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{order.order_no}</h1>
                        <Badge variant={statusConfig[order.status].variant} className="text-sm px-3 py-1">
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {statusConfig[order.status].label}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>商品信息</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                        <Package className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg mb-2">{order.product.name}</h3>
                                        <div className="flex items-center gap-2">
                                            {order.product.category && (
                                                <Badge variant="outline">{order.product.category.name}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>用户信息</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{order.user.name}</p>
                                        <p className="text-sm text-muted-foreground">{order.user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>收货信息</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">收货人</p>
                                        <p className="font-medium">{order.shipping_info.name}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">联系电话</p>
                                        <p className="font-medium">{order.shipping_info.phone}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">收货地址</p>
                                        <p className="font-medium whitespace-pre-wrap">{order.shipping_info.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Timeline */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>订单时间线</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.statusHistory.map((history, index) => (
                                        <div key={history.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    index === 0 ? 'bg-primary' : 'bg-muted'
                                                }`} />
                                                {index < order.statusHistory.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-muted mt-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium capitalize">
                                                        {history.to_status.replace('_', ' ')}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {new Date(history.created_at).toLocaleString()}
                                                    </Badge>
                                                </div>
                                                {history.note && (
                                                    <p className="text-sm text-muted-foreground">{history.note}</p>
                                                )}
                                                {history.operator && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        操作者: {history.operator.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>订单摘要</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">订单号</span>
                                    <span className="font-mono font-medium text-sm">{order.order_no}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">下单时间</span>
                                    <span className="text-sm">{new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">最后更新</span>
                                    <span className="text-sm">{new Date(order.updated_at).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">消耗积分</span>
                                    <div className="flex items-center gap-1 text-primary font-bold text-lg">
                                        <Coins className="h-5 w-5" />
                                        {order.points_spent.toLocaleString()}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">订单状态</span>
                                    <Badge variant={statusConfig[order.status].variant}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusConfig[order.status].label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Third Party Order Info */}
                        {order.third_party_order_id && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        第三方订单
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">外部订单ID</p>
                                        <p className="font-mono text-sm">{order.third_party_order_id}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Verification */}
                        {canVerifyOrder && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        订单核销
                                    </CardTitle>
                                    <CardDescription>
                                        {isOrderVerified ? '该订单已完成核销' : '请选择核销方式'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isOrderVerified ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <ShieldCheck className="h-5 w-5" />
                                                <span className="font-medium">已核销</span>
                                            </div>
                                            <Separator />
                                            {verification_code && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">验证码</p>
                                                    <p className="font-mono font-bold text-lg tracking-wider">{verification_code}</p>
                                                </div>
                                            )}
                                            <Separator />
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">核销时间</p>
                                                <p className="text-sm">{new Date(order.verified_at!).toLocaleString()}</p>
                                            </div>
                                            {order.verifiedBy && (
                                                <>
                                                    <Separator />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">核销人</p>
                                                        <p className="text-sm font-medium">{order.verifiedBy.name}</p>
                                                        <p className="text-xs text-muted-foreground">{order.verifiedBy.email}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : canVerifyThisOrder ? (
                                        <form onSubmit={handleVerification} className="space-y-4">
                                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VerificationMethod)}>
                                                <TabsList className="grid grid-cols-4 w-full">
                                                    <TabsTrigger value="code" className="text-xs">验证码</TabsTrigger>
                                                    <TabsTrigger value="password" className="text-xs">密码</TabsTrigger>
                                                    <TabsTrigger value="id_card" className="text-xs">身份证</TabsTrigger>
                                                    <TabsTrigger value="direct" className="text-xs">直接核销</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="code" className="space-y-3 mt-4">
                                                    {verification_code ? (
                                                        <>
                                                            <div className="bg-muted/50 p-3 rounded-lg text-center">
                                                                <p className="text-xs text-muted-foreground mb-1">验证码</p>
                                                                <p className="font-mono font-bold text-xl tracking-wider">{verification_code}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="code">输入验证码</Label>
                                                                <Input
                                                                    id="code"
                                                                    placeholder="请输入6位验证码"
                                                                    maxLength={6}
                                                                    value={verificationForm.data.code}
                                                                    onChange={(e) => verificationForm.setData('code', e.target.value)}
                                                                    className="font-mono text-center text-lg tracking-wider"
                                                                />
                                                                <InputError message={verificationForm.errors.code} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            该订单暂未生成验证码
                                                        </p>
                                                    )}
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
                                                            value={verificationForm.data.password}
                                                            onChange={(e) => verificationForm.setData('password', e.target.value)}
                                                        />
                                                        <InputError message={verificationForm.errors.password} />
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
                                                            value={verificationForm.data.id_number}
                                                            onChange={(e) => verificationForm.setData('id_number', e.target.value)}
                                                        />
                                                        <InputError message={verificationForm.errors.id_number} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">姓名</Label>
                                                        <Input
                                                            id="name"
                                                            placeholder="请输入姓名"
                                                            value={verificationForm.data.name}
                                                            onChange={(e) => verificationForm.setData('name', e.target.value)}
                                                        />
                                                        <InputError message={verificationForm.errors.name} />
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
                                                            value={verificationForm.data.admin_password}
                                                            onChange={(e) => verificationForm.setData('admin_password', e.target.value)}
                                                        />
                                                        <InputError message={verificationForm.errors.admin_password} />
                                                    </div>
                                                </TabsContent>
                                            </Tabs>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={verificationForm.processing}
                                            >
                                                {verificationForm.processing ? '核销中...' : '确认核销'}
                                            </Button>
                                        </form>
                                    ) : order.status === 'cancelled' ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <ShieldX className="h-5 w-5" />
                                            <span className="text-sm">已取消的订单无法核销</span>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Direct Verification Confirmation Dialog */}
                <AlertDialog open={showDirectVerifyDialog} onOpenChange={setShowDirectVerifyDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>确认直接核销</AlertDialogTitle>
                            <AlertDialogDescription>
                                您确定要直接核销订单 {order.order_no} 吗？此操作需要输入您的管理员密码进行确认，核销后订单状态将变更为已完成。
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2 py-4">
                            <Label htmlFor="dialog_admin_password">管理员密码</Label>
                            <Input
                                id="dialog_admin_password"
                                type="password"
                                placeholder="请输入您的密码"
                                value={verificationForm.data.admin_password}
                                onChange={(e) => verificationForm.setData('admin_password', e.target.value)}
                            />
                            <InputError message={verificationForm.errors.admin_password} />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={verificationForm.processing}>取消</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDirectVerify();
                                }}
                                disabled={verificationForm.processing || !verificationForm.data.admin_password}
                            >
                                {verificationForm.processing ? '核销中...' : '确认核销'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
