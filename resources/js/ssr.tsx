import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';
import ReactDOMServer from 'react-dom/server';
import { setLocale } from './lib/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./pages/${name}.tsx`,
                import.meta.glob<ComponentType<any>>('./pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => {
            // Required: `t()` must never reach for `window` here, and without
            // seeding the locale the server would render the fallback language
            // and hydrate a mismatch.
            (globalThis as { pageProps?: unknown }).pageProps =
                props.initialPage.props;
            setLocale((props.initialPage.props as { locale?: string }).locale);

            return <App {...props} />;
        },
    }),
);
