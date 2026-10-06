import { Head } from '@inertiajs/react';
import { Check, X, AlertTriangle, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

    const texts = {
        zh: {
            title: '环境检测',
            description: '检查您的服务器是否满足系统要求',
            checking: '检测中...',
            next: '下一步',
            requirements: '系统要求',
            all_passed: '所有必选要求已满足，可以继续安装',
            some_failed: '您的服务器不满足必选要求，请解决后继续',
        },
        en: {
            title: 'Environment Check',
            description: 'Check if your server meets the system requirements',
            checking: 'Checking...',
            next: 'Next',
            requirements: 'System Requirements',
            all_passed: 'All required requirements met, you can continue',
            some_failed: 'Your server does not meet all required requirements',
        },
        ja: {
            title: '環境チェック',
            description: 'サーバーーがシステム要件を満たしているか確認',
            checking: 'チェック中...',
            next: '次へ',
            requirements: 'システム要件',
            all_passed: '必須要件を満たしています',
            some_failed: 'サーバーーが必須要件を満たしていません',
        },
    };

    const t = texts[locale as keyof typeof texts] ?? texts.zh;

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
                return <Check className="h-5 w-5 text-green-600" />;
            case 'fail':
                return <X className="h-5 w-5 text-red-600" />;
            case 'checking':
                return (
                    <AlertTriangle className="h-5 w-5 animate-spin text-blue-600" />
                );
            default:
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        }
    };

    return (
        <>
            <Head title="环境检测 - 安装向导">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>{t.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isChecking ? (
                                <div className="py-12 text-center">
                                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t.checking}
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
                                                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                                                        : 'bg-white dark:bg-gray-800'
                                                }`}
                                            >
                                                {getStatusIcon(req.status)}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {req.name}
                                                        {req.required && (
                                                            <span className="ml-1 text-red-500">
                                                                *
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {req.condition}
                                                    </p>
                                                    {req.current && (
                                                        <p className="text-xs text-gray-400">
                                                            {req.current}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {requiredPassed ? (
                                        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                            <p className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                                                <Check className="h-4 w-4" />
                                                {t.all_passed}
                                            </p>
                                        </div>
                                    ) : (
                                        requiredRequirements.some(
                                            (r) => r.status === 'fail',
                                        ) && (
                                            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                                <p className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                                                    <X className="h-4 w-4" />
                                                    {t.some_failed}
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
                                返回
                            </Button>
                        </a>
                        {requiredPassed && (
                            <a href="/install/database" className="flex-1">
                                <Button className="w-full" type="button">
                                    {t.next}{' '}
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
