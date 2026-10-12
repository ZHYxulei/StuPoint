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

export default function ParentChildCreate() {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.parent_center'), href: '/parent' },
        { title: t('parent.children.title'), href: '/parent/children' },
        {
            title: t('parent.children.link_child'),
            href: '/parent/children/create',
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        child_student_id: '',
        relationship: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/parent/children');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('parent.children.link_child')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/parent/children">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={t('parent.children.link_child')}
                        description={t('parent.children.create_description')}
                    />
                </div>

                <Card className="max-w-2xl border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('parent.children.link_child')}</CardTitle>
                        <CardDescription>
                            {t('parent.children.create_card_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="child_student_id">
                                    {t('parent.children.child_student_id')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="child_student_id"
                                    placeholder={t(
                                        'parent.children.child_student_id_placeholder',
                                    )}
                                    value={data.child_student_id}
                                    onChange={(e) =>
                                        setData(
                                            'child_student_id',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.child_student_id} />
                                <p className="text-sm text-muted-foreground">
                                    {t('parent.children.child_student_id_hint')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="relationship">
                                    {t('parent.children.relationship')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.relationship}
                                    onValueChange={(value) =>
                                        setData('relationship', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={t(
                                                'parent.children.relationship_placeholder',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="父亲">
                                            {t('parent.relationship.father')}
                                        </SelectItem>
                                        <SelectItem value="母亲">
                                            {t('parent.relationship.mother')}
                                        </SelectItem>
                                        <SelectItem value="其他">
                                            {t('parent.relationship.other')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.relationship} />
                            </div>

                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground">
                                    {t('parent.children.link_note')}
                                </p>
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
                                        href="/parent/children"
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
                                    {t('parent.children.confirm_link')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
