import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    GraduationCap,
    CheckCircle2,
    XCircle,
    Users2,
    Settings,
} from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format';
import { t } from '@/lib/i18n';
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

export default function ShowGrade({ grade }: PageProps) {
    // Built here, not at module scope: `t()` would otherwise run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('admin.grades.title'), href: '/admin/grades' },
        { title: t('admin.grades.detail_title'), href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('admin.grades.detail_head_title', { name: grade.name })}
            />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/grades">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={grade.name}
                        description={t('admin.grades.detail_description')}
                    />
                </div>

                {/* Grade Information */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">
                                    {grade.name}
                                </CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4" />
                                    {t('admin.grades.grade')}
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    grade.is_active ? 'default' : 'secondary'
                                }
                                className="px-3 py-1 text-base"
                            >
                                {grade.is_active ? (
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                ) : (
                                    <XCircle className="mr-1 h-4 w-4" />
                                )}
                                {grade.is_active
                                    ? t('admin.grades.active')
                                    : t('admin.grades.inactive')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {grade.description && (
                                <div>
                                    <h3 className="mb-2 font-semibold">
                                        {t('common.description')}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {grade.description}
                                    </p>
                                </div>
                            )}
                            <div>
                                <h3 className="mb-2 font-semibold">
                                    {t('admin.grades.basic_info')}
                                </h3>
                                <dl className="grid gap-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">
                                            {t('admin.grades.created_at')}
                                        </dt>
                                        <dd className="font-medium">
                                            {formatDateTime(grade.created_at)}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">
                                            {t('admin.grades.class_count')}
                                        </dt>
                                        <dd className="font-medium">
                                            {t(
                                                'admin.grades.class_count_value',
                                                {
                                                    count: grade.classes
                                                        .length,
                                                },
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button asChild>
                                    <Link
                                        href={`/admin/grades/${grade.id}/edit`}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        {t('admin.grades.edit_title')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Classes List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users2 className="h-5 w-5" />
                            {t('admin.grades.related_classes')}
                        </CardTitle>
                        <CardDescription>
                            {t('admin.grades.related_classes_description')}
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
                                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                            <CardContent className="p-4">
                                                <div className="font-medium">
                                                    {classItem.name}
                                                </div>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {classItem.grade}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                <Users2 className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                <p>{t('admin.grades.no_classes')}</p>
                                <Button asChild variant="outline" size="sm">
                                    <Link
                                        href="/admin/classes/create"
                                        className="mt-4 inline-block"
                                    >
                                        {t('admin.classes.create_title')}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
