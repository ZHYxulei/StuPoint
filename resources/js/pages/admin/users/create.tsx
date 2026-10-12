import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    User,
    GraduationCap,
    Baby,
    Crown,
    Shield,
    Users,
    UserCog,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

const roleIcons: Record<string, any> = {
    student: User,
    teacher: GraduationCap,
    parent: Baby,
    head_teacher: Users,
    grade_director: Shield,
    principal: Crown,
    super_admin: UserCog,
};

export default function CreateUser({
    roles,
    classes,
    subjects,
    defaultRole,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.user_management'), href: '/admin/users' },
        { title: t('admin.users.add_user'), href: '/admin/users/create' },
    ];

    // Built in the component: at module scope `t()` would run on import, before
    // the locale is known, and freeze the default language.
    const roleDescriptions: Record<string, string> = {
        student: t('admin.users.role_desc_student'),
        teacher: t('admin.users.role_desc_teacher'),
        parent: t('admin.users.role_desc_parent'),
        head_teacher: t('admin.users.role_desc_head_teacher'),
        grade_director: t('admin.users.role_desc_grade_director'),
        principal: t('admin.users.role_desc_principal'),
    };

    const [selectedRole, setSelectedRole] = useState<string>(
        defaultRole || 'student',
    );
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [isHeadTeacher, setIsHeadTeacher] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        role_id: defaultRole
            ? roles.find((r) => r.slug === defaultRole)?.id ||
              roles.find((r) => r.slug === 'student')?.id
            : roles.find((r) => r.slug === 'student')?.id,
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
        setSelectedRole(
            roles.find((r) => r.id === parseInt(roleId))?.slug || 'student',
        );
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

    const currentRoleSlug =
        roles.find((r) => r.id === data.role_id)?.slug || 'student';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.users.add_user')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={t('admin.users.add_user')}
                        description={t('admin.users.create_description')}
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('admin.users.user_role')}</CardTitle>
                        <CardDescription>
                            {t('admin.users.select_role')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={data.role_id?.toString()}
                            onValueChange={handleRoleChange}
                        >
                            <div className="grid gap-4 md:grid-cols-3">
                                {roles.map((role) => {
                                    const Icon = roleIcons[role.slug] || User;
                                    return (
                                        <div
                                            key={role.id}
                                            className="flex items-center gap-2 rounded-lg border p-4"
                                        >
                                            <RadioGroupItem
                                                value={role.id.toString()}
                                                id={`role-${role.id}`}
                                            />
                                            <Label
                                                htmlFor={`role-${role.id}`}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-semibold">
                                                            {role.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {roleDescriptions[
                                                                role.slug as keyof typeof roleDescriptions
                                                            ] || role.name}
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
                        <CardTitle>{t('admin.users.user_info')}</CardTitle>
                        <CardDescription>
                            {t('admin.users.fill_basic_info')}
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
                                                {t('auth.register.id_number')}{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="id_number"
                                                value={data.id_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'id_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'auth.register.id_number_placeholder',
                                                )}
                                            />
                                            <InputError
                                                message={errors.id_number}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="student_id">
                                                {t('profile.student_id')}
                                            </Label>
                                            <Input
                                                id="student_id"
                                                value={data.student_id}
                                                onChange={(e) =>
                                                    setData(
                                                        'student_id',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'admin.users.student_id_optional',
                                                )}
                                            />
                                            <InputError
                                                message={errors.student_id}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                {t('auth.name')}{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'auth.register.name_placeholder',
                                                )}
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nickname">
                                                {t('auth.nickname')}
                                            </Label>
                                            <Input
                                                id="nickname"
                                                value={data.nickname}
                                                onChange={(e) =>
                                                    setData(
                                                        'nickname',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'auth.register.nickname_placeholder',
                                                )}
                                            />
                                            <InputError
                                                message={errors.nickname}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="class_id">
                                            {t('auth.register.class')}
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
                                                        'admin.users.select_class_optional',
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

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                {t('profile.email')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'admin.users.email_optional',
                                                )}
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                {t('admin.users.phone')}
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'admin.users.phone_optional',
                                                )}
                                            />
                                            <InputError
                                                message={errors.phone}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Teacher Fields */}
                            {currentRoleSlug === 'teacher' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            {t('profile.email')}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder={t('profile.email')}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
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
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            if (checked) {
                                                                setSelectedClasses(
                                                                    [
                                                                        ...selectedClasses,
                                                                        cls.id,
                                                                    ],
                                                                );
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
                                        <InputError
                                            message={errors.teaching_classes}
                                        />
                                    </div>

                                    <div className="space-y-2">
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
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            if (checked) {
                                                                setSelectedSubjects(
                                                                    [
                                                                        ...selectedSubjects,
                                                                        subject.id,
                                                                    ],
                                                                );
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
                                                        {subject.name} (
                                                        {subject.code})
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
                                                setIsHeadTeacher(
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_head_teacher"
                                            className="cursor-pointer"
                                        >
                                            {t('profile.head_teacher')}
                                        </Label>
                                    </div>
                                    <InputError
                                        message={errors.is_head_teacher}
                                    />
                                </>
                            )}

                            {/* Parent Fields */}
                            {currentRoleSlug === 'parent' && (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="parent_email">
                                                {t('profile.email')}
                                            </Label>
                                            <Input
                                                id="parent_email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'admin.users.email_optional',
                                                )}
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="parent_phone">
                                                {t('admin.users.phone')}
                                            </Label>
                                            <Input
                                                id="parent_phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'admin.users.phone_optional',
                                                )}
                                            />
                                            <InputError
                                                message={errors.phone}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.users.parent_note')}
                                    </p>
                                </>
                            )}

                            {/* Default Fields for other roles (grade_director, principal, etc.) */}
                            {!['student', 'teacher', 'parent'].includes(
                                currentRoleSlug,
                            ) && (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                {t('auth.name')}{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'auth.register.name_placeholder',
                                                )}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nickname">
                                                {t('auth.nickname')}
                                            </Label>
                                            <Input
                                                id="nickname"
                                                value={data.nickname}
                                                onChange={(e) =>
                                                    setData(
                                                        'nickname',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'auth.register.nickname_placeholder',
                                                )}
                                            />
                                            <InputError
                                                message={errors.nickname}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                {t('profile.email')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'admin.users.email_optional',
                                                )}
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                {t('admin.users.phone')}
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'admin.users.phone_optional',
                                                )}
                                            />
                                            <InputError
                                                message={errors.phone}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Password Fields (for all roles) */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {t('auth.password')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder={t('auth.password')}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        {t('auth.password_confirmation')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'auth.password_confirmation',
                                        )}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('admin.users.create_user')}
                                </Button>
                                <Button asChild type="button" variant="outline">
                                    <Link href="/admin/users">
                                        {t('common.cancel')}
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
