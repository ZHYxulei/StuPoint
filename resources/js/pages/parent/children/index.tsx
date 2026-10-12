import { Head, Link } from '@inertiajs/react';
import { Plus, Users2, Award, Coins, Eye, Trash2 } from 'lucide-react';
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
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Child {
    id: number;
    name: string;
    student_id: string;
    grade: string | null;
    class: string | null;
    relationship: string;
    is_approved: boolean;
    points: {
        total_points: number;
        redeemable_points: number;
    };
}

interface PageProps {
    children: Child[];
}

export default function ParentChildrenIndex({ children }: PageProps) {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.parent_center'), href: '/parent' },
        { title: t('parent.children.title'), href: '/parent/children' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('parent.children.title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('parent.children.title')}
                        description={t('parent.children.index_description')}
                    />
                    <Button asChild>
                        <Link href="/parent/children/create">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('parent.children.link_child')}
                        </Link>
                    </Button>
                </div>

                {children.length === 0 ? (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                                {t('parent.children.empty')}
                            </p>
                            <Button asChild>
                                <Link
                                    href="/parent/children/create"
                                    className="mt-4"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('parent.children.link_first')}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {children.map((child) => (
                            <Card
                                key={child.id}
                                className="border-sidebar-border/70 transition-shadow hover:shadow-md dark:border-sidebar-border"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {child.name}
                                            </CardTitle>
                                            <CardDescription className="mt-1 flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    {child.relationship}
                                                </Badge>
                                                {child.is_approved && (
                                                    <Badge variant="default">
                                                        {t(
                                                            'parent.children.approved',
                                                        )}
                                                    </Badge>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {t('profile.student_id')}
                                            </span>
                                            <span className="font-medium">
                                                {child.student_id}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {t(
                                                    'parent.children.grade_class',
                                                )}
                                            </span>
                                            <span className="font-medium">
                                                {child.grade} {child.class}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Coins className="h-3.5 w-3.5" />
                                                {t('points.total_points')}
                                            </span>
                                            <span className="font-bold text-primary">
                                                {child.points.total_points}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Award className="h-3.5 w-3.5" />
                                                {t('dashboard.redeemable')}
                                            </span>
                                            <span className="font-bold text-primary">
                                                {child.points.redeemable_points}
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
                                                    href={`/parent/children/${child.id}`}
                                                    className="flex-1"
                                                >
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    {t('common.view_details')}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
