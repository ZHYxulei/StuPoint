import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Package, Calendar, Coins, User, MapPin, Phone, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface ProductCategory {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    points_required: number;
    category: ProductCategory | null;
}

interface Order {
    id: number;
    order_no: string;
    points_spent: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
    shipping_info: {
        name: string;
        phone: string;
        address: string;
    };
    third_party_order_id: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    product: Product;
}

interface PageProps {
    order: Order;
    verification_code: string | null;
    verification_code_expires_at: string | null;
    verification_code_expired: boolean;
}

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
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
    },
    failed: {
        label: '失败',
        variant: 'destructive',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
    },
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '商城',
        href: '/shop',
    },
    {
        title: '我的订单',
        href: '/shop/orders',
    },
    {
        title: '订单详情',
        href: '',
    },
];

export default function ShopOrderDetail({ order, verification_code, verification_code_expires_at, verification_code_expired }: PageProps) {
    const [copied, setCopied] = useState(false);
    const StatusIcon = statusConfig[order.status].icon;

    const { post, processing } = useForm({});

    const handleRegenerateCode = () => {
        post(`/shop/orders/${order.id}/regenerate-code`);
    };

    const handleCopyCode = () => {
        if (verification_code) {
            navigator.clipboard.writeText(verification_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isCodeExpired = verification_code_expired;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`订单 ${order.order_no}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/shop/orders">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                返回订单列表
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold mt-3">订单详情</h1>
                    </div>
                    <Badge variant={statusConfig[order.status].variant} className="text-sm px-3 py-1">
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusConfig[order.status].label}
                    </Badge>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Verification Code Card */}
                        {!order.verified_at && order.status !== 'completed' && order.status !== 'cancelled' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        核销验证码
                                    </CardTitle>
                                    <CardDescription>
                                        向核销人员出示此验证码以兑换商品
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {verification_code ? (
                                        <>
                                            <div className="bg-muted rounded-lg p-6 text-center">
                                                <p className="text-sm text-muted-foreground mb-2">您的验证码</p>
                                                <div className="flex items-center justify-center gap-4">
                                                    <p className="text-4xl font-bold font-mono tracking-wider">
                                                        {verification_code}
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleCopyCode}
                                                        className="shrink-0"
                                                    >
                                                        {copied ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                <p className={`text-xs mt-3 ${isCodeExpired ? 'text-red-600' : 'text-muted-foreground'}`}>
                                                    {isCodeExpired ? (
                                                        <span className="flex items-center justify-center gap-1">
                                                            <XCircle className="h-3 w-3" />
                                                            验证码已过期
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            有效期至：{verification_code_expires_at ? new Date(verification_code_expires_at).toLocaleString() : '未知'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    验证码每24小时自动过期，过期后需要重新生成
                                                </AlertDescription>
                                            </Alert>

                                            <Button
                                                onClick={handleRegenerateCode}
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                <RefreshCw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                                                {processing ? '生成中...' : '重新生成验证码'}
                                            </Button>
                                        </>
                                    ) : (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                暂无验证码，点击下方按钮生成
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {!verification_code && (
                                        <Button
                                            onClick={handleRegenerateCode}
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            <RefreshCw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                                            {processing ? '生成中...' : '生成验证码'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Verified Badge */}
                        {order.verified_at && (
                            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="font-semibold text-green-900 dark:text-green-100">订单已核销</p>
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                核销时间：{new Date(order.verified_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Status Alert for Completed/Cancelled */}
                        {(order.status === 'completed' || order.status === 'cancelled') && !order.verified_at && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        {order.status === 'completed' ? (
                                            <>
                                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <p className="font-semibold text-green-900 dark:text-green-100">订单已完成</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        该订单已完成，无法生成验证码
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                                <div>
                                                    <p className="font-semibold text-red-900 dark:text-red-100">订单已取消</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        该订单已取消，无法生成验证码
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Product Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>商品信息</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                        {order.product.image ? (
                                            <img
                                                src={order.product.image}
                                                alt={order.product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Package className="h-16 w-16 text-muted-foreground opacity-20" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg mb-2">{order.product.name}</h3>
                                        {order.product.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                {order.product.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-sm">
                                            {order.product.category && (
                                                <Badge variant="outline">{order.product.category.name}</Badge>
                                            )}
                                            <div className="flex items-center gap-1 text-primary font-semibold">
                                                <Coins className="h-4 w-4" />
                                                {order.product.points_required.toLocaleString()} 积分
                                            </div>
                                        </div>
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
                                    <span className="font-mono font-medium">{order.order_no}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">下单时间</span>
                                    <span className="text-sm">{new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">更新时间</span>
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
                                        <p className="text-sm text-muted-foreground">外部订单号</p>
                                        <p className="font-mono text-sm">{order.third_party_order_id}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
