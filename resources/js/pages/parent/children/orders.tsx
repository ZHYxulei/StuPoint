import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Order {
    id: number;
    order_no: string;
    product_name: string;
    points_spent: number;
    status: string;
    created_at: string;
}

interface Child {
    id: number;
    name: string;
    student_id: string;
}

interface PageProps {
    child: Child;
    orders: Paginator<Order>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '家长中心', href: '/parent' },
    { title: '我的子女', href: '/parent/children' },
    { title: '兑换记录', href: '/parent/children/[id]/orders' },
];

export default function ParentChildOrders({ child, orders }: PageProps) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: any }> = {
            pending: { label: '待处理', variant: 'secondary' },
            processing: { label: '处理中', variant: 'default' },
            completed: { label: '已完成', variant: 'default' },
            cancelled: { label: '已取消', variant: 'destructive' },
            failed: { label: '失败', variant: 'destructive' },
        };
        const info = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={info.variant}>{info.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${child.name} - 兑换记录`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href={`/parent/children/${child.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={`${child.name} 的兑换记录`}
                        description={`学号: ${child.student_id}`}
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            全部兑换记录
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <p className="text-center text-muted-foreground py-12">
                                暂无兑换记录
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {orders.data.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.product_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    订单号: {order.order_no}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleString('zh-CN')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-primary text-lg">
                                                    -{order.points_spent}
                                                </p>
                                                <p className="text-xs text-muted-foreground">积分</p>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {orders.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination
                            currentPage={orders.current_page}
                            lastPage={orders.last_page}
                            links={orders.links}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
