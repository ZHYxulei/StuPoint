import { Head } from '@inertiajs/react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/lib/i18n';

export default function InstallWelcome() {
    return (
        <>
            <Head title={t('install.welcome.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-12">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                <Rocket className="h-8 w-8" />
                            </div>
                            <h1 className="mb-2 text-4xl font-bold text-foreground">
                                {t('common.app_name')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('install.welcome.subtitle')}
                            </p>
                        </div>

                        <div className="mb-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    1
                                </div>
                                <span className="text-foreground">
                                    {t('install.welcome.step_language')}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    2
                                </div>
                                <span className="text-foreground">
                                    {t('install.welcome.step_environment')}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    3
                                </div>
                                <span className="text-foreground">
                                    {t('install.welcome.step_database')}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    4
                                </div>
                                <span className="text-foreground">
                                    {t('install.welcome.step_redis')}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    5
                                </div>
                                <span className="text-foreground">
                                    {t('install.welcome.step_cache')}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    6
                                </div>
                                <span className="text-foreground">
                                    {t('install.welcome.step_site')}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                                    7
                                </div>
                                <span className="text-foreground">
                                    {t('install.welcome.step_account')}
                                </span>
                            </div>
                        </div>

                        <a href="/install/language" className="block">
                            <Button className="w-full" size="lg">
                                {t('install.welcome.start')}
                            </Button>
                        </a>
                    </Card>
                </div>
            </div>
        </>
    );
}
