import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    Calendar,
    Coins,
    User,
    MapPin,
    Phone,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    Copy,
    Check,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

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

export default function ShopOrderDetail({
    order,
    verification_code,
    verification_code_expires_at,
    verification_code_expired,
}: PageProps) {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const statusConfig: Record<
        string,
        {
            label: string;
            variant:
                | 'default'
                | 'secondary'
                | 'destructive'
                | 'outline'
                | 'success'
                | 'warning';
            icon: React.ElementType;
            color: string;
        }
    > = {
        pending: {
            label: t('status.pending'),
            variant: 'warning',
            icon: Clock,
            color: 'text-warning',
        },
        processing: {
            label: t('status.processing'),
            variant: 'default',
            icon: AlertCircle,
            color: 'text-info',
        },
        completed: {
            label: t('status.completed'),
            variant: 'success',
            icon: CheckCircle2,
            color: 'text-success',
        },
        cancelled: {
            label: t('status.cancelled'),
            variant: 'destructive',
            icon: XCircle,
            color: 'text-destructive',
        },
        failed: {
            label: t('status.failed'),
            variant: 'destructive',
            icon: XCircle,
            color: 'text-destructive',
        },
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('shop.title'),
            href: '/shop',
        },
        {
            title: t('shop.my_orders'),
            href: '/shop/orders',
        },
        {
            title: t('shop.order_details'),
            href: '',
        },
    ];

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
            <Head title={t('shop.order_title', { no: order.order_no })} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/shop/orders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('shop.back_to_orders')}
                            </Link>
                        </Button>
                        <h1 className="mt-3 text-2xl font-bold">
                            {t('shop.order_details')}
                        </h1>
                    </div>
                    <Badge
                        variant={statusConfig[order.status].variant}
                        className="px-3 py-1 text-sm"
                    >
                        <StatusIcon className="mr-1 h-4 w-4" />
                        {statusConfig[order.status].label}
                    </Badge>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Verification Code Card */}
                        {!order.verified_at &&
                            order.status !== 'completed' &&
                            order.status !== 'cancelled' && (
                                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            {t('shop.verification_code_title')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                'shop.verification_code_description',
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {verification_code ? (
                                            <>
                                                <div className="rounded-lg bg-muted p-6 text-center">
                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                        {t(
                                                            'shop.your_verification_code',
                                                        )}
                                                    </p>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <p className="font-mono text-4xl font-bold tracking-wider">
                                                            {verification_code}
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={
                                                                handleCopyCode
                                                            }
                                                            className="shrink-0"
                                                        >
                                                            {copied ? (
                                                                <Check className="h-4 w-4" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <p
                                                        className={`mt-3 text-xs ${isCodeExpired ? 'text-destructive' : 'text-muted-foreground'}`}
                                                    >
                                                        {isCodeExpired ? (
                                                            <span className="flex items-center justify-center gap-1">
                                                                <XCircle className="h-3 w-3" />
                                                                {t(
                                                                    'shop.verification_code_expired',
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                {t(
                                                                    'shop.valid_until',
                                                                    {
                                                                        time: verification_code_expires_at
                                                                            ? formatDateTime(
                                                                                  verification_code_expires_at,
                                                                              )
                                                                            : t(
                                                                                  'common.unknown',
                                                                              ),
                                                                    },
                                                                )}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {t(
                                                            'shop.verification_code_expiry_note',
                                                        )}
                                                    </AlertDescription>
                                                </Alert>

                                                <Button
                                                    onClick={
                                                        handleRegenerateCode
                                                    }
                                                    disabled={processing}
                                                    className="w-full"
                                                >
                                                    <RefreshCw
                                                        className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`}
                                                    />
                                                    {processing
                                                        ? t('shop.generating')
                                                        : t(
                                                              'shop.regenerate_code',
                                                          )}
                                                </Button>
                                            </>
                                        ) : (
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    {t(
                                                        'shop.no_verification_code',
                                                    )}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {!verification_code && (
                                            <Button
                                                onClick={handleRegenerateCode}
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                <RefreshCw
                                                    className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`}
                                                />
                                                {processing
                                                    ? t('shop.generating')
                                                    : t('shop.generate_code')}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                        {/* Verified Badge */}
                        {order.verified_at && (
                            <Card className="border-success/30 bg-success-soft">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-8 w-8 text-success" />
                                        <div>
                                            <p className="font-semibold text-success-foreground">
                                                {t('shop.order_verified')}
                                            </p>
                                            <p className="text-sm text-success">
                                                {t('shop.verified_at', {
                                                    time: formatDateTime(
                                                        order.verified_at,
                                                    ),
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Status Alert for Completed/Cancelled */}
                        {(order.status === 'completed' ||
                            order.status === 'cancelled') &&
                            !order.verified_at && (
                                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3">
                                            {order.status === 'completed' ? (
                                                <>
                                                    <CheckCircle2 className="h-8 w-8 text-success" />
                                                    <div>
                                                        <p className="font-semibold text-success-foreground">
                                                            {t(
                                                                'shop.order_completed',
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t(
                                                                'shop.order_completed_no_code',
                                                            )}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-8 w-8 text-destructive" />
                                                    <div>
                                                        <p className="font-semibold text-destructive">
                                                            {t(
                                                                'shop.order_cancelled',
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t(
                                                                'shop.order_cancelled_no_code',
                                                            )}
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
                                <CardTitle>
                                    {t('shop.product_information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        {order.product.image ? (
                                            <img
                                                src={order.product.image}
                                                alt={order.product.name}
                                                className="h-full w-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <Package className="h-16 w-16 text-muted-foreground opacity-20" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            {order.product.name}
                                        </h3>
                                        {order.product.description && (
                                            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                                                {order.product.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-sm">
                                            {order.product.category && (
                                                <Badge variant="outline">
                                                    {
                                                        order.product.category
                                                            .name
                                                    }
                                                </Badge>
                                            )}
                                            <div className="flex items-center gap-1 font-semibold text-primary">
                                                <Coins className="h-4 w-4" />
                                                {formatNumber(
                                                    order.product
                                                        .points_required,
                                                )}{' '}
                                                {t('points.title')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>
                                    {t('shop.shipping_information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('shop.recipient')}
                                        </p>
                                        <p className="font-medium">
                                            {order.shipping_info.name}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('shop.contact_phone')}
                                        </p>
                                        <p className="font-medium">
                                            {order.shipping_info.phone}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t('shop.delivery_address')}
                                        </p>
                                        <p className="font-medium whitespace-pre-wrap">
                                            {order.shipping_info.address}
                                        </p>
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
                                <CardTitle>{t('shop.order_summary')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.order_number')}
                                    </span>
                                    <span className="font-mono font-medium">
                                        {order.order_no}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.order_date')}
                                    </span>
                                    <span className="text-sm">
                                        {formatDateTime(order.created_at)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.updated_at')}
                                    </span>
                                    <span className="text-sm">
                                        {formatDateTime(order.updated_at)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.points_spent')}
                                    </span>
                                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                                        <Coins className="h-5 w-5" />
                                        {formatNumber(order.points_spent)}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.order_status')}
                                    </span>
                                    <Badge
                                        variant={
                                            statusConfig[order.status].variant
                                        }
                                    >
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {statusConfig[order.status].label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Third Party Order Info */}
                        {order.third_party_order_id && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Package className="h-4 w-4" />
                                        {t('shop.third_party_order')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            {t('shop.external_order_id')}
                                        </p>
                                        <p className="font-mono text-sm">
                                            {order.third_party_order_id}
                                        </p>
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
