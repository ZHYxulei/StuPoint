import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Filter, Eye, Calendar, Coins } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    pending: { label: 'Pending', variant: 'warning' },
    processing: { label: 'Processing', variant: 'default' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
    failed: { label: 'Failed', variant: 'destructive' },
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shop',
        href: '/shop',
    },
    {
        title: 'My Orders',
        href: '/shop/orders',
    },
];

export default function ShopOrders({ orders, filters }: PageProps) {
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
            <Head title="My Orders" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="My Orders"
                        description="View your order history and status"
                    />
                    <Link href="/shop">
                        <Button variant="outline" size="sm">
                            <Package className="mr-2 h-4 w-4" />
                            Back to Shop
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Order Status</Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => get('/shop/orders', {
                                        data: { ...filters, status: value === 'all' ? null : value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
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
                                    Search
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Orders List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>
                            Showing {orders.from} to {orders.to} of {orders.total} orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No orders found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.data.map((order) => (
                                    <Card key={order.id} className="border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Product Image */}
                                            <div className="sm:w-32 sm:h-32 bg-muted flex items-center justify-center p-4">
                                                {order.product.image ? (
                                                    <img
                                                        src={order.product.image}
                                                        alt={order.product.name}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                ) : (
                                                    <Package className="h-16 w-16 text-muted-foreground opacity-20" />
                                                )}
                                            </div>

                                            {/* Order Details */}
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold truncate">{order.product.name}</p>
                                                            <Badge variant={statusConfig[order.status].variant}>
                                                                {statusConfig[order.status].label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <span>Order: {order.order_no}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-primary font-bold">
                                                            <Coins className="h-4 w-4" />
                                                            {order.points_spent.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    {order.product.category && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {order.product.category.name}
                                                        </Badge>
                                                    )}
                                                    <Link href={`/shop/orders/${order.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
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
