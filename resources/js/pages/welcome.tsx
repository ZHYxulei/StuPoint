import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register, ranking } from '@/routes';
import type { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicNavbar from '@/components/public-navbar';
import { Coins, Trophy, Package, Users, TrendingUp, ArrowRight, TrendingDown, Award, School } from 'lucide-react';
import { useState } from 'react';

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
}

interface WelcomeProps {
    canRegister: boolean;
    userStats?: UserStats | null;
}

export default function Welcome({ canRegister, userStats }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const user = auth.user;

    // Convert userStats to local state for reactivity if available
    const localStats = userStats;

    return (
        <>
            <Head title="学生积分管理系统" />
            <PublicNavbar showMobileMenu={showMobileMenu} onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* User Stats Section - Only show for logged in users */}
                {localStats ? (
                    <div className="container py-8 px-4">
                        <div className="max-w-6xl mx-auto">
                            {/* Welcome Message */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    欢迎回来，{localStats.nickname || localStats.name}！
                                </h1>
                                <p className="text-muted-foreground mt-1">查看你的积分统计和排名</p>
                            </div>

                            {/* Stats Cards Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {/* Total Points Card */}
                                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                            <Coins className="h-4 w-4" />
                                            总积分
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                            {localStats.total_points.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                                            可兑换: {localStats.redeemable_points.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Today's Change Card */}
                                <Card className={`bg-gradient-to-br ${localStats.today_change >= 0 ? 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800' : 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800'} `}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className={`text-sm font-medium flex items-center gap-2 ${localStats.today_change >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                            {localStats.today_change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                            今日变化
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-3xl font-bold ${localStats.today_change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {localStats.today_change >= 0 ? '+' : ''}{localStats.today_change.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            积分变动
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* School Rank Card */}
                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                            <Trophy className="h-4 w-4" />
                                            全校排名
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            #{localStats.school_rank}
                                        </div>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                                            全校学生
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Class Rank Card */}
                                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                                            <Award className="h-4 w-4" />
                                            班级排名
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            {localStats.class_rank ? `#${localStats.class_rank}` : '-'}
                                        </div>
                                        <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                                            {localStats.class_name || '未分配班级'}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Class Info Card */}
                                <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 border-cyan-200 dark:border-cyan-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                                            <School className="h-4 w-4" />
                                            所属班级
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                                            {localStats.grade_name || '未分配'}
                                        </div>
                                        <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1">
                                            {localStats.class_name ? `${localStats.class_name}班` : '请完善班级信息'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <Link href={dashboard()}>
                                    <Button size="lg">
                                        进入仪表盘
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href={ranking()}>
                                    <Button size="lg" variant="outline">
                                        查看排行榜
                                        <Trophy className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Hero Section - Only show for logged out users */
                    <div className="container py-20 px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl mb-6">
                                学生积分管理系统
                            </h1>
                            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                                通过积分激励学习，记录每一次进步。支持学生、教师、家长多角色管理，
                                让教育更有趣。
                            </p>

                            <div className="mt-8 flex items-center justify-center gap-4">
                                <Link href={login()}>
                                    <Button size="lg">
                                        立即登录
                                    </Button>
                                </Link>
                                {canRegister && (
                                    <Link href={register()}>
                                        <Button size="lg" variant="outline">
                                            注册账户
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Section - Show for everyone or adjust based on login status */}
                <div className="container py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">功能特色</h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <Coins className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>积分管理</CardTitle>
                                    <CardDescription>
                                        完整的积分系统，支持总积分和可兑换积分，记录每次积分变动
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Trophy className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>积分排行</CardTitle>
                                    <CardDescription>
                                        实时积分排行榜，支持全校、年级、班级多种排名方式
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Package className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>积分商城</CardTitle>
                                    <CardDescription>
                                        使用积分兑换奖品，激励学生积极参与学习和活动
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Users className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>角色权限</CardTitle>
                                    <CardDescription>
                                        支持学生、教师、家长、管理员等多种角色，权限分级管理
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <TrendingUp className="h-10 w-10 text-primary mb-2" />
                                    <CardTitle>数据统计</CardTitle>
                                    <CardDescription>
                                        详细的积分统计和图表分析，帮助教师了解学生学习情况
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Users className="h-10 w-10 text-primary mb-2" />
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
                    <div className="container py-16 px-4">
                        <div className="max-w-4xl mx-auto">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-center">开始使用积分系统</CardTitle>
                                    <CardDescription className="text-center text-base">
                                        注册账户，开启积分学习之旅
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    {canRegister && (
                                        <Link href={register()}>
                                            <Button size="lg">
                                                免费注册
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="container py-8 px-4">
                    <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
                        <p>© {new Date().getFullYear()} 学生积分管理系统</p>
                        <p className="mt-1">基于 Laravel + React 构建</p>
                    </div>
                </div>
            </div>
        </>
    );
}