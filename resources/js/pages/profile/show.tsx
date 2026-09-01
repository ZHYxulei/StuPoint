import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { User, Mail, Phone, IdCard, Award, Shield, Calendar, User as UserIcon, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';

interface UserRole {
    id: number;
    name: string;
    slug: string;
}

interface ProfileUser {
    id: number;
    name: string;
    nickname: string | null;
    email: string;
    phone?: string;
    student_id?: string;
    id_number?: string;
    grade?: string;
    class?: string;
    is_head_teacher?: boolean;
    avatar?: string;
    last_login_at?: string;
    last_login_ip?: string;
    roles: UserRole[];
    email_verified_at: string | null;
    created_at: string;
}

interface PageProps {
    user: ProfileUser;
}

export default function ProfileShow({ user }: PageProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper function to get display name
    const getDisplayName = (user: ProfileUser) => {
        return user.nickname || user.name;
    };

    return (
        <PublicLayout>
            <Head title="账户信息" />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-card/30 py-12">
                    <div className="container">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border shadow-lg">
                                <AvatarImage src={user.avatar} alt={getDisplayName(user)} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {getDisplayName(user).charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold">{getDisplayName(user)}</h1>
                                <p className="text-muted-foreground mt-1">查看您的账户信息</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container py-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    基本信息
                                </CardTitle>
                                <CardDescription>您的个人基本信息</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">姓名</label>
                                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{user.name}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">昵称</label>
                                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                        <User className="h-4 w-4" />
                                        <span>{user.nickname || '未设置'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">身份证号</label>
                                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                        <IdCard className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{user.id_number || '未设置'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">学号</label>
                                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                        <Award className="h-4 w-4" />
                                        <span>{user.student_id || '未设置'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">手机号码</label>
                                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                        <Phone className="h-4 w-4" />
                                        <span>{user.phone || '未设置'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">电子邮箱</label>
                                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                        {user.email_verified_at ? (
                                            <Badge variant="success" className="ml-auto">已验证</Badge>
                                        ) : (
                                            <Badge variant="warning" className="ml-auto">未验证</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic & Role Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    角色与年级
                                </CardTitle>
                                <CardDescription>您的角色和年级信息</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">角色</label>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles.map((role) => (
                                            <Badge key={role.id} variant="secondary">
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {user.is_head_teacher && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">职务</label>
                                        <div className="rounded-md border border-info/20 bg-info-soft p-2">
                                            <span className="text-info-foreground">班主任</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">年级</label>
                                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                        <UserIcon className="h-4 w-4" />
                                        <span>{user.grade || '未设置'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">班级</label>
                                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                        <User className="h-4 w-4" />
                                        <span>{user.class || '未设置'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                                    <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(user.created_at)}</span>
                                    </div>
                                </div>

                                {user.last_login_at && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">最后登录</label>
                                        <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatDate(user.last_login_at)}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end">
                        <Button asChild>
                            <Link href="/settings/profile">编辑账户信息</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
