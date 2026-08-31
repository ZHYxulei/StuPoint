import type { PropsWithChildren } from 'react';
import PublicNavbar from '@/components/public-navbar';
import { cn } from '@/lib/utils';

export type PublicLayoutProps = PropsWithChildren<{
    contentClassName?: string;
    withContainer?: boolean;
}>;

export default function PublicLayout({
    children,
    contentClassName,
    withContainer = false,
}: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PublicNavbar />
            <main
                className={cn(
                    'min-h-[calc(100vh-4rem)]',
                    withContainer && 'container py-8',
                    contentClassName,
                )}
            >
                {children}
            </main>
        </div>
    );
}
