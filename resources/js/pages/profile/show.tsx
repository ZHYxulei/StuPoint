import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    User,
    Mail,
    Phone,
    IdCard,
    Award,
    Shield,
    Calendar,
    User as UserIcon,
    Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { formatDate } from '@/lib/format';
import { t } from '@/lib/i18n';

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
    // Helper function to get display name
    const getDisplayName = (user: ProfileUser) => {
        return user.nickname || user.name;
    };

    return (
        <PublicLayout>
            <Head title={t('nav.account')} />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-card/30 py-12">
                    <div className="container">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border shadow-lg">
                                <AvatarImage
                                    src={user.avatar}
                                    alt={getDisplayName(user)}
                                />
                                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                                    {getDisplayName(user)
                                        .charAt(0)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {getDisplayName(user)}
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    {t('profile.subtitle')}
                                </p>
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
                                    {t('profile.basic_info')}
                                </CardTitle>
                                <CardDescription>
                                    {t('profile.basic_info_description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.name')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {user.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.nickname')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                        <User className="h-4 w-4" />
                                        <span>
                                            {user.nickname ||
                                                t('profile.not_set')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.id_number')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                                        <IdCard className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {user.id_number ||
                                                t('profile.not_set')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.student_id')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                        <Award className="h-4 w-4" />
                                        <span>
                                            {user.student_id ||
                                                t('profile.not_set')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('shop.phone_number')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                        <Phone className="h-4 w-4" />
                                        <span>
                                            {user.phone || t('profile.not_set')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.email')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                        {user.email_verified_at ? (
                                            <Badge
                                                variant="success"
                                                className="ml-auto"
                                            >
                                                {t('profile.verified')}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="warning"
                                                className="ml-auto"
                                            >
                                                {t('profile.unverified')}
                                            </Badge>
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
                                    {t('profile.roles_and_grade')}
                                </CardTitle>
                                <CardDescription>
                                    {t('profile.roles_and_grade_description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.role')}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles.map((role) => (
                                            <Badge
                                                key={role.id}
                                                variant="secondary"
                                            >
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {user.is_head_teacher && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {t('profile.position')}
                                        </label>
                                        <div className="rounded-md border border-info/20 bg-info-soft p-2">
                                            <span className="text-info-foreground">
                                                {t('profile.head_teacher')}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.grade')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                        <UserIcon className="h-4 w-4" />
                                        <span>
                                            {user.grade || t('profile.not_set')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.class')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                        <User className="h-4 w-4" />
                                        <span>
                                            {user.class || t('profile.not_set')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        {t('profile.registered_at')}
                                    </label>
                                    <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {formatDate(user.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {user.last_login_at && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            {t('profile.last_login')}
                                        </label>
                                        <div className="flex items-center gap-2 rounded-md border bg-background p-2">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {formatDate(user.last_login_at)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end">
                        <Button asChild>
                            <Link href="/settings/profile">
                                {t('profile.edit_account_info')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
