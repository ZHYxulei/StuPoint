import { useEffect, useRef } from 'react';

interface CaptchaWidgetProps {
    siteKey: string;
    provider: string;
    onVerify: (token: string) => void;
    onExpire?: () => void;
}

export default function CaptchaWidget({ siteKey, provider, onVerify, onExpire }: CaptchaWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (provider === 'log' || !siteKey || provider === 'none') {
            // Test mode: auto-verify with dummy token
            onVerify('log-test-token');
            return;
        }

        if (provider === 'cloudflare') {
            // Load Cloudflare Turnstile
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.onload = () => {
                if (window.turnstile && containerRef.current) {
                    window.turnstile.render(containerRef.current, {
                        sitekey: siteKey,
                        callback: (token: string) => onVerify(token),
                        'expired-callback': () => onExpire?.(),
                    });
                }
            };
            document.head.appendChild(script);
            return () => {
                document.head.removeChild(script);
            };
        }

        if (provider === 'google') {
            // Load Google reCAPTCHA v3
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            script.async = true;
            script.onload = () => {
                const grecaptcha = window.grecaptcha;
                if (grecaptcha) {
                    grecaptcha.ready(() => {
                        grecaptcha.execute(siteKey, { action: 'login' }).then((token: string) => {
                            onVerify(token);
                        });
                    });
                }
            };
            document.head.appendChild(script);
            return () => {
                document.head.removeChild(script);
            };
        }
    }, [siteKey, provider, onVerify, onExpire]);

    if (provider === 'log' || provider === 'none' || !siteKey) {
        return null;
    }

    return <div ref={containerRef} />;
}

// Extend window for grecaptcha and turnstile
declare global {
    interface Window {
        grecaptcha?: {
            ready: (cb: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
        turnstile?: {
            render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void }) => void;
        };
    }
}
