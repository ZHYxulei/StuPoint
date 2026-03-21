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
import { CheckCircle2, Eye, ShieldAlert, Users } from 'lucide-react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '注册审批', href: '/admin/approvals' },
];

export default function ApprovalsIndex({
    approvals,
    stats,
    userRole,
}: PageProps) {
    const roleLabel =
        userRole === 'admin'
            ? '管理员审批'
            : userRole === 'grade_director'
              ? '年级主任审批'
              : userRole === 'head_teacher'
                ? '班主任审批'
                : '审批';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="注册审批" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">注册审批</h2>
                        <p className="text-sm text-muted-foreground">
                            {roleLabel}
                        </p>
                    </div>
                    <Link href="/admin/approvals/all">
                        <Button variant="outline">查看全部</Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                待审批总数
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                学生
                            </CardTitle>
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.students.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                教师
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.teachers.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                学生会
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.student_union_members.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>待审批列表</CardTitle>
                        <CardDescription>
                            共 {approvals.total} 位用户等待审批
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {approvals.data.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    暂无待审批用户
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
                                                    '未分配年级'}
                                                {user.class?.name
                                                    ? ` · ${user.class.name}班`
                                                    : ''}
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
