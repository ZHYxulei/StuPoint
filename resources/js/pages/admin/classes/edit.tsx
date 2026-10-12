import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import Heading from '@/components/heading';
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
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface ClassData {
    id: number;
    name: string;
    grade: string;
    head_teacher_id: number | null;
}

interface PageProps {
    class: ClassData;
    teachers: Teacher[];
}

export default function EditClass({ class: classData, teachers }: PageProps) {
    // Built here, not at module scope: `t()` would otherwise run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.classes'), href: '/admin/classes' },
        { title: t('admin.classes.edit_title'), href: '/admin/classes/[id]/edit' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: classData.name,
        grade: classData.grade,
        head_teacher_id: classData.head_teacher_id?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/classes/${classData.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.classes.edit_title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/classes/${classData.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={t('admin.classes.edit_title')}
                        description={t('admin.classes.edit_description')}
                    />
                </div>

                <Card className="max-w-2xl border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('admin.classes.info_title')}</CardTitle>
                        <CardDescription>
                            {t('admin.classes.edit_info_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grade">
                                        {t('admin.classes.grade')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="grade"
                                        placeholder={t(
                                            'admin.classes.grade_placeholder',
                                        )}
                                        value={data.grade}
                                        onChange={(e) =>
                                            setData('grade', e.target.value)
                                        }
                                    />
                                    {errors.grade && (
                                        <p className="text-sm text-destructive">
                                            {errors.grade}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        {t('admin.classes.name')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder={t(
                                            'admin.classes.name_placeholder',
                                        )}
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="head_teacher_id">
                                        {t('admin.classes.head_teacher')}
                                    </Label>
                                    <Select
                                        value={data.head_teacher_id}
                                        onValueChange={(value) =>
                                            setData('head_teacher_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={t(
                                                    'admin.classes.select_head_teacher',
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">
                                                {t(
                                                    'admin.classes.no_head_teacher',
                                                )}
                                            </SelectItem>
                                            {teachers.map((teacher) => (
                                                <SelectItem
                                                    key={teacher.id}
                                                    value={teacher.id.toString()}
                                                >
                                                    {teacher.name} (
                                                    {teacher.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.head_teacher_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.head_teacher_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    <Link
                                        href={`/admin/classes/${classData.id}`}
                                        className="flex-1"
                                    >
                                        {t('common.cancel')}
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('admin.classes.save_changes')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
