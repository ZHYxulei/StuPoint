import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type EmptyProps = ComponentProps<'div'> & {
    icon?: ElementType;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    size?: 'sm' | 'default' | 'lg';
};

const sizeClasses = {
    sm: 'gap-3 px-4 py-8',
    default: 'gap-4 px-6 py-12',
    lg: 'gap-5 px-8 py-16',
};

function Empty({
    icon: Icon,
    title,
    description,
    action,
    size = 'default',
    className,
    ...props
}: EmptyProps) {
    return (
        <div
            data-slot="empty"
            className={cn(
                'flex flex-col items-center justify-center rounded-xl border border-dashed bg-surface-2 text-center',
                sizeClasses[size],
                className,
            )}
            {...props}
        >
            {Icon && (
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            )}
            <div className="grid max-w-md gap-1.5">
                <h3 className="font-medium text-foreground">{title}</h3>
                {description && (
                    <div className="text-sm text-muted-foreground">{description}</div>
                )}
            </div>
            {action && <div className="pt-1">{action}</div>}
        </div>
    );
}

export { Empty };
