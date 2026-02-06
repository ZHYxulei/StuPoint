import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

export default function InstallCache() {
    return (
        <>
            <Head title="缓存配置 - 安装向导">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>缓存配置 (5/7)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action="/install/cache" method="POST" className="space-y-4">
                                <input type="hidden" name="_token" value={window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        缓存驱动
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <input type="radio" name="driver" value="file" defaultChecked className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">文件缓存</div>
                                                <div className="text-xs text-gray-500">使用文件系统存储缓存数据，简单易用</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <input type="radio" name="driver" value="database" className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">数据库缓存</div>
                                                <div className="text-xs text-gray-500">使用数据库存储缓存数据</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <input type="radio" name="driver" value="redis" className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">Redis缓存</div>
                                                <div className="text-xs text-gray-500">高性能缓存服务，需要配置Redis</div>
                                            </div>
                                        </label>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">会话存储将使用文件驱动，队列使用数据库</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a href="/install/redis" className="flex-1">
                                        <Button variant="outline" className="w-full" type="button">返回</Button>
                                    </a>
                                    <Button type="submit" className="flex-1">
                                        下一步 <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
