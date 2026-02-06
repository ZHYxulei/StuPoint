import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ArrowLeft, History } from 'lucide-react';
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
                <div className="flex items-center gap-4">
                    <Link href={`/parent/children/${child.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={`${child.name} 的积分记录`}
                        description={`学号: ${child.student_id}`}
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <History className="h-4 w-4" />
                            全部交易记录
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <p className="text-center text-muted-foreground py-12">
                                暂无积分变动记录
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {transactions.data.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {new Date(t.created_at).toLocaleString('zh-CN')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">
                                                {t.type === 'total' ? '总积分' : '可兑换'}
                                            </Badge>
                                            <Badge
                                                variant={t.amount > 0 ? 'default' : 'destructive'}
                                                className="min-w-[80px] justify-center"
                                            >
                                                {t.amount > 0 ? '+' : ''}{t.amount}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {transactions.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination
                            currentPage={transactions.current_page}
                            lastPage={transactions.last_page}
                            links={transactions.links}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
