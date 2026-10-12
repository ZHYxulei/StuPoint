import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface PageProps {
    // 可以添加预填充数据
}

export default function CreateActivity({}: PageProps) {
    // Built inside the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.home'), href: '/' },
        { title: t('nav.student_council'), href: '/student-council' },
        {
            title: t('council.activities.title'),
            href: '/student-council/activities',
        },
        {
            title: t('council.activities.create'),
            href: '/student-council/activities/create',
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: '',
        points_reward: '',
        status: 'draft',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student-council/activities');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('council.activities.create')} />

            <div className="mx-auto max-w-3xl space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/student-council/activities">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={t('council.activities.create')}
                        description={t(
                            'council.activities.create_description',
                        )}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>{t('council.activities.basic_info')}</CardTitle>
                            <CardDescription>
                                {t(
                                    'council.activities.create_basic_info_description',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    {t('council.activities.form.title')}
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder={t(
                                        'council.activities.form.title_placeholder',
                                    )}
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    {t('council.activities.form.description')}
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder={t(
                                        'council.activities.form.description_placeholder',
                                    )}
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        {t(
                                            'council.activities.form.start_date',
                                        )}
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="datetime-local"
                                        value={data.start_date}
                                        onChange={(e) =>
                                            setData(
                                                'start_date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">
                                        {t('council.activities.form.end_date')}
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={(e) =>
                                            setData('end_date', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">
                                    {t('council.activities.form.location')}
                                </Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) =>
                                        setData('location', e.target.value)
                                    }
                                    placeholder={t(
                                        'council.activities.form.location_placeholder',
                                    )}
                                    required
                                />
                                {errors.location && (
                                    <p className="text-sm text-destructive">
                                        {errors.location}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>
                                {t('council.activities.settings')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'council.activities.create_settings_description',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="max_participants">
                                        {t(
                                            'council.activities.form.max_participants',
                                        )}
                                    </Label>
                                    <Input
                                        id="max_participants"
                                        type="number"
                                        min="1"
                                        value={data.max_participants}
                                        onChange={(e) =>
                                            setData(
                                                'max_participants',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'council.activities.form.max_participants_placeholder',
                                        )}
                                        required
                                    />
                                    {errors.max_participants && (
                                        <p className="text-sm text-destructive">
                                            {errors.max_participants}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="points_reward">
                                        {t(
                                            'council.activities.form.points_reward',
                                        )}
                                    </Label>
                                    <Input
                                        id="points_reward"
                                        type="number"
                                        min="0"
                                        value={data.points_reward}
                                        onChange={(e) =>
                                            setData(
                                                'points_reward',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'council.activities.form.points_reward_placeholder',
                                        )}
                                        required
                                    />
                                    {errors.points_reward && (
                                        <p className="text-sm text-destructive">
                                            {errors.points_reward}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    {t('council.activities.form.status')}
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue
                                            placeholder={t(
                                                'council.activities.select_status',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            {t('council.status.draft')}
                                        </SelectItem>
                                        <SelectItem value="active">
                                            {t('council.status.active')}
                                        </SelectItem>
                                        <SelectItem value="closed">
                                            {t('council.status.closed')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-destructive">
                                        {errors.status}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {t('council.activities.create')}
                        </Button>
                        <Button asChild type="button" variant="outline">
                            <Link href="/student-council/activities">
                                {t('common.cancel')}
                            </Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
