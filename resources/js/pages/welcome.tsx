import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register, ranking } from '@/routes';
import type { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
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

    const siteName = '学生积分管理系统';
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
                                    欢迎回来，
                                    {localStats.nickname || localStats.name}！
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    查看你的积分统计和排名
                                </p>
                            </div>

                            {/* Stats Cards Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {/* Total Points Card */}
                                <Card className="border-warning/20 bg-warning-soft/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-warning-foreground">
                                            <Coins className="h-4 w-4" />
                                            总积分
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-warning-foreground">
                                            {localStats.total_points.toLocaleString()}
                                        </div>
                                        <p className="mt-1 text-xs text-warning-foreground/70">
                                            可兑换:{' '}
                                            {localStats.redeemable_points.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Today's Change Card */}
                                <Card
                                    className={localStats.today_change >= 0
                                        ? 'border-success/20 bg-success-soft/60'
                                        : 'border-destructive/20 bg-destructive/5'}
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
                                            今日变化
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className={`text-3xl font-bold ${localStats.today_change >= 0 ? 'text-success-foreground' : 'text-destructive'}`}
                                        >
                                            {localStats.today_change >= 0
                                                ? '+'
                                                : ''}
                                            {localStats.today_change.toLocaleString()}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            积分变动
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* School Rank Card */}
                                <Card className="border-info/20 bg-info-soft/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-info-foreground">
                                            <Trophy className="h-4 w-4" />
                                            全校排名
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-info-foreground">
                                            #{localStats.school_rank}
                                        </div>
                                        <p className="mt-1 text-xs text-info-foreground/70">
                                            全校学生
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Class Rank Card */}
                                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-800 dark:from-purple-950/30 dark:to-violet-950/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                                            <Award className="h-4 w-4" />
                                            班级排名
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            {localStats.class_rank
                                                ? `#${localStats.class_rank}`
                                                : '-'}
                                        </div>
                                        <p className="mt-1 text-xs text-purple-600/70 dark:text-purple-400/70">
                                            {localStats.class_name ||
                                                '未分配班级'}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 dark:border-teal-800 dark:from-teal-950/30 dark:to-emerald-950/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-300">
                                            <Users className="h-4 w-4" />
                                            当前班级积分
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                                            {localStats.class_points !== null
                                                ? localStats.class_points.toLocaleString()
                                                : '--'}
                                        </div>
                                        <p className="mt-1 text-xs text-teal-600/70 dark:text-teal-400/70">
                                            {localStats.class_name ||
                                                '未分配班级'}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Class Info Card */}
                                <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 dark:border-cyan-800 dark:from-cyan-950/30 dark:to-sky-950/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                                            <School className="h-4 w-4" />
                                            所属班级
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                                            {localStats.grade_name || '未分配'}
                                        </div>
                                        <p className="mt-1 text-xs text-cyan-600/70 dark:text-cyan-400/70">
                                            {localStats.class_name
                                                ? `${localStats.class_name}班`
                                                : '请完善班级信息'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Button asChild size="lg">
                                    <Link href={dashboard()}>
                                        进入仪表盘
                                        <ArrowRight className="size-5" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href={ranking()}>
                                        查看排行榜
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
                            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
                                学生积分管理系统
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
                                通过积分激励学习，记录每一次进步。支持学生、教师、家长多角色管理，
                                让教育更有趣。
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Button asChild size="lg">
                                    <Link href={login()}>立即登录</Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild size="lg" variant="outline">
                                        <Link href={register()}>注册账户</Link>
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
                            功能特色
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <Coins className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>积分管理</CardTitle>
                                    <CardDescription>
                                        完整的积分系统，支持总积分和可兑换积分，记录每次积分变动
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Trophy className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>积分排行</CardTitle>
                                    <CardDescription>
                                        实时积分排行榜，支持全校、年级、班级多种排名方式
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Package className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>积分商城</CardTitle>
                                    <CardDescription>
                                        使用积分兑换奖品，激励学生积极参与学习和活动
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Users className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>角色权限</CardTitle>
                                    <CardDescription>
                                        支持学生、教师、家长、管理员等多种角色，权限分级管理
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>数据统计</CardTitle>
                                    <CardDescription>
                                        详细的积分统计和图表分析，帮助教师了解学生学习情况
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Users className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>家长中心</CardTitle>
                                    <CardDescription>
                                        家长可绑定子女账户，实时查看孩子的积分和排名情况
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
                                        开始使用积分系统
                                    </CardTitle>
                                    <CardDescription className="text-center text-base">
                                        注册账户，开启积分学习之旅
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    {canRegister && (
                                        <Button asChild size="lg">
                                            <Link href={register()}>
                                                免费注册
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
                        <p className="mt-1">基于 Laravel + React 构建</p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
