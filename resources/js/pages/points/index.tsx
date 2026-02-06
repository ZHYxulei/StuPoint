import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Coins, ArrowRight, TrendingUp, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface UserPoint {
    id: number;
    total_points: number;
    redeemable_points: number;
}

interface PointTransaction {
    id: number;
    type: 'total' | 'redeemable';
    amount: number;
    balance_after: number;
    source: string;
    description: string | null;
    created_at: string;
}

interface PageProps {
    points: UserPoint;
    recentTransactions: PointTransaction[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Points',
        href: '/points',
    },
];

export default function PointsIndex({ points, recentTransactions }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Points" />

            <div className="space-y-6 p-4">
                <Heading
                    title="My Points"
                    description="View your point balance and recent transactions"
                />

                {/* Points Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{points.total_points.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Cumulative lifetime points
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Redeemable Points</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {points.redeemable_points.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Available for exchange
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>Latest point changes in your account</CardDescription>
                            </div>
                            <Link href="/points/history">
                                <Button variant="outline" size="sm">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No transactions yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${
                                                transaction.amount > 0
                                                    ? 'bg-green-100 dark:bg-green-900/20'
                                                    : 'bg-red-100 dark:bg-red-900/20'
                                            }`}>
                                                <Coins className={`h-4 w-4 ${
                                                    transaction.amount > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {transaction.description || transaction.source}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(transaction.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${
                                                transaction.amount > 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {transaction.type === 'total' ? 'Total' : 'Redeemable'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
