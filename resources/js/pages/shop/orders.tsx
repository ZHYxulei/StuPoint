import { Head, Link, router, useForm } from '@inertiajs/react';
import { Package, Search, Filter, Eye, Calendar, Coins } from 'lucide-react';
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
import { formatDate, formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface ProductCategory {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    image: string | null;
    points_required: number;
    category: ProductCategory | null;
}

interface Order {
    id: number;
    order_no: string;
    points_spent: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
    created_at: string;
    product: Product;
}

interface Paginator {
    data: Order[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PageProps {
    orders: Paginator;
    filters: {
        status?: string;
    };
}

export default function ShopOrders({ orders, filters }: PageProps) {
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
        }
    > = {
        pending: { label: t('status.pending'), variant: 'warning' },
        processing: { label: t('status.processing'), variant: 'default' },
        completed: { label: t('status.completed'), variant: 'success' },
        cancelled: { label: t('status.cancelled'), variant: 'destructive' },
        failed: { label: t('status.failed'), variant: 'destructive' },
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
    ];

    const { get, processing } = useForm({
        status: filters.status || 'all',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/shop/orders', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('shop.my_orders')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('shop.my_orders')}
                        description={t('shop.orders_description')}
                    />
                    <Button asChild variant="outline" size="sm">
                        <Link href="/shop">
                            <Package className="mr-2 h-4 w-4" />
                            {t('shop.back_to_shop')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            {t('shop.filter_orders')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="status">
                                    {t('shop.order_status')}
                                </Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) =>
                                        router.get(
                                            '/shop/orders',
                                            {
                                                ...filters,
                                                status:
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
                                    <SelectTrigger id="status">
                                        <SelectValue
                                            placeholder={t('shop.all_statuses')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('shop.all_statuses')}
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
                                        <SelectItem value="failed">
                                            {t('status.failed')}
                                        </SelectItem>
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
                                    {t('common.search')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Orders List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('shop.orders')}</CardTitle>
                        <CardDescription>
                            {t('shop.orders_showing', {
                                from: orders.from ?? 0,
                                to: orders.to ?? 0,
                                total: orders.total,
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>{t('errors.no_orders_found')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.data.map((order) => (
                                    <Card
                                        key={order.id}
                                        className="overflow-hidden border border-sidebar-border/70 transition-shadow hover:shadow-md dark:border-sidebar-border"
                                    >
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Product Image */}
                                            <div className="flex items-center justify-center bg-muted p-4 sm:h-32 sm:w-32">
                                                {order.product.image ? (
                                                    <img
                                                        src={
                                                            order.product.image
                                                        }
                                                        alt={order.product.name}
                                                        className="h-full w-full rounded object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-16 w-16 text-muted-foreground opacity-20" />
                                                )}
                                            </div>

                                            {/* Order Details */}
                                            <div className="flex-1 p-4">
                                                <div className="mb-2 flex items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <p className="truncate font-semibold">
                                                                {
                                                                    order
                                                                        .product
                                                                        .name
                                                                }
                                                            </p>
                                                            <Badge
                                                                variant={
                                                                    statusConfig[
                                                                        order
                                                                            .status
                                                                    ].variant
                                                                }
                                                            >
                                                                {
                                                                    statusConfig[
                                                                        order
                                                                            .status
                                                                    ].label
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>
                                                                {t(
                                                                    'shop.order_prefix',
                                                                )}
                                                                :{' '}
                                                                {order.order_no}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(
                                                                    order.created_at,
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 font-bold text-primary">
                                                            <Coins className="h-4 w-4" />
                                                            {formatNumber(
                                                                order.points_spent,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                    {order.product.category && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {
                                                                order.product
                                                                    .category
                                                                    .name
                                                            }
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/shop/orders/${order.id}`}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            {t(
                                                                'common.view_details',
                                                            )}
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <PaginationBar links={orders.links} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
