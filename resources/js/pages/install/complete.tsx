import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function InstallComplete() {
    return (
        <>
            <Head title="安装完成 - 学生积分管理系统">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>

            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
                <div className="w-full max-w-lg">
                    <div className="bg-white p-8 shadow-lg rounded-lg dark:bg-gray-800">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                安装完成！
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                学生积分管理系统已准备就绪
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                                <h3 className="font-semibold text-green-900 dark:text-green-300">
                                    接下来您可以：
                                </h3>
                                <ul className="mt-2 space-y-2 text-sm text-green-700 dark:text-green-400">
                                    <li>• 使用管理员账号登录系统</li>
                                    <li>• 配置角色和权限</li>
                                    <li>• 设置积分规则和分类</li>
                                    <li>• 添加学生和教师</li>
                                    <li>• 安装插件以扩展功能</li>
                                </ul>
                            </div>

                            <Link
                                href="/"
                                className="block"
                            >
                                <Button className="w-full" size="lg">
                                    前往系统首页
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                            感谢使用学生积分管理系统！
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
