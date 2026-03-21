import { Head, Link, useForm } from '@inertiajs/react';
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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

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
    student_id: string | null;
    class_id: number | null;
    grade_id: number | null;
    registration_status: string;
    requires_review: boolean;
    rejection_reason: string | null;
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

interface PageProps {
    approval: ApprovalUser;
    userRole: string | null;
    approvalStatus: {
        head_teacher_approved_at: string | null;
        grade_director_approved_at: string | null;
    };
}

export default function ApprovalShow({
    approval,
    userRole,
    approvalStatus,
}: PageProps) {
    const { data, setData, post, processing } = useForm({
        note: '',
        reason: '',
    });

    const approve = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(`/admin/approvals/${approval.id}/approve`, {
            preserveScroll: true,
        });
    };

    const reject = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(`/admin/approvals/${approval.id}/reject`, {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: '管理员', href: '/admin' },
        { title: '注册审批', href: '/admin/approvals' },
        {
            title: approval.nickname || approval.name,
            href: `/admin/approvals/${approval.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="审批详情" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/approvals">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                返回
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-semibold">审批详情</h2>
                            <p className="text-sm text-muted-foreground">
                                {userRole === 'admin'
                                    ? '管理员审批'
                                    : userRole === 'grade_director'
                                      ? '年级主任审批'
                                      : '班主任审批'}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>用户信息</CardTitle>
                        <CardDescription>注册信息与角色</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {approval.roles.map((role) => (
                                <Badge key={role.id} variant="secondary">
                                    {role.name}
                                </Badge>
                            ))}
                        </div>
                        <div className="text-sm">
                            <div>
                                姓名：{approval.nickname || approval.name}
                            </div>
                            <div>学号：{approval.student_id || '—'}</div>
                            <div>邮箱：{approval.email || '—'}</div>
                            <div>手机号：{approval.phone || '—'}</div>
                            <div>
                                年级：
                                {approval.class?.grade?.name ||
                                    approval.grade?.name ||
                                    '—'}
                            </div>
                            <div>
                                班级：
                                {approval.class?.name
                                    ? `${approval.class.name}班`
                                    : '—'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {approval.roles.some(
                    (role) => role.slug === 'student_union_member',
                ) && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>学生会双重审批状态</CardTitle>
                            <CardDescription>
                                班主任与年级主任审批进度
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <div>
                                班主任审批：
                                {approvalStatus.head_teacher_approved_at
                                    ? '已完成'
                                    : '未完成'}
                            </div>
                            <div>
                                年级主任审批：
                                {approvalStatus.grade_director_approved_at
                                    ? '已完成'
                                    : '未完成'}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                通过审批
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <form onSubmit={approve} className="space-y-3">
                                <Textarea
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    placeholder="备注（可选）"
                                    rows={3}
                                    name="note"
                                />
                                <Button type="submit" disabled={processing}>
                                    通过
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                拒绝审批
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <form onSubmit={reject} className="space-y-3">
                                <Textarea
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    placeholder="请输入拒绝原因"
                                    rows={3}
                                    name="reason"
                                />
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={processing || !data.reason}
                                >
                                    拒绝
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
