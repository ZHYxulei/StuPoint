import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Edit, Trash2, Globe, Check, X, Link as LinkIcon, Zap } from 'lucide-react';
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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '系统设置', href: '/admin/settings' },
];

export default function SystemSettings({ pluginSources }: PageProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSource, setEditingSource] = useState<PluginSource | null>(null);

    const { post, put, delete: destroy, processing, reset, setData, data, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        url: '',
        api_key: '',
        is_active: true,
        sort_order: 0,
    });

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

                {/* Plugin Sources Section */}
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
                                <Button onClick={() => setShowAddForm(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    添加插件源
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add/Edit Form */}
                        {showAddForm && (
                            <div className="border border-sidebar-border/70 dark:border-sidebar-border rounded-lg p-4 bg-muted/50">
                                <h3 className="font-semibold mb-4">
                                    {editingSource ? '编辑插件源' : '添加新插件源'}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">名称 *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="例如：官方插件市场"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="slug">标识符 *</Label>
                                            <Input
                                                id="slug"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                placeholder="official-market"
                                                pattern="[a-z0-9-]+"
                                                required
                                            />
                                            {errors.slug && (
                                                <p className="text-sm text-destructive">{errors.slug}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="url">API 地址 *</Label>
                                            <Input
                                                id="url"
                                                type="url"
                                                value={data.url}
                                                onChange={(e) => setData('url', e.target.value)}
                                                placeholder="https://api.example.com/plugins"
                                                required
                                            />
                                            {errors.url && (
                                                <p className="text-sm text-destructive">{errors.url}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="api_key">API 密钥</Label>
                                            <Input
                                                id="api_key"
                                                type="password"
                                                value={data.api_key}
                                                onChange={(e) => setData('api_key', e.target.value)}
                                                placeholder="可选"
                                            />
                                            {errors.api_key && (
                                                <p className="text-sm text-destructive">{errors.api_key}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="sort_order">排序</Label>
                                            <Input
                                                id="sort_order"
                                                type="number"
                                                min="0"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="description">描述</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="插件源的描述信息"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2 md:col-span-2">
                                            <Switch
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                            <Label htmlFor="is_active">启用此插件源</Label>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? '保存中...' : editingSource ? '更新' : '添加'}
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
                                <div className="text-center py-12 text-muted-foreground">
                                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>暂无插件源</p>
                                    <p className="text-sm">点击上方按钮添加插件源</p>
                                </div>
                            ) : (
                                pluginSources.map((source) => (
                                    <div
                                        key={source.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                source.is_active
                                                    ? 'bg-green-100 dark:bg-green-900/20'
                                                    : 'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                                <Globe className={`h-5 w-5 ${
                                                    source.is_active
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-gray-500'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{source.name}</span>
                                                    <Badge variant={source.is_active ? 'default' : 'secondary'}>
                                                        {source.is_active ? '已启用' : '已停用'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {source.description || '无描述'}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    API: {source.url}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTest(source.id)}
                                                disabled={processing}
                                            >
                                                <Zap className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(source)}
                                                disabled={processing}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(source.id)}
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

                {/* Other Settings */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            其他系统设置
                        </CardTitle>
                        <CardDescription>
                            更多系统配置选项即将推出
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>更多设置功能正在开发中</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
