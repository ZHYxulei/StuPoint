import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Award, Shield, Edit, Key, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface UserPoints {
    id: number;
    total_points: number;
    redeemable_points: number;
}

interface PageProps {
    user: {
        id: number;
        name: string;
        nickname: string | null;
        email: string;
        phone: string | null;
        student_id: string | null;
        id_number: string | null;
        grade: string | null;
        class: string | null;
        is_head_teacher: boolean;
        created_at: string;
        roles: Role[];
        points: UserPoints | null;
    };
    availableRoles: Role[];
}

export default function UserShow({ user, availableRoles }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.user_management'), href: '/admin/users' },
        { title: t('admin.users.user_detail'), href: '' },
    ];

    const [successMessage, setSuccessMessage] = useState('');
    const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
    const [pointsSuccess, setPointsSuccess] = useState('');

    // Update user info form
    const {
        data,
        setData,
        put,
        processing: updateProcessing,
        errors: updateErrors,
    } = useForm({
        name: user.name,
        nickname: user.nickname || '',
        email: user.email,
        phone: user.phone || '',
        student_id: user.student_id || '',
        id_number: user.id_number || '',
        grade: user.grade || '',
        class: user.class || '',
        is_head_teacher: user.is_head_teacher,
    });

    // Update roles form
    const {
        data: rolesData,
        setData: setRolesData,
        post,
        processing: rolesProcessing,
    } = useForm({
        role_id: user.roles.length > 0 ? user.roles[0].id : '',
    });

    // Update password form
    const {
        data: passwordData,
        setData: setPasswordData,
        post: postPassword,
        processing: passwordProcessing,
        reset: resetPassword,
        errors: passwordErrors,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Adjust points form
    const {
        data: pointsData,
        setData: setPointsData,
        post: postPoints,
        processing: pointsProcessing,
        reset: resetPoints,
        errors: pointsErrors,
        clearErrors: clearPointsErrors,
    } = useForm({
        type: 'add',
        amount: '',
        reason: '',
    });

    const handleUpdateInfo = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        put(`/admin/users/${user.id}`, {
            onSuccess: () =>
                setSuccessMessage(t('admin.users.info_updated')),
        });
    };

    const handleUpdateRoles = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        post(`/admin/users/${user.id}/roles`, {
            onSuccess: () =>
                setSuccessMessage(t('admin.users.roles_updated')),
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        postPassword(`/admin/users/${user.id}/password`, {
            onSuccess: () => {
                setSuccessMessage(t('admin.users.password_updated'));
                resetPassword();
            },
        });
    };

    const handleAdjustPoints = (e: React.FormEvent) => {
        e.preventDefault();
        setPointsSuccess('');
        clearPointsErrors();
        postPoints(`/admin/users/${user.id}/adjust-points`, {
            onSuccess: () => {
                setPointsSuccess(t('admin.users.points_adjusted'));
                resetPoints();
                setTimeout(() => {
                    setPointsDialogOpen(false);
                    setPointsSuccess('');
                    setSuccessMessage(t('admin.users.points_adjusted'));
                }, 1500);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('admin.users.user_head_title', { name: user.name })}
            />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/users">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common.back')}
                        </Link>
                    </Button>
                    <Heading
                        title={user.name}
                        description={t('admin.users.user_id', {
                            id: user.id,
                        })}
                    />
                </div>

                {successMessage && (
                    <div className="rounded-md bg-success-soft px-4 py-2 text-success">
                        {successMessage}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* User Info Card */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                {t('profile.basic_info')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleUpdateInfo}
                                className="space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t('auth.name')}</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    {updateErrors.name && (
                                        <p className="text-sm text-destructive">
                                            {updateErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nickname">
                                        {t('auth.nickname')}
                                    </Label>
                                    <Input
                                        id="nickname"
                                        value={data.nickname}
                                        onChange={(e) =>
                                            setData('nickname', e.target.value)
                                        }
                                        placeholder={t(
                                            'admin.users.nickname_placeholder',
                                        )}
                                    />
                                    {updateErrors.nickname && (
                                        <p className="text-sm text-destructive">
                                            {updateErrors.nickname}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="id_number">
                                        {t('profile.id_number')}
                                    </Label>
                                    <Input
                                        id="id_number"
                                        value={data.id_number}
                                        onChange={(e) =>
                                            setData('id_number', e.target.value)
                                        }
                                    />
                                    {updateErrors.id_number && (
                                        <p className="text-sm text-destructive">
                                            {updateErrors.id_number}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('auth.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />
                                    {updateErrors.email && (
                                        <p className="text-sm text-destructive">
                                            {updateErrors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        {t('admin.users.phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
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
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade">
                                            {t('profile.grade')}
                                        </Label>
                                        <Input
                                            id="grade"
                                            value={data.grade}
                                            onChange={(e) =>
                                                setData('grade', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="class">
                                            {t('profile.class')}
                                        </Label>
                                        <Input
                                            id="class"
                                            value={data.class}
                                            onChange={(e) =>
                                                setData('class', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_head_teacher"
                                        checked={data.is_head_teacher}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_head_teacher',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <Label htmlFor="is_head_teacher">
                                        {t('profile.head_teacher')}
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={updateProcessing}
                                >
                                    {updateProcessing
                                        ? t('admin.users.saving')
                                        : t('common.save')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Roles Card */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                {t('admin.users.role_permissions')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.users.current_role', {
                                    name:
                                        user.roles.length > 0
                                            ? user.roles[0].name
                                            : t('admin.users.none'),
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleUpdateRoles}
                                className="space-y-4"
                            >
                                <RadioGroup
                                    value={rolesData.role_id?.toString()}
                                    onValueChange={(value) =>
                                        setRolesData('role_id', parseInt(value))
                                    }
                                >
                                    {availableRoles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex items-center gap-2"
                                        >
                                            <RadioGroupItem
                                                value={role.id.toString()}
                                                id={`role-${role.id}`}
                                            />
                                            <Label htmlFor={`role-${role.id}`}>
                                                {role.name}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <Button
                                    type="submit"
                                    disabled={rolesProcessing}
                                >
                                    {rolesProcessing
                                        ? t('admin.users.saving')
                                        : t('admin.users.update_role')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Points Card */}
                {user.points && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                {t('admin.users.points_info')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {t('points.total_points')}
                                    </p>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatNumber(
                                            user.points.total_points,
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {t('points.redeemable_points')}
                                    </p>
                                    <p className="text-2xl font-bold text-success">
                                        {formatNumber(
                                            user.points.redeemable_points,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Dialog
                                    open={pointsDialogOpen}
                                    onOpenChange={setPointsDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Award className="mr-2 h-4 w-4" />
                                            {t('admin.users.adjust_points')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t(
                                                    'admin.users.adjust_points_title',
                                                )}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {t(
                                                    'admin.users.adjust_points_desc',
                                                    { name: user.name },
                                                )}
                                            </DialogDescription>
                                        </DialogHeader>

                                        {pointsSuccess && (
                                            <div className="rounded-md bg-success-soft px-4 py-2 text-sm text-success">
                                                {pointsSuccess}
                                            </div>
                                        )}

                                        <form
                                            onSubmit={handleAdjustPoints}
                                            className="space-y-4"
                                        >
                                            <div className="grid gap-2">
                                                <Label>
                                                    {t(
                                                        'admin.users.operation_type',
                                                    )}
                                                </Label>
                                                <Select
                                                    value={pointsData.type}
                                                    onValueChange={(value) =>
                                                        setPointsData(
                                                            'type',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="add">
                                                            <div className="flex items-center gap-2">
                                                                <Plus className="h-4 w-4" />
                                                                {t(
                                                                    'admin.users.add_points',
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="deduct">
                                                            <div className="flex items-center gap-2">
                                                                <Minus className="h-4 w-4" />
                                                                {t(
                                                                    'admin.users.deduct_points',
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="amount">
                                                    {t(
                                                        'admin.users.points_amount',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    min="1"
                                                    value={pointsData.amount}
                                                    onChange={(e) =>
                                                        setPointsData(
                                                            'amount',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                {pointsErrors.amount && (
                                                    <p className="text-sm text-destructive">
                                                        {pointsErrors.amount}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="reason">
                                                    {t(
                                                        'admin.users.adjust_reason',
                                                    )}
                                                </Label>
                                                <Textarea
                                                    id="reason"
                                                    value={pointsData.reason}
                                                    onChange={(e) =>
                                                        setPointsData(
                                                            'reason',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.users.adjust_reason_placeholder',
                                                    )}
                                                    rows={3}
                                                    required
                                                />
                                                {pointsErrors.reason && (
                                                    <p className="text-sm text-destructive">
                                                        {pointsErrors.reason}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() =>
                                                        setPointsDialogOpen(
                                                            false,
                                                        )
                                                    }
                                                    disabled={pointsProcessing}
                                                >
                                                    {t('common.cancel')}
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        pointsProcessing ||
                                                        !!pointsSuccess
                                                    }
                                                    className="flex-1"
                                                >
                                                    {pointsProcessing
                                                        ? t('common.processing')
                                                        : t(
                                                              'admin.users.confirm_adjust',
                                                          )}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Password Card */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            {t('admin.users.change_password')}
                        </CardTitle>
                        <CardDescription>
                            {t('admin.users.set_password_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleUpdatePassword}
                            className="space-y-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('settings.password.new_password')}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    minLength={8}
                                />
                                {passwordErrors.password && (
                                    <p className="text-sm text-destructive">
                                        {passwordErrors.password}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('auth.password_confirmation')}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={passwordProcessing}>
                                {passwordProcessing
                                    ? t('admin.users.updating')
                                    : t('admin.users.update_password')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
