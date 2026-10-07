import { Head } from '@inertiajs/react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function InstallWelcome() {
    return (
        <>
            <Head title="安装向导 - 学生积分管理系统">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-2xl">
                    <Card className="p-12">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <Rocket className="h-8 w-8" />
                            </div>
                            <h1 className="mb-2 text-4xl font-bold text-foreground dark:text-white">
                                学生积分管理系统
                            </h1>
                            <p className="text-muted-foreground">
                                欢迎使用安装向导
                            </p>
                        </div>

                        <div className="mb-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    1
                                </div>
                                <span className="text-foreground">
                                    语言选择
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    2
                                </div>
                                <span className="text-foreground">
                                    PHP环境检测
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    3
                                </div>
                                <span className="text-foreground">
                                    数据库配置
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    4
                                </div>
                                <span className="text-foreground">
                                    Redis配置（可选）
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    5
                                </div>
                                <span className="text-foreground">
                                    缓存配置
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    6
                                </div>
                                <span className="text-foreground">
                                    站点配置
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    7
                                </div>
                                <span className="text-foreground">
                                    创建管理员
                                </span>
                            </div>
                        </div>

                        <a href="/install/language" className="block">
                            <Button className="w-full" size="lg">
                                开始安装
                            </Button>
                        </a>
                    </Card>
                </div>
            </div>
        </>
    );
}
