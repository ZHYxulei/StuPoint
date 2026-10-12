import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    CheckCircle,
    Info,
    Code,
    Server,
    GitCommitHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface AboutData {
    version: string;
    commitHash: string;
    commitDate: string;
    phpVersion: string;
    laravelVersion: string;
    schoolName: string;
    schoolLogo: string;
}

export default function AboutIndex({
    version,
    commitHash,
    commitDate,
    phpVersion,
    laravelVersion,
    schoolName,
    schoolLogo,
}: AboutData) {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('about.title'), href: '/about' },
    ];

    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState<{
        upToDate: boolean;
        message: string;
    } | null>(null);

    const handleCheckUpdate = () => {
        setChecking(true);
        setCheckResult(null);
        // Simulated check - replace with real API call later
        setTimeout(() => {
            setCheckResult({ upToDate: true, message: t('about.up_to_date') });
            setChecking(false);
        }, 1500);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('about.title')} />

            <div className="mx-auto max-w-2xl space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{t('about.heading')}</h1>
                </div>

                {/* Logo Section */}
                <Card className="overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-6 py-4">
                            {/* System Logo */}
                            <div className="flex w-36 justify-end">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg">
                                        <span className="text-2xl font-bold text-white">
                                            SP
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        StuPoint
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-16 w-px shrink-0 bg-border" />

                            {/* School Logo */}
                            <div className="flex w-28 justify-start">
                                <div className="flex flex-col items-center gap-2">
                                    {schoolLogo ? (
                                        <img
                                            src={schoolLogo}
                                            alt={schoolName}
                                            className="h-16 w-16 rounded-xl object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                                            <span className="text-2xl">🏫</span>
                                        </div>
                                    )}
                                    <span className="text-center text-sm leading-snug font-medium text-muted-foreground">
                                        {schoolName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Info */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between border-b border-border/50 py-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span className="text-sm">
                                    {t('about.version')}
                                </span>
                            </div>
                            <span className="font-mono font-semibold">
                                v{version}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border/50 py-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <GitCommitHorizontal className="h-4 w-4" />
                                <span className="text-sm">
                                    {t('about.commit_hash')}
                                </span>
                            </div>
                            <span className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                {commitHash}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border/50 py-2">
                            <span className="text-sm text-muted-foreground">
                                {t('about.commit_date')}
                            </span>
                            <span className="text-sm">{commitDate}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-border/50 py-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Code className="h-4 w-4" />
                                <span className="text-sm">
                                    {t('about.php_version')}
                                </span>
                            </div>
                            <span className="text-sm">{phpVersion}</span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Server className="h-4 w-4" />
                                <span className="text-sm">
                                    {t('about.laravel_version')}
                                </span>
                            </div>
                            <span className="text-sm">{laravelVersion}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Check Update */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">
                                    {t('about.check_update')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('about.check_update_description')}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleCheckUpdate}
                                disabled={checking}
                            >
                                {checking
                                    ? t('about.checking')
                                    : t('about.check_update')}
                            </Button>
                        </div>

                        {checkResult && (
                            <div
                                className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                                    checkResult.upToDate
                                        ? 'bg-success-soft text-success'
                                        : 'bg-warning-soft text-yellow-700 dark:text-yellow-300'
                                }`}
                            >
                                <CheckCircle className="h-4 w-4" />
                                {checkResult.message}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <a
                                href="https://github.com/ZHYxulei/StuPoint"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 transition-colors hover:text-foreground"
                            >
                                <ExternalLink className="h-3 w-3" />
                                GitHub
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
