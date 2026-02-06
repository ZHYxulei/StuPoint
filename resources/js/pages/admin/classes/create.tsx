import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    teachers: Teacher[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '班级管理', href: '/admin/classes' },
    { title: '创建班级', href: '/admin/classes/create' },
};

export default function CreateClass({ teachers }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        grade: '',
        head_teacher_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/classes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="创建班级" />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/classes">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title="创建班级"
                        description="填写班级信息并分配班主任"
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border max-w-2xl">
                    <CardHeader>
                        <CardTitle>班级信息</CardTitle>
                        <CardDescription>
                            请填写班级的基本信息
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grade">
                                        年级 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="grade"
                                        placeholder="例如: 高三、初一"
                                        value={data.grade}
                                        onChange={(e) => setData('grade', e.target.value)}
                                        error={errors.grade}
                                    />
                                    {errors.grade && (
                                        <p className="text-sm text-destructive">{errors.grade}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        班级名称 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="例如: 1班、2班"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="head_teacher_id">班主任</Label>
                                    <Select
                                        value={data.head_teacher_id}
                                        onValueChange={(value) => setData('head_teacher_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择班主任" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name} ({teacher.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.head_teacher_id && (
                                        <p className="text-sm text-destructive">{errors.head_teacher_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Link href="/admin/classes" className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        取消
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    创建班级
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
