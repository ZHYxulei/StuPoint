import { Head } from '@inertiajs/react';
import { Check, X, AlertTriangle, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';

interface Requirement {
    name: string;
    required: boolean;
    condition: string;
    status: 'pass' | 'fail' | 'checking';
    current?: string;
}

interface PageProps {
    locale?: string;
    requirements?: Requirement[];
}

export default function InstallCheck({ locale = 'zh' }: PageProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkRequirements = async () => {
            try {
                const response = await fetch('/install/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            window.document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ locale }),
                });
                const data = await response.json();
                setRequirements(data.requirements || []);
            } catch (error) {
                console.error('Failed to check requirements:', error);
            } finally {
                setIsChecking(false);
            }
        };
        checkRequirements();
    }, []);

    const requiredRequirements = requirements.filter((r) => r.required);
    const requiredPassed =
        requiredRequirements.length > 0 &&
        requiredRequirements.every((r) => r.status === 'pass');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass':
                return <Check className="h-5 w-5 text-success" />;
            case 'fail':
                return <X className="h-5 w-5 text-destructive" />;
            case 'checking':
                return (
                    <AlertTriangle className="h-5 w-5 animate-spin text-info" />
                );
            default:
                return <AlertTriangle className="h-5 w-5 text-warning" />;
        }
    };

    return (
        <>
            <Head title={t('install.check.head_title')}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>{t('install.check.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isChecking ? (
                                <div className="py-12 text-center">
                                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 animate-spin text-info" />
                                    <p className="text-muted-foreground">
                                        {t('install.check.checking')}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {requirements.map((req, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center gap-3 rounded-lg border p-3 ${
                                                    req.status === 'fail'
                                                        ? 'border-destructive/30 bg-destructive/10'
                                                        : 'bg-card'
                                                }`}
                                            >
                                                {getStatusIcon(req.status)}
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">
                                                        {req.name}
                                                        {req.required && (
                                                            <span className="ml-1 text-destructive">
                                                                *
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {req.condition}
                                                    </p>
                                                    {req.current && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {req.current}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {requiredPassed ? (
                                        <div className="mt-6 rounded-lg border border-success/30 bg-success-soft p-4">
                                            <p className="flex items-center gap-2 text-sm text-success">
                                                <Check className="h-4 w-4" />
                                                {t('install.check.all_passed')}
                                            </p>
                                        </div>
                                    ) : (
                                        requiredRequirements.some(
                                            (r) => r.status === 'fail',
                                        ) && (
                                            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                                                <p className="flex items-center gap-2 text-sm text-destructive">
                                                    <X className="h-4 w-4" />
                                                    {t(
                                                        'install.check.some_failed',
                                                    )}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex gap-4">
                        <a href="/install/language" className="flex-1">
                            <Button
                                variant="outline"
                                className="w-full"
                                type="button"
                            >
                                {t('common.back')}
                            </Button>
                        </a>
                        {requiredPassed && (
                            <a href="/install/database" className="flex-1">
                                <Button className="w-full" type="button">
                                    {t('install.next')}{' '}
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
