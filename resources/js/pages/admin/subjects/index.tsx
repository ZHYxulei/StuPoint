import { Head, Link, useForm } from '@inertiajs/react';
import {
    Search,
    Plus,
    BookOpen,
    CheckCircle2,
    XCircle,
    Settings2,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    created_at: string;
}

interface PageProps {
    subjects: Subject[];
    filters: {
        search?: string;
    };
}

export default function SubjectIndex({ subjects, filters }: PageProps) {
    // Built here, not at module scope: `t()` would otherwise run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.subjects'), href: '/admin/subjects' },
    ];

    const { get, processing, setData } = useForm({
        search: filters.search || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/subjects', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('nav.subjects')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('nav.subjects')}
                        description={t('admin.subjects.index_description')}
                    />
                    <Button asChild>
                        <Link href="/admin/subjects/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin.subjects.create_title')}
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Search className="h-4 w-4" />
                            {t('admin.subjects.search_title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-1"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="search">
                                    {t('common.search')}
                                </Label>
                                <Input
                                    id="search"
                                    type="text"
                                    value={filters.search || ''}
                                    onChange={(e) =>
                                        setData('search', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.subjects.search_placeholder',
                                    )}
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Search className="mr-2 h-4 w-4" />
                                {t('common.search')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Subjects List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                        <Card
                            key={subject.id}
                            className="border-sidebar-border/70 transition-shadow hover:shadow-md dark:border-sidebar-border"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {subject.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-1">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {subject.code}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            subject.is_active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {subject.is_active ? (
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                        ) : (
                                            <XCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {subject.is_active
                                            ? t('admin.subjects.active')
                                            : t('admin.subjects.inactive')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {subject.description && (
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {subject.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Settings2 className="h-3.5 w-3.5" />
                                            {t('admin.subjects.sort')}
                                        </span>
                                        <span className="font-medium">
                                            {subject.sort_order}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            <Link
                                                href={`/admin/subjects/${subject.id}/edit`}
                                                className="flex-1"
                                            >
                                                {t('common.edit')}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {subjects.length === 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                                {t('admin.subjects.empty')}
                            </p>
                            <Button asChild>
                                <Link
                                    href="/admin/subjects/create"
                                    className="mt-4"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin.subjects.create_title')}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
