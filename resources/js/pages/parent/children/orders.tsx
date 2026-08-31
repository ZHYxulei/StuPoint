import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import PaginationBar from '@/components/pagination-bar';
import StatusBadge, { type StatusTone } from '@/components/status-badge';
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
        const statusMap: Record<string, { label: string; tone: StatusTone }> = {
            pending: { label: '待处理', tone: 'warning' },
            processing: { label: '处理中', tone: 'info' },
            completed: { label: '已完成', tone: 'success' },
            cancelled: { label: '已取消', tone: 'secondary' },
            failed: { label: '失败', tone: 'destructive' },
        };
        const info = statusMap[status] || { label: status, tone: 'secondary' };

        return <StatusBadge tone={info.tone} label={info.label} />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${child.name} - 兑换记录`} />

            <div className="space-y-6 p-4">
                <PageHeader
                    title={`${child.name} 的兑换记录`}
                    description={`学号: ${child.student_id}`}
                    actions={(
                        <Button asChild variant="outline">
                            <Link href={`/parent/children/${child.id}`}>
                                <ArrowLeft className="size-4" />
                                返回详情
                            </Link>
                        </Button>
                    )}
                />

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            全部兑换记录
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <Empty
                                icon={Package}
                                title="暂无兑换记录"
                                description="孩子完成积分兑换后，订单会显示在这里。"
                            />
                        ) : (
                            <div className="space-y-3">
                                {orders.data.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex flex-col gap-4 rounded-lg border border-border/70 bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
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
                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
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
                    <PaginationBar links={orders.links} />
                )}
            </div>
        </AppLayout>
    );
}
