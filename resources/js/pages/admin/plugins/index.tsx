import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Puzzle, Download, Power, PowerOff, Trash2, Settings, Upload, Package, X, FileArchive, Search, Plus, Globe, ExternalLink } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Plugin {
    id: number;
    name: string;
    slug: string;
    version: string;
    description: string;
    author: string;
    status: 'installed' | 'enabled' | 'disabled';
    config: Record<string, any> | null;
    permissions_count: number;
    created_at: string;
    enabled_at: string | null;
}

interface PluginSource {
    id: number;
    name: string;
    slug: string;
    url: string;
    is_active: boolean;
    sort_order: number;
}

interface PageProps {
    plugins: Plugin[];
    pluginSources: PluginSource[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '插件管理', href: '/admin/plugins' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; icon: any }> = {
    installed: {
        label: '已安装',
        variant: 'secondary',
        icon: Settings,
    },
    enabled: {
        label: '已启用',
        variant: 'success',
        icon: Power,
    },
    disabled: {
        label: '已禁用',
        variant: 'destructive',
        icon: PowerOff,
    },
};

export default function PluginIndex({ plugins, pluginSources }: PageProps) {
    const { post, processing, setData } = useForm({});
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [marketplacePlugins, setMarketplacePlugins] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const installPlugin = (slug: string) => {
        post('/admin/plugins/install', {
            data: { slug },
            onSuccess: () => window.location.reload(),
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();

        if (! uploadFile) {
            return;
        }

        const formData = new FormData();
        formData.append('plugin', uploadFile);

        fetch('/admin/plugins/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('插件上传成功');
                    window.location.reload();
                } else {
                    alert(data.message || '上传失败');
                }
            })
            .catch(error => {
                console.error('Upload error:', error);
                alert('上传失败: ' + error.message);
            });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.name.endsWith('.zip')) {
            setUploadFile(file);
        }
    };

    const searchMarketplace = async () => {
        if (! searchQuery.trim()) {
            return;
        }

        setSearching(true);
        try {
            const response = await fetch('/admin/plugins/marketplace/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ query: searchQuery }),
            });
            const data = await response.json();
            setMarketplacePlugins(data.plugins || []);
        } catch (error) {
            console.error('Search error:', error);
            alert('搜索失败: ' + error.message);
        } finally {
            setSearching(false);
        }
    };

    const filteredPlugins = plugins.filter(plugin =>
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="插件管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="插件管理"
                        description="管理系统插件和扩展功能"
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowSourceForm(!showSourceForm)}>
                            <Globe className="mr-2 h-4 w-4" />
                            插件源
                        </Button>
                        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
                            <Upload className="mr-2 h-4 w-4" />
                            上传插件
                        </Button>
                    </div>
                </div>

                {/* Plugin Sources Form */}
                {showSourceForm && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>插件源设置</CardTitle>
                                    <CardDescription>
                                        管理插件市场源，用于浏览和安装远程插件
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSourceForm(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pluginSources.map(source => (
                                    <div key={source.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{source.name}</p>
                                                <p className="text-xs text-muted-foreground">{source.url}</p>
                                            </div>
                                            {source.is_active && (
                                                <Badge variant="success" className="ml-2">活跃</Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Link href="/admin/settings#plugin-sources">
                                    <Button variant="outline" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        添加插件源
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Upload Form */}
                {showUploadForm && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>上传插件</CardTitle>
                                    <CardDescription>
                                        上传 ZIP 格式的插件包，系统会自动解压并安装
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setUploadFile(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                {/* Drag & Drop Zone */}
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                        dragActive
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <FileArchive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-2">
                                        拖拽 ZIP 文件到这里，或
                                    </p>
                                    <Label htmlFor="file-upload" className="cursor-pointer">
                                        <span className="text-primary hover:underline">点击选择文件</span>
                                    </Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept=".zip"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        最大 50MB
                                    </p>
                                </div>

                                {/* Selected File */}
                                {uploadFile && (
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            <span className="text-sm font-medium">{uploadFile.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setUploadFile(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Plugin Info */}
                                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                                    <h4 className="font-semibold mb-2">插件包要求：</h4>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>ZIP 格式压缩包</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>包含 plugin.json 配置文件</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>声明依赖项（如有）</span>
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={! uploadFile || processing}
                                    className="w-full"
                                >
                                    {processing ? '上传中...' : '开始上传'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {/* Search Bar */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="pt-6">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="搜索已安装插件..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={searchMarketplace}
                                    disabled={searching}
                                >
                                    <Globe className="h-4 w-4 mr-2" />
                                    {searching ? '搜索中...' : '搜索插件市场'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Installed Plugins */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>已安装插件</CardTitle>
                            <CardDescription>
                                共 {filteredPlugins.length} 个插件
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredPlugins.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Puzzle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>暂无已安装的插件</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredPlugins.map((plugin) => {
                                        const config = statusConfig[plugin.status];
                                        return (
                                            <div
                                                key={plugin.id}
                                                className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold truncate">{plugin.name}</h3>
                                                        <Badge variant={config.variant}>
                                                            <config.icon className="h-3 w-3 mr-1" />
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                                                        {plugin.description || '无描述'}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span>v{plugin.version}</span>
                                                        <span>•</span>
                                                        <span>{plugin.author}</span>
                                                    </div>
                                                    {plugin.permissions_count > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {plugin.permissions_count} 个权限
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    {plugin.status === 'installed' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => installPlugin(plugin.slug)}
                                                            disabled={processing}
                                                        >
                                                            <Download className="h-4 w-4 mr-1" />
                                                            启用
                                                        </Button>
                                                    )}
                                                    {plugin.status === 'enabled' && (
                                                        <Link href={`/admin/plugins/${plugin.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                <Settings className="h-4 w-4 mr-1" />
                                                                配置
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {plugin.status === 'disabled' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm(`确定要重新启用插件 "${plugin.name}" 吗？`)) {
                                                                    post(`/admin/plugins/${plugin.id}/enable`, {
                                                                        onSuccess: () => window.location.reload(),
                                                                    });
                                                                }
                                                            }}
                                                            disabled={processing}
                                                        >
                                                            <Power className="h-4 w-4 mr-1" />
                                                            启用
                                                        </Button>
                                                    )}
                                                    <Link href={`/admin/plugins/${plugin.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Plugin Market */}
                    {marketplacePlugins.length > 0 && (
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    插件市场
                                </CardTitle>
                                <CardDescription>
                                    从远程插件源浏览和安装插件
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {marketplacePlugins.map((plugin) => (
                                        <div
                                            key={plugin.slug}
                                            className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold truncate">{plugin.name}</h3>
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                                                    {plugin.description || '无描述'}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>v{plugin.version}</span>
                                                    <span>•</span>
                                                    <span>{plugin.author}</span>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() => window.open(plugin.url, '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                查看
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
