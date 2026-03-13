import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import { home } from '@/routes';
import type { SharedData } from '@/types';

export default function AppLogo() {
    const { siteSettings } = usePage<SharedData>().props;
    const siteName = 'StuPoint';
    const siteFavicon = siteSettings?.site_favicon;

    return (
        <Link href={home().url} className="flex w-full items-center gap-2">
            {siteFavicon ? (
                <img
                    src={siteFavicon}
                    alt={siteName}
                    className="size-8 rounded-md object-contain"
                />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                </div>
            )}
            <div className="flex flex-1 items-center justify-center text-center">
                <span className="mt-[6px] mb-0.5 truncate text-lg leading-tight font-semibold">
                    {siteName}
                </span>
            </div>
        </Link>
    );
}
