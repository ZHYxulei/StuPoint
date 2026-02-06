import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Users2, GraduationCap, Settings2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Class {
    id: number;
    name: string;
    grade: string;
    full_name: string;
    head_teacher: {
        id: number;
        name: string;
    } | null;
    student_count: number;
    teacher_count: number;
    created_at: string;
}

interface PageProps {
    classes: Class[];
    grades: string[];
    filters: {
        grade?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '班级管理', href: '/admin/classes' },
];

export default function ClassIndex({ classes, grades, filters }: PageProps) {
    const { get, processing } = useForm({
        grade: filters.grade || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/classes', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="班级管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="班级管理"
                        description="管理学校班级、班主任和任课老师"
                    />
                    <Link href="/admin/classes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            创建班级
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            筛选班级
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="grade">年级</Label>
                                <Select
                                    value={filters.grade || ''}
                                    onValueChange={(value) => {
                                        if (value === 'all') {
                                            get('/admin/classes', {
                                                data: { grade: '' },
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        } else {
                                            get('/admin/classes', {
                                                data: { grade: value },
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择年级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">全部年级</SelectItem>
                                        {grades.map((grade) => (
                                            <SelectItem key={grade} value={grade}>
                                                {grade}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Classes List */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((classItem) => (
                        <Card
                            key={classItem.id}
                            className="border-sidebar-border/70 dark:border-sidebar-border hover:shadow-md transition-shadow"
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {classItem.full_name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    {classItem.grade}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">班主任</span>
                                        <span className="font-medium">
                                            {classItem.head_teacher?.name || '未设置'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Users2 className="h-3.5 w-3.5" />
                                            学生
                                        </span>
                                        <span className="font-medium">
                                            {classItem.student_count} 人
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Settings2 className="h-3.5 w-3.5" />
                                            任课老师
                                        </span>
                                        <span className="font-medium">
                                            {classItem.teacher_count} 人
                                        </span>
                                    </div>
                                    <div className="pt-2 flex gap-2">
                                        <Link
                                            href={`/admin/classes/${classItem.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                查看详情
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {classes.length === 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">暂无班级</p>
                            <Link href="/admin/classes/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    创建班级
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
