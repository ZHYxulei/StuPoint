import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '注册审批', href: '/admin/approvals' },
    { title: '全部记录', href: '/admin/approvals/all' },
];

export default function ApprovalsAll({ approvals }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="审批记录" />

            <div className="space-y-6 p-4">
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>全部审批记录</CardTitle>
                        <CardDescription>
                            显示所有未通过审批的用户
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {approvals.data.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    暂无记录
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
                                                    '未分配年级'}
                                                {user.class?.name
                                                    ? ` · ${user.class.name}班`
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
                                        <Link
                                            href={`/admin/approvals/${user.id}`}
                                        >
                                            <Button size="sm" variant="outline">
                                                <Eye className="mr-2 h-4 w-4" />
                                                查看
                                            </Button>
                                        </Link>
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
