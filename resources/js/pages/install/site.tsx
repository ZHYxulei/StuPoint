import { Head, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';

interface InstallSiteProps {
    form: {
        app_name: string;
        app_url: string;
        locale: 'zh-CN' | 'en';
        class_points_mode: 'avg' | 'sum' | 'separate';
    };
}

interface SharedPageProps {
    errors: Record<string, string>;
    old: {
        install?: Record<string, string>;
    };
    [key: string]: unknown;
}

export default function InstallSite({ form }: InstallSiteProps) {
    const { errors, old } = usePage<SharedPageProps>().props;
    const installOld = old.install ?? {};
    const appName = installOld.app_name ?? form.app_name;
    const appUrl = installOld.app_url ?? form.app_url;
    const locale =
        (installOld.locale as InstallSiteProps['form']['locale'] | undefined) ??
        form.locale;
    const classPointsMode =
        (installOld.class_points_mode as
            InstallSiteProps['form']['class_points_mode'] | undefined) ??
        form.class_points_mode;

    return (
        <>
            <Head title={t('install.site.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>{t('install.site.title')}</CardTitle>
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
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.site.app_name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="app_name"
                                        defaultValue={appName}
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <InputError
                                        message={errors.app_name}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.site.app_url')}
                                    </label>
                                    <input
                                        type="url"
                                        name="app_url"
                                        defaultValue={appUrl}
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t('install.site.app_url_hint')}
                                    </p>
                                    <InputError
                                        message={errors.app_url}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.site.locale')}
                                    </label>
                                    <select
                                        name="locale"
                                        defaultValue={locale}
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                    >
                                        <option value="zh-CN">
                                            {t('install.site.locale_zh')}
                                        </option>
                                        <option value="en">
                                            {t('install.site.locale_en')}
                                        </option>
                                    </select>
                                    <InputError
                                        message={errors.locale}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.site.class_points_mode')}
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-2 text-sm text-foreground">
                                            <input
                                                type="radio"
                                                name="class_points_mode"
                                                value="avg"
                                                defaultChecked={
                                                    classPointsMode === 'avg'
                                                }
                                                className="mt-1"
                                            />
                                            <span>
                                                {t('install.site.mode_avg')}
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    {t(
                                                        'install.site.mode_avg_desc',
                                                    )}
                                                </span>
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-2 text-sm text-foreground">
                                            <input
                                                type="radio"
                                                name="class_points_mode"
                                                value="sum"
                                                defaultChecked={
                                                    classPointsMode === 'sum'
                                                }
                                                className="mt-1"
                                            />
                                            <span>
                                                {t('install.site.mode_sum')}
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    {t(
                                                        'install.site.mode_sum_desc',
                                                    )}
                                                </span>
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-2 text-sm text-foreground">
                                            <input
                                                type="radio"
                                                name="class_points_mode"
                                                value="separate"
                                                defaultChecked={
                                                    classPointsMode ===
                                                    'separate'
                                                }
                                                className="mt-1"
                                            />
                                            <span>
                                                {t(
                                                    'install.site.mode_separate',
                                                )}
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    {t(
                                                        'install.site.mode_separate_desc',
                                                    )}
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {t(
                                            'install.site.class_points_mode_note',
                                        )}
                                    </p>
                                    <InputError
                                        message={errors.class_points_mode}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a href="/install/cache" className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                        >
                                            {t('common.back')}
                                        </Button>
                                    </a>
                                    <Button type="submit" className="flex-1">
                                        {t('install.next')}{' '}
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
