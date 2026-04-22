import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { ChevronRight } from 'lucide-react';

interface InstallSiteProps {
    form: {
        app_name: string;
        app_url: string;
        locale: 'zh' | 'en' | 'ja';
        class_points_mode: 'avg' | 'sum' | 'separate';
    };
}

interface SharedPageProps {
    errors: Record<string, string>;
    old: {
        install?: Record<string, string>;
    };
}

export default function InstallSite({ form }: InstallSiteProps) {
    const { errors, old } = usePage<SharedPageProps>().props;
    const installOld = old.install ?? {};
    const appName = installOld.app_name ?? form.app_name;
    const appUrl = installOld.app_url ?? form.app_url;
    const locale = (installOld.locale as InstallSiteProps['form']['locale'] | undefined) ?? form.locale;
    const classPointsMode = (installOld.class_points_mode as InstallSiteProps['form']['class_points_mode'] | undefined) ?? form.class_points_mode;

    return (
        <>
            <Head title="站点配置 - 安装向导">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>站点配置 (6/7)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                action="/install/site"
                                method="POST"
                                className="space-y-4"
                            >
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={
                                        window.document
                                            .querySelector(
                                                'meta[name="csrf-token"]',
                                            )
                                            ?.getAttribute('content') || ''
                                    }
                                />
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        站点名称
                                    </label>
                                    <input
                                        type="text"
                                        name="app_name"
                                        defaultValue={appName}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    <InputError message={errors.app_name} className="mt-2" />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        站点URL
                                    </label>
                                    <input
                                        type="url"
                                        name="app_url"
                                        defaultValue={appUrl}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        请输入完整的访问地址，例如：http://your-domain.com
                                    </p>
                                    <InputError message={errors.app_url} className="mt-2" />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        默认语言
                                    </label>
                                    <select
                                        name="locale"
                                        defaultValue={locale}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="zh">简体中文</option>
                                        <option value="en">English</option>
                                        <option value="ja">日本語</option>
                                    </select>
                                    <InputError message={errors.locale} className="mt-2" />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        班级积分计算方式
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <input
                                                type="radio"
                                                name="class_points_mode"
                                                value="avg"
                                                defaultChecked={classPointsMode === 'avg'}
                                                className="mt-1"
                                            />
                                            <span>
                                                学生总分平均值
                                                <span className="mt-1 block text-xs text-gray-500">
                                                    班级积分 =
                                                    同班学生总积分平均值
                                                </span>
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <input
                                                type="radio"
                                                name="class_points_mode"
                                                value="sum"
                                                defaultChecked={classPointsMode === 'sum'}
                                                className="mt-1"
                                            />
                                            <span>
                                                学生总分累加
                                                <span className="mt-1 block text-xs text-gray-500">
                                                    班级积分 =
                                                    同班学生总积分之和
                                                </span>
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <input
                                                type="radio"
                                                name="class_points_mode"
                                                value="separate"
                                                defaultChecked={classPointsMode === 'separate'}
                                                className="mt-1"
                                            />
                                            <span>
                                                独立班级积分
                                                <span className="mt-1 block text-xs text-gray-500">
                                                    班级积分单独计算，不依赖学生积分
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        该设置安装完成后不可修改
                                    </p>
                                    <InputError message={errors.class_points_mode} className="mt-2" />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a href="/install/cache" className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                        >
                                            返回
                                        </Button>
                                    </a>
                                    <Button type="submit" className="flex-1">
                                        下一步{' '}
                                        <ChevronRight className="ml-2 h-4 w-4" />
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
