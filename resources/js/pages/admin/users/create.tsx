import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import InputError from '@/components/ui/input-error';
import { ArrowLeft, Save, User, GraduationCap, Baby } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    slug: string;
    level: number;
}

interface SchoolClass {
    id: number;
    full_name: string;
    grade: string;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface PageProps {
    roles: Role[];
    classes: SchoolClass[];
    subjects: Subject[];
    defaultRole?: string;
}

const roleDescriptions = {
    student: '需要填写身份证号、姓名、班级等信息',
    teacher: '需要选择授课班级和科目',
    parent: '只需填写联系方式，后续可绑定子女',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '用户管理', href: '/admin/users' },
    { title: '添加用户', href: '/admin/users/create' },
];

export default function CreateUser({ roles, classes, subjects, defaultRole }: PageProps) {
    const [selectedRole, setSelectedRole] = useState<string>(defaultRole || 'student');
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [isHeadTeacher, setIsHeadTeacher] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        role_id: defaultRole ? roles.find(r => r.slug === defaultRole)?.id || roles.find(r => r.slug === 'student')?.id : roles.find(r => r.slug === 'student')?.id,
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        id_number: '',
        student_id: '',
        nickname: '',
        class_id: '',
        is_head_teacher: false,
        teaching_classes: [] as number[],
        subjects: [] as number[],
    });

    const handleRoleChange = (roleId: string) => {
        setSelectedRole(roles.find(r => r.id === parseInt(roleId))?.slug || 'student');
        setData('role_id', parseInt(roleId));
        setSelectedClasses([]);
        setSelectedSubjects([]);
        setIsHeadTeacher(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('teaching_classes', selectedClasses);
        setData('subjects', selectedSubjects);
        setData('is_head_teacher', isHeadTeacher);
        post('/admin/users');
    };

    const currentRoleSlug = roles.find(r => r.id === data.role_id)?.slug || 'student';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="添加用户" />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title="添加用户"
                        description="创建新的用户账户"
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>用户角色</CardTitle>
                        <CardDescription>选择用户的角色</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={data.role_id?.toString()} onValueChange={handleRoleChange}>
                            <div className="grid gap-4 md:grid-cols-3">
                                {roles.map((role) => {
                                    const Icon = role.slug === 'student' ? User : role.slug === 'teacher' ? GraduationCap : Baby;
                                    return (
                                        <div key={role.id} className="flex items-center gap-2 p-4 border rounded-lg">
                                            <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
                                            <Label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-semibold">{role.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {roleDescriptions[role.slug as keyof typeof roleDescriptions]}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>用户信息</CardTitle>
                        <CardDescription>
                            填写用户的基本信息
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Student Fields */}
                            {currentRoleSlug === 'student' && (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="id_number">
                                                身份证号/学号 <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="id_number"
                                                value={data.id_number}
                                                onChange={(e) => setData('id_number', e.target.value)}
                                                placeholder="身份证号或学号"
                                            />
                                            <InputError message={errors.id_number} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="student_id">学号</Label>
                                            <Input
                                                id="student_id"
                                                value={data.student_id}
                                                onChange={(e) => setData('student_id', e.target.value)}
                                                placeholder="学号（可选）"
                                            />
                                            <InputError message={errors.student_id} />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                姓名 <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="真实姓名"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nickname">昵称</Label>
                                            <Input
                                                id="nickname"
                                                value={data.nickname}
                                                onChange={(e) => setData('nickname', e.target.value)}
                                                placeholder="昵称（可选）"
                                            />
                                            <InputError message={errors.nickname} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="class_id">所在班级</Label>
                                        <Select
                                            value={data.class_id}
                                            onValueChange={(value) => setData('class_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择班级（可选）" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.id} value={cls.id.toString()}>
                                                        {cls.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.class_id} />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">电子邮箱</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="电子邮箱（可选）"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">手机号</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="手机号（可选）"
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Teacher Fields */}
                            {currentRoleSlug === 'teacher' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            电子邮箱 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="电子邮箱"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>授课班级（可多选）</Label>
                                        <div className="grid gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                                            {classes.map((cls) => (
                                                <label
                                                    key={cls.id}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedClasses.includes(cls.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedClasses([...selectedClasses, cls.id]);
                                                            } else {
                                                                setSelectedClasses(selectedClasses.filter((id) => id !== cls.id));
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">{cls.full_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {classes.length === 0 && (
                                            <p className="text-sm text-muted-foreground">暂无班级可选</p>
                                        )}
                                        <InputError message={errors.teaching_classes} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>任课科目（可多选）</Label>
                                        <div className="grid gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                                            {subjects.map((subject) => (
                                                <label
                                                    key={subject.id}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedSubjects.includes(subject.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedSubjects([...selectedSubjects, subject.id]);
                                                            } else {
                                                                setSelectedSubjects(selectedSubjects.filter((id) => id !== subject.id));
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">
                                                        {subject.name} ({subject.code})
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {subjects.length === 0 && (
                                            <p className="text-sm text-muted-foreground">暂无科目可选</p>
                                        )}
                                        <InputError message={errors.subjects} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_head_teacher"
                                            checked={isHeadTeacher}
                                            onCheckedChange={(checked) => setIsHeadTeacher(checked as boolean)}
                                        />
                                        <Label htmlFor="is_head_teacher" className="cursor-pointer">
                                            班主任
                                        </Label>
                                    </div>
                                    <InputError message={errors.is_head_teacher} />
                                </>
                            )}

                            {/* Parent Fields */}
                            {currentRoleSlug === 'parent' && (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="parent_email">电子邮箱</Label>
                                            <Input
                                                id="parent_email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="电子邮箱（可选）"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="parent_phone">手机号</Label>
                                            <Input
                                                id="parent_phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="手机号（可选）"
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        家长账户创建后，可以在家长中心绑定子女账号，查看其积分、排名和兑换记录。
                                    </p>
                                </>
                            )}

                            {/* Password Fields (for all roles) */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        密码 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="密码"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        确认密码 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="确认密码"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    创建用户
                                </Button>
                                <Link href="/admin/users">
                                    <Button type="button" variant="outline">
                                        取消
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
