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

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
}

interface PageProps {
    subject: Subject;
}

export default function EditSubject({ subject }: PageProps) {
    // Built here, not at module scope: `t()` would otherwise run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.subjects'), href: '/admin/subjects' },
        { title: t('admin.subjects.edit_title'), href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: subject.name,
        code: subject.code,
        description: subject.description || '',
        is_active: subject.is_active,
        sort_order: subject.sort_order,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/subjects/${subject.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.subjects.edit_title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/subjects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={t('admin.subjects.edit_title')}
                        description={t('admin.subjects.edit_description')}
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('admin.subjects.info_title')}</CardTitle>
                        <CardDescription>
                            {t('admin.subjects.edit_info_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        {t('admin.subjects.name')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder={t(
                                            'admin.subjects.name_placeholder',
                                        )}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">
                                        {t('admin.subjects.code')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        placeholder={t(
                                            'admin.subjects.code_placeholder',
                                        )}
                                        required
                                    />
                                    <InputError message={errors.code} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    {t('admin.subjects.description')}
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.subjects.description_placeholder',
                                    )}
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">
                                        {t('admin.subjects.sort_order')}
                                    </Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) =>
                                            setData(
                                                'sort_order',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <InputError message={errors.sort_order} />
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
                                        {t('admin.subjects.enable_label')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.subjects.enable_hint')}
                                    </p>
                                    <InputError message={errors.is_active} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('admin.subjects.save_changes')}
                                </Button>
                                <Button asChild type="button" variant="outline">
                                    <Link href="/admin/subjects">
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
