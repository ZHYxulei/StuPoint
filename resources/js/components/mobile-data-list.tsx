import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type MobileDataListProps = ComponentProps<'div'>;

export default function MobileDataList({
    className,
    ...props
}: MobileDataListProps) {
    return (
        <div
            data-slot="mobile-data-list"
            className={cn('grid gap-3 md:hidden', className)}
            {...props}
        />
    );
}
