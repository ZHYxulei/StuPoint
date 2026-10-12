import { Head, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';

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
    [key: string]: unknown;
}

export default function InstallRedis({ form }: InstallRedisProps) {
    const { errors, old } = usePage<SharedPageProps>().props;
    const installOld = old.install ?? {};
    const enabled =
        installOld.enabled !== undefined
            ? installOld.enabled === '1'
            : form.enabled;
    const host = installOld.host ?? form.host;
    const port = installOld.port ?? form.port;
    const database = installOld.database ?? form.database;
    const password = installOld.password ?? form.password;

    return (
        <>
            <Head title={t('install.redis.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>{t('install.redis.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                action="/install/redis"
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
                                <input type="hidden" name="enabled" value="0" />
                                <div>
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="enabled"
                                            value="1"
                                            defaultChecked={enabled}
                                            className="h-5 w-5 rounded border-border"
                                        />
                                        <span className="text-sm font-medium text-foreground">
                                            {t('install.redis.enable')}
                                        </span>
                                    </label>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {t('install.redis.enable_hint')}
                                    </p>
                                    <InputError
                                        message={errors.redis || errors.enabled}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="host">
                                            {t('install.redis.host')}
                                        </Label>
                                        <input
                                            id="host"
                                            type="text"
                                            name="host"
                                            defaultValue={host}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                        />
                                        <InputError
                                            message={errors.host}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="port">
                                            {t('install.redis.port')}
                                        </Label>
                                        <input
                                            id="port"
                                            type="text"
                                            name="port"
                                            defaultValue={port}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                        />
                                        <InputError
                                            message={errors.port}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="database">
                                            {t('install.redis.database')}
                                        </Label>
                                        <input
                                            id="database"
                                            type="number"
                                            name="database"
                                            min="0"
                                            max="15"
                                            defaultValue={database}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t('install.redis.database_hint')}
                                        </p>
                                        <InputError
                                            message={errors.database}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">
                                            {t('install.redis.password')}
                                        </Label>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            defaultValue={password}
                                            className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a
                                        href="/install/database"
                                        className="flex-1"
                                    >
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
