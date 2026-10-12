import { Head, useForm } from '@inertiajs/react';
import { UserPlus, GraduationCap, Baby, User, Users } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { t } from '@/lib/i18n';
import { login } from '@/routes';

interface Role {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

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

export default function Register({
    classes = [],
    subjects = [],
    grades = [],
}: PageProps) {
    const [selectedRole, setSelectedRole] = useState<string>('student');
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [isHeadTeacher, setIsHeadTeacher] = useState(false);

    const roles: Role[] = [
        {
            value: 'student',
            label: t('auth.roles.student'),
            icon: User,
            description: t('auth.roles.student_description'),
        },
        {
            value: 'teacher',
            label: t('auth.roles.teacher'),
            icon: GraduationCap,
            description: t('auth.roles.teacher_description'),
        },
        {
            value: 'student_union_member',
            label: t('auth.roles.student_union_member'),
            icon: Users,
            description: t('auth.roles.student_union_member_description'),
        },
        {
            value: 'parent',
            label: t('auth.roles.parent'),
            icon: Baby,
            description: t('auth.roles.parent_description'),
        },
    ];

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
            title={t('auth.register.title')}
            description={t('auth.register.description')}
        >
            <Head title={t('nav.register')} />

            <div className="space-y-6">
                {/* Role Selector */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => handleRoleChange(role.value)}
                                className={`relative flex h-full min-h-[132px] flex-col items-start rounded-lg border-2 p-4 text-left transition-all hover:bg-accent ${
                                    selectedRole === role.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted'
                                }`}
                            >
                                <div className="flex w-full items-center gap-2">
                                    <Icon className="h-5 w-5" />
                                    <span className="font-semibold">
                                        {role.label}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {role.description}
                                </p>
                                {selectedRole === role.value && (
                                    <div className="absolute top-4 right-4">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Student Fields */}
                    {selectedRole === 'student' && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="id_number">
                                    {t('auth.register.id_number')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="id_number"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    value={data.id_number}
                                    onChange={(e) =>
                                        setData('id_number', e.target.value)
                                    }
                                    placeholder={t(
                                        'auth.register.id_number_placeholder',
                                    )}
                                />
                                <InputError message={errors.id_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('auth.name')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder={t(
                                        'auth.register.name_placeholder',
                                    )}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nickname">
                                    {t('auth.nickname')}
                                </Label>
                                <Input
                                    id="nickname"
                                    type="text"
                                    autoComplete="nickname"
                                    value={data.nickname}
                                    onChange={(e) =>
                                        setData('nickname', e.target.value)
                                    }
                                    placeholder={t(
                                        'auth.register.nickname_placeholder',
                                    )}
                                />
                                <InputError message={errors.nickname} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="class_id">
                                    {t('auth.register.class')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.class_id}
                                    onValueChange={(value) =>
                                        setData('class_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={t(
                                                'auth.register.select_class',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem
                                                key={cls.id}
                                                value={cls.id.toString()}
                                            >
                                                {cls.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.class_id} />
                                <p className="text-xs text-muted-foreground">
                                    {t('auth.register.class_approval_note')}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email_or_phone">
                                    {t('auth.register.email_or_phone')}{' '}
                                    <span className="text-destructive">*</span>
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
                                    placeholder={t(
                                        'auth.register.email_or_phone',
                                    )}
                                />
                                <InputError
                                    message={errors.email || errors.phone}
                                />
                            </div>
                        </>
                    )}

                    {/* Teacher Fields */}
                    {selectedRole === 'teacher' && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="grade_id">
                                    {t('auth.register.grade')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.grade_id}
                                    onValueChange={(value) =>
                                        setData('grade_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={t(
                                                'auth.register.select_grade',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {grades.map((grade) => (
                                            <SelectItem
                                                key={grade.id}
                                                value={grade.id.toString()}
                                            >
                                                {grade.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.grade_id} />
                                <p className="text-xs text-muted-foreground">
                                    {t('auth.register.grade_approval_note')}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="teacher_email">
                                    {t('auth.register.teacher_email')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="teacher_email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder={t(
                                        'auth.register.teacher_email',
                                    )}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label>
                                    {t('auth.register.teaching_classes')}
                                </Label>
                                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border p-3">
                                    {classes.map((cls) => (
                                        <label
                                            key={cls.id}
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <Checkbox
                                                checked={selectedClasses.includes(
                                                    cls.id,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedClasses([
                                                            ...selectedClasses,
                                                            cls.id,
                                                        ]);
                                                    } else {
                                                        setSelectedClasses(
                                                            selectedClasses.filter(
                                                                (id) =>
                                                                    id !==
                                                                    cls.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                            />
                                            <span className="text-sm">
                                                {cls.full_name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {classes.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        {t('auth.register.no_classes')}
                                    </p>
                                )}
                                <InputError message={errors.teaching_classes} />
                            </div>

                            <div className="grid gap-2">
                                <Label>{t('auth.register.subjects')}</Label>
                                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border p-3">
                                    {subjects.map((subject) => (
                                        <label
                                            key={subject.id}
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <Checkbox
                                                checked={selectedSubjects.includes(
                                                    subject.id,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedSubjects([
                                                            ...selectedSubjects,
                                                            subject.id,
                                                        ]);
                                                    } else {
                                                        setSelectedSubjects(
                                                            selectedSubjects.filter(
                                                                (id) =>
                                                                    id !==
                                                                    subject.id,
                                                            ),
                                                        );
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
                                    <p className="text-sm text-muted-foreground">
                                        {t('auth.register.no_subjects')}
                                    </p>
                                )}
                                <InputError message={errors.subjects} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_head_teacher"
                                    checked={isHeadTeacher}
                                    onCheckedChange={(checked) =>
                                        setIsHeadTeacher(checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor="is_head_teacher"
                                    className="cursor-pointer"
                                >
                                    {t('auth.register.is_head_teacher')}
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
                                    {t('auth.register.id_number')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="id_number"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="off"
                                    value={data.id_number}
                                    onChange={(e) =>
                                        setData('id_number', e.target.value)
                                    }
                                    placeholder={t(
                                        'auth.register.id_number_placeholder',
                                    )}
                                />
                                <InputError message={errors.id_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('auth.name')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder={t(
                                        'auth.register.name_placeholder',
                                    )}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nickname">
                                    {t('auth.nickname')}
                                </Label>
                                <Input
                                    id="nickname"
                                    type="text"
                                    autoComplete="nickname"
                                    value={data.nickname}
                                    onChange={(e) =>
                                        setData('nickname', e.target.value)
                                    }
                                    placeholder={t(
                                        'auth.register.nickname_placeholder',
                                    )}
                                />
                                <InputError message={errors.nickname} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="class_id">
                                    {t('auth.register.class')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.class_id}
                                    onValueChange={(value) =>
                                        setData('class_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={t(
                                                'auth.register.select_class',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem
                                                key={cls.id}
                                                value={cls.id.toString()}
                                            >
                                                {cls.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.class_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="student_union_department">
                                    {t('auth.register.department')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="student_union_department"
                                    type="text"
                                    required
                                    autoComplete="organization"
                                    value={data.student_union_department}
                                    onChange={(e) =>
                                        setData(
                                            'student_union_department',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={t(
                                        'auth.register.department_placeholder',
                                    )}
                                />
                                <InputError
                                    message={errors.student_union_department}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'auth.register.department_approval_note',
                                    )}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email_or_phone">
                                    {t('auth.register.email_or_phone')}{' '}
                                    <span className="text-destructive">*</span>
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
                                    placeholder={t(
                                        'auth.register.email_or_phone',
                                    )}
                                />
                                <InputError
                                    message={errors.email || errors.phone}
                                />
                            </div>
                        </>
                    )}

                    {/* Parent Fields */}
                    {selectedRole === 'parent' && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="parent_email_or_phone">
                                    {t('auth.register.email_or_phone')}{' '}
                                    <span className="text-destructive">*</span>
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
                                    placeholder={t(
                                        'auth.register.email_or_phone',
                                    )}
                                />
                                <InputError
                                    message={errors.email || errors.phone}
                                />
                            </div>

                            <p className="text-sm text-muted-foreground">
                                {t('auth.register.parent_note')}
                            </p>
                        </>
                    )}

                    {/* Password Fields (for all roles) */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {t('auth.password')}{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder={t('auth.password')}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            {t('auth.password_confirmation')}{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder={t('auth.password_confirmation')}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        {t('auth.register.submit')}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        {t('auth.register.have_account')}{' '}
                        <TextLink href={login()}>{t('nav.login')}</TextLink>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
