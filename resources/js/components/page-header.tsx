import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

export type PageHeaderProps = {
    title: ReactNode;
    description?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    className?: string;
};

export default function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div className="grid min-w-0 gap-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {title}
                </h1>
                {description && (
                    <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
            )}
        </header>
    );
}
