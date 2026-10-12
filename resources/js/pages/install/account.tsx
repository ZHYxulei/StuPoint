import { Head, useForm, usePage } from '@inertiajs/react';
import { User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';

interface InstallAccountProps {
    siteConfig: {
        app_name?: string;
    };
}

export default function InstallAccount({ siteConfig }: InstallAccountProps) {
    const { data, setData, post, processing, errors } = useForm({
        nickname: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const pageErrors = usePage().props.errors as Record<string, string>;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/install/account');
    };

    return (
        <>
            <Head title={t('install.account.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>{t('install.account.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.account.nickname')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={data.nickname}
                                            onChange={(e) =>
                                                setData(
                                                    'nickname',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-10 focus:ring-2 focus:ring-ring focus:outline-none"
                                            placeholder={t(
                                                'install.account.nickname_placeholder',
                                            )}
                                        />
                                    </div>
                                    <InputError
                                        message={errors.nickname}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.account.email')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-10 focus:ring-2 focus:ring-ring focus:outline-none"
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t('install.account.password')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-10 focus:ring-2 focus:ring-ring focus:outline-none"
                                            placeholder={t(
                                                'install.account.password_placeholder',
                                            )}
                                        />
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t(
                                            'install.account.password_confirmation',
                                        )}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-10 focus:ring-2 focus:ring-ring focus:outline-none"
                                            placeholder={t(
                                                'install.account.password_confirmation_placeholder',
                                            )}
                                        />
                                    </div>
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>

                                {pageErrors.install && (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                                        <p className="flex items-center text-sm text-destructive">
                                            <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                                            {pageErrors.install}
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-lg bg-info-soft p-4">
                                    <p className="text-sm text-info">
                                        <CheckCircle className="mr-1 inline h-4 w-4" />
                                        {t('install.account.info')}
                                    </p>
                                    {siteConfig.app_name && (
                                        <p className="mt-2 text-xs text-info">
                                            {t(
                                                'install.account.current_site_name',
                                                { name: siteConfig.app_name },
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a href="/install/site" className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                            disabled={processing}
                                        >
                                            {t('common.back')}
                                        </Button>
                                    </a>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? t('install.account.installing')
                                            : t('install.account.submit')}{' '}
                                        <CheckCircle className="ml-2 h-4 w-4" />
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
