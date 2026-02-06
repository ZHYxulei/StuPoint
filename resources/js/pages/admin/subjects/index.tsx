import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BookOpen, CheckCircle2, XCircle, Settings2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '科目管理', href: '/admin/subjects' },
];

export default function SubjectIndex({ subjects, filters }: PageProps) {
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
            <Head title="科目管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="科目管理"
                        description="管理学校科目信息，教师注册时可选"
                    />
                    <Link href="/admin/subjects/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            添加科目
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            搜索科目
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
                                    placeholder="搜索科目名称或代码..."
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Search className="mr-2 h-4 w-4" />
                                搜索
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Subjects List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                        <Card
                            key={subject.id}
                            className="border-sidebar-border/70 dark:border-sidebar-border hover:shadow-md transition-shadow"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {subject.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {subject.code}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                                        {subject.is_active ? (
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                        ) : (
                                            <XCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {subject.is_active ? '启用' : '禁用'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {subject.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {subject.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Settings2 className="h-3.5 w-3.5" />
                                            排序
                                        </span>
                                        <span className="font-medium">
                                            {subject.sort_order}
                                        </span>
                                    </div>
                                    <div className="pt-2 flex gap-2">
                                        <Link
                                            href={`/admin/subjects/${subject.id}/edit`}
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

                {subjects.length === 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">暂无科目</p>
                            <Link href="/admin/subjects/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    添加科目
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
