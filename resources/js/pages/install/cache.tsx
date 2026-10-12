import { Head, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';

interface InstallCacheProps {
    form: {
        driver: 'file' | 'database' | 'redis';
    };
}

interface SharedPageProps {
    errors: Record<string, string>;
    old: {
        install?: Record<string, string>;
    };
    [key: string]: unknown;
}

export default function InstallCache({ form }: InstallCacheProps) {
    const { errors, old } = usePage<SharedPageProps>().props;
    const driver = old.install?.driver ?? form.driver;

    return (
        <>
            <Head title={t('install.cache.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>{t('install.cache.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                action="/install/cache"
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
                                    <label className="mb-3 block text-sm font-medium text-foreground">
                                        {t('install.cache.driver')}
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                                            <input
                                                type="radio"
                                                name="driver"
                                                value="file"
                                                defaultChecked={
                                                    driver === 'file'
                                                }
                                                className="h-4 w-4"
                                            />
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {t('install.cache.file')}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t(
                                                        'install.cache.file_desc',
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                                            <input
                                                type="radio"
                                                name="driver"
                                                value="database"
                                                defaultChecked={
                                                    driver === 'database'
                                                }
                                                className="h-4 w-4"
                                            />
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {t(
                                                        'install.cache.database',
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t(
                                                        'install.cache.database_desc',
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent">
                                            <input
                                                type="radio"
                                                name="driver"
                                                value="redis"
                                                defaultChecked={
                                                    driver === 'redis'
                                                }
                                                className="h-4 w-4"
                                            />
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {t('install.cache.redis')}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t(
                                                        'install.cache.redis_desc',
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {t('install.cache.note')}
                                    </p>
                                    <InputError
                                        message={errors.driver}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a href="/install/redis" className="flex-1">
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
