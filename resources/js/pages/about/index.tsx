import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, CheckCircle, Info, Code, Server, GitCommitHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '关于', href: '/about' },
];

export default function AboutIndex({ version, commitHash, commitDate, phpVersion, laravelVersion, schoolName, schoolLogo }: AboutData) {
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState<{ upToDate: boolean; message: string } | null>(null);

    const handleCheckUpdate = () => {
        setChecking(true);
        setCheckResult(null);
        // Simulated check - replace with real API call later
        setTimeout(() => {
            setCheckResult({ upToDate: true, message: '当前已是最新版本' });
            setChecking(false);
        }, 1500);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="关于" />

            <div className="space-y-6 p-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">关于 StuPoint</h1>
                </div>

                {/* Logo Section */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-4 gap-6">
                            {/* System Logo */}
                            <div className="w-36 flex justify-end">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl font-bold">SP</span>
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">StuPoint</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-16 w-px bg-border shrink-0" />

                            {/* School Logo */}
                            <div className="w-28 flex justify-start">
                                <div className="flex flex-col items-center gap-2">
                                    {schoolLogo ? (
                                        <img src={schoolLogo} alt={schoolName} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                                            <span className="text-2xl">🏫</span>
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-muted-foreground text-center leading-snug">{schoolName}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Info */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span className="text-sm">版本号</span>
                            </div>
                            <span className="font-mono font-semibold">v{version}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <GitCommitHorizontal className="h-4 w-4" />
                                <span className="text-sm">提交哈希</span>
                            </div>
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{commitHash}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">提交日期</span>
                            <span className="text-sm">{commitDate}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Code className="h-4 w-4" />
                                <span className="text-sm">PHP 版本</span>
                            </div>
                            <span className="text-sm">{phpVersion}</span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Server className="h-4 w-4" />
                                <span className="text-sm">Laravel 版本</span>
                            </div>
                            <span className="text-sm">{laravelVersion}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Check Update */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">检查更新</h3>
                                <p className="text-sm text-muted-foreground">检查是否有新版本可用</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleCheckUpdate}
                                disabled={checking}
                            >
                                {checking ? '检查中...' : '检查更新'}
                            </Button>
                        </div>

                        {checkResult && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                checkResult.upToDate
                                    ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                                    : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                            }`}>
                                <CheckCircle className="h-4 w-4" />
                                {checkResult.message}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <a href="https://github.com/ZHYxulei/StuPoint" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-foreground transition-colors">
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
