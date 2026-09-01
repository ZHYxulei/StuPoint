import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History } from 'lucide-react';
import PageHeader from '@/components/page-header';
import PaginationBar from '@/components/pagination-bar';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
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

interface Transaction {
    id: number;
    type: string;
    amount: number;
    description: string;
    created_at: string;
}

interface Child {
    id: number;
    name: string;
    student_id: string;
}

interface PageProps {
    child: Child;
    transactions: Paginator<Transaction>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '家长中心', href: '/parent' },
    { title: '我的子女', href: '/parent/children' },
    { title: '积分记录', href: '/parent/children/[id]/transactions' },
];

export default function ParentChildTransactions({ child, transactions }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${child.name} - 积分记录`} />

            <div className="space-y-6 p-4">
                <PageHeader
                    title={`${child.name} 的积分记录`}
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
                            <History className="h-4 w-4" />
                            全部交易记录
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <Empty
                                icon={History}
                                title="暂无积分变动记录"
                                description="孩子获得或使用积分后，交易记录会显示在这里。"
                            />
                        ) : (
                            <div className="space-y-3">
                                {transactions.data.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex flex-col gap-4 rounded-lg border border-border/70 bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {new Date(t.created_at).toLocaleString('zh-CN')}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                                            <StatusBadge
                                                tone="outline"
                                                label={t.type === 'total' ? '总积分' : '可兑换'}
                                            />
                                            <StatusBadge
                                                tone={t.amount > 0 ? 'success' : 'destructive'}
                                                label={`${t.amount > 0 ? '+' : ''}${t.amount}`}
                                                className="min-w-20 justify-center"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {transactions.last_page > 1 && (
                    <PaginationBar links={transactions.links} />
                )}
            </div>
        </AppLayout>
    );
}
