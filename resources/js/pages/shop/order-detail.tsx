import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Calendar, Coins, User, MapPin, Phone, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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

interface Operator {
    id: number;
    name: string;
}

interface OrderStatusHistory {
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
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
    shipping_info: {
        name: string;
        phone: string;
        address: string;
    };
    third_party_order_id: string | null;
    created_at: string;
    updated_at: string;
    product: Product;
    statusHistory: OrderStatusHistory[];
}

interface PageProps {
    order: Order;
}

const statusConfig: Record<string, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
    icon: React.ElementType;
    color: string;
}> = {
    pending: {
        label: 'Pending',
        variant: 'warning',
        icon: Clock,
        color: 'text-yellow-600 dark:text-yellow-400',
    },
    processing: {
        label: 'Processing',
        variant: 'default',
        icon: AlertCircle,
        color: 'text-blue-600 dark:text-blue-400',
    },
    completed: {
        label: 'Completed',
        variant: 'success',
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'destructive',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
    },
    failed: {
        label: 'Failed',
        variant: 'destructive',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
    },
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
    {
        title: 'Order Details',
        href: '',
    },
];

export default function ShopOrderDetail({ order }: PageProps) {
    const StatusIcon = statusConfig[order.status].icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_no}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/shop/orders">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Orders
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold mt-3">Order Details</h1>
                    </div>
                    <Badge variant={statusConfig[order.status].variant} className="text-sm px-3 py-1">
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusConfig[order.status].label}
                    </Badge>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
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
                                                {order.product.points_required.toLocaleString()} points
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Info */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Recipient Name</p>
                                        <p className="font-medium">{order.shipping_info.name}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone Number</p>
                                        <p className="font-medium">{order.shipping_info.phone}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Delivery Address</p>
                                        <p className="font-medium whitespace-pre-wrap">{order.shipping_info.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Timeline */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>Order Timeline</CardTitle>
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
                                                        by {history.operator.name}
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
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Order Number</span>
                                    <span className="font-mono font-medium">{order.order_no}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Order Date</span>
                                    <span className="text-sm">{new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span className="text-sm">{new Date(order.updated_at).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Points Spent</span>
                                    <div className="flex items-center gap-1 text-primary font-bold text-lg">
                                        <Coins className="h-5 w-5" />
                                        {order.points_spent.toLocaleString()}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
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
                                        Third Party Order
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">External Order ID</p>
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
