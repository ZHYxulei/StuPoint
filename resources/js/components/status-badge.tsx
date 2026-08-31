import type { ComponentProps, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

export type StatusTone = ComponentProps<typeof Badge>['variant'];

export type StatusBadgeProps = Omit<ComponentProps<typeof Badge>, 'variant'> & {
    label: ReactNode;
    tone?: StatusTone;
};

export default function StatusBadge({
    label,
    tone = 'secondary',
    ...props
}: StatusBadgeProps) {
    return (
        <Badge variant={tone} {...props}>
            {label}
        </Badge>
    );
}
