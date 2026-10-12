import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Search,
    Eye,
    Package,
    User,
    Calendar,
    TrendingUp,
    ShoppingCart,
    ShieldCheck,
    AlertCircle,
} from 'lucide-react';
import { useState, useRef } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
    total: number;
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

export default function OrderIndex({ orders, stats, filters }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const [successMessage, setSuccessMessage] = useState('');

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
        }
    > = {
        pending: { label: t('status.pending'), variant: 'warning' },
        processing: { label: t('status.processing'), variant: 'default' },
        completed: { label: t('status.completed'), variant: 'success' },
        cancelled: { label: t('status.cancelled'), variant: 'destructive' },
        failed: { label: t('status.failed'), variant: 'destructive' },
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.orders'), href: '/admin/orders' },
    ];

    const { get, setData, processing } = useForm({
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
            <Head title={t('nav.orders')} />

            <div className="space-y-6 p-4">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.orders.stats_total')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.total}
                                    </p>
                                </div>
                                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('status.pending')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.pending}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-warning" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('status.processing')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.processing}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-info" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('status.completed')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.completed}
                                    </p>
                                </div>
                                <Package className="h-8 w-8 text-success" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('shop.points_spent')}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatNumber(
                                            stats.total_points_spent,
                                        )}
                                    </p>
                                </div>
                                <User className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t('admin.orders.search_and_filter')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="search">
                                    {t('admin.orders.search_orders')}
                                </Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder={t(
                                            'admin.orders.search_placeholder',
                                        )}
                                        value={filters.search || ''}
                                        onChange={(e) =>
                                            setData('search', e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    {t('shop.order_status')}
                                </Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={t(
                                                'admin.orders.select_status',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('common.all')}
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            {t('status.pending')}
                                        </SelectItem>
                                        <SelectItem value="processing">
                                            {t('status.processing')}
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            {t('status.completed')}
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            {t('status.cancelled')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product">
                                    {t('shop.product')}
                                </Label>
                                <Input
                                    id="product"
                                    placeholder={t(
                                        'admin.orders.product_placeholder',
                                    )}
                                    value={filters.product || ''}
                                    onChange={(e) =>
                                        setData('product', e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {t('common.search')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Success Message */}
                {successMessage && (
                    <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-success-foreground">
                        <AlertCircle className="h-4 w-4" />
                        {successMessage}
                    </div>
                )}

                {/* Orders Table */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('admin.orders.list_title')}</CardTitle>
                        <CardDescription>
                            {t('admin.orders.total_orders', {
                                count: formatNumber(orders.total),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t('shop.order_number')}
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t('shop.product')}
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t('admin.orders.user')}
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t('admin.orders.points')}
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t('common.status')}
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t(
                                                'admin.orders.verification_status',
                                            )}
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t('shop.order_date')}
                                        </th>
                                        <th className="p-3 text-left text-sm font-medium">
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b hover:bg-muted/50"
                                        >
                                            <td className="p-3">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="font-mono text-sm hover:underline"
                                                >
                                                    {order.order_no}
                                                </Link>
                                            </td>
                                            <td className="p-3 text-sm">
                                                {order.product.name}
                                            </td>
                                            <td className="p-3 text-sm">
                                                <div>{order.user.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {order.user.email}
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm font-medium">
                                                {formatNumber(
                                                    order.points_spent,
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant={
                                                        statusConfig[
                                                            order.status
                                                        ]?.variant
                                                    }
                                                >
                                                    {
                                                        statusConfig[
                                                            order.status
                                                        ]?.label
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                {order.verified_at ? (
                                                    <span className="flex items-center gap-1 text-xs text-success">
                                                        <Package className="h-3 w-3" />
                                                        {t(
                                                            'admin.orders.verified',
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        {t(
                                                            'admin.orders.unverified',
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-sm">
                                                {formatDateTime(
                                                    order.created_at,
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                        >
                                                            {t(
                                                                'common.view_details',
                                                            )}
                                                        </Link>
                                                    </Button>
                                                    {order.status ===
                                                        'pending' && (
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={`/admin/orders/${order.id}/edit`}
                                                            >
                                                                {t(
                                                                    'admin.orders.update_status',
                                                                )}
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {!order.verified_at &&
                                                        order.status !==
                                                            'cancelled' &&
                                                        order.status !==
                                                            'completed' && (
                                                            <VerifyOrderDialog
                                                                orderId={
                                                                    order.id
                                                                }
                                                                orderNo={
                                                                    order.order_no
                                                                }
                                                                onSuccess={() =>
                                                                    setSuccessMessage(
                                                                        t(
                                                                            'admin.orders.verify_success',
                                                                        ),
                                                                    )
                                                                }
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

function VerifyOrderDialog({
    orderId,
    orderNo,
    onSuccess,
}: {
    orderId: string | number;
    orderNo: string;
    onSuccess: () => void;
}) {
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
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const verificationSuccessfulRef = useRef(false);
    const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            codeInputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            codeInputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            codeInputRefs.current[index + 1]?.focus();
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
        codeInputRefs.current[lastIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setData('method', activeTab);
        setErrors({}); // Clear previous errors
        setSuccessMessage(''); // Clear previous success message

        const url = `/admin/orders/${orderId}/verify`;

        try {
            const response = await fetch(url, {
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
                    code: data.code,
                    password: data.password,
                    id_number: data.id_number,
                    name: data.name,
                    admin_password: data.admin_password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMessage(
                    result.message ||
                        t('admin.orders.verified_success_message'),
                );
                setShowSuccess(true);
                verificationSuccessfulRef.current = true;
                reset();
                // Close dialog after 2 seconds and refresh page
                setTimeout(() => {
                    setIsDialogOpen(false);
                    // Directly refresh page after closing dialog
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }, 2000);
            } else {
                // Handle validation errors
                const newErrors: Record<string, string> = {};
                if (result.errors) {
                    Object.keys(result.errors).forEach((key) => {
                        const errorArray = result.errors[key];
                        newErrors[key] = Array.isArray(errorArray)
                            ? errorArray[0]
                            : errorArray;
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
            setErrors({ __all__: t('admin.orders.verify_failed_retry') });
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when dialog closes
            reset();
            setCodeDigits(['', '', '', '', '', '']);
            setErrors({});
            setSuccessMessage('');
            setShowSuccess(false);
            verificationSuccessfulRef.current = false;
        }
    };

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
                setIsDialogOpen(open);
                handleOpenChange(open);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {t('admin.orders.verify')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('admin.orders.verify_title')}</DialogTitle>
                    <DialogDescription>
                        {t('shop.order_number')}: {orderNo}
                    </DialogDescription>
                </DialogHeader>

                {/* Show global error if any */}
                {errors.__all__ && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-red-800 dark:text-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errors.__all__}</span>
                    </div>
                )}

                {/* Show success message if any */}
                {showSuccess && successMessage && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft p-3 text-sm text-success-foreground">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className={showSuccess ? 'hidden' : 'space-y-4'}
                >
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => {
                            setActiveTab(v as VerificationMethod);
                            // Clear errors when switching tabs
                            setErrors({});
                        }}
                    >
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="code" className="text-xs">
                                {t('admin.orders.code')}
                            </TabsTrigger>
                            <TabsTrigger value="password" className="text-xs">
                                {t('auth.password')}
                            </TabsTrigger>
                            <TabsTrigger value="id_card" className="text-xs">
                                {t('admin.orders.id_card')}
                            </TabsTrigger>
                            <TabsTrigger value="direct" className="text-xs">
                                {t('admin.orders.direct')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="code" className="mt-4 space-y-3">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.orders.code_hint')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    {t('admin.orders.code')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex justify-center gap-2">
                                    {codeDigits.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => {
                                                codeInputRefs.current[index] =
                                                    el;
                                            }}
                                            id={`code-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleCodeChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleCodeKeyDown(index, e)
                                            }
                                            onPaste={handleCodePaste}
                                            className="h-14 w-12 text-center font-mono text-2xl tracking-wider"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                <InputError message={errors.code} />
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="password"
                            className="mt-4 space-y-3"
                        >
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.orders.password_hint')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {t('auth.password')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t(
                                        'admin.orders.user_password_placeholder',
                                    )}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                />
                                <InputError message={errors.password} />
                            </div>
                        </TabsContent>

                        <TabsContent value="id_card" className="mt-4 space-y-3">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.orders.id_card_hint')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="id_number">
                                    {t('admin.orders.id_number')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="id_number"
                                    placeholder={t(
                                        'admin.orders.id_number_placeholder',
                                    )}
                                    value={data.id_number}
                                    onChange={(e) =>
                                        setData('id_number', e.target.value)
                                    }
                                />
                                <InputError message={errors.id_number} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    {t('auth.name')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder={t(
                                        'admin.orders.name_placeholder',
                                    )}
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                <InputError message={errors.name} />
                            </div>
                        </TabsContent>

                        <TabsContent value="direct" className="mt-4 space-y-3">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-center text-sm text-muted-foreground">
                                    {t('admin.orders.direct_hint')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_password">
                                    {t('admin.orders.admin_password')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="admin_password"
                                    type="password"
                                    placeholder={t(
                                        'admin.orders.admin_password_placeholder',
                                    )}
                                    value={data.admin_password}
                                    onChange={(e) =>
                                        setData(
                                            'admin_password',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.admin_password} />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex gap-3 pt-2">
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                            >
                                {t('common.cancel')}
                            </Button>
                        </DialogTrigger>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1"
                        >
                            {processing
                                ? t('admin.orders.verifying')
                                : t('admin.orders.confirm_verify')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
