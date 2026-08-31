import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';

export type IsCurrentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    exact?: boolean,
) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
};

function pathname(url: string): string {
    const value = url.split('#', 1)[0].split('?', 1)[0] || '/';

    if (!value.startsWith('http')) {
        return value.startsWith('/') ? value : `/${value}`;
    }

    try {
        return new URL(value).pathname;
    } catch {
        return '/';
    }
}

export function useCurrentUrl(): UseCurrentUrlReturn {
    const page = usePage();
    const currentUrl = pathname(page.url);

    const isCurrentUrl: IsCurrentUrlFn = (urlToCheck, exact = true) => {
        const targetUrl = pathname(toUrl(urlToCheck));

        return exact
            ? targetUrl === currentUrl
            : currentUrl === targetUrl || currentUrl.startsWith(`${targetUrl}/`);
    };

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => {
        return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
    };

    return {
        currentUrl,
        isCurrentUrl,
        whenCurrentUrl,
    };
}
