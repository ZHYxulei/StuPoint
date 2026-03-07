import { Head, Link, useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
    siteSettings: Record<string, string>;
    contactSettings: Record<string, string>;
    footerSettings: Record<string, string>;
    socialSettings: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '系统设置', href: '/admin/settings' },
];

export default function SystemSettings({
    pluginSources,
    siteSettings,
    contactSettings,
    footerSettings,
    socialSettings,
}: PageProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSource, setEditingSource] = useState<PluginSource | null>(
        null,
    );

    // Site settings form
    const siteForm = useForm({
        site_name: siteSettings.site_name || '',
        site_description: siteSettings.site_description || '',
        site_keywords: siteSettings.site_keywords || '',
        site_logo: siteSettings.site_logo || '',
        site_favicon: siteSettings.site_favicon || '',
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
            onSuccess: () => {
                // Optionally show success message
            },
        });
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contactForm.post('/admin/settings/contact', {
            onSuccess: () => {
                // Optionally show success message
            },
        });
    };

    const handleFooterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        footerForm.post('/admin/settings/footer', {
            onSuccess: () => {
                // Optionally show success message
            },
        });
    };

    const handleSocialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        socialForm.post('/admin/settings/social', {
            onSuccess: () => {
                // Optionally show success message
            },
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
        if (confirm('确定要删除这个插件源吗？')) {
            destroy(`/admin/settings/plugin-sources/${id}`);
        }
    };

    const handleTest = (id: number) => {
        post(`/admin/settings/plugin-sources/${id}/test`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="系统设置" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="系统设置"
                        description="配置系统参数和插件源"
                    />
                </div>

                <Tabs defaultValue="site" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger
                            value="site"
                            className="flex items-center gap-2"
                        >
                            <Palette className="h-4 w-4" />
                            站点设置
                        </TabsTrigger>
                        <TabsTrigger
                            value="contact"
                            className="flex items-center gap-2"
                        >
                            <Mail className="h-4 w-4" />
                            联系信息
                        </TabsTrigger>
                        <TabsTrigger
                            value="footer"
                            className="flex items-center gap-2"
                        >
                            <Copyright className="h-4 w-4" />
                            页脚设置
                        </TabsTrigger>
                        <TabsTrigger
                            value="social"
                            className="flex items-center gap-2"
                        >
                            <Share2 className="h-4 w-4" />
                            社交媒体
                        </TabsTrigger>
                        <TabsTrigger
                            value="plugins"
                            className="flex items-center gap-2"
                        >
                            <Globe className="h-4 w-4" />
                            插件源
                        </TabsTrigger>
                    </TabsList>

                    {/* Site Settings Tab */}
                    <TabsContent value="site">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    站点设置
                                </CardTitle>
                                <CardDescription>
                                    配置网站的基本信息
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
                                                网站名称
                                            </Label>
                                            <Input
                                                id="site_name"
                                                value={siteForm.data.site_name}
                                                onChange={(e) =>
                                                    siteForm.setData(
                                                        'site_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="StuPoint 学生积分管理系统"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="site_keywords">
                                                网站关键词
                                            </Label>
                                            <Input
                                                id="site_keywords"
                                                value={
                                                    siteForm.data.site_keywords
                                                }
                                                onChange={(e) =>
                                                    siteForm.setData(
                                                        'site_keywords',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="学生管理,积分系统,校园"
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="site_description">
                                                网站描述
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
                                                placeholder="一个现代化的学生积分管理系统"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="site_logo">
                                                网站 Logo URL
                                            </Label>
                                            <Input
                                                id="site_logo"
                                                value={siteForm.data.site_logo}
                                                onChange={(e) =>
                                                    siteForm.setData(
                                                        'site_logo',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="https://example.com/logo.png"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                建议尺寸: 200x60 像素
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="site_favicon">
                                                网站 Favicon URL
                                            </Label>
                                            <Input
                                                id="site_favicon"
                                                value={
                                                    siteForm.data.site_favicon
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
                                                建议尺寸: 32x32 或 64x64 像素
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={siteForm.processing}
                                        >
                                            {siteForm.processing
                                                ? '保存中...'
                                                : '保存设置'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Settings Tab */}
                    <TabsContent value="contact">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    联系信息
                                </CardTitle>
                                <CardDescription>
                                    配置网站的联系信息
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
                                                联系邮箱
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
                                                联系电话
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
                                            disabled={contactForm.processing}
                                        >
                                            {contactForm.processing
                                                ? '保存中...'
                                                : '保存设置'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Footer Settings Tab */}
                    <TabsContent value="footer">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Copyright className="h-5 w-5" />
                                    页脚设置
                                </CardTitle>
                                <CardDescription>
                                    配置网站页脚显示的信息
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
                                                版权信息
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
                                                ICP 备案号
                                            </Label>
                                            <Input
                                                id="footer_icp"
                                                value={
                                                    footerForm.data.footer_icp
                                                }
                                                onChange={(e) =>
                                                    footerForm.setData(
                                                        'footer_icp',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="京ICP备xxxxxxxx号"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="footer_police">
                                                公安备案号
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
                                                placeholder="京公网安备xxxxxxxx号"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={footerForm.processing}
                                        >
                                            {footerForm.processing
                                                ? '保存中...'
                                                : '保存设置'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Social Settings Tab */}
                    <TabsContent value="social">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Share2 className="h-5 w-5" />
                                    社交媒体
                                </CardTitle>
                                <CardDescription>
                                    配置网站的社交媒体账号
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
                                                微信公众号
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
                                                placeholder="微信公众号名称或ID"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="social_weibo">
                                                微博
                                            </Label>
                                            <Input
                                                id="social_weibo"
                                                value={
                                                    socialForm.data.social_weibo
                                                }
                                                onChange={(e) =>
                                                    socialForm.setData(
                                                        'social_weibo',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="@用户名"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="social_qq">
                                                QQ
                                            </Label>
                                            <Input
                                                id="social_qq"
                                                value={
                                                    socialForm.data.social_qq
                                                }
                                                onChange={(e) =>
                                                    socialForm.setData(
                                                        'social_qq',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="QQ号码"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={socialForm.processing}
                                        >
                                            {socialForm.processing
                                                ? '保存中...'
                                                : '保存设置'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Plugin Sources Tab */}
                    <TabsContent value="plugins">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Globe className="h-5 w-5" />
                                            插件源管理
                                        </CardTitle>
                                        <CardDescription>
                                            配置第三方插件市场源，从中浏览和安装插件
                                        </CardDescription>
                                    </div>
                                    {!showAddForm && (
                                        <Button
                                            onClick={() => setShowAddForm(true)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            添加插件源
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
                                                ? '编辑插件源'
                                                : '添加新插件源'}
                                        </h3>
                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-4"
                                        >
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">
                                                        名称 *
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="例如：官方插件市场"
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
                                                        标识符 *
                                                    </Label>
                                                    <Input
                                                        id="slug"
                                                        value={data.slug}
                                                        onChange={(e) =>
                                                            setData(
                                                                'slug',
                                                                e.target.value,
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
                                                        API 地址 *
                                                    </Label>
                                                    <Input
                                                        id="url"
                                                        type="url"
                                                        value={data.url}
                                                        onChange={(e) =>
                                                            setData(
                                                                'url',
                                                                e.target.value,
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
                                                        API 密钥
                                                    </Label>
                                                    <Input
                                                        id="api_key"
                                                        type="password"
                                                        value={data.api_key}
                                                        onChange={(e) =>
                                                            setData(
                                                                'api_key',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="可选"
                                                    />
                                                    {errors.api_key && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.api_key}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="sort_order">
                                                        排序
                                                    </Label>
                                                    <Input
                                                        id="sort_order"
                                                        type="number"
                                                        min="0"
                                                        value={data.sort_order}
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
                                                        描述
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        value={data.description}
                                                        onChange={(e) =>
                                                            setData(
                                                                'description',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="插件源的描述信息"
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="flex items-center space-x-2 md:col-span-2">
                                                    <Switch
                                                        id="is_active"
                                                        checked={data.is_active}
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
                                                        启用此插件源
                                                    </Label>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    {processing
                                                        ? '保存中...'
                                                        : editingSource
                                                          ? '更新'
                                                          : '添加'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                    disabled={processing}
                                                >
                                                    取消
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
                                            <p>暂无插件源</p>
                                            <p className="text-sm">
                                                点击上方按钮添加插件源
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
                                                                ? 'bg-green-100 dark:bg-green-900/20'
                                                                : 'bg-gray-100 dark:bg-gray-800'
                                                        }`}
                                                    >
                                                        <Globe
                                                            className={`h-5 w-5 ${
                                                                source.is_active
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-gray-500'
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {source.name}
                                                            </span>
                                                            <Badge
                                                                variant={
                                                                    source.is_active
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                            >
                                                                {source.is_active
                                                                    ? '已启用'
                                                                    : '已停用'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {source.description ||
                                                                '无描述'}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            API: {source.url}
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
                                                        disabled={processing}
                                                    >
                                                        <Zap className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(source)
                                                        }
                                                        disabled={processing}
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
                                                        disabled={processing}
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
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
