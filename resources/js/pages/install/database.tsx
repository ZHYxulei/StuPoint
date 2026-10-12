import { Head, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';

interface InstallDatabaseProps {
    form: {
        connection: 'sqlite' | 'mysql' | 'pgsql';
        host: string;
        port: string;
        username: string;
        password: string;
        database: string;
    };
}

interface SharedPageProps {
    errors: Record<string, string>;
    old: {
        install?: Record<string, string>;
    };
    [key: string]: unknown;
}

export default function InstallDatabase({ form }: InstallDatabaseProps) {
    const { errors, old } = usePage<SharedPageProps>().props;
    const installOld = old.install ?? {};
    const initialConnection =
        (installOld.connection as
            InstallDatabaseProps['form']['connection'] | undefined) ??
        form.connection;
    const host = installOld.host ?? form.host;
    const port = installOld.port ?? form.port;
    const username = installOld.username ?? form.username;
    const password = installOld.password ?? form.password;
    const database = installOld.database ?? form.database;
    const [connectionType, setConnectionType] = useState(initialConnection);

    return (
        <>
            <Head title={t('install.database.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>{t('install.database.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                action="/install/database"
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
                                        {t('install.database.connection_type')}
                                    </label>
                                    <select
                                        name="connection"
                                        value={connectionType}
                                        onChange={(e) =>
                                            setConnectionType(
                                                e.target
                                                    .value as InstallDatabaseProps['form']['connection'],
                                            )
                                        }
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                    >
                                        <option value="sqlite">
                                            {t(
                                                'install.database.sqlite_recommended',
                                            )}
                                        </option>
                                        <option value="mysql">MySQL</option>
                                        <option value="pgsql">
                                            PostgreSQL
                                        </option>
                                    </select>
                                    <InputError
                                        message={
                                            errors.connection || errors.database
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                {connectionType !== 'sqlite' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-foreground">
                                                {t('install.database.host')}
                                            </label>
                                            <input
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
                                            <label className="mb-2 block text-sm font-medium text-foreground">
                                                {t('install.database.port')}
                                            </label>
                                            <input
                                                type="text"
                                                name="port"
                                                defaultValue={
                                                    port ||
                                                    (connectionType === 'mysql'
                                                        ? '3306'
                                                        : '5432')
                                                }
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                            />
                                            <InputError
                                                message={errors.port}
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-foreground">
                                                {t('install.database.username')}
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                defaultValue={username}
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                            />
                                            <InputError
                                                message={errors.username}
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-foreground">
                                                {t('install.database.password')}
                                            </label>
                                            <input
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
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.database.database_name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="database"
                                        defaultValue={database}
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 focus:ring-2 focus:ring-ring focus:outline-none"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t('install.database.database_hint')}
                                    </p>
                                    <InputError
                                        message={errors.database}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a href="/install/check" className="flex-1">
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
