import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Users,
    Trophy,
    TrendingUp,
    Activity,
    Plus,
} from 'lucide-react';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format';
import { t } from '@/lib/i18n';
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

export default function StudentCouncilDashboard({
    stats,
    recentActivities,
}: PageProps) {
    // Built inside the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.home'), href: '/' },
        { title: t('nav.student_council'), href: '/student-council' },
    ];

    const statusConfig: Record<
        string,
        {
            label: string;
            variant:
                | 'default'
                | 'secondary'
                | 'destructive'
                | 'outline'
                | 'success'
                | 'warning';
        }
    > = {
        draft: { label: t('council.status.draft'), variant: 'secondary' },
        active: { label: t('council.status.active'), variant: 'success' },
        closed: { label: t('council.status.closed'), variant: 'outline' },
    };

    const statCards: StatCard[] = [
        {
            title: t('council.dashboard.total_activities'),
            value: stats.total_activities,
            description: t('council.dashboard.total_activities_description'),
            icon: Calendar,
        },
        {
            title: t('council.dashboard.active_activities'),
            value: stats.active_activities,
            description: t('council.dashboard.active_activities_description'),
            icon: Activity,
        },
        {
            title: t('council.dashboard.total_participants'),
            value: stats.total_participants,
            description: t('council.dashboard.total_participants_description'),
            icon: Users,
        },
        {
            title: t('council.dashboard.points_awarded'),
            value: stats.points_awarded,
            description: t('council.dashboard.points_awarded_description'),
            icon: Trophy,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('council.dashboard.title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('council.dashboard.title')}
                        description={t('council.dashboard.description')}
                    />
                    <Link href="/student-council/activities/create">
                        <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('council.activities.create')}
                        </button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={stat.title}
                                className="border-sidebar-border/70 dark:border-sidebar-border"
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stat.value}
                                    </div>
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
                        <CardTitle>
                            {t('council.dashboard.recent_activities')}
                        </CardTitle>
                        <CardDescription>
                            {t('council.dashboard.recent_activities_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentActivities.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Activity className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>{t('council.activities.empty')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => {
                                    const config =
                                        statusConfig[activity.status] ||
                                        statusConfig.draft;
                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <h3 className="truncate font-semibold">
                                                        {activity.title}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none ${
                                                            config.variant ===
                                                            'success'
                                                                ? 'bg-green-500 text-white'
                                                                : config.variant ===
                                                                    'secondary'
                                                                  ? 'bg-secondary text-secondary-foreground'
                                                                  : 'bg-outline text-outline-foreground'
                                                        }`}
                                                    >
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        activity.start_date,
                                                    )}{' '}
                                                    ·{' '}
                                                    {t(
                                                        'council.activities.participants_progress',
                                                        {
                                                            current:
                                                                activity.participants_count,
                                                            max: activity.max_participants,
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/student-council/activities/${activity.id}`}
                                            >
                                                <button className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                                                    {t('common.view_details')}
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
