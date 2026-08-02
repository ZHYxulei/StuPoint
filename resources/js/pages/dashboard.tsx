import { Head, Link } from '@inertiajs/react';
import { Trophy, TrendingUp, TrendingDown, Activity, Users, Coins, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

interface UserPoint {
    id: number;
    total_points: number;
    redeemable_points: number;
}

interface TopUser {
    id: number;
    name: string;
    email: string;
    total_points: number;
    redeemable_points: number;
}

interface RecentTransaction {
    id: number;
    user_id: number;
    user_name: string;
    type: string;
    amount: number;
    balance_after: number;
    source: string;
    description: string;
    created_at: string;
}

interface PageProps {
    canViewGlobalDashboard: boolean;
    totalUsers: number | null;
    todayAdded: number | null;
    todayDeducted: number | null;
    todayTransactions: number | null;
    topUsers: TopUser[];
    userPoints: UserPoint | null;
    recentTransactions: RecentTransaction[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    canViewGlobalDashboard,
    totalUsers,
    todayAdded,
    todayDeducted,
    todayTransactions,
    topUsers,
    userPoints,
    recentTransactions,
}: PageProps) {
    const [transactionsExpanded, setTransactionsExpanded] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {canViewGlobalDashboard && totalUsers !== null && todayAdded !== null && todayDeducted !== null && todayTransactions !== null && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="relative overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('total_users')}</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">系统注册用户</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('today_added')}</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    +{todayAdded.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">总积分增加</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('today_deducted')}</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    -{todayDeducted.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">总积分扣除</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('today_transactions')}</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{todayTransactions.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">交易笔数</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className={`grid gap-4 min-h-[400px] ${canViewGlobalDashboard ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-primary" />
                                {t('your_points')}
                            </CardTitle>
                            <CardDescription>您的积分概览</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userPoints ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">{t('total_points')}</span>
                                            <span className="text-lg font-bold text-primary">
                                                {userPoints.total_points.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">{t('redeemable_points')}</span>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {userPoints.redeemable_points.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-green-600 dark:bg-green-400"
                                                style={{
                                                    width: userPoints.total_points > 0
                                                        ? `${(userPoints.redeemable_points / userPoints.total_points) * 100}%`
                                                        : '0%',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">加载中...</p>
                            )}
                        </CardContent>
                    </Card>

                    {canViewGlobalDashboard && (
                        <Card className="border-sidebar-border/70 lg:col-span-2 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    {t('top_10_users')}
                                </CardTitle>
                                <CardDescription>积分排行榜</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {topUsers.map((user, index) => (
                                        <Link
                                            key={user.id}
                                            href={`/admin/users/${user.id}/transactions`}
                                            className="block"
                                        >
                                            <div className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                                            index === 0
                                                                ? 'bg-yellow-500 text-white'
                                                                : index === 1
                                                                    ? 'bg-gray-400 text-white'
                                                                    : index === 2
                                                                        ? 'bg-orange-500 text-white'
                                                                        : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">{user.total_points.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        可兑换: {user.redeemable_points.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {topUsers.length === 0 && (
                                        <p className="py-8 text-center text-muted-foreground">暂无数据</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    {t('recent_transactions')}
                                </CardTitle>
                                <CardDescription>
                                    {canViewGlobalDashboard ? '最新的积分变动记录' : '您的最近积分变动记录'}
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTransactionsExpanded(!transactionsExpanded)}
                            >
                                <ChevronDown className={`h-4 w-4 transition-transform ${transactionsExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    {transactionsExpanded && (
                        <CardContent>
                            {recentTransactions.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">暂无记录</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentTransactions.map((transaction) => {
                                        const transactionContent = (
                                            <div className="flex cursor-pointer items-center justify-between rounded-lg border border-sidebar-border/70 p-3 transition-colors hover:bg-muted/50 dark:border-sidebar-border">
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="truncate font-medium">{transaction.user_name}</span>
                                                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                                                            transaction.type === 'total'
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        }`}>
                                                            {transaction.type === 'total' ? '总积分' : '可兑换'}
                                                        </span>
                                                    </div>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {transaction.description || transaction.source}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(transaction.created_at).toLocaleString('zh-CN')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${
                                                        transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        余额: {transaction.balance_after}
                                                    </p>
                                                </div>
                                            </div>
                                        );

                                        if (!canViewGlobalDashboard) {
                                            return <div key={transaction.id}>{transactionContent}</div>;
                                        }

                                        return (
                                            <Link
                                                key={transaction.id}
                                                href={`/admin/users/${transaction.user_id}/transactions`}
                                                className="block"
                                            >
                                                {transactionContent}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
