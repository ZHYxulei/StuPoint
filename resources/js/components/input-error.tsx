import type { ComponentProps, JSX } from 'react';
import { cn } from '@/lib/utils';

export type InputErrorProps = ComponentProps<'p'> & {
    message?: string | null;
};

export default function InputError({
    message,
    className,
    ...props
}: InputErrorProps): JSX.Element | null {
    if (!message) {
        return null;
    }

    return (
        <p
            role="alert"
            aria-live="polite"
            className={cn('text-sm text-destructive', className)}
            {...props}
        >
            {message}
        </p>
    );
}
