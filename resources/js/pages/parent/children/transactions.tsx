import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History } from 'lucide-react';
import PageHeader from '@/components/page-header';
import PaginationBar from '@/components/pagination-bar';
import StatusBadge from '@/components/status-badge';
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

export default function ParentChildTransactions({
    child,
    transactions,
}: PageProps) {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.parent_center'), href: '/parent' },
        { title: t('parent.children.title'), href: '/parent/children' },
        {
            title: t('points.history'),
            href: '/parent/children/[id]/transactions',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('parent.transactions.head_title', {
                    name: child.name,
                })}
            />

            <div className="space-y-6 p-4">
                <PageHeader
                    title={t('parent.transactions.page_title', {
                        name: child.name,
                    })}
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
                            <History className="h-4 w-4" />
                            {t('parent.transactions.all_records')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <Empty
                                icon={History}
                                title={t('parent.transactions.empty')}
                                description={t(
                                    'parent.transactions.empty_description',
                                )}
                            />
                        ) : (
                            <div className="space-y-3">
                                {transactions.data.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex flex-col gap-4 rounded-lg border border-border/70 bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {transaction.description}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatDateTime(
                                                    transaction.created_at,
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                                            <StatusBadge
                                                tone="outline"
                                                label={
                                                    transaction.type === 'total'
                                                        ? t(
                                                              'points.total_points',
                                                          )
                                                        : t(
                                                              'dashboard.redeemable',
                                                          )
                                                }
                                            />
                                            <StatusBadge
                                                tone={
                                                    transaction.amount > 0
                                                        ? 'success'
                                                        : 'destructive'
                                                }
                                                label={`${transaction.amount > 0 ? '+' : ''}${transaction.amount}`}
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
