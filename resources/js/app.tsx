import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, type ComponentType } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { setLocale } from './lib/i18n';

const appName =
    document.querySelector('title')?.textContent ||
    import.meta.env.VITE_APP_NAME ||
    'Laravel';

type LocaleProps = { locale?: string };

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob<ComponentType<any>>('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        // Make page props available globally for i18n
        (window as unknown as { pageProps: unknown }).pageProps =
            props.initialPage.props;
        setLocale((props.initialPage.props as LocaleProps).locale);

        // `pageProps` above is only ever assigned once, so it goes stale after
        // the first client-side visit. Re-seed both on every navigation.
        router.on('navigate', (event) => {
            const pageProps = event.detail.page.props;

            (window as unknown as { pageProps: unknown }).pageProps = pageProps;
            setLocale((pageProps as LocaleProps).locale);
        });

        const application = (
            <StrictMode>
                <App {...props} />
            </StrictMode>
        );

        if (el.hasChildNodes()) {
            hydrateRoot(el, application);

            return;
        }

        createRoot(el).render(application);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
