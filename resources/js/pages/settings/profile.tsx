import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { User, Upload, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { t } from '@/lib/i18n';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        auth.user.avatar || null,
    );
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: auth.user.name,
            email: auth.user.email,
            avatar: null as File | null,
            remove_avatar: false,
        });

    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.profile.title'),
            href: edit().url,
        },
    ];

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setAvatarError(t('settings.profile.avatar_too_large'));
            e.target.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            setAvatarError(t('settings.profile.avatar_invalid_type'));
            e.target.value = '';
            return;
        }

        setAvatarError(null);
        setData('avatar', file);
        setData('remove_avatar', false);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarError(null);
        setData('avatar', null);
        setData('remove_avatar', true);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings/profile', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.profile.title')} />

            <h1 className="sr-only">{t('settings.profile.title')}</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={t('settings.profile.heading')}
                        description={t('settings.profile.description')}
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="grid gap-4">
                            <Label>{t('settings.profile.avatar')}</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage
                                        src={avatarPreview ?? undefined}
                                    />
                                    <AvatarFallback>
                                        <User className="h-12 w-12" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label
                                            htmlFor="avatar-upload"
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
                                                <Upload className="h-4 w-4" />
                                                <span>
                                                    {t(
                                                        'settings.profile.upload_avatar',
                                                    )}
                                                </span>
                                            </div>
                                        </Label>
                                        <input
                                            ref={fileInputRef}
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handleAvatarChange}
                                        />
                                        {avatarPreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAvatar}
                                            >
                                                <X className="mr-1 h-4 w-4" />
                                                {t('common.delete')}
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.profile.avatar_hint')}
                                    </p>
                                    {(avatarError || errors.avatar) && (
                                        <InputError
                                            message={
                                                avatarError || errors.avatar
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                {t('settings.profile.name')}
                            </Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                                autoComplete="name"
                                placeholder={t(
                                    'settings.profile.name_placeholder',
                                )}
                            />

                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                {t('settings.profile.email')}
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                autoComplete="username"
                                placeholder={t('settings.profile.email')}
                            />

                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        {mustVerifyEmail &&
                            auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        {t('settings.profile.unverified')}{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            {t(
                                                'settings.profile.resend_verification',
                                            )}
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-success">
                                            {t(
                                                'settings.profile.verification_sent',
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                {t('common.save')}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.saved')}
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
