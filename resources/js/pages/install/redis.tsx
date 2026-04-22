import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ChevronRight } from 'lucide-react';

interface InstallRedisProps {
    form: {
        enabled: boolean;
        host: string;
        port: string;
        database: string;
        password: string;
    };
}

interface SharedPageProps {
    errors: Record<string, string>;
    old: {
        install?: Record<string, string>;
    };
}

export default function InstallRedis({ form }: InstallRedisProps) {
    const { errors, old } = usePage<SharedPageProps>().props;
    const installOld = old.install ?? {};
    const enabled = installOld.enabled !== undefined ? installOld.enabled === '1' : form.enabled;
    const host = installOld.host ?? form.host;
    const port = installOld.port ?? form.port;
    const database = installOld.database ?? form.database;
    const password = installOld.password ?? form.password;

    return (
        <>
            <Head title="Redis配置 - 安装向导">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>Redis配置 (4/7) - 可选</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action="/install/redis" method="POST" className="space-y-4">
                                <input type="hidden" name="_token" value={window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                                <input type="hidden" name="enabled" value="0" />
                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="enabled" value="1" defaultChecked={enabled} className="w-5 h-5 rounded border-gray-300" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">启用Redis缓存（推荐）</span>
                                    </label>
                                    <p className="mt-2 text-xs text-gray-500">Redis可以提供更好的缓存性能，如果您的服务器没有安装Redis，请保持未选中状态</p>
                                    <InputError message={errors.redis || errors.enabled} className="mt-2" />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="host">主机</Label>
                                        <input
                                            id="host"
                                            type="text"
                                            name="host"
                                            defaultValue={host}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <InputError message={errors.host} className="mt-2" />
                                    </div>
                                    <div>
                                        <Label htmlFor="port">端口</Label>
                                        <input
                                            id="port"
                                            type="text"
                                            name="port"
                                            defaultValue={port}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <InputError message={errors.port} className="mt-2" />
                                    </div>
                                    <div>
                                        <Label htmlFor="database">数据库 (0-15)</Label>
                                        <input
                                            id="database"
                                            type="number"
                                            name="database"
                                            min="0"
                                            max="15"
                                            defaultValue={database}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Redis支持0-15共16个数据库，默认使用0</p>
                                        <InputError message={errors.database} className="mt-2" />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">密码（可选）</Label>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            defaultValue={password}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a href="/install/database" className="flex-1">
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
