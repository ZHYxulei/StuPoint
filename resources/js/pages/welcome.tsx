import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicNavbar from '@/components/public-navbar';
import { Coins, Trophy, Package, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const user = auth.user;

    return (
        <>
            <Head title="学生积分管理系统" />
            <PublicNavbar showMobileMenu={showMobileMenu} onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Hero Section */}
                <div className="container py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl mb-6">
                            学生积分管理系统
                        </h1>
                        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                            通过积分激励学习，记录每一次进步。支持学生、教师、家长多角色管理，
                            让教育更有趣。
                        </p>

                        {!user && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <Link href={login()}>
                                    <Button size="lg">
                                        立即登录
                                    </Button>
                                </Link>
                                <Link href={register()}>
                                    <Button size="lg" variant="outline">
                                        注册账户
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {user && (
                            <div className="mt-8">
                                <Link href={dashboard()}>
                                    <Button size="lg">
                                        进入仪表盘
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features */}
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

                {/* CTA Section */}
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
                                    <Link href={register()}>
                                        <Button size="lg">
                                            免费注册
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
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


