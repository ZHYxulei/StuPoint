import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

export default function InstallWelcome() {
    return (
        <>
            <Head title="安装向导 - 学生积分管理系统">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-12">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4">
                                <Rocket className="h-8 w-8" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                学生积分管理系统
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                欢迎使用安装向导
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                                <span className="text-gray-700 dark:text-gray-300">语言选择</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                                <span className="text-gray-700 dark:text-gray-300">PHP环境检测</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                                <span className="text-gray-700 dark:text-gray-300">数据库配置</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</div>
                                <span className="text-gray-700 dark:text-gray-300">Redis配置（可选）</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">5</div>
                                <span className="text-gray-700 dark:text-gray-300">缓存配置</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">6</div>
                                <span className="text-gray-700 dark:text-gray-300">站点配置</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">7</div>
                                <span className="text-gray-700 dark:text-gray-300">创建管理员</span>
                            </div>
                        </div>

                        <a href="/install/language" className="block">
                            <Button className="w-full" size="lg">开始安装</Button>
                        </a>
                    </Card>
                </div>
            </div>
        </>
    );
}
