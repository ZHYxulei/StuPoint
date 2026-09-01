import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '插件管理', href: '/admin/plugins' },
    { title: '插件配置', href: '#' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    installed: { label: '已安装', variant: 'secondary' },
    enabled: { label: '已启用', variant: 'success' },
    disabled: { label: '已禁用', variant: 'destructive' },
};

export default function PluginShow({ plugin, configSchema }: PageProps) {
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
            <Head title={`${plugin.name} 配置`} />

            <div className="space-y-6 p-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/admin/plugins">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
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
                                <CardDescription className="mt-2">{plugin.description}</CardDescription>
                            </div>
                            <Badge variant={config.variant}>{config.label}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">标识符</span>
                                <span className="font-mono">{plugin.slug}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">版本</span>
                                <span>v{plugin.version}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">作者</span>
                                <span>{plugin.author}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">安装时间</span>
                                <span>{new Date(plugin.created_at).toLocaleString('zh-CN')}</span>
                            </div>
                            {plugin.enabled_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">启用时间</span>
                                    <span>{new Date(plugin.enabled_at).toLocaleString('zh-CN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">权限数量</span>
                                <span>{plugin.permissions.length}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions */}
                {plugin.permissions.length > 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">插件权限</CardTitle>
                            <CardDescription>此插件提供的权限列表</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {plugin.permissions.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className="p-3 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border"
                                    >
                                        <div className="font-medium">{permission.name}</div>
                                        <div className="text-sm text-muted-foreground font-mono mt-1">
                                            {permission.slug}
                                        </div>
                                        {permission.description && (
                                            <div className="text-xs text-muted-foreground mt-1">
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
                            <CardTitle className="text-base">插件配置</CardTitle>
                            <CardDescription>配置插件参数和设置</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {Object.entries(configSchema).map(([key, field]) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key}>{field.label}</Label>
                                        {field.type === 'boolean' ? (
                                            <select
                                                id={key}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={data.config[key] ? 'true' : 'false'}
                                                onChange={(e) => setData('config', { ...data.config, [key]: e.target.value === 'true' })}
                                            >
                                                <option value="false">否</option>
                                                <option value="true">是</option>
                                            </select>
                                        ) : field.type === 'number' ? (
                                            <Input
                                                id={key}
                                                type="number"
                                                value={data.config[key] ?? ''}
                                                onChange={(e) => setData('config', { ...data.config, [key]: parseInt(e.target.value) || 0 })}
                                            />
                                        ) : (
                                            <Input
                                                id={key}
                                                type="text"
                                                value={data.config[key] ?? ''}
                                                onChange={(e) => setData('config', { ...data.config, [key]: e.target.value })}
                                            />
                                        )}
                                        {field.description && (
                                            <p className="text-xs text-muted-foreground">{field.description}</p>
                                        )}
                                    </div>
                                ))}

                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        保存配置
                                    </Button>
                                    <Link href="/admin/plugins">
                                        <Button type="button" variant="outline">
                                            取消
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
