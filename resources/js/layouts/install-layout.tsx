import type { ReactNode } from 'react';
import InstallStepper from '@/components/install-stepper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type InstallLayoutProps = {
    children: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    step?: { current: number; total: number };
    maxWidth?: 'md' | 'lg';
    actions?: ReactNode;
};

export default function InstallLayout({
    children,
    title,
    description,
    step,
    maxWidth = 'lg',
    actions,
}: InstallLayoutProps) {
    return (
        <main className="min-h-screen bg-surface-2 px-4 py-8 sm:px-6 sm:py-12">
            <div
                className={cn(
                    'mx-auto grid gap-6',
                    maxWidth === 'md' ? 'max-w-2xl' : 'max-w-4xl',
                )}
            >
                <div className="flex items-center justify-center gap-3 text-center">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">
                        S
                    </span>
                    <span className="text-lg font-semibold">StuPoint</span>
                </div>

                {step && <InstallStepper current={step.current} total={step.total} />}

                <Card className="border-border/80 bg-surface-1 shadow-lg shadow-foreground/5">
                    <CardHeader className="gap-2 border-b border-border/70">
                        <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="grid gap-6">{children}</CardContent>
                    {actions && (
                        <div className="flex flex-col-reverse gap-3 border-t border-border/70 px-6 pt-5 sm:flex-row sm:justify-end">
                            {actions}
                        </div>
                    )}
                </Card>
            </div>
        </main>
    );
}
