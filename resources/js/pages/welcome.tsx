import { Head, Link, usePage } from '@inertiajs/react';
import {
    Coins,
    Trophy,
    Package,
    Users,
    TrendingUp,
    ArrowRight,
    TrendingDown,
    Award,
    School,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import { dashboard, login, register, ranking } from '@/routes';
import type { SharedData } from '@/types';

interface UserStats {
    id: number;
    name: string;
    nickname: string | null;
    student_id: string | null;
    total_points: number;
    redeemable_points: number;
    today_change: number;
    school_rank: number;
    class_rank: number | null;
    class_name: string | null;
    grade_name: string | null;
    class_points: number | null;
}

interface WelcomeProps {
    canRegister: boolean;
    userStats?: UserStats | null;
}

export default function Welcome({ canRegister, userStats }: WelcomeProps) {
    const { auth, footerSettings } = usePage<SharedData>().props;
    const user = auth.user;

    const siteName = t('common.app_name');
    const copyright =
        footerSettings?.copyright ||
        `© ${new Date().getFullYear()} ${siteName}`;
    const icp = footerSettings?.icp;
    const police = footerSettings?.police;

    const localStats = userStats;

    return (
        <PublicLayout>
            <Head title={siteName} />

            <div className="min-h-screen bg-background">
                {/* User Stats Section - Only show for logged in users */}
                {localStats ? (
                    <div className="container px-4 py-8">
                        <div className="mx-auto max-w-6xl">
                            {/* Welcome Message */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                    {t('welcome.greeting', {
                                        name:
                                            localStats.nickname ||
                                            localStats.name,
                                    })}
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    {t('welcome.subtitle')}
                                </p>
                            </div>

                            {/* Stats Cards Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {/* Total Points Card */}
                                <Card className="border-warning/20 bg-warning-soft/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-warning-foreground">
                                            <Coins className="h-4 w-4" />
                                            {t('points.total_points')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-warning-foreground">
                                            {formatNumber(
                                                localStats.total_points,
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-warning-foreground/70">
                                            {t('welcome.redeemable')}:{' '}
                                            {formatNumber(
                                                localStats.redeemable_points,
                                            )}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Today's Change Card */}
                                <Card
                                    className={
                                        localStats.today_change >= 0
                                            ? 'border-success/20 bg-success-soft/60'
                                            : 'border-destructive/20 bg-destructive/5'
                                    }
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle
                                            className={`flex items-center gap-2 text-sm font-medium ${localStats.today_change >= 0 ? 'text-success-foreground' : 'text-destructive'}`}
                                        >
                                            {localStats.today_change >= 0 ? (
                                                <TrendingUp className="h-4 w-4" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4" />
                                            )}
                                            {t('welcome.today_change')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className={`text-3xl font-bold ${localStats.today_change >= 0 ? 'text-success-foreground' : 'text-destructive'}`}
                                        >
                                            {localStats.today_change >= 0
                                                ? '+'
                                                : ''}
                                            {formatNumber(
                                                localStats.today_change,
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t('welcome.points_change')}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* School Rank Card */}
                                <Card className="border-info/20 bg-info-soft/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-info-foreground">
                                            <Trophy className="h-4 w-4" />
                                            {t('welcome.school_rank')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-info-foreground">
                                            #{localStats.school_rank}
                                        </div>
                                        <p className="mt-1 text-xs text-info-foreground/70">
                                            {t('welcome.all_students')}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Class Rank Card */}
                                <Card className="border-border bg-muted">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-primary">
                                            <Award className="h-4 w-4" />
                                            {t('welcome.class_rank')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-primary">
                                            {localStats.class_rank
                                                ? `#${localStats.class_rank}`
                                                : '-'}
                                        </div>
                                        <p className="mt-1 text-xs text-primary/70">
                                            {localStats.class_name ||
                                                t('welcome.no_class')}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-border bg-muted">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-success">
                                            <Users className="h-4 w-4" />
                                            {t('welcome.class_points')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-success">
                                            {localStats.class_points !== null
                                                ? formatNumber(
                                                      localStats.class_points,
                                                  )
                                                : '--'}
                                        </div>
                                        <p className="mt-1 text-xs text-success/70">
                                            {localStats.class_name ||
                                                t('welcome.no_class')}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Class Info Card */}
                                <Card className="border-border bg-muted">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-info">
                                            <School className="h-4 w-4" />
                                            {t('welcome.my_class')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-info">
                                            {localStats.grade_name ||
                                                t('welcome.not_assigned')}
                                        </div>
                                        <p className="mt-1 text-xs text-info/70">
                                            {localStats.class_name
                                                ? t(
                                                      'welcome.class_name_format',
                                                      {
                                                          name: localStats.class_name,
                                                      },
                                                  )
                                                : t(
                                                      'welcome.complete_class_info',
                                                  )}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Button asChild size="lg">
                                    <Link href={dashboard()}>
                                        {t('welcome.enter_dashboard')}
                                        <ArrowRight className="size-5" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href={ranking()}>
                                        {t('welcome.view_ranking')}
                                        <Trophy className="size-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Hero Section - Only show for logged out users */
                    <div className="container px-4 py-20">
                        <div className="mx-auto max-w-4xl text-center">
                            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                                {t('common.app_name')}
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
                                {t('welcome.hero_description')}
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Button asChild size="lg">
                                    <Link href={login()}>
                                        {t('welcome.login_now')}
                                    </Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild size="lg" variant="outline">
                                        <Link href={register()}>
                                            {t('welcome.register_account')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Section - Show for everyone or adjust based on login status */}
                <div className="container px-4 py-16">
                    <div className="mx-auto max-w-6xl">
                        <h2 className="mb-12 text-center text-3xl font-bold">
                            {t('welcome.features_title')}
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <Coins className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>
                                        {t('welcome.feature_points_management')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'welcome.feature_points_management_desc',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Trophy className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>
                                        {t('welcome.feature_ranking')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('welcome.feature_ranking_desc')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Package className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>
                                        {t('welcome.feature_shop')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('welcome.feature_shop_desc')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Users className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>
                                        {t('welcome.feature_roles')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('welcome.feature_roles_desc')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>
                                        {t('welcome.feature_analytics')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('welcome.feature_analytics_desc')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Users className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>
                                        {t('nav.parent_center')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('welcome.feature_parent_desc')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* CTA Section - Only show for logged out users */}
                {!user && (
                    <div className="container px-4 py-16">
                        <div className="mx-auto max-w-4xl">
                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-center text-2xl">
                                        {t('welcome.cta_title')}
                                    </CardTitle>
                                    <CardDescription className="text-center text-base">
                                        {t('welcome.cta_description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    {canRegister && (
                                        <Button asChild size="lg">
                                            <Link href={register()}>
                                                {t('welcome.register_free')}
                                                <ArrowRight className="size-5" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="container px-4 py-8">
                    <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
                        <p>{copyright}</p>
                        {icp && <p className="mt-1">{icp}</p>}
                        {police && <p className="mt-1">{police}</p>}
                        <p className="mt-1">{t('welcome.built_with')}</p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
