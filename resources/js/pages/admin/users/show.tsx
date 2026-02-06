import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Award, Shield, Edit, Key, Plus, Minus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '用户管理', href: '/admin/users' },
    { title: '用户详情', href: '' },
];

export default function UserShow({ user, availableRoles }: PageProps) {
    const [successMessage, setSuccessMessage] = useState('');

    // Update user info form
    const { data, setData, put, processing: updateProcessing, errors: updateErrors } = useForm({
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
    const { data: rolesData, setData: setRolesData, post, processing: rolesProcessing } = useForm({
        role_id: user.roles.length > 0 ? user.roles[0].id : '',
    });

    // Update password form
    const { data: passwordData, setData: setPasswordData, post: postPassword, processing: passwordProcessing, reset: resetPassword, errors: passwordErrors } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Adjust points form
    const { data: pointsData, setData: setPointsData, post: postPoints, processing: pointsProcessing, reset: resetPoints } = useForm({
        type: 'add',
        amount: '',
        reason: '',
    });

    const handleUpdateInfo = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`, {
            onSuccess: () => setSuccessMessage('用户信息已更新'),
        });
    };

    const handleUpdateRoles = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/users/${user.id}/roles`, {
            onSuccess: () => setSuccessMessage('用户角色已更新'),
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        postPassword(`/admin/users/${user.id}/password`, {
            onSuccess: () => {
                setSuccessMessage('密码已更新');
                resetPassword();
            },
        });
    };

    const handleAdjustPoints = (e: React.FormEvent) => {
        e.preventDefault();
        postPoints(`/admin/users/${user.id}/adjust-points`, {
            onSuccess: () => {
                setSuccessMessage('积分调整成功');
                resetPoints();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`用户: ${user.name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            返回
                        </Button>
                    </Link>
                    <Heading title={user.name} description={`用户 ID: ${user.id}`} />
                </div>

                {successMessage && (
                    <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-md">
                        {successMessage}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* User Info Card */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                基本信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateInfo} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">姓名</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {updateErrors.name && <p className="text-sm text-red-600">{updateErrors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nickname">昵称</Label>
                                    <Input
                                        id="nickname"
                                        value={data.nickname}
                                        onChange={(e) => setData('nickname', e.target.value)}
                                        placeholder="留空则使用姓名"
                                    />
                                    {updateErrors.nickname && <p className="text-sm text-red-600">{updateErrors.nickname}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="id_number">身份证号</Label>
                                    <Input
                                        id="id_number"
                                        value={data.id_number}
                                        onChange={(e) => setData('id_number', e.target.value)}
                                    />
                                    {updateErrors.id_number && <p className="text-sm text-red-600">{updateErrors.id_number}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">邮箱</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {updateErrors.email && <p className="text-sm text-red-600">{updateErrors.email}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">手机号</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="student_id">学号</Label>
                                    <Input
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade">年级</Label>
                                        <Input
                                            id="grade"
                                            value={data.grade}
                                            onChange={(e) => setData('grade', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="class">班级</Label>
                                        <Input
                                            id="class"
                                            value={data.class}
                                            onChange={(e) => setData('class', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_head_teacher"
                                        checked={data.is_head_teacher}
                                        onCheckedChange={(checked) => setData('is_head_teacher', checked as boolean)}
                                    />
                                    <Label htmlFor="is_head_teacher">班主任</Label>
                                </div>

                                <Button type="submit" disabled={updateProcessing}>
                                    {updateProcessing ? '保存中...' : '保存'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Roles Card */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                角色权限
                            </CardTitle>
                            <CardDescription>当前角色: {user.roles.length > 0 ? user.roles[0].name : '无'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateRoles} className="space-y-4">
                                <RadioGroup value={rolesData.role_id?.toString()} onValueChange={(value) => setRolesData('role_id', parseInt(value))}>
                                    {availableRoles.map((role) => (
                                        <div key={role.id} className="flex items-center gap-2">
                                            <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
                                            <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <Button type="submit" disabled={rolesProcessing}>
                                    {rolesProcessing ? '保存中...' : '更新角色'}
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
                                积分信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">总积分</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {user.points.total_points.toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">可兑换积分</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {user.points.redeemable_points.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Award className="mr-2 h-4 w-4" />
                                            手动调整积分
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>调整用户积分</DialogTitle>
                                            <DialogDescription>
                                                为 {user.name} 手动增加或扣除积分
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleAdjustPoints} className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label>操作类型</Label>
                                                <Select
                                                    value={pointsData.type}
                                                    onValueChange={(value) => setPointsData('type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="add">
                                                            <div className="flex items-center gap-2">
                                                                <Plus className="h-4 w-4" />
                                                                增加积分
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="deduct">
                                                            <div className="flex items-center gap-2">
                                                                <Minus className="h-4 w-4" />
                                                                扣除积分
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="amount">积分数量</Label>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    min="1"
                                                    value={pointsData.amount}
                                                    onChange={(e) => setPointsData('amount', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="reason">调整原因</Label>
                                                <Textarea
                                                    id="reason"
                                                    value={pointsData.reason}
                                                    onChange={(e) => setPointsData('reason', e.target.value)}
                                                    placeholder="请输入调整积分的原因..."
                                                    rows={3}
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="outline" className="flex-1">
                                                        取消
                                                    </Button>
                                                </DialogTrigger>
                                                <Button type="submit" disabled={pointsProcessing} className="flex-1">
                                                    {pointsProcessing ? '处理中...' : '确认调整'}
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
                            修改密码
                        </CardTitle>
                        <CardDescription>为此用户设置新密码</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">新密码</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    required
                                    minLength={8}
                                />
                                {passwordErrors.password && <p className="text-sm text-red-600">{passwordErrors.password}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">确认密码</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={passwordProcessing}>
                                {passwordProcessing ? '更新中...' : '更新密码'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
