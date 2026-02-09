import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GraduationCap, CheckCircle2, XCircle, Users2, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface SchoolClass {
    id: number;
    name: string;
    grade: string;
}

interface Grade {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    classes: SchoolClass[];
}

interface PageProps {
    grade: Grade;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '年级管理', href: '/admin/grades' },
    { title: '年级详情', href: '#' },
];

export default function ShowGrade({ grade }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`年级详情 - ${grade.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/grades">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={grade.name}
                        description="查看年级详细信息"
                    />
                </div>

                {/* Grade Information */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{grade.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-2">
                                    <GraduationCap className="h-4 w-4" />
                                    年级
                                </CardDescription>
                            </div>
                            <Badge variant={grade.is_active ? 'default' : 'secondary'} className="text-base px-3 py-1">
                                {grade.is_active ? (
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                )}
                                {grade.is_active ? '启用' : '禁用'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {grade.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">描述</h3>
                                    <p className="text-muted-foreground">{grade.description}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold mb-2">基本信息</h3>
                                <dl className="grid gap-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">创建时间</dt>
                                        <dd className="font-medium">
                                            {new Date(grade.created_at).toLocaleString('zh-CN')}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">班级数量</dt>
                                        <dd className="font-medium">{grade.classes.length} 个</dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Link href={`/admin/grades/${grade.id}/edit`}>
                                    <Button>
                                        <Settings className="mr-2 h-4 w-4" />
                                        编辑年级
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Classes List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users2 className="h-5 w-5" />
                            关联班级
                        </CardTitle>
                        <CardDescription>
                            该年级下的所有班级
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {grade.classes.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {grade.classes.map((classItem) => (
                                    <Link
                                        key={classItem.id}
                                        href={`/admin/classes/${classItem.id}`}
                                    >
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="font-medium">{classItem.name}</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {classItem.grade}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>该年级下暂无班级</p>
                                <Link href="/admin/classes/create" className="mt-4 inline-block">
                                    <Button variant="outline" size="sm">
                                        创建班级
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
