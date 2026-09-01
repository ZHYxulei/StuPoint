import { Send } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SmsVerificationProps {
    phone: string;
    type: string;
    onVerified: () => void;
}

export default function SmsVerification({ phone, type, onVerified }: SmsVerificationProps) {
    const [code, setCode] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [message, setMessage] = useState('');

    const handleSendCode = useCallback(async () => {
        if (!phone || countdown > 0) return;
        setSending(true);
        setMessage('');

        try {
            const res = await fetch('/api/verification/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                body: JSON.stringify({ phone, type }),
            });
            const data = await res.json();
            setMessage(data.message || (data.success ? '已发送' : '发送失败'));
            if (data.success) {
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) { clearInterval(timer); return 0; }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch {
            setMessage('网络错误');
        } finally {
            setSending(false);
        }
    }, [phone, countdown, type]);

    const handleVerify = useCallback(async () => {
        if (!code || code.length !== 6) return;
        setVerifying(true);
        setMessage('');

        try {
            const res = await fetch('/api/verification/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                body: JSON.stringify({ phone, code, type }),
            });
            const data = await res.json();
            setMessage(data.message || (data.success ? '验证成功' : '验证失败'));
            if (data.success) onVerified();
        } catch {
            setMessage('网络错误');
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
                        placeholder="6位验证码"
                        maxLength={6}
                    />
                </div>
                <Button type="button" variant="outline" onClick={handleSendCode} disabled={sending || countdown > 0 || !phone}>
                    {countdown > 0 ? `${countdown}s` : <Send className="h-4 w-4" />}
                </Button>
            </div>
            {code.length === 6 && (
                <Button type="button" variant="outline" onClick={handleVerify} disabled={verifying} className="w-full">
                    {verifying ? '验证中...' : '确认验证码'}
                </Button>
            )}
            {message && <p className={`text-xs ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </div>
    );
}
