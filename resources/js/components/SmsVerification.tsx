import { Send } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';

interface SmsVerificationProps {
    phone: string;
    type: string;
    onVerified: () => void;
}

export default function SmsVerification({
    phone,
    type,
    onVerified,
}: SmsVerificationProps) {
    const [code, setCode] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [message, setMessage] = useState('');
    // Tracked explicitly rather than inferred from the message text: the text
    // is now translated, so sniffing it for a word would break in English.
    const [succeeded, setSucceeded] = useState<boolean | null>(null);

    const handleSendCode = useCallback(async () => {
        if (!phone || countdown > 0) return;
        setSending(true);
        setMessage('');
        setSucceeded(null);

        try {
            const res = await fetch('/api/verification/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ phone, type }),
            });
            const data = await res.json();
            setMessage(
                data.message ||
                    (data.success ? t('sms.sent') : t('sms.send_failed')),
            );
            setSucceeded(Boolean(data.success));
            if (data.success) {
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch {
            setMessage(t('sms.network_error'));
            setSucceeded(false);
        } finally {
            setSending(false);
        }
    }, [phone, countdown, type]);

    const handleVerify = useCallback(async () => {
        if (!code || code.length !== 6) return;
        setVerifying(true);
        setMessage('');
        setSucceeded(null);

        try {
            const res = await fetch('/api/verification/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ phone, code, type }),
            });
            const data = await res.json();
            setMessage(
                data.message ||
                    (data.success ? t('sms.verified') : t('sms.verify_failed')),
            );
            setSucceeded(Boolean(data.success));
            if (data.success) onVerified();
        } catch {
            setMessage(t('sms.network_error'));
            setSucceeded(false);
        } finally {
            setVerifying(false);
        }
    }, [phone, code, type, onVerified]);

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={t('sms.code_placeholder')}
                        maxLength={6}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={sending || countdown > 0 || !phone}
                >
                    {countdown > 0 ? (
                        `${countdown}s`
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>
            {code.length === 6 && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full"
                >
                    {verifying ? t('sms.verifying') : t('sms.confirm')}
                </Button>
            )}
            {message && (
                <p
                    className={`text-xs ${succeeded ? 'text-success' : 'text-destructive'}`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
