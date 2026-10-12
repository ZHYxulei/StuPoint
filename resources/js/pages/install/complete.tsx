import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

export default function InstallComplete() {
    return (
        <>
            <Head title={t('install.complete.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>

            <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6">
                <div className="w-full max-w-lg">
                    <div className="bg-card shadow-lg">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-soft">
                                <CheckCircle2 className="h-10 w-10 text-success" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {t('install.complete.title')}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {t('install.complete.subtitle')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-md bg-success-soft p-4">
                                <h3 className="font-semibold text-success-foreground">
                                    {t('install.complete.next_steps')}
                                </h3>
                                <ul className="mt-2 space-y-2 text-sm text-success">
                                    <li>
                                        • {t('install.complete.step_login')}
                                    </li>
                                    <li>
                                        • {t('install.complete.step_roles')}
                                    </li>
                                    <li>
                                        • {t('install.complete.step_points')}
                                    </li>
                                    <li>
                                        • {t('install.complete.step_users')}
                                    </li>
                                    <li>
                                        • {t('install.complete.step_plugins')}
                                    </li>
                                </ul>
                            </div>

                            <Button asChild className="w-full" size="lg">
                                <Link href="/" className="block">
                                    {t('install.complete.go_home')}
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-6 text-center text-xs text-muted-foreground">
                            {t('install.complete.thanks')}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
