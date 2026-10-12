import { Head, Link, useForm } from '@inertiajs/react';
import {
    Settings,
    Plus,
    Edit,
    Trash2,
    Globe,
    Check,
    X,
    Link as LinkIcon,
    Zap,
    Palette,
    Mail,
    Copyright,
    Share2,
    Shield,
    Send,
    Key,
    Server,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface PluginSource {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    url: string;
    api_key: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    pluginSources: PluginSource[];
    siteSettingsForm: Record<string, string>;
    contactSettings: Record<string, string>;
    footerSettings: Record<string, string>;
    socialSettings: Record<string, string>;
    mailSettings: Record<string, string> & { mail_password_set?: boolean };
    smsSettings: Record<string, string> & {
        sms_aliyun_access_key_secret_set?: boolean;
        sms_tencent_secret_key_set?: boolean;
    };
    captchaSettings: Record<string, string> & {
        captcha_cloudflare_secret_key_set?: boolean;
        captcha_google_secret_key_set?: boolean;
    };
}

export default function SystemSettings({
    pluginSources,
    siteSettingsForm,
    contactSettings,
    footerSettings,
    socialSettings,
    mailSettings,
    smsSettings,
    captchaSettings,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.settings'), href: '/admin/settings' },
    ];

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSource, setEditingSource] = useState<PluginSource | null>(
        null,
    );
    const [activeTab, setActiveTab] = useState('site');

    // Site settings form
    const siteForm = useForm({
        site_name: siteSettingsForm.site_name || '',
        site_description: siteSettingsForm.site_description || '',
        site_keywords: siteSettingsForm.site_keywords || '',
        site_logo: siteSettingsForm.site_logo || '',
        site_favicon: siteSettingsForm.site_favicon || '',
        site_favicon_upload: null as File | null,
    });

    // Contact settings form
    const contactForm = useForm({
        contact_email: contactSettings.contact_email || '',
        contact_phone: contactSettings.contact_phone || '',
    });

    // Footer settings form
    const footerForm = useForm({
        footer_copyright: footerSettings.footer_copyright || '',
        footer_icp: footerSettings.footer_icp || '',
        footer_police: footerSettings.footer_police || '',
    });

    // Social settings form
    const socialForm = useForm({
        social_wechat: socialSettings.social_wechat || '',
        social_weibo: socialSettings.social_weibo || '',
        social_qq: socialSettings.social_qq || '',
    });

    // Plugin source form
    const {
        post,
        put,
        delete: destroy,
        processing,
        reset,
        setData,
        data,
        errors,
    } = useForm({
        name: '',
        slug: '',
        description: '',
        url: '',
        api_key: '',
        is_active: true,
        sort_order: 0,
    });

    const handleSiteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        siteForm.post('/admin/settings/site', {
            forceFormData: true,
            onSuccess: () => {},
        });
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contactForm.post('/admin/settings/contact', {
            onSuccess: () => {},
        });
    };

    const handleFooterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        footerForm.post('/admin/settings/footer', {
            onSuccess: () => {},
        });
    };

    const handleSocialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        socialForm.post('/admin/settings/social', {
            onSuccess: () => {},
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSource) {
            put(`/admin/settings/plugin-sources/${editingSource.id}`, {
                onSuccess: () => {
                    reset();
                    setEditingSource(null);
                },
            });
        } else {
            post('/admin/settings/plugin-sources', {
                onSuccess: () => {
                    reset();
                    setShowAddForm(false);
                },
            });
        }
    };

    const handleEdit = (source: PluginSource) => {
        setData({
            name: source.name,
            slug: source.slug,
            description: source.description || '',
            url: source.url,
            api_key: source.api_key || '',
            is_active: source.is_active,
            sort_order: source.sort_order,
        });
        setEditingSource(source);
        setShowAddForm(true);
    };

    const handleCancel = () => {
        reset();
        setShowAddForm(false);
        setEditingSource(null);
    };

    const handleDelete = (id: number) => {
        if (confirm(t('admin.settings.delete_source_confirm'))) {
            destroy(`/admin/settings/plugin-sources/${id}`);
        }
    };

    const handleTest = (id: number) => {
        post(`/admin/settings/plugin-sources/${id}/test`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('nav.settings')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('nav.settings')}
                        description={t('admin.settings.description')}
                    />
                </div>

                <div className="flex gap-6">
                    {/* Sidebar Navigation */}
                    <nav className="w-48 shrink-0 space-y-1">
                        {[
                            {
                                key: 'site',
                                icon: Palette,
                                label: t('admin.settings.tab_site'),
                            },
                            {
                                key: 'contact',
                                icon: Mail,
                                label: t('admin.settings.tab_contact'),
                            },
                            {
                                key: 'footer',
                                icon: Copyright,
                                label: t('admin.settings.tab_footer'),
                            },
                            {
                                key: 'social',
                                icon: Share2,
                                label: t('admin.settings.tab_social'),
                            },
                            {
                                key: 'plugins',
                                icon: Globe,
                                label: t('admin.settings.tab_plugins'),
                            },
                            {
                                key: 'mail',
                                icon: Send,
                                label: t('admin.settings.tab_mail'),
                            },
                            {
                                key: 'sms',
                                icon: Zap,
                                label: t('admin.settings.tab_sms'),
                            },
                            {
                                key: 'captcha',
                                icon: Shield,
                                label: t('admin.settings.tab_captcha'),
                            },
                        ].map(({ key, icon: Icon, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    activeTab === key
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </nav>

                    {/* Tab Content */}
                    <div className="min-w-0 flex-1 space-y-6">
                        {/* Site Settings Tab */}
                        {activeTab === 'site' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="h-5 w-5" />
                                        {t('admin.settings.tab_site')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('admin.settings.site_description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleSiteSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="site_name">
                                                    {t('admin.settings.site_name')}
                                                </Label>
                                                <Input
                                                    id="site_name"
                                                    value={
                                                        siteForm.data.site_name
                                                    }
                                                    onChange={(e) =>
                                                        siteForm.setData(
                                                            'site_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.site_name_placeholder',
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="site_keywords">
                                                    {t(
                                                        'admin.settings.site_keywords',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="site_keywords"
                                                    value={
                                                        siteForm.data
                                                            .site_keywords
                                                    }
                                                    onChange={(e) =>
                                                        siteForm.setData(
                                                            'site_keywords',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.site_keywords_placeholder',
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="site_description">
                                                    {t(
                                                        'admin.settings.site_description_label',
                                                    )}
                                                </Label>
                                                <Textarea
                                                    id="site_description"
                                                    value={
                                                        siteForm.data
                                                            .site_description
                                                    }
                                                    onChange={(e) =>
                                                        siteForm.setData(
                                                            'site_description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.site_description_placeholder',
                                                    )}
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="site_logo">
                                                    {t(
                                                        'admin.settings.site_logo_url',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="site_logo"
                                                    value={
                                                        siteForm.data.site_logo
                                                    }
                                                    onChange={(e) =>
                                                        siteForm.setData(
                                                            'site_logo',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://example.com/logo.png"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {t(
                                                        'admin.settings.site_logo_hint',
                                                    )}
                                                </p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="site_favicon">
                                                    {t(
                                                        'admin.settings.site_favicon_url',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="site_favicon"
                                                    value={
                                                        siteForm.data
                                                            .site_favicon
                                                    }
                                                    onChange={(e) =>
                                                        siteForm.setData(
                                                            'site_favicon',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://example.com/favicon.ico"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {t(
                                                        'admin.settings.site_favicon_hint',
                                                    )}
                                                </p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="site_favicon_upload">
                                                    {t(
                                                        'admin.settings.upload_favicon',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="site_favicon_upload"
                                                    type="file"
                                                    accept=".png,.ico,.webp"
                                                    onChange={(e) =>
                                                        siteForm.setData(
                                                            'site_favicon_upload',
                                                            e.target
                                                                .files?.[0] ||
                                                                null,
                                                        )
                                                    }
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {t(
                                                        'admin.settings.upload_favicon_hint',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={siteForm.processing}
                                            >
                                                {siteForm.processing
                                                    ? t('admin.settings.saving')
                                                    : t(
                                                          'admin.settings.save_settings',
                                                      )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Settings Tab */}
                        {activeTab === 'contact' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        {t('admin.settings.tab_contact')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'admin.settings.contact_description',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleContactSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="contact_email">
                                                    {t(
                                                        'admin.settings.contact_email',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={
                                                        contactForm.data
                                                            .contact_email
                                                    }
                                                    onChange={(e) =>
                                                        contactForm.setData(
                                                            'contact_email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="contact@example.com"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="contact_phone">
                                                    {t(
                                                        'admin.settings.contact_phone',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="contact_phone"
                                                    value={
                                                        contactForm.data
                                                            .contact_phone
                                                    }
                                                    onChange={(e) =>
                                                        contactForm.setData(
                                                            'contact_phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="400-xxx-xxxx"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    contactForm.processing
                                                }
                                            >
                                                {contactForm.processing
                                                    ? t('admin.settings.saving')
                                                    : t(
                                                          'admin.settings.save_settings',
                                                      )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Footer Settings Tab */}
                        {activeTab === 'footer' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Copyright className="h-5 w-5" />
                                        {t('admin.settings.tab_footer')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'admin.settings.footer_description',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleFooterSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="footer_copyright">
                                                    {t(
                                                        'admin.settings.copyright',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="footer_copyright"
                                                    value={
                                                        footerForm.data
                                                            .footer_copyright
                                                    }
                                                    onChange={(e) =>
                                                        footerForm.setData(
                                                            'footer_copyright',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="© 2024 StuPoint. All rights reserved."
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="footer_icp">
                                                    {t('admin.settings.icp')}
                                                </Label>
                                                <Input
                                                    id="footer_icp"
                                                    value={
                                                        footerForm.data
                                                            .footer_icp
                                                    }
                                                    onChange={(e) =>
                                                        footerForm.setData(
                                                            'footer_icp',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.icp_placeholder',
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="footer_police">
                                                    {t(
                                                        'admin.settings.police',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="footer_police"
                                                    value={
                                                        footerForm.data
                                                            .footer_police
                                                    }
                                                    onChange={(e) =>
                                                        footerForm.setData(
                                                            'footer_police',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.police_placeholder',
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={footerForm.processing}
                                            >
                                                {footerForm.processing
                                                    ? t('admin.settings.saving')
                                                    : t(
                                                          'admin.settings.save_settings',
                                                      )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Social Settings Tab */}
                        {activeTab === 'social' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Share2 className="h-5 w-5" />
                                        {t('admin.settings.tab_social')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'admin.settings.social_description',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleSocialSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="social_wechat">
                                                    {t('admin.settings.wechat')}
                                                </Label>
                                                <Input
                                                    id="social_wechat"
                                                    value={
                                                        socialForm.data
                                                            .social_wechat
                                                    }
                                                    onChange={(e) =>
                                                        socialForm.setData(
                                                            'social_wechat',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.wechat_placeholder',
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="social_weibo">
                                                    {t('admin.settings.weibo')}
                                                </Label>
                                                <Input
                                                    id="social_weibo"
                                                    value={
                                                        socialForm.data
                                                            .social_weibo
                                                    }
                                                    onChange={(e) =>
                                                        socialForm.setData(
                                                            'social_weibo',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.weibo_placeholder',
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="social_qq">
                                                    QQ
                                                </Label>
                                                <Input
                                                    id="social_qq"
                                                    value={
                                                        socialForm.data
                                                            .social_qq
                                                    }
                                                    onChange={(e) =>
                                                        socialForm.setData(
                                                            'social_qq',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'admin.settings.qq_placeholder',
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={socialForm.processing}
                                            >
                                                {socialForm.processing
                                                    ? t('admin.settings.saving')
                                                    : t(
                                                          'admin.settings.save_settings',
                                                      )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Plugin Sources Tab */}
                        {activeTab === 'plugins' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Globe className="h-5 w-5" />
                                                {t(
                                                    'admin.settings.plugin_sources_title',
                                                )}
                                            </CardTitle>
                                            <CardDescription>
                                                {t(
                                                    'admin.settings.plugin_sources_description',
                                                )}
                                            </CardDescription>
                                        </div>
                                        {!showAddForm && (
                                            <Button
                                                onClick={() =>
                                                    setShowAddForm(true)
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                {t('admin.settings.add_source')}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Add/Edit Form */}
                                    {showAddForm && (
                                        <div className="rounded-lg border border-sidebar-border/70 bg-muted/50 p-4 dark:border-sidebar-border">
                                            <h3 className="mb-4 font-semibold">
                                                {editingSource
                                                    ? t(
                                                          'admin.settings.edit_source',
                                                      )
                                                    : t(
                                                          'admin.settings.add_new_source',
                                                      )}
                                            </h3>
                                            <form
                                                onSubmit={handleSubmit}
                                                className="space-y-4"
                                            >
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="name">
                                                            {t(
                                                                'admin.settings.name_required',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            value={data.name}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={t(
                                                                'admin.settings.name_placeholder',
                                                            )}
                                                            required
                                                        />
                                                        {errors.name && (
                                                            <p className="text-sm text-destructive">
                                                                {errors.name}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="slug">
                                                            {t(
                                                                'admin.settings.slug_required',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="slug"
                                                            value={data.slug}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'slug',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="official-market"
                                                            pattern="[a-z0-9-]+"
                                                            required
                                                        />
                                                        {errors.slug && (
                                                            <p className="text-sm text-destructive">
                                                                {errors.slug}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-2 md:col-span-2">
                                                        <Label htmlFor="url">
                                                            {t(
                                                                'admin.settings.api_url_required',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="url"
                                                            type="url"
                                                            value={data.url}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'url',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="https://api.example.com/plugins"
                                                            required
                                                        />
                                                        {errors.url && (
                                                            <p className="text-sm text-destructive">
                                                                {errors.url}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="api_key">
                                                            {t(
                                                                'admin.settings.api_key',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="api_key"
                                                            type="password"
                                                            value={data.api_key}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'api_key',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={t(
                                                                'admin.settings.optional',
                                                            )}
                                                        />
                                                        {errors.api_key && (
                                                            <p className="text-sm text-destructive">
                                                                {errors.api_key}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="sort_order">
                                                            {t(
                                                                'admin.settings.sort',
                                                            )}
                                                        </Label>
                                                        <Input
                                                            id="sort_order"
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                data.sort_order
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'sort_order',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2 md:col-span-2">
                                                        <Label htmlFor="description">
                                                            {t(
                                                                'common.description',
                                                            )}
                                                        </Label>
                                                        <Textarea
                                                            id="description"
                                                            value={
                                                                data.description
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'description',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={t(
                                                                'admin.settings.source_description_placeholder',
                                                            )}
                                                            rows={2}
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-2 md:col-span-2">
                                                        <Switch
                                                            id="is_active"
                                                            checked={
                                                                data.is_active
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setData(
                                                                    'is_active',
                                                                    checked,
                                                                )
                                                            }
                                                        />
                                                        <Label htmlFor="is_active">
                                                            {t(
                                                                'admin.settings.enable_source',
                                                            )}
                                                        </Label>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        {processing
                                                            ? t(
                                                                  'admin.settings.saving',
                                                              )
                                                            : editingSource
                                                              ? t(
                                                                    'common.update',
                                                                )
                                                              : t(
                                                                    'admin.settings.add',
                                                                )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleCancel}
                                                        disabled={processing}
                                                    >
                                                        {t('common.cancel')}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Plugin Sources List */}
                                    <div className="space-y-3">
                                        {pluginSources.length === 0 ? (
                                            <div className="py-12 text-center text-muted-foreground">
                                                <Globe className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                                <p>
                                                    {t(
                                                        'admin.settings.empty_sources',
                                                    )}
                                                </p>
                                                <p className="text-sm">
                                                    {t(
                                                        'admin.settings.empty_sources_hint',
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            pluginSources.map((source) => (
                                                <div
                                                    key={source.id}
                                                    className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                                                >
                                                    <div className="flex flex-1 items-center gap-4">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                                source.is_active
                                                                    ? 'bg-success-soft/20'
                                                                    : 'bg-muted'
                                                            }`}
                                                        >
                                                            <Globe
                                                                className={`h-5 w-5 ${
                                                                    source.is_active
                                                                        ? 'text-success'
                                                                        : 'text-muted-foreground'
                                                                }`}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <span className="font-medium">
                                                                    {
                                                                        source.name
                                                                    }
                                                                </span>
                                                                <Badge
                                                                    variant={
                                                                        source.is_active
                                                                            ? 'default'
                                                                            : 'secondary'
                                                                    }
                                                                >
                                                                    {source.is_active
                                                                        ? t(
                                                                              'admin.settings.enabled',
                                                                          )
                                                                        : t(
                                                                              'admin.settings.disabled',
                                                                          )}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {source.description ||
                                                                    t(
                                                                        'admin.settings.no_description',
                                                                    )}
                                                            </p>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                API:{' '}
                                                                {source.url}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleTest(
                                                                    source.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <Zap className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    source,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    source.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="hover:bg-destructive hover:text-destructive-foreground"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Mail Settings Tab */}
                        {activeTab === 'mail' && (
                            <MailSettingsTab mailSettings={mailSettings} />
                        )}

                        {/* SMS Settings Tab */}
                        {activeTab === 'sms' && (
                            <SmsSettingsTab smsSettings={smsSettings} />
                        )}

                        {/* Captcha Settings Tab */}
                        {activeTab === 'captcha' && (
                            <CaptchaSettingsTab
                                captchaSettings={captchaSettings}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* ─────────── Mail Settings Tab ─────────── */

function MailSettingsTab({
    mailSettings,
}: {
    mailSettings: Record<string, string> & { mail_password_set?: boolean };
}) {
    const { data, setData, post, processing } = useForm({
        mail_host: mailSettings.mail_host || '',
        mail_port: mailSettings.mail_port || '587',
        mail_username: mailSettings.mail_username || '',
        // Secrets are never sent to the client; blank keeps the stored value.
        mail_password: '',
        mail_encryption: mailSettings.mail_encryption || 'tls',
        mail_from_address: mailSettings.mail_from_address || '',
        mail_from_name: mailSettings.mail_from_name || '',
    });

    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {t('admin.settings.mail_title')}
                </CardTitle>
                <CardDescription>
                    {t('admin.settings.mail_description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/admin/settings/mail');
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label>{t('admin.settings.mail_host')}</Label>
                            <Input
                                value={data.mail_host}
                                onChange={(e) =>
                                    setData('mail_host', e.target.value)
                                }
                                placeholder="smtp.example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin.settings.mail_port')}</Label>
                            <Input
                                value={data.mail_port}
                                onChange={(e) =>
                                    setData('mail_port', e.target.value)
                                }
                                placeholder="587"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin.settings.mail_encryption')}</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.mail_encryption}
                                onChange={(e) =>
                                    setData('mail_encryption', e.target.value)
                                }
                            >
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                                <option value="none">
                                    {t('admin.settings.encryption_none')}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t('admin.settings.mail_username')}</Label>
                            <Input
                                value={data.mail_username}
                                onChange={(e) =>
                                    setData('mail_username', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin.settings.mail_password')}</Label>
                            <Input
                                type="password"
                                value={data.mail_password}
                                placeholder={
                                    mailSettings.mail_password_set
                                        ? t(
                                              'admin.settings.secret_configured',
                                          )
                                        : t(
                                              'admin.settings.mail_password_placeholder',
                                          )
                                }
                                onChange={(e) =>
                                    setData('mail_password', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t('admin.settings.mail_from_address')}</Label>
                            <Input
                                type="email"
                                value={data.mail_from_address}
                                onChange={(e) =>
                                    setData('mail_from_address', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin.settings.mail_from_name')}</Label>
                            <Input
                                value={data.mail_from_name}
                                onChange={(e) =>
                                    setData('mail_from_name', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? t('admin.settings.saving')
                                : t('admin.settings.save_config')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => post('/admin/settings/mail/test')}
                        >
                            {t('admin.settings.send_test_mail')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ─────────── SMS Settings Tab ─────────── */

function SmsSettingsTab({
    smsSettings,
}: {
    smsSettings: Record<string, string> & {
        sms_aliyun_access_key_secret_set?: boolean;
        sms_tencent_secret_key_set?: boolean;
    };
}) {
    const { data, setData, post, processing } = useForm({
        sms_provider: smsSettings.sms_provider || 'log',
        sms_aliyun_access_key_id: smsSettings.sms_aliyun_access_key_id || '',
        // Secrets are never sent to the client; blank keeps the stored value.
        sms_aliyun_access_key_secret: '',
        sms_aliyun_sign_name: smsSettings.sms_aliyun_sign_name || '',
        sms_aliyun_template_code: smsSettings.sms_aliyun_template_code || '',
        sms_tencent_secret_id: smsSettings.sms_tencent_secret_id || '',
        sms_tencent_secret_key: '',
        sms_tencent_sdk_app_id: smsSettings.sms_tencent_sdk_app_id || '',
        sms_tencent_template_id: smsSettings.sms_tencent_template_id || '',
        sms_tencent_sign_name: smsSettings.sms_tencent_sign_name || '',
    });

    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    {t('admin.settings.sms_title')}
                </CardTitle>
                <CardDescription>
                    {t('admin.settings.sms_description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/admin/settings/sms');
                    }}
                    className="space-y-6"
                >
                    <div className="grid gap-2">
                        <Label>{t('admin.settings.sms_provider')}</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={data.sms_provider}
                            onChange={(e) =>
                                setData('sms_provider', e.target.value)
                            }
                        >
                            <option value="log">
                                {t('admin.settings.sms_provider_log')}
                            </option>
                            <option value="aliyun">
                                {t('admin.settings.sms_provider_aliyun')}
                            </option>
                            <option value="tencent">
                                {t('admin.settings.sms_provider_tencent')}
                            </option>
                        </select>
                    </div>

                    {data.sms_provider === 'aliyun' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h4 className="text-sm font-medium">
                                {t('admin.settings.sms_aliyun_title')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Access Key ID</Label>
                                    <Input
                                        value={data.sms_aliyun_access_key_id}
                                        onChange={(e) =>
                                            setData(
                                                'sms_aliyun_access_key_id',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Access Key Secret</Label>
                                    <Input
                                        type="password"
                                        value={
                                            data.sms_aliyun_access_key_secret
                                        }
                                        placeholder={
                                            smsSettings.sms_aliyun_access_key_secret_set
                                                ? t(
                                                      'admin.settings.secret_configured',
                                                  )
                                                : ''
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'sms_aliyun_access_key_secret',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>{t('admin.settings.sms_sign_name')}</Label>
                                    <Input
                                        value={data.sms_aliyun_sign_name}
                                        onChange={(e) =>
                                            setData(
                                                'sms_aliyun_sign_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="StuPoint"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>
                                        {t('admin.settings.sms_template_code')}
                                    </Label>
                                    <Input
                                        value={data.sms_aliyun_template_code}
                                        onChange={(e) =>
                                            setData(
                                                'sms_aliyun_template_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="SMS_xxxxx"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {data.sms_provider === 'tencent' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h4 className="text-sm font-medium">
                                {t('admin.settings.sms_tencent_title')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Secret ID</Label>
                                    <Input
                                        value={data.sms_tencent_secret_id}
                                        onChange={(e) =>
                                            setData(
                                                'sms_tencent_secret_id',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Secret Key</Label>
                                    <Input
                                        type="password"
                                        value={data.sms_tencent_secret_key}
                                        placeholder={
                                            smsSettings.sms_tencent_secret_key_set
                                                ? t(
                                                      'admin.settings.secret_configured',
                                                  )
                                                : ''
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'sms_tencent_secret_key',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>SDK App ID</Label>
                                    <Input
                                        value={data.sms_tencent_sdk_app_id}
                                        onChange={(e) =>
                                            setData(
                                                'sms_tencent_sdk_app_id',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>
                                        {t('admin.settings.sms_template_id')}
                                    </Label>
                                    <Input
                                        value={data.sms_tencent_template_id}
                                        onChange={(e) =>
                                            setData(
                                                'sms_tencent_template_id',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>{t('admin.settings.sms_sign_name')}</Label>
                                    <Input
                                        value={data.sms_tencent_sign_name}
                                        onChange={(e) =>
                                            setData(
                                                'sms_tencent_sign_name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" disabled={processing}>
                        {processing
                            ? t('admin.settings.saving')
                            : t('admin.settings.save_config')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

/* ─────────── Captcha Settings Tab ─────────── */

function CaptchaSettingsTab({
    captchaSettings,
}: {
    captchaSettings: Record<string, string> & {
        captcha_cloudflare_secret_key_set?: boolean;
        captcha_google_secret_key_set?: boolean;
    };
}) {
    const { data, setData, post, processing } = useForm({
        captcha_provider: captchaSettings.captcha_provider || 'log',
        captcha_cloudflare_site_key:
            captchaSettings.captcha_cloudflare_site_key || '',
        // Secrets are never sent to the client; blank keeps the stored value.
        captcha_cloudflare_secret_key: '',
        captcha_google_site_key: captchaSettings.captcha_google_site_key || '',
        captcha_google_secret_key: '',
    });

    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('admin.settings.captcha_title')}
                </CardTitle>
                <CardDescription>
                    {t('admin.settings.captcha_description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/admin/settings/captcha');
                    }}
                    className="space-y-6"
                >
                    <div className="grid gap-2">
                        <Label>{t('admin.settings.captcha_provider')}</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={data.captcha_provider}
                            onChange={(e) =>
                                setData('captcha_provider', e.target.value)
                            }
                        >
                            <option value="log">
                                {t('admin.settings.captcha_provider_log')}
                            </option>
                            <option value="cloudflare">
                                Cloudflare Turnstile
                            </option>
                            <option value="google">Google reCAPTCHA</option>
                        </select>
                    </div>

                    {data.captcha_provider === 'cloudflare' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h4 className="text-sm font-medium">
                                {t('admin.settings.captcha_cloudflare_title')}
                            </h4>
                            <div className="grid gap-2">
                                <Label>Site Key</Label>
                                <Input
                                    value={data.captcha_cloudflare_site_key}
                                    onChange={(e) =>
                                        setData(
                                            'captcha_cloudflare_site_key',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Secret Key</Label>
                                <Input
                                    type="password"
                                    value={data.captcha_cloudflare_secret_key}
                                    placeholder={
                                        captchaSettings.captcha_cloudflare_secret_key_set
                                            ? t(
                                                  'admin.settings.secret_configured',
                                              )
                                            : ''
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'captcha_cloudflare_secret_key',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {data.captcha_provider === 'google' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h4 className="text-sm font-medium">
                                {t('admin.settings.captcha_google_title')}
                            </h4>
                            <div className="grid gap-2">
                                <Label>Site Key</Label>
                                <Input
                                    value={data.captcha_google_site_key}
                                    onChange={(e) =>
                                        setData(
                                            'captcha_google_site_key',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Secret Key</Label>
                                <Input
                                    type="password"
                                    value={data.captcha_google_secret_key}
                                    placeholder={
                                        captchaSettings.captcha_google_secret_key_set
                                            ? t(
                                                  'admin.settings.secret_configured',
                                              )
                                            : ''
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'captcha_google_secret_key',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <Button type="submit" disabled={processing}>
                        {processing
                            ? t('admin.settings.saving')
                            : t('admin.settings.save_config')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
