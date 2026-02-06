import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Calendar, Users, Trophy, TrendingUp, Activity, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface StatCard {
    title: string;
    value: number | string;
    description: string;
    icon: any;
}

interface RecentActivity {
    id: number;
    title: string;
    status: string;
    start_date: string;
    participants_count: number;
    max_participants: number;
}

interface PageProps {
    stats: {
        total_activities: number;
        active_activities: number;
        total_participants: number;
        points_awarded: number;
    };
    recentActivities: RecentActivity[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '首页', href: '/' },
    { title: '学生会', href: '/student-council' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    draft: { label: '草稿', variant: 'secondary' },
    active: { label: '进行中', variant: 'success' },
    closed: { label: '已结束', variant: 'outline' },
};

export default function StudentCouncilDashboard({ stats, recentActivities }: PageProps) {
    const statCards: StatCard[] = [
        {
            title: '总活动数',
            value: stats.total_activities,
            description: '已创建的活动总数',
            icon: Calendar,
        },
        {
            title: '进行中活动',
            value: stats.active_activities,
            description: '当前正在进行的活动',
            icon: Activity,
        },
        {
            title: '参与人数',
            value: stats.total_participants,
            description: '活动总参与人次',
            icon: Users,
        },
        {
            title: '已发积分',
            value: stats.points_awarded,
            description: '通过活动发放的积分',
            icon: Trophy,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="学生会管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="学生会管理"
                        description="管理学生会活动和积分奖励"
                    />
                    <Link href="/student-council/activities/create">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <Plus className="h-4 w-4 mr-2" />
                            创建活动
                        </button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title} className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Activities */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>最近活动</CardTitle>
                        <CardDescription>最近创建的5个活动</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>暂无活动</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => {
                                    const config = statusConfig[activity.status] || statusConfig.draft;
                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold truncate">{activity.title}</h3>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${
                                                        config.variant === 'success' ? 'bg-green-500 text-white' :
                                                        config.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                                                        'bg-outline text-outline-foreground'
                                                    }`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(activity.start_date).toLocaleDateString('zh-CN')} ·
                                                    {activity.participants_count}/{activity.max_participants} 人参与
                                                </p>
                                            </div>
                                            <Link href={`/student-council/activities/${activity.id}`}>
                                                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                                                    查看详情
                                                </button>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
