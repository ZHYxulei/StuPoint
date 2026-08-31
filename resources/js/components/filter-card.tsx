import type { ComponentProps } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type FilterCardProps = ComponentProps<typeof Card>;

export default function FilterCard({
    className,
    children,
    ...props
}: FilterCardProps) {
    return (
        <Card className={cn('gap-0 border-border/80 bg-surface-1 py-0 shadow-xs', className)} {...props}>
            <CardContent className="p-4 sm:p-5">{children}</CardContent>
        </Card>
    );
}
