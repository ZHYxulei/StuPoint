import { Form, Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { useState } from 'react';
import { UserPlus, GraduationCap, Baby, User, Users } from 'lucide-react';

interface Role {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const roles: Role[] = [
    {
        value: 'student',
        label: '学生',
        icon: User,
        description: '我是学生，需要填写身份证号、姓名等信息',
    },
    {
        value: 'teacher',
        label: '教师',
        icon: GraduationCap,
        description: '我是教师，需要选择年级、授课班级和科目',
    },
    {
        value: 'student_union_member',
        label: '学生会成员',
        icon: Users,
        description: '我是学生会成员，需要填写部门和班级信息',
    },
    {
        value: 'parent',
        label: '家长',
        icon: Baby,
        description: '我是家长，绑定子女后可查看其信息',
    },
];

interface SchoolClass {
    id: number;
    full_name: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Grade {
    id: number;
    name: string;
}

interface PageProps {
    classes?: SchoolClass[];
    subjects?: Subject[];
    grades?: Grade[];
}

export default function Register({ classes = [], subjects = [], grades = [] }: PageProps) {
    const [selectedRole, setSelectedRole] = useState<string>('student');
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [isHeadTeacher, setIsHeadTeacher] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        role: 'student',
        name: '',
        id_number: '',
        nickname: '',
        class_id: '',
        grade_id: '',
        student_union_department: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        teaching_classes: [] as number[],
        subjects: [] as number[],
        is_head_teacher: false,
    });

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        setData('role', role);
        // Reset fields when role changes
        setSelectedClasses([]);
        setSelectedSubjects([]);
        setIsHeadTeacher(false);
        setData({
            role,
            name: '',
            id_number: '',
            nickname: '',
            class_id: '',
            grade_id: '',
            student_union_department: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
            teaching_classes: [],
            subjects: [],
            is_head_teacher: false,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('teaching_classes', selectedClasses);
        setData('subjects', selectedSubjects);
        setData('is_head_teacher', isHeadTeacher);
        post('/register');
    };

    const currentRole = roles.find((r) => r.value === selectedRole);

    return (
        <AuthLayout
            title="创建账户"
            description="请选择您的角色并填写相应信息"
        >
            <Head title="注册" />

            <div className="space-y-6">
                {/* Role Selector */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => handleRoleChange(role.value)}
                                className={`relative flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all hover:bg-accent ${
                                    selectedRole === role.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted'
                                }`}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Icon className="h-5 w-5" />
                                    <span className="font-semibold">{role.label}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {role.description}
                                </p>
                                {selectedRole === role.value && (
                                    <div className="absolute right-4 top-4">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <Form
                    onSubmit={handleSubmit}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {() => (
                        <>
                            {/* Student Fields */}
                            {selectedRole === 'student' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="id_number">
                                            身份证号/学号 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="id_number"
                                            type="text"
                                            required
                                            autoFocus
                                            autoComplete="off"
                                            value={data.id_number}
                                            onChange={(e) => setData('id_number', e.target.value)}
                                            placeholder="身份证号或学号"
                                        />
                                        <InputError message={errors.id_number} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            姓名 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="真实姓名"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="nickname">昵称</Label>
                                        <Input
                                            id="nickname"
                                            type="text"
                                            autoComplete="nickname"
                                            value={data.nickname}
                                            onChange={(e) => setData('nickname', e.target.value)}
                                            placeholder="昵称（可选）"
                                        />
                                        <InputError message={errors.nickname} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="class_id">
                                            所在班级 <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.class_id}
                                            onValueChange={(value) => setData('class_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择班级" />
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
                                        <p className="text-xs text-muted-foreground">
                                            注册后需要班主任审核通过才能使用
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email_or_phone">
                                            手机号或电子邮箱 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="email_or_phone"
                                            type="text"
                                            required
                                            autoComplete="username"
                                            value={data.email || data.phone}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.includes('@')) {
                                                    setData('email', value);
                                                    setData('phone', '');
                                                } else {
                                                    setData('phone', value);
                                                    setData('email', '');
                                                }
                                            }}
                                            placeholder="手机号或电子邮箱"
                                        />
                                        <InputError message={errors.email || errors.phone} />
                                    </div>
                                </>
                            )}

                            {/* Teacher Fields */}
                            {selectedRole === 'teacher' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade_id">
                                            所属年级 <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.grade_id}
                                            onValueChange={(value) => setData('grade_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择年级" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((grade) => (
                                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                                        {grade.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.grade_id} />
                                        <p className="text-xs text-muted-foreground">
                                            注册后需要该年级的年级主任审核通过才能使用
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="teacher_email">
                                            电子邮箱 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="teacher_email"
                                            type="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="电子邮箱"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
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

                                    <div className="grid gap-2">
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
                                            我是班主任
                                        </Label>
                                    </div>
                                    <InputError message={errors.is_head_teacher} />
                                </>
                            )}

                            {/* Student Union Member Fields */}
                            {selectedRole === 'student_union_member' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="id_number">
                                            身份证号/学号 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="id_number"
                                            type="text"
                                            required
                                            autoFocus
                                            autoComplete="off"
                                            value={data.id_number}
                                            onChange={(e) => setData('id_number', e.target.value)}
                                            placeholder="身份证号或学号"
                                        />
                                        <InputError message={errors.id_number} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            姓名 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="真实姓名"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="nickname">昵称</Label>
                                        <Input
                                            id="nickname"
                                            type="text"
                                            autoComplete="nickname"
                                            value={data.nickname}
                                            onChange={(e) => setData('nickname', e.target.value)}
                                            placeholder="昵称（可选）"
                                        />
                                        <InputError message={errors.nickname} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="class_id">
                                            所在班级 <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.class_id}
                                            onValueChange={(value) => setData('class_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择班级" />
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

                                    <div className="grid gap-2">
                                        <Label htmlFor="student_union_department">
                                            学生会部门 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="student_union_department"
                                            type="text"
                                            required
                                            autoComplete="organization"
                                            value={data.student_union_department}
                                            onChange={(e) => setData('student_union_department', e.target.value)}
                                            placeholder="例如：学习部、文艺部、体育部"
                                        />
                                        <InputError message={errors.student_union_department} />
                                        <p className="text-xs text-muted-foreground">
                                            注册后需要班主任和年级主任双重审核通过才能使用
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email_or_phone">
                                            手机号或电子邮箱 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="email_or_phone"
                                            type="text"
                                            required
                                            autoComplete="username"
                                            value={data.email || data.phone}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.includes('@')) {
                                                    setData('email', value);
                                                    setData('phone', '');
                                                } else {
                                                    setData('phone', value);
                                                    setData('email', '');
                                                }
                                            }}
                                            placeholder="手机号或电子邮箱"
                                        />
                                        <InputError message={errors.email || errors.phone} />
                                    </div>
                                </>
                            )}

                            {/* Parent Fields */}
                            {selectedRole === 'parent' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="parent_email_or_phone">
                                            手机号或电子邮箱 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="parent_email_or_phone"
                                            type="text"
                                            required
                                            autoFocus
                                            autoComplete="username"
                                            value={data.email || data.phone}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.includes('@')) {
                                                    setData('email', value);
                                                    setData('phone', '');
                                                } else {
                                                    setData('phone', value);
                                                    setData('email', '');
                                                }
                                            }}
                                            placeholder="手机号或电子邮箱"
                                        />
                                        <InputError message={errors.email || errors.phone} />
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        注册成功后，您可以在家长中心绑定子女账号，查看其积分、排名和兑换记录。
                                    </p>
                                </>
                            )}

                            {/* Password Fields (for all roles) */}
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    密码 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="密码"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    确认密码 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="确认密码"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <Spinner />}
                                创建账户
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                已有账户？{' '}
                                <TextLink href={login()}>登录</TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
