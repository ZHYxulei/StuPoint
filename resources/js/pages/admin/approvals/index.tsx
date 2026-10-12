import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Eye, ShieldAlert, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface ApprovalUser {
    id: number;
    name: string;
    nickname: string | null;
    email: string | null;
    phone: string | null;
    class_id: number | null;
    grade_id: number | null;
    registration_status: string;
    requires_review: boolean;
    class?: {
        id: number;
        name: string;
        grade?: {
            id: number;
            name: string;
        } | null;
    } | null;
    grade?: {
        id: number;
        name: string;
    } | null;
    roles: Role[];
}

interface PaginatedApprovals {
    data: ApprovalUser[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Stats {
    total: number;
    students: number;
    teachers: number;
    student_union_members: number;
}

interface PageProps {
    approvals: PaginatedApprovals;
    stats: Stats;
    userRole: string | null;
}

export default function ApprovalsIndex({
    approvals,
    stats,
    userRole,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.approvals'), href: '/admin/approvals' },
    ];

    const roleLabel =
        userRole === 'admin'
            ? t('admin.approvals.role_admin')
            : userRole === 'grade_director'
              ? t('admin.approvals.role_grade_director')
              : userRole === 'head_teacher'
                ? t('admin.approvals.role_head_teacher')
                : t('admin.approvals.role_generic');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('nav.approvals')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">
                            {t('nav.approvals')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {roleLabel}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/approvals/all">
                            {t('admin.approvals.view_all')}
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('admin.approvals.total_pending')}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatNumber(stats.total)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('auth.roles.student')}
                            </CardTitle>
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatNumber(stats.students)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('auth.roles.teacher')}
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatNumber(stats.teachers)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('nav.student_council')}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatNumber(stats.student_union_members)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('admin.approvals.pending_list')}</CardTitle>
                        <CardDescription>
                            {t('admin.approvals.pending_count', {
                                count: formatNumber(approvals.total),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {approvals.data.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    {t('admin.approvals.no_pending')}
                                </div>
                            ) : (
                                approvals.data.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {user.nickname || user.name}
                                                </span>
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {user.class?.grade?.name ||
                                                    user.grade?.name ||
                                                    t('admin.approvals.no_grade')}
                                                {user.class?.name
                                                    ? ` · ${t('welcome.class_name_format', { name: user.class.name })}`
                                                    : ''}
                                            </div>
                                        </div>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link
                                                href={`/admin/approvals/${user.id}`}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                {t('common.view')}
                                            </Link>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
