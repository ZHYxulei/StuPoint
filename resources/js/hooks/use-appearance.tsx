import { useCallback, useMemo, useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type ThemeColor =
    | 'emerald'
    | 'teal'
    | 'blue'
    | 'indigo'
    | 'violet'
    | 'rose'
    | 'amber'
    | 'slate';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;

    readonly themeColor: ThemeColor;
    readonly updateThemeColor: (color: ThemeColor) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';
let currentThemeColor: ThemeColor = 'emerald';

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') return 'system';

    return (localStorage.getItem('appearance') as Appearance) || 'system';
};

const getStoredThemeColor = (): ThemeColor => {
    if (typeof window === 'undefined') return 'emerald';

    return (localStorage.getItem('theme_color') as ThemeColor) || 'emerald';
};

const isDarkMode = (appearance: Appearance): boolean => {
    return appearance === 'dark' || (appearance === 'system' && prefersDark());
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') return;

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const applyThemeColor = (color: ThemeColor): void => {
    if (typeof document === 'undefined') return;

    document.documentElement.setAttribute('data-theme', color);
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === 'undefined') return null;

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = (): void => {
    applyTheme(currentAppearance);
    notify();
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem('appearance')) {
        localStorage.setItem('appearance', 'system');
        setCookie('appearance', 'system');
    }

    if (!localStorage.getItem('theme_color')) {
        localStorage.setItem('theme_color', 'emerald');
        setCookie('theme_color', 'emerald');
    }

    currentAppearance = getStoredAppearance();
    currentThemeColor = getStoredThemeColor();

    applyTheme(currentAppearance);
    applyThemeColor(currentThemeColor);

    // Set up system theme change listener
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const themeColor: ThemeColor = useSyncExternalStore(
        subscribe,
        () => currentThemeColor,
        () => 'emerald',
    );

    const resolvedAppearance: ResolvedAppearance = useMemo(
        () => (isDarkMode(appearance) ? 'dark' : 'light'),
        [appearance],
    );

    const updateAppearance = useCallback((mode: Appearance): void => {
        currentAppearance = mode;

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    }, []);

    const updateThemeColor = useCallback((color: ThemeColor): void => {
        currentThemeColor = color;

        localStorage.setItem('theme_color', color);
        setCookie('theme_color', color);

        applyThemeColor(color);
        notify();
    }, []);

    return {
        appearance,
        resolvedAppearance,
        updateAppearance,
        themeColor,
        updateThemeColor,
    } as const;
}
