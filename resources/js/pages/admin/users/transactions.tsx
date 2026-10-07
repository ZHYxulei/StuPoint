import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Filter,
    Calendar,
} from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface UserPoints {
    total_points: number;
    redeemable_points: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    student_id: string | null;
    grade: string | null;
    class: string | null;
    points: UserPoints;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    balance_after: number;
    source: string;
    description: string | null;
    created_at: string;
}

interface Paginator {
    data: Transaction[];
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
    user: User;
    transactions: Paginator;
    filters: {
        type?: string;
        source?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '用户统计', href: '/admin/users/statistics' },
    { title: '交易记录', href: '#' },
];

export default function UserTransactions({
    user,
    transactions,
    filters,
}: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - 交易记录`} />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/users/statistics">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <Heading
                            title={`${user.name} 的交易记录`}
                            description="查看该用户的所有积分变动"
                        />
                    </div>
                </div>

                {/* User Points Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                用户信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        姓名
                                    </span>
                                    <span className="font-medium">
                                        {user.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        邮箱
                                    </span>
                                    <span className="font-medium">
                                        {user.email}
                                    </span>
                                </div>
                                {user.student_id && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            学号
                                        </span>
                                        <span className="font-medium">
                                            {user.student_id}
                                        </span>
                                    </div>
                                )}
                                {user.grade && user.class && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            班级
                                        </span>
                                        <span className="font-medium">
                                            {user.grade} {user.class}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                当前积分
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            总积分
                                        </span>
                                        <span className="text-2xl font-bold text-primary">
                                            {user.points.total_points.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            可兑换积分
                                        </span>
                                        <span className="text-2xl font-bold text-success">
                                            {user.points.redeemable_points.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-success"
                                            style={{
                                                width:
                                                    user.points.total_points > 0
                                                        ? `${(user.points.redeemable_points / user.points.total_points) * 100}%`
                                                        : '0%',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            筛选记录
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">
                                    积分类型
                                </label>
                                <Select
                                    value={filters.type || 'all'}
                                    onValueChange={(value) =>
                                        router.get(
                                            `/admin/users/${user.id}/transactions`,
                                            {
                                                ...filters,
                                                type:
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
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            全部
                                        </SelectItem>
                                        <SelectItem value="total">
                                            总积分
                                        </SelectItem>
                                        <SelectItem value="redeemable">
                                            可兑换积分
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">
                                    来源
                                </label>
                                <Select
                                    value={filters.source || 'all'}
                                    onValueChange={(value) =>
                                        router.get(
                                            `/admin/users/${user.id}/transactions`,
                                            {
                                                ...filters,
                                                source:
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
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            全部
                                        </SelectItem>
                                        <SelectItem value="check_in">
                                            每日签到
                                        </SelectItem>
                                        <SelectItem value="task_complete">
                                            完成任务
                                        </SelectItem>
                                        <SelectItem value="activity_reward">
                                            活动奖励
                                        </SelectItem>
                                        <SelectItem value="manual_adjust">
                                            手动调整
                                        </SelectItem>
                                        <SelectItem value="product_exchange">
                                            商品兑换
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            交易记录
                        </CardTitle>
                        <CardDescription>
                            显示 {transactions.from} 到 {transactions.to}，共{' '}
                            {transactions.total} 条记录
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    暂无交易记录
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {transactions.data.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-start gap-4 rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                                    >
                                        {/* Icon */}
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                transaction.amount > 0
                                                    ? 'bg-success-soft'
                                                    : 'bg-destructive/10'
                                            }`}
                                        >
                                            {transaction.amount > 0 ? (
                                                <TrendingUp className="h-5 w-5 text-success" />
                                            ) : (
                                                <TrendingDown className="h-5 w-5 text-destructive" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="font-medium">
                                                    {transaction.description ||
                                                        transaction.source}
                                                </span>
                                                <Badge
                                                    variant={
                                                        transaction.type ===
                                                        'total'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {transaction.type ===
                                                    'total'
                                                        ? '总积分'
                                                        : '可兑换'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                来源: {transaction.source}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(
                                                    transaction.created_at,
                                                ).toLocaleString('zh-CN')}
                                            </p>
                                        </div>

                                        {/* Amount */}
                                        <div className="shrink-0 text-right">
                                            <p
                                                className={`text-lg font-bold ${
                                                    transaction.amount > 0
                                                        ? 'text-success'
                                                        : 'text-destructive'
                                                }`}
                                            >
                                                {transaction.amount > 0
                                                    ? '+'
                                                    : ''}
                                                {transaction.amount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                余额:{' '}
                                                {transaction.balance_after}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <PaginationBar links={transactions.links} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
