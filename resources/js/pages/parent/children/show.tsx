import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Target, Coins, History, ShoppingCart, Package, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    description: string;
    created_at: string;
}

interface Order {
    id: number;
    order_no: string;
    product_name: string;
    points_spent: number;
    status: string;
    created_at: string;
}

interface ChildData {
    id: number;
    name: string;
    student_id: string;
    grade: string | null;
    class: string | null;
    relationship: string;
    points: {
        total_points: number;
        redeemable_points: number;
        rank: number;
        total_users: number;
    };
    recent_transactions: Transaction[];
    recent_orders: Order[];
}

interface PageProps {
    child: ChildData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '家长中心', href: '/parent' },
    { title: '我的子女', href: '/parent/children' },
    { title: '子女详情', href: '/parent/children/[id]' },
];

export default function ParentChildShow({ child }: PageProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'orders'>('overview');

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
            <Head title={`子女详情 - ${child.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/parent/children">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={child.name}
                        description={`学号: ${child.student_id} · ${child.relationship}`}
                    />
                </div>

                {/* Points Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Coins className="h-4 w-4" />
                                总积分
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{child.points.total_points}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                可兑换积分
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-primary">
                                {child.points.redeemable_points}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                全校排名
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">第 {child.points.rank} 名</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                共 {child.points.total_users} 人
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">年级班级</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {child.grade} {child.class}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList>
                        <TabsTrigger value="overview">概览</TabsTrigger>
                        <TabsTrigger value="transactions">
                            <History className="mr-2 h-4 w-4" />
                            积分记录
                        </TabsTrigger>
                        <TabsTrigger value="orders">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            兑换记录
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Recent Transactions */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">最近积分变动</CardTitle>
                                    <Link href={`/parent/children/${child.id}/transactions`}>
                                        <Button variant="ghost" size="sm">
                                            查看全部
                                            <Eye className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {child.recent_transactions.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        暂无积分变动记录
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {child.recent_transactions.map((t) => (
                                            <div
                                                key={t.id}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">{t.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(t.created_at).toLocaleString('zh-CN')}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={t.amount > 0 ? 'default' : 'destructive'}
                                                    className="ml-4"
                                                >
                                                    {t.amount > 0 ? '+' : ''}{t.amount}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Orders */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">最近兑换</CardTitle>
                                    <Link href={`/parent/children/${child.id}/orders`}>
                                        <Button variant="ghost" size="sm">
                                            查看全部
                                            <Eye className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {child.recent_orders.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        暂无兑换记录
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {child.recent_orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{order.product_name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleString('zh-CN')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-primary">
                                                        -{order.points_spent} 积分
                                                    </p>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>提示</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    点击上方"积分记录"标签页查看全部交易记录
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>提示</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    点击上方"兑换记录"标签页查看全部订单记录
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
