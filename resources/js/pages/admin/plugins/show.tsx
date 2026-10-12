import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface PluginPermission {
    id: number;
    name: string;
    slug: string;
    description: string;
}

interface ConfigField {
    value: string | number | boolean;
    label: string;
    description: string;
    type: 'text' | 'number' | 'boolean';
}

interface Plugin {
    id: number;
    name: string;
    slug: string;
    version: string;
    description: string;
    author: string;
    status: 'installed' | 'enabled' | 'disabled';
    config: Record<string, any> | null;
    permissions: PluginPermission[];
    created_at: string;
    enabled_at: string | null;
}

interface PageProps {
    plugin: Plugin;
    configSchema: Record<string, ConfigField>;
}

export default function PluginShow({ plugin, configSchema }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.plugins'), href: '/admin/plugins' },
        { title: t('admin.plugins.configuration'), href: '#' },
    ];

    const statusConfig: Record<
        string,
        {
            label: string;
            variant:
                | 'default'
                | 'secondary'
                | 'destructive'
                | 'outline'
                | 'success'
                | 'warning';
        }
    > = {
        installed: {
            label: t('admin.plugins.status.installed'),
            variant: 'secondary',
        },
        enabled: {
            label: t('admin.plugins.status.enabled'),
            variant: 'success',
        },
        disabled: {
            label: t('admin.plugins.status.disabled'),
            variant: 'destructive',
        },
    };

    const hasConfig = configSchema && Object.keys(configSchema).length > 0;

    const initialConfig: Record<string, any> = {};
    if (hasConfig) {
        for (const [key, field] of Object.entries(configSchema)) {
            initialConfig[key] = field.value;
        }
    }

    const { data, setData, post, processing } = useForm({
        config: initialConfig,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/plugins/${plugin.id}/config`);
    };

    const config = statusConfig[plugin.status];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('admin.plugins.config_page_title', {
                    name: plugin.name,
                })}
            />

            <div className="mx-auto max-w-4xl space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/plugins">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={plugin.name}
                        description={plugin.description}
                    />
                </div>

                {/* Plugin Info */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{plugin.name}</CardTitle>
                                <CardDescription className="mt-2">
                                    {plugin.description}
                                </CardDescription>
                            </div>
                            <Badge variant={config.variant}>
                                {config.label}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t('admin.plugins.slug_label')}
                                </span>
                                <span className="font-mono">{plugin.slug}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t('admin.plugins.version')}
                                </span>
                                <span>v{plugin.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t('admin.plugins.author')}
                                </span>
                                <span>{plugin.author}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t('admin.plugins.installed_at')}
                                </span>
                                <span>
                                    {new Date(plugin.created_at).toLocaleString(
                                        'zh-CN',
                                    )}
                                </span>
                            </div>
                            {plugin.enabled_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('admin.plugins.enabled_at')}
                                    </span>
                                    <span>
                                        {new Date(
                                            plugin.enabled_at,
                                        ).toLocaleString('zh-CN')}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t('admin.plugins.permission_count')}
                                </span>
                                <span>{plugin.permissions.length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions */}
                {plugin.permissions.length > 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('admin.plugins.permissions')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.plugins.permissions_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {plugin.permissions.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className="rounded-lg border border-sidebar-border/70 p-3 dark:border-sidebar-border"
                                    >
                                        <div className="font-medium">
                                            {permission.name}
                                        </div>
                                        <div className="mt-1 font-mono text-sm text-muted-foreground">
                                            {permission.slug}
                                        </div>
                                        {permission.description && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {permission.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Configuration Form */}
                {hasConfig && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('admin.plugins.configuration')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.plugins.configuration_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {Object.entries(configSchema).map(
                                    ([key, field]) => (
                                        <div key={key} className="space-y-2">
                                            <Label htmlFor={key}>
                                                {field.label}
                                            </Label>
                                            {field.type === 'boolean' ? (
                                                <select
                                                    id={key}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={
                                                        data.config[key]
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                    onChange={(e) =>
                                                        setData('config', {
                                                            ...data.config,
                                                            [key]:
                                                                e.target
                                                                    .value ===
                                                                'true',
                                                        })
                                                    }
                                                >
                                                    <option value="false">
                                                        {t(
                                                            'admin.plugins.boolean_no',
                                                        )}
                                                    </option>
                                                    <option value="true">
                                                        {t(
                                                            'admin.plugins.boolean_yes',
                                                        )}
                                                    </option>
                                                </select>
                                            ) : field.type === 'number' ? (
                                                <Input
                                                    id={key}
                                                    type="number"
                                                    value={
                                                        data.config[key] ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        setData('config', {
                                                            ...data.config,
                                                            [key]:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <Input
                                                    id={key}
                                                    type="text"
                                                    value={
                                                        data.config[key] ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        setData('config', {
                                                            ...data.config,
                                                            [key]: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            )}
                                            {field.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {field.description}
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}

                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('admin.plugins.save_config')}
                                    </Button>
                                    <Button
                                        asChild
                                        type="button"
                                        variant="outline"
                                    >
                                        <Link href="/admin/plugins">
                                            {t('common.cancel')}
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
