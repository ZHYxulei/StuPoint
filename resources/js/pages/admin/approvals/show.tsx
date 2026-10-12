import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.approvals'), href: '/admin/approvals' },
        {
            title: approval.nickname || approval.name,
            href: `/admin/approvals/${approval.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.approvals.detail_title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/approvals">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('common.back')}
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-semibold">
                                {t('admin.approvals.detail_title')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {userRole === 'admin'
                                    ? t('admin.approvals.role_admin')
                                    : userRole === 'grade_director'
                                      ? t('admin.approvals.role_grade_director')
                                      : t('admin.approvals.role_head_teacher')}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('admin.approvals.user_info')}</CardTitle>
                        <CardDescription>
                            {t('admin.approvals.registration_info_roles')}
                        </CardDescription>
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
                                {t('admin.approvals.label_name', {
                                    value: approval.nickname || approval.name,
                                })}
                            </div>
                            <div>
                                {t('admin.approvals.label_student_id', {
                                    value: approval.student_id || '—',
                                })}
                            </div>
                            <div>
                                {t('admin.approvals.label_email', {
                                    value: approval.email || '—',
                                })}
                            </div>
                            <div>
                                {t('admin.approvals.label_phone', {
                                    value: approval.phone || '—',
                                })}
                            </div>
                            <div>
                                {t('admin.approvals.label_grade', {
                                    value:
                                        approval.class?.grade?.name ||
                                        approval.grade?.name ||
                                        '—',
                                })}
                            </div>
                            <div>
                                {t('admin.approvals.label_class', {
                                    value: approval.class?.name
                                        ? t('welcome.class_name_format', {
                                              name: approval.class.name,
                                          })
                                        : '—',
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {approval.roles.some(
                    (role) => role.slug === 'student_union_member',
                ) && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>
                                {t('admin.approvals.dual_approval_status')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.approvals.dual_approval_desc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <div>
                                {t('admin.approvals.head_teacher_approval', {
                                    status: approvalStatus.head_teacher_approved_at
                                        ? t('status.completed')
                                        : t('admin.approvals.not_completed'),
                                })}
                            </div>
                            <div>
                                {t(
                                    'admin.approvals.grade_director_approval',
                                    {
                                        status: approvalStatus.grade_director_approved_at
                                            ? t('status.completed')
                                            : t(
                                                  'admin.approvals.not_completed',
                                              ),
                                    },
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {t('admin.approvals.approve_title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <form onSubmit={approve} className="space-y-3">
                                <Textarea
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.approvals.note_placeholder',
                                    )}
                                    rows={3}
                                    name="note"
                                />
                                <Button type="submit" disabled={processing}>
                                    {t('admin.approvals.approve_button')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                {t('admin.approvals.reject_title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <form onSubmit={reject} className="space-y-3">
                                <Textarea
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.approvals.reject_reason_placeholder',
                                    )}
                                    rows={3}
                                    name="reason"
                                />
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={processing || !data.reason}
                                >
                                    {t('admin.approvals.reject_button')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
