import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PluginPermission {
    id: number;
    name: string;
    slug: string;
    description: string;
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

export default function PluginShow({ plugin }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        config: plugin.config || {},
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
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base">插件配置</CardTitle>
                        <CardDescription>配置插件参数和设置</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {plugin.slug === 'student_council' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="max_activities">活动数量限制</Label>
                                        <Input
                                            id="max_activities"
                                            type="number"
                                            value={data.config.max_activities || ''}
                                            onChange={(e) => setData('config', { ...data.config, max_activities: parseInt(e.target.value) || 0 })}
                                            placeholder="0表示无限制"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            设置同时可进行的最大活动数量，0表示无限制
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_participants_per_activity">单次活动参与人数上限</Label>
                                        <Input
                                            id="max_participants_per_activity"
                                            type="number"
                                            value={data.config.max_participants_per_activity || ''}
                                            onChange={(e) => setData('config', { ...data.config, max_participants_per_activity: parseInt(e.target.value) || 0 })}
                                            placeholder="0表示无限制"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            单个活动可参与的最大人数，0表示无限制
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="auto_approve_activities">自动批准活动</Label>
                                        <select
                                            id="auto_approve_activities"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.config.auto_approve_activities ? 'true' : 'false'}
                                            onChange={(e) => setData('config', { ...data.config, auto_approve_activities: e.target.value === 'true' })}
                                        >
                                            <option value="false">否 - 需要管理员审核</option>
                                            <option value="true">是 - 自动批准</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            创建的活动是否需要管理员审核后才能发布
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="default_points_reward">默认积分奖励</Label>
                                        <Input
                                            id="default_points_reward"
                                            type="number"
                                            min="0"
                                            value={data.config.default_points_reward || ''}
                                            onChange={(e) => setData('config', { ...data.config, default_points_reward: parseInt(e.target.value) || 0 })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            创建活动时的默认积分奖励
                                        </p>
                                    </div>
                                </>
                            )}

                            {plugin.slug !== 'student_council' && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>此插件暂无可配置项</p>
                                </div>
                            )}

                            {plugin.slug === 'student_council' && (
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
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
