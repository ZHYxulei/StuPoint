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
    [key: string]: unknown;
};
