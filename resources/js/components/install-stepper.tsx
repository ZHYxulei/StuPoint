import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InstallStepperProps = {
    current: number;
    total: number;
    className?: string;
};

export default function InstallStepper({
    current,
    total,
    className,
}: InstallStepperProps) {
    return (
        <ol
            className={cn('flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2', className)}
            aria-label={`安装进度，第 ${current} 步，共 ${total} 步`}
        >
            {Array.from({ length: total }, (_, index) => index + 1).map((step) => {
                const completed = step < current;
                const active = step === current;

                return (
                    <li
                        key={step}
                        className="flex min-w-10 flex-1 items-center gap-1 last:flex-none sm:gap-2"
                    >
                        <span
                            aria-current={active ? 'step' : undefined}
                            className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                completed && 'border-success bg-success-soft text-success-foreground',
                                active && 'border-primary bg-primary text-primary-foreground',
                                !completed && !active && 'border-border bg-surface-2 text-muted-foreground',
                            )}
                        >
                            {completed ? <Check className="size-4" aria-hidden="true" /> : step}
                            <span className="sr-only">
                                {completed ? '已完成' : active ? '当前步骤' : '未开始'}
                            </span>
                        </span>
                        {step < total && (
                            <span
                                className={cn(
                                    'h-px flex-1 bg-border',
                                    completed && 'bg-success/50',
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
