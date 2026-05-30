import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationBarProps {
    links: PaginationLink[];
}

/**
 * Safely renders pagination link labels by stripping HTML tags.
 * Replaces dangerouslySetInnerHTML pattern across all pages.
 */
function sanitizeLabel(html: string): string {
    // Laravel paginator uses &laquo; &raquo; for prev/next and <span> for active page
    return html
        .replace(/<[^>]*>/g, '')    // strip all HTML tags
        .replace(/&laquo;/g, '«')   // left chevron entity
        .replace(/&raquo;/g, '»')   // right chevron entity
        .replace(/&nbsp;/g, ' ')
        .trim();
}

export default function PaginationBar({ links }: PaginationBarProps) {
    if (links.length <= 3) return null;

    return (
        <div className="flex justify-center gap-1 mt-6">
            {links.map((link, index) => {
                const text = sanitizeLabel(link.label);
                const isPrev = text === '«';
                const isNext = text === '»';

                if (!link.url && !link.active) {
                    return (
                        <Button key={index} variant="ghost" size="sm" disabled className="min-w-[36px] px-2">
                            {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : text}
                        </Button>
                    );
                }

                return (
                    <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[36px] px-2"
                        onClick={() => {
                            if (link.url) {
                                router.get(link.url, {}, { preserveScroll: true, preserveState: true });
                            }
                        }}
                        disabled={!link.url}
                    >
                        {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : text}
                    </Button>
                );
            })}
        </div>
    );
}
