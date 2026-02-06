import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, Users, MapPin, Trophy, Plus, Edit, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '首页', href: '/' },
    { title: '学生会', href: '/student-council' },
    { title: '活动列表', href: '/student-council/activities' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    draft: { label: '草稿', variant: 'secondary' },
    active: { label: '进行中', variant: 'success' },
    closed: { label: '已结束', variant: 'outline' },
};

export default function ActivityIndex({ activities, filters }: PageProps) {
    const { get } = useForm({});

    const handleFilterChange = (key: string, value: string) => {
        get(`/student-council/activities?${key}=${value}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="活动列表" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="活动列表"
                        description={`共 ${activities.total} 个活动`}
                    />
                    <Link href="/student-council/activities/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            创建活动
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base">筛选条件</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="status-filter">活动状态</Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger id="status-filter">
                                        <SelectValue placeholder="选择状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">全部状态</SelectItem>
                                        <SelectItem value="draft">草稿</SelectItem>
                                        <SelectItem value="active">进行中</SelectItem>
                                        <SelectItem value="closed">已结束</SelectItem>
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
                            <div className="text-center py-12 text-muted-foreground">
                                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg mb-2">暂无活动</p>
                                <p className="text-sm">点击上方"创建活动"按钮开始创建</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {activities.data.map((activity) => {
                                    const config = statusConfig[activity.status];
                                    return (
                                        <div
                                            key={activity.id}
                                            className="p-6 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold">{activity.title}</h3>
                                                        <Badge variant={config.variant}>
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                        {activity.description || '暂无描述'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(activity.start_date).toLocaleDateString('zh-CN')} - {new Date(activity.end_date).toLocaleDateString('zh-CN')}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {activity.location}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            {activity.participants_count}/{activity.max_participants} 人
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="h-4 w-4" />
                                                            {activity.points_reward} 积分
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Link href={`/student-council/activities/${activity.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {activity.status !== 'closed' && (
                                                        <Link href={`/student-council/activities/${activity.id}/edit`}>
                                                            <Button size="sm" variant="outline">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                创建者：{activity.organizer.name}
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
                        {Array.from({ length: activities.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/student-council/activities?page=${page}${filters.status ? `&status=${filters.status}` : ''}`}
                                className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
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
