import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Puzzle,
    Download,
    Power,
    PowerOff,
    Trash2,
    Settings,
    Upload,
    Package,
    X,
    FileArchive,
    Search,
    Plus,
    Globe,
    ExternalLink,
    Star,
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
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

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
    github_url: string | null;
    github_stars: number | null;
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

export default function PluginIndex({ plugins, pluginSources }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.plugins'), href: '/admin/plugins' },
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
            icon: any;
        }
    > = {
        installed: {
            label: t('admin.plugins.status.installed'),
            variant: 'secondary',
            icon: Settings,
        },
        enabled: {
            label: t('admin.plugins.status.enabled'),
            variant: 'success',
            icon: Power,
        },
        disabled: {
            label: t('admin.plugins.status.disabled'),
            variant: 'destructive',
            icon: PowerOff,
        },
    };

    const { post, processing, setData } = useForm({});
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [marketplacePlugins, setMarketplacePlugins] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const installPlugin = (slug: string) => {
        router.post(
            '/admin/plugins/install',
            {
                slug,
            },
            {
                onSuccess: () => window.location.reload(),
            },
        );
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();

        if (!uploadFile) {
            return;
        }

        const formData = new FormData();
        formData.append('plugin', uploadFile);

        fetch('/admin/plugins/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert(t('admin.plugins.upload_success'));
                    window.location.reload();
                } else {
                    alert(data.message || t('admin.plugins.upload_failed'));
                }
            })
            .catch((error) => {
                console.error('Upload error:', error);
                alert(
                    t('admin.plugins.upload_failed_detail', {
                        error: error.message,
                    }),
                );
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
        if (!searchQuery.trim()) {
            return;
        }

        setSearching(true);
        try {
            const response = await fetch('/admin/plugins/marketplace/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({ query: searchQuery }),
            });
            const data = await response.json();
            setMarketplacePlugins(data.plugins || []);
        } catch (error) {
            console.error('Search error:', error);
            alert(
                t('admin.plugins.search_failed_detail', {
                    error:
                        error instanceof Error ? error.message : String(error),
                }),
            );
        } finally {
            setSearching(false);
        }
    };

    const filteredPlugins = plugins.filter(
        (plugin) =>
            plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plugin.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plugin.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('nav.plugins')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('nav.plugins')}
                        description={t('admin.plugins.description')}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowSourceForm(!showSourceForm)}
                        >
                            <Globe className="mr-2 h-4 w-4" />
                            {t('admin.plugins.sources')}
                        </Button>
                        <Button
                            onClick={() => setShowUploadForm(!showUploadForm)}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {t('admin.plugins.upload')}
                        </Button>
                    </div>
                </div>

                {/* Plugin Sources Form */}
                {showSourceForm && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>
                                        {t('admin.plugins.source_settings')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'admin.plugins.source_settings_description',
                                        )}
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
                                {pluginSources.map((source) => (
                                    <div
                                        key={source.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">
                                                    {source.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {source.url}
                                                </p>
                                            </div>
                                            {source.is_active && (
                                                <Badge
                                                    variant="success"
                                                    className="ml-2"
                                                >
                                                    {t('admin.plugins.active')}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/admin/settings#plugin-sources">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('admin.plugins.add_source')}
                                    </Link>
                                </Button>
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
                                    <CardTitle>
                                        {t('admin.plugins.upload')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('admin.plugins.upload_description')}
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
                                    className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                        dragActive
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <FileArchive className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        {t('admin.plugins.drop_hint')}
                                    </p>
                                    <Label
                                        htmlFor="file-upload"
                                        className="cursor-pointer"
                                    >
                                        <span className="text-primary hover:underline">
                                            {t('admin.plugins.click_to_select')}
                                        </span>
                                    </Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept=".zip"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {t('admin.plugins.max_size')}
                                    </p>
                                </div>

                                {/* Selected File */}
                                {uploadFile && (
                                    <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {uploadFile.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {(
                                                    uploadFile.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{' '}
                                                MB
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
                                    <h4 className="mb-2 font-semibold">
                                        {t('admin.plugins.package_requirements')}
                                    </h4>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            <span>{t('admin.plugins.req_zip')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            <span>
                                                {t('admin.plugins.req_config')}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            <span>
                                                {t(
                                                    'admin.plugins.req_dependencies',
                                                )}
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!uploadFile || processing}
                                    className="w-full"
                                >
                                    {processing
                                        ? t('admin.plugins.uploading')
                                        : t('admin.plugins.start_upload')}
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
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder={t(
                                            'admin.plugins.search_installed_placeholder',
                                        )}
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={searchMarketplace}
                                    disabled={searching}
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    {searching
                                        ? t('admin.plugins.searching')
                                        : t(
                                              'admin.plugins.search_marketplace',
                                          )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Installed Plugins */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>
                                {t('admin.plugins.installed_plugins')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.plugins.count', {
                                    count: filteredPlugins.length,
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredPlugins.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Puzzle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                    <p>{t('admin.plugins.empty_installed')}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredPlugins.map((plugin) => {
                                        const config =
                                            statusConfig[plugin.status];
                                        return (
                                            <div
                                                key={plugin.id}
                                                className={`flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border ${plugin.github_url ? 'cursor-pointer' : ''}`}
                                                onClick={
                                                    plugin.github_url
                                                        ? () =>
                                                              window.open(
                                                                  plugin.github_url!,
                                                                  '_blank',
                                                              )
                                                        : undefined
                                                }
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <h3 className="truncate font-semibold">
                                                            {plugin.name}
                                                        </h3>
                                                        <Badge
                                                            variant={
                                                                config.variant
                                                            }
                                                        >
                                                            <config.icon className="mr-1 h-3 w-3" />
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="mb-1 line-clamp-1 text-sm text-muted-foreground">
                                                        {plugin.description ||
                                                            t(
                                                                'admin.plugins.no_description',
                                                            )}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span>
                                                            v{plugin.version}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {plugin.author}
                                                        </span>
                                                        {plugin.github_stars !==
                                                            null &&
                                                            plugin.github_stars !==
                                                                undefined && (
                                                                <>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Star className="h-3 w-3" />
                                                                        {
                                                                            plugin.github_stars
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                    </div>
                                                    {plugin.permissions_count >
                                                        0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {t(
                                                                'admin.plugins.permissions_count',
                                                                {
                                                                    count: plugin.permissions_count,
                                                                },
                                                            )}
                                                        </p>
                                                    )}
                                                    {plugin.github_url && (
                                                        <a
                                                            href={
                                                                plugin.github_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                                        >
                                                            <svg
                                                                className="h-3 w-3"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.303 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                            </svg>
                                                            {plugin.github_url.replace(
                                                                'https://github.com/',
                                                                '',
                                                            )}
                                                        </a>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    {plugin.status ===
                                                        'installed' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                installPlugin(
                                                                    plugin.slug,
                                                                );
                                                            }}
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <Download className="mr-1 h-4 w-4" />
                                                            {t(
                                                                'admin.plugins.enable',
                                                            )}
                                                        </Button>
                                                    )}
                                                    {plugin.status ===
                                                        'enabled' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    if (
                                                                        confirm(
                                                                            t(
                                                                                'admin.plugins.confirm_disable',
                                                                                {
                                                                                    name: plugin.name,
                                                                                },
                                                                            ),
                                                                        )
                                                                    ) {
                                                                        post(
                                                                            `/admin/plugins/${plugin.id}/disable`,
                                                                            {
                                                                                onSuccess:
                                                                                    () =>
                                                                                        window.location.reload(),
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                <PowerOff className="mr-1 h-4 w-4" />
                                                                {t(
                                                                    'admin.plugins.disable',
                                                                )}
                                                            </Button>
                                                            <a
                                                                href={`/admin/plugins/${plugin.id}`}
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                >
                                                                    <Settings className="mr-1 h-4 w-4" />
                                                                    {t(
                                                                        'admin.plugins.settings',
                                                                    )}
                                                                </Button>
                                                            </a>
                                                        </>
                                                    )}
                                                    {plugin.status ===
                                                        'disabled' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        t(
                                                                            'admin.plugins.confirm_enable',
                                                                            {
                                                                                name: plugin.name,
                                                                            },
                                                                        ),
                                                                    )
                                                                ) {
                                                                    post(
                                                                        `/admin/plugins/${plugin.id}/enable`,
                                                                        {
                                                                            onSuccess:
                                                                                () =>
                                                                                    window.location.reload(),
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <Power className="mr-1 h-4 w-4" />
                                                            {t(
                                                                'admin.plugins.enable',
                                                            )}
                                                        </Button>
                                                    )}
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
                                    {t('admin.plugins.marketplace')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin.plugins.marketplace_description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {marketplacePlugins.map((plugin) => (
                                        <div
                                            key={plugin.slug}
                                            className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <h3 className="truncate font-semibold">
                                                        {plugin.name}
                                                    </h3>
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <p className="mb-1 line-clamp-1 text-sm text-muted-foreground">
                                                    {plugin.description ||
                                                        t(
                                                            'admin.plugins.no_description',
                                                        )}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>
                                                        v{plugin.version}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{plugin.author}</span>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        plugin.url,
                                                        '_blank',
                                                    )
                                                }
                                            >
                                                <Download className="mr-1 h-4 w-4" />
                                                {t('common.view')}
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
