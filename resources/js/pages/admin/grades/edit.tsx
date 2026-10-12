import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Grade {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
}

interface PageProps {
    grade: Grade;
}

export default function EditGrade({ grade }: PageProps) {
    // Built here, not at module scope: `t()` would otherwise run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('admin.grades.title'), href: '/admin/grades' },
        { title: t('admin.grades.edit_title'), href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: grade.name,
        description: grade.description || '',
        is_active: grade.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/grades/${grade.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.grades.edit_title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/grades">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={t('admin.grades.edit_title')}
                        description={t('admin.grades.edit_description')}
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('admin.grades.info_title')}</CardTitle>
                        <CardDescription>
                            {t('admin.grades.edit_info_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    {t('admin.grades.name')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.grades.name_placeholder',
                                    )}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    {t('admin.grades.description')}
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.grades.description_placeholder',
                                    )}
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_active',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    {t('admin.grades.enable_label')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('admin.grades.enable_hint')}
                                </p>
                                <InputError message={errors.is_active} />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('admin.grades.save_changes')}
                                </Button>
                                <Button asChild type="button" variant="outline">
                                    <Link href="/admin/grades">
                                        {t('common.cancel')}
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
