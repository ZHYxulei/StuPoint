import { Head, Link, useForm } from '@inertiajs/react';
import { Calendar, Users, MapPin, Trophy, Plus, Edit, Eye } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface CouncilActivity {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    points_reward: number;
    status: 'draft' | 'active' | 'closed';
    participants_count: number;
    organizer: {
        id: number;
        name: string;
    };
}

interface PaginatedActivities {
    data: CouncilActivity[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    activities: PaginatedActivities;
    filters: {
        status?: string;
    };
}

export default function ActivityIndex({ activities, filters }: PageProps) {
    // Built inside the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.home'), href: '/' },
        { title: t('nav.student_council'), href: '/student-council' },
        {
            title: t('council.activities.title'),
            href: '/student-council/activities',
        },
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

    const { get } = useForm({});

    const handleFilterChange = (key: string, value: string) => {
        get(`/student-council/activities?${key}=${value}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('council.activities.title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('council.activities.title')}
                        description={t('council.activities.count', {
                            count: activities.total,
                        })}
                    />
                    <Button asChild>
                        <Link href="/student-council/activities/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('council.activities.create')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {t('council.activities.filters')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="status-filter">
                                    {t('council.activities.status_label')}
                                </Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger id="status-filter">
                                        <SelectValue
                                            placeholder={t(
                                                'council.activities.select_status',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t(
                                                'council.activities.all_statuses',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="draft">
                                            {t('council.status.draft')}
                                        </SelectItem>
                                        <SelectItem value="active">
                                            {t('council.status.active')}
                                        </SelectItem>
                                        <SelectItem value="closed">
                                            {t('council.status.closed')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activities List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="p-0">
                        {activities.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Calendar className="mx-auto mb-4 h-16 w-16 opacity-50" />
                                <p className="mb-2 text-lg">
                                    {t('council.activities.empty')}
                                </p>
                                <p className="text-sm">
                                    {t('council.activities.empty_description')}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {activities.data.map((activity) => {
                                    const config =
                                        statusConfig[activity.status];
                                    return (
                                        <div
                                            key={activity.id}
                                            className="p-6 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <h3 className="text-lg font-semibold">
                                                            {activity.title}
                                                        </h3>
                                                        <Badge
                                                            variant={
                                                                config.variant
                                                            }
                                                        >
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                                        {activity.description ||
                                                            t(
                                                                'shop.no_description',
                                                            )}
                                                    </p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(
                                                                activity.start_date,
                                                            )}{' '}
                                                            -{' '}
                                                            {formatDate(
                                                                activity.end_date,
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {activity.location}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            {t(
                                                                'council.activities.participants_progress_short',
                                                                {
                                                                    current:
                                                                        activity.participants_count,
                                                                    max: activity.max_participants,
                                                                },
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="h-4 w-4" />
                                                            {t(
                                                                'council.activities.points_badge',
                                                                {
                                                                    points: activity.points_reward,
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex gap-2">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={`/student-council/activities/${activity.id}`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {activity.status !==
                                                        'closed' && (
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Link
                                                                href={`/student-council/activities/${activity.id}/edit`}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {t(
                                                    'council.activities.created_by',
                                                    {
                                                        name: activity.organizer
                                                            .name,
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from(
                            { length: activities.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Link
                                key={page}
                                href={`/student-council/activities?page=${page}${filters.status ? `&status=${filters.status}` : ''}`}
                                className={`inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                                    page === activities.current_page
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
