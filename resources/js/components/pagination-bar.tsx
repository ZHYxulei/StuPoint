import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LaravelPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationBarProps {
    links: LaravelPaginationLink[];
    preserveScroll?: boolean;
    preserveState?: boolean;
    className?: string;
}

function sanitizeLabel(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&nbsp;/g, ' ')
        .trim();
}

export default function PaginationBar({
    links,
    preserveScroll = true,
    preserveState = true,
    className,
}: PaginationBarProps) {
    if (links.length <= 3) return null;

    return (
        <nav
            aria-label="分页导航"
            className={cn('mt-6 flex justify-center gap-1', className)}
        >
            {links.map((link, index) => {
                const text = sanitizeLabel(link.label);
                const isPrev = text === '«';
                const isNext = text === '»';

                if (!link.url && !link.active) {
                    return (
                        <Button
                            key={`${link.label}-${index}`}
                            variant="ghost"
                            size="sm"
                            disabled
                            className="min-w-9 px-2"
                            aria-label={isPrev ? '上一页' : isNext ? '下一页' : undefined}
                        >
                            {isPrev ? (
                                <ChevronLeft className="size-4" aria-hidden="true" />
                            ) : isNext ? (
                                <ChevronRight className="size-4" aria-hidden="true" />
                            ) : (
                                text
                            )}
                        </Button>
                    );
                }

                return (
                    <Button
                        key={`${link.label}-${index}`}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-9 px-2"
                        aria-current={link.active ? 'page' : undefined}
                        aria-label={isPrev ? '上一页' : isNext ? '下一页' : `第 ${text} 页`}
                        onClick={() => {
                            if (link.url) {
                                router.get(link.url, {}, { preserveScroll, preserveState });
                            }
                        }}
                        disabled={!link.url}
                    >
                        {isPrev ? (
                            <ChevronLeft className="size-4" aria-hidden="true" />
                        ) : isNext ? (
                            <ChevronRight className="size-4" aria-hidden="true" />
                        ) : (
                            text
                        )}
                    </Button>
                );
            })}
        </nav>
    );
}
