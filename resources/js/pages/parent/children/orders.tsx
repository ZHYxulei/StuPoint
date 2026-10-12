import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import PageHeader from '@/components/page-header';
import PaginationBar from '@/components/pagination-bar';
import StatusBadge, { type StatusTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format';
import { t } from '@/lib/i18n';
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

export default function ParentChildOrders({ child, orders }: PageProps) {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.parent_center'), href: '/parent' },
        { title: t('parent.children.title'), href: '/parent/children' },
        {
            title: t('parent.orders.title'),
            href: '/parent/children/[id]/orders',
        },
    ];

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; tone: StatusTone }> = {
            pending: { label: t('status.pending'), tone: 'warning' },
            processing: { label: t('status.processing'), tone: 'info' },
            completed: { label: t('status.completed'), tone: 'success' },
            cancelled: { label: t('status.cancelled'), tone: 'secondary' },
            failed: { label: t('status.failed'), tone: 'destructive' },
        };
        const info = statusMap[status] || {
            label: t('status.unknown'),
            tone: 'secondary',
        };

        return <StatusBadge tone={info.tone} label={info.label} />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('parent.orders.head_title', { name: child.name })} />

            <div className="space-y-6 p-4">
                <PageHeader
                    title={t('parent.orders.page_title', { name: child.name })}
                    description={`${t('profile.student_id')}: ${child.student_id}`}
                    actions={
                        <Button asChild variant="outline">
                            <Link href={`/parent/children/${child.id}`}>
                                <ArrowLeft className="size-4" />
                                {t('parent.back_to_detail')}
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShoppingCart className="h-4 w-4" />
                            {t('parent.orders.all_records')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <Empty
                                icon={Package}
                                title={t('parent.orders.empty')}
                                description={t(
                                    'parent.orders.empty_description',
                                )}
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
                                                <p className="font-medium">
                                                    {order.product_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('shop.order_number')}:{' '}
                                                    {order.order_no}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        order.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">
                                                    -{order.points_spent}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t('points.title')}
                                                </p>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {orders.last_page > 1 && <PaginationBar links={orders.links} />}
            </div>
        </AppLayout>
    );
}
