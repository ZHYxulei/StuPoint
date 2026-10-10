import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, type ComponentType } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { getLocale, setLocale } from './lib/i18n';

const appName =
    document.querySelector('title')?.textContent ||
    import.meta.env.VITE_APP_NAME ||
    'Laravel';

type LocaleProps = { locale?: string };

/**
 * Refresh the i18n locale on every page change.
 *
 * `t()` resolves its locale from a module-level value, so it must be kept in
 * step with whatever page Inertia is about to render — not just on boot. The
 * sync is done by wrapping the resolved component rather than by listening to
 * a router event, because this runs during the render that precedes the page's
 * own `t()` calls, so the very first translated string is already correct.
 */
function withLocaleSync(Component: ComponentType<any>): ComponentType<any> {
    function LocaleSynced(props: Record<string, unknown>) {
        setLocale((props as LocaleProps).locale);

        // <html lang> is written server-side and would otherwise keep the
        // language the document was first loaded in.
        const locale = getLocale();

        if (document.documentElement.lang !== locale) {
            document.documentElement.lang = locale;
        }

        return <Component {...props} />;
    }

    // Inertia reads `Component.layout` off the resolved component; carry it
    // over so a page that ever adopts the layout convention keeps working.
    (LocaleSynced as { layout?: unknown }).layout = (
        Component as { layout?: unknown }
    ).layout;

    return LocaleSynced;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const module = await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob<ComponentType<any>>('./pages/**/*.tsx'),
        );

        // resolvePageComponent hands back the imported module, not its default
        // export. Inertia normally unwraps it (`module.default || module`), so
        // do the same here before wrapping — otherwise React gets an object.
        const page =
            (module as { default?: ComponentType<any> }).default ?? module;

        return withLocaleSync(page);
    },
    setup({ el, App, props }) {
        // Other code reads the shared props off the global; keep it populated.
        (globalThis as { pageProps?: unknown }).pageProps =
            props.initialPage.props;
        setLocale((props.initialPage.props as LocaleProps).locale);

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
