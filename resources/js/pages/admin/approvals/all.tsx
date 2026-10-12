import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
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
    registration_status: string;
    class?: {
        name: string;
        grade?: {
            name: string;
        } | null;
    } | null;
    grade?: {
        name: string;
    } | null;
    roles: Role[];
}

interface PaginatedApprovals {
    data: ApprovalUser[];
    current_page: number;
    last_page: number;
    total: number;
}

interface PageProps {
    approvals: PaginatedApprovals;
}

export default function ApprovalsAll({ approvals }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.approvals'), href: '/admin/approvals' },
        { title: t('admin.approvals.all_records'), href: '/admin/approvals/all' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.approvals.records_head')} />

            <div className="space-y-6 p-4">
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>
                            {t('admin.approvals.all_approval_records')}
                        </CardTitle>
                        <CardDescription>
                            {t('admin.approvals.all_records_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {approvals.data.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    {t('dashboard.no_records')}
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
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {user.registration_status}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {user.class?.grade?.name ||
                                                    user.grade?.name ||
                                                    t('admin.approvals.no_grade')}
                                                {user.class?.name
                                                    ? ` · ${t('welcome.class_name_format', { name: user.class.name })}`
                                                    : ''}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ))}
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
