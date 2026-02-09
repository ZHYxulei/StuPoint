import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, GraduationCap, CheckCircle2, XCircle, Users2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Grade {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

interface PageProps {
    grades: {
        data: Grade[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '年级管理', href: '/admin/grades' },
];

export default function GradeIndex({ grades, filters }: PageProps) {
    const { get, processing, setData } = useForm({
        search: filters.search || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/grades', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="年级管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="年级管理"
                        description="管理学校年级信息，教师注册时可选"
                    />
                    <Link href="/admin/grades/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            添加年级
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            搜索年级
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="search">搜索</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    value={filters.search || ''}
                                    onChange={(e) => setData('search', e.target.value)}
                                    placeholder="搜索年级名称..."
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Search className="mr-2 h-4 w-4" />
                                搜索
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Grades List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {grades.data.map((grade) => (
                        <Card
                            key={grade.id}
                            className="border-sidebar-border/70 dark:border-sidebar-border hover:shadow-md transition-shadow"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {grade.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            年级
                                        </CardDescription>
                                    </div>
                                    <Badge variant={grade.is_active ? 'default' : 'secondary'}>
                                        {grade.is_active ? (
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                        ) : (
                                            <XCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {grade.is_active ? '启用' : '禁用'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {grade.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {grade.description}
                                        </p>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Link
                                            href={`/admin/grades/${grade.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Users2 className="h-4 w-4 mr-1" />
                                                查看详情
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/admin/grades/${grade.id}/edit`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                编辑
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {grades.data.length === 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">暂无年级</p>
                            <Link href="/admin/grades/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    添加年级
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
