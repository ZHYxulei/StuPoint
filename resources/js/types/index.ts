export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    locale: string;
    fallback_locale: string;
    enabledPlugins?: string[];
    siteSettings?: {
        site_description?: string;
        site_keywords?: string;
        site_logo?: string;
        site_favicon?: string;
    };
    footerSettings?: {
        copyright?: string;
        icp?: string;
        police?: string;
    };
    contactSettings?: {
        email?: string;
        phone?: string;
    };
    [key: string]: unknown;
};
