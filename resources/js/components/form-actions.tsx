import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FormActionsProps = {
    primary: ReactNode;
    secondary?: ReactNode;
    destructive?: ReactNode;
    className?: string;
};

export default function FormActions({
    primary,
    secondary,
    destructive,
    className,
}: FormActionsProps) {
    return (
        <div
            className={cn(
                'flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center',
                className,
            )}
        >
            {destructive && <div className="sm:mr-auto">{destructive}</div>}
            {secondary}
            {primary}
        </div>
    );
}
