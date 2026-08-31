import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChangeEvent, useRef, useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';
import { User, Upload, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(auth.user.avatar || null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        remove_avatar: false,
    });

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setAvatarError('头像大小不能超过5MB');
            e.target.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            setAvatarError('请选择图片文件');
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
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="grid gap-4">
                                    <Label>头像</Label>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={avatarPreview ?? undefined} />
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
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                                        <Upload className="h-4 w-4" />
                                                        <span>上传头像</span>
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
                                                        <X className="h-4 w-4 mr-1" />
                                                        删除
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                支持 JPG、PNG、GIF、WebP 格式，最大5MB
                                            </p>
                                            {(avatarError || errors.avatar) && (
                                                <InputError
                                                    message={avatarError || errors.avatar}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
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
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
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
