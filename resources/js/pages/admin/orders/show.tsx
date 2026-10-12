import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    Phone,
    Calendar,
    Coins,
    Clock,
    CheckCircle2,
    AlertCircle,
    Shield,
    ShieldCheck,
    ShieldX,
} from 'lucide-react';
import React from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
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

export default function OrderShow({
    order: initialOrder,
    verification_code,
    verification_code_expired,
}: PageProps) {
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
            icon: AlertCircle,
            color: 'text-destructive',
        },
        failed: {
            label: t('status.failed'),
            variant: 'destructive',
            icon: AlertCircle,
            color: 'text-destructive',
        },
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.orders'), href: '/admin/orders' },
        { title: t('shop.order_details'), href: '' },
    ];

    const { auth } = usePage<SharedData>().props;
    const [localOrder, setLocalOrder] = React.useState(initialOrder);
    const currentUser = auth.user;
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    // Check if user has permission to verify orders (admin, head_teacher, grade_director, etc.)
    const canVerifyOrder =
        currentUser &&
        (currentUser.email === 'admin@example.com' ||
            currentUser.is_head_teacher ||
            (currentUser as any).roles?.some((r: any) =>
                ['admin', 'head_teacher', 'grade_director'].includes(r.slug),
            ));

    // Computed values that will update when localOrder changes
    const isOrderVerified = React.useMemo(
        () => !!localOrder.verified_at,
        [localOrder.verified_at],
    );
    const canVerifyThisOrder = React.useMemo(
        () =>
            canVerifyOrder &&
            !isOrderVerified &&
            localOrder.status !== 'cancelled',
        [canVerifyOrder, isOrderVerified, localOrder.status],
    );
    const StatusIcon = React.useMemo(
        () => statusConfig[localOrder.status].icon,
        [localOrder.status],
    );

    // Verification form state
    const verificationForm = useForm({
        method: 'code' as VerificationMethod,
        code: '',
        password: '',
        id_number: '',
        name: '',
        admin_password: '',
    });

    const [activeTab, setActiveTab] =
        React.useState<VerificationMethod>('code');
    const [showDirectVerifyDialog, setShowDirectVerifyDialog] =
        React.useState(false);

    const [isVerifying, setIsVerifying] = React.useState(false);
    const [verificationError, setVerificationError] = React.useState('');
    const [verificationSuccess, setVerificationSuccess] = React.useState('');

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'direct') {
            setShowDirectVerifyDialog(true);
            return;
        }

        setIsVerifying(true);
        setVerificationError('');
        setVerificationSuccess('');

        try {
            const response = await fetch(
                `/admin/orders/${localOrder.id}/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({
                        method: activeTab,
                        code: verificationForm.data.code,
                        password: verificationForm.data.password,
                        id_number: verificationForm.data.id_number,
                        name: verificationForm.data.name,
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                // Update local order status first
                const updatedOrder = {
                    ...localOrder,
                    verified_at: new Date().toISOString(),
                    status: 'completed',
                };
                setLocalOrder(updatedOrder);
                // Show success message and reset form
                setVerificationSuccess(
                    data.message ||
                        t('admin.orders.verified_success_message'),
                );
                verificationForm.reset();
                // Force re-render immediately to ensure UI updates
                forceUpdate();
            } else {
                setVerificationError(
                    data.message || t('admin.orders.verify_failed'),
                );
            }
        } catch (error) {
            setVerificationError(t('admin.orders.network_error'));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDirectVerify = async () => {
        setIsVerifying(true);
        setVerificationError('');
        setVerificationSuccess('');

        try {
            const response = await fetch(
                `/admin/orders/${localOrder.id}/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({
                        method: 'direct',
                        admin_password: verificationForm.data.admin_password,
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                // Update local order status first
                const updatedOrder = {
                    ...localOrder,
                    verified_at: new Date().toISOString(),
                    status: 'completed',
                };
                setLocalOrder(updatedOrder);
                // Show success message and reset form
                setVerificationSuccess(
                    data.message || t('admin.orders.direct_verify_success'),
                );
                verificationForm.reset();
                // Force re-render to ensure UI updates
                forceUpdate();
                // Close dialog after 2 seconds
                setTimeout(() => {
                    setShowDirectVerifyDialog(false);
                    setVerificationSuccess('');
                }, 2000);
            } else {
                setVerificationError(
                    data.message || t('admin.orders.verify_failed'),
                );
            }
        } catch (error) {
            setVerificationError(t('admin.orders.network_error'));
        } finally {
            setIsVerifying(false);
        }
    };

    const clearError = () => {
        setVerificationError('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('admin.orders.head_title', {
                    no: localOrder.order_no,
                })}
            />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common.back')}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">
                            {localOrder.order_no}
                        </h1>
                        <Badge
                            variant={statusConfig[localOrder.status].variant}
                            className="px-3 py-1 text-sm"
                        >
                            <StatusIcon className="mr-1 h-4 w-4" />
                            {statusConfig[localOrder.status].label}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
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
                                        <Package className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            {localOrder.product.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {localOrder.product.category && (
                                                <Badge variant="outline">
                                                    {
                                                        localOrder.product
                                                            .category.name
                                                    }
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>
                                    {t('admin.users.user_info')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">
                                            {localOrder.user.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {localOrder.user.email}
                                        </p>
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
                                            {localOrder.shipping_info.name}
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
                                            {localOrder.shipping_info.phone}
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
                                            {localOrder.shipping_info.address}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Timeline */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>
                                    {t('shop.order_timeline')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {localOrder.statusHistory &&
                                    localOrder.statusHistory.length > 0 ? (
                                        localOrder.statusHistory.map(
                                            (history, index) => (
                                                <div
                                                    key={history.id}
                                                    className="flex gap-3"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`h-3 w-3 rounded-full ${
                                                                index === 0
                                                                    ? 'bg-primary'
                                                                    : 'bg-muted'
                                                            }`}
                                                        />
                                                        {index <
                                                            localOrder
                                                                .statusHistory
                                                                .length -
                                                                1 && (
                                                            <div className="mt-1 w-0.5 flex-1 bg-muted" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <p className="font-medium capitalize">
                                                                {history.to_status.replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                <Calendar className="mr-1 h-3 w-3" />
                                                                {formatDateTime(
                                                                    history.created_at,
                                                                )}
                                                            </Badge>
                                                        </div>
                                                        {history.note && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {history.note}
                                                            </p>
                                                        )}
                                                        {history.operator && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {t(
                                                                    'admin.orders.operator',
                                                                    {
                                                                        name: history
                                                                            .operator
                                                                            .name,
                                                                    },
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            {t('admin.orders.no_history')}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>
                                    {t('shop.order_summary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.order_number')}
                                    </span>
                                    <span className="font-mono text-sm font-medium">
                                        {localOrder.order_no}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.order_date')}
                                    </span>
                                    <span className="text-sm">
                                        {formatDateTime(
                                            localOrder.created_at,
                                        )}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.last_updated')}
                                    </span>
                                    <span className="text-sm">
                                        {formatDateTime(
                                            localOrder.updated_at,
                                        )}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.points_spent')}
                                    </span>
                                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                                        <Coins className="h-5 w-5" />
                                        {formatNumber(
                                            localOrder.points_spent,
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('shop.order_status')}
                                    </span>
                                    <Badge
                                        variant={
                                            statusConfig[localOrder.status]
                                                .variant
                                        }
                                    >
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {statusConfig[localOrder.status].label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Third Party Order Info */}
                        {localOrder.third_party_order_id && (
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
                                            {t(
                                                'admin.orders.external_order_id',
                                            )}
                                        </p>
                                        <p className="font-mono text-sm">
                                            {localOrder.third_party_order_id}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Verification */}
                        {canVerifyOrder && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Shield className="h-4 w-4" />
                                        {t('admin.orders.verify_title')}
                                    </CardTitle>
                                    <CardDescription>
                                        {isOrderVerified
                                            ? t(
                                                  'admin.orders.already_verified',
                                              )
                                            : t('admin.orders.select_method')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isOrderVerified ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-success">
                                                <ShieldCheck className="h-5 w-5" />
                                                <span className="font-medium">
                                                    {t('admin.orders.verified')}
                                                </span>
                                            </div>
                                            <Separator />
                                            {verification_code && (
                                                <div>
                                                    <p className="mb-1 text-sm text-muted-foreground">
                                                        {t('admin.orders.code')}
                                                    </p>
                                                    <p className="font-mono text-lg font-bold tracking-wider">
                                                        {verification_code}
                                                    </p>
                                                </div>
                                            )}
                                            <Separator />
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    {t(
                                                        'admin.orders.verified_at',
                                                    )}
                                                </p>
                                                <p className="text-sm">
                                                    {formatDateTime(
                                                        localOrder.verified_at!,
                                                    )}
                                                </p>
                                            </div>
                                            {localOrder.verifiedBy && (
                                                <>
                                                    <Separator />
                                                    <div>
                                                        <p className="mb-1 text-sm text-muted-foreground">
                                                            {t(
                                                                'admin.orders.verified_by',
                                                            )}
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                localOrder
                                                                    .verifiedBy
                                                                    .name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                localOrder
                                                                    .verifiedBy
                                                                    .email
                                                            }
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : canVerifyThisOrder ? (
                                        <form
                                            onSubmit={handleVerification}
                                            className="space-y-4"
                                        >
                                            {verificationSuccess && (
                                                <Alert
                                                    variant="default"
                                                    className="border-success/30 bg-success-soft text-success-foreground"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {verificationSuccess}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            {verificationError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {verificationError}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            <Tabs
                                                value={activeTab}
                                                onValueChange={(v) =>
                                                    setActiveTab(
                                                        v as VerificationMethod,
                                                    )
                                                }
                                            >
                                                <TabsList className="grid w-full grid-cols-4">
                                                    <TabsTrigger
                                                        value="code"
                                                        className="text-xs"
                                                    >
                                                        {t('admin.orders.code')}
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="password"
                                                        className="text-xs"
                                                    >
                                                        {t('auth.password')}
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="id_card"
                                                        className="text-xs"
                                                    >
                                                        {t(
                                                            'admin.orders.id_card',
                                                        )}
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="direct"
                                                        className="text-xs"
                                                    >
                                                        {t('admin.orders.direct')}
                                                    </TabsTrigger>
                                                </TabsList>

                                                <TabsContent
                                                    value="code"
                                                    className="mt-4 space-y-3"
                                                >
                                                    {verification_code ? (
                                                        <>
                                                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                                                <p className="mb-1 text-xs text-muted-foreground">
                                                                    {t(
                                                                        'admin.orders.code',
                                                                    )}
                                                                </p>
                                                                <p className="font-mono text-xl font-bold tracking-wider">
                                                                    {
                                                                        verification_code
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="code">
                                                                    {t(
                                                                        'admin.orders.input_code',
                                                                    )}
                                                                </Label>
                                                                <Input
                                                                    id="code"
                                                                    placeholder={t(
                                                                        'admin.orders.code_placeholder',
                                                                    )}
                                                                    maxLength={
                                                                        6
                                                                    }
                                                                    value={
                                                                        verificationForm
                                                                            .data
                                                                            .code
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        verificationForm.setData(
                                                                            'code',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="text-center font-mono text-lg tracking-wider"
                                                                />
                                                                <InputError
                                                                    message={
                                                                        verificationForm
                                                                            .errors
                                                                            .code
                                                                    }
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                                            {t(
                                                                'admin.orders.no_code',
                                                            )}
                                                        </p>
                                                    )}
                                                </TabsContent>

                                                <TabsContent
                                                    value="password"
                                                    className="mt-4 space-y-3"
                                                >
                                                    <div className="rounded-lg bg-muted/50 p-3">
                                                        <p className="text-xs text-muted-foreground">
                                                            {t(
                                                                'admin.orders.password_hint',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">
                                                            {t(
                                                                'auth.password',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="password"
                                                            type="password"
                                                            placeholder={t(
                                                                'admin.orders.user_password_placeholder',
                                                            )}
                                                            value={
                                                                verificationForm
                                                                    .data
                                                                    .password
                                                            }
                                                            onChange={(e) =>
                                                                verificationForm.setData(
                                                                    'password',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                verificationForm
                                                                    .errors
                                                                    .password
                                                            }
                                                        />
                                                    </div>
                                                </TabsContent>

                                                <TabsContent
                                                    value="id_card"
                                                    className="mt-4 space-y-3"
                                                >
                                                    <div className="rounded-lg bg-muted/50 p-3">
                                                        <p className="text-xs text-muted-foreground">
                                                            {t(
                                                                'admin.orders.id_card_hint',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="id_number">
                                                            {t(
                                                                'admin.orders.id_number',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="id_number"
                                                            placeholder={t(
                                                                'admin.orders.id_number_placeholder',
                                                            )}
                                                            value={
                                                                verificationForm
                                                                    .data
                                                                    .id_number
                                                            }
                                                            onChange={(e) =>
                                                                verificationForm.setData(
                                                                    'id_number',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                verificationForm
                                                                    .errors
                                                                    .id_number
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">
                                                            {t('auth.name')}
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            placeholder={t(
                                                                'admin.orders.name_placeholder',
                                                            )}
                                                            value={
                                                                verificationForm
                                                                    .data.name
                                                            }
                                                            onChange={(e) =>
                                                                verificationForm.setData(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                verificationForm
                                                                    .errors.name
                                                            }
                                                        />
                                                    </div>
                                                </TabsContent>

                                                <TabsContent
                                                    value="direct"
                                                    className="mt-4 space-y-3"
                                                >
                                                    <div className="rounded-lg bg-muted/50 p-3">
                                                        <p className="text-center text-sm text-muted-foreground">
                                                            {t(
                                                                'admin.orders.direct_hint',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="admin_password">
                                                            {t(
                                                                'admin.orders.admin_password',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="admin_password"
                                                            type="password"
                                                            placeholder={t(
                                                                'admin.orders.admin_password_placeholder',
                                                            )}
                                                            value={
                                                                verificationForm
                                                                    .data
                                                                    .admin_password
                                                            }
                                                            onChange={(e) =>
                                                                verificationForm.setData(
                                                                    'admin_password',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                verificationForm
                                                                    .errors
                                                                    .admin_password
                                                            }
                                                        />
                                                    </div>
                                                </TabsContent>
                                            </Tabs>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={isVerifying}
                                            >
                                                {isVerifying
                                                    ? t(
                                                          'admin.orders.verifying',
                                                      )
                                                    : t(
                                                          'admin.orders.confirm_verify',
                                                      )}
                                            </Button>
                                        </form>
                                    ) : localOrder.status === 'cancelled' ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <ShieldX className="h-5 w-5" />
                                            <span className="text-sm">
                                                {t(
                                                    'admin.orders.cancelled_cannot_verify',
                                                )}
                                            </span>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Direct Verification Confirmation Dialog */}
                <AlertDialog
                    open={showDirectVerifyDialog}
                    onOpenChange={setShowDirectVerifyDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('admin.orders.confirm_direct_title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('admin.orders.direct_confirm_description', {
                                    no: localOrder.order_no,
                                })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        {verificationSuccess && (
                            <Alert
                                variant="default"
                                className="my-4 border-success/30 bg-success-soft text-success-foreground"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>
                                    {verificationSuccess}
                                </AlertDescription>
                            </Alert>
                        )}
                        {verificationError && (
                            <Alert variant="destructive" className="my-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {verificationError}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2 py-4">
                            <Label htmlFor="dialog_admin_password">
                                {t('admin.orders.admin_password')}
                            </Label>
                            <Input
                                id="dialog_admin_password"
                                type="password"
                                placeholder={t(
                                    'admin.orders.admin_password_placeholder',
                                )}
                                value={verificationForm.data.admin_password}
                                onChange={(e) =>
                                    verificationForm.setData(
                                        'admin_password',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={verificationForm.errors.admin_password}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isVerifying}>
                                {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDirectVerify();
                                }}
                                disabled={
                                    isVerifying ||
                                    !verificationForm.data.admin_password
                                }
                            >
                                {verificationForm.processing
                                    ? t('admin.orders.verifying')
                                    : t('admin.orders.confirm_verify')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
