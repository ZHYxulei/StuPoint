import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Package, TrendingUp, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface ProductCategory {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    points_required: number;
    stock: number;
    status: string;
    category: ProductCategory | null;
    orders_count: number;
}

interface Stats {
    total: number;
    active: number;
    out_of_stock: number;
    total_exchanges: number;
}

interface Paginator {
    data: Product[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface PageProps {
    products: Paginator;
    categories: ProductCategory[];
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        category?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '商品管理', href: '/admin/products' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    active: { label: '上架', variant: 'success' },
    inactive: { label: '下架', variant: 'secondary' },
    out_of_stock: { label: '缺货', variant: 'destructive' },
};

export default function ProductIndex({ products, categories, stats, filters }: PageProps) {
    const { get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
        category: filters.category || 'all',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/products', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="商品管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="商品管理"
                        description="管理商城商品和库存"
                    />
                    <Link href="/admin/products/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            添加商品
                        </Button>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">商品总数</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">上架商品</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">缺货商品</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.out_of_stock}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">总兑换次数</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_exchanges}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            筛选商品
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="search">搜索</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="商品名称..."
                                    value={filters.search || ''}
                                    onChange={(e) => get('/admin/products', {
                                        data: { ...filters, search: e.target.value || null },
                                        preserveScroll: true,
                                    })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">状态</Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => get('/admin/products', {
                                        data: { ...filters, status: value === 'all' ? null : value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="所有状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">所有状态</SelectItem>
                                        <SelectItem value="active">上架</SelectItem>
                                        <SelectItem value="inactive">下架</SelectItem>
                                        <SelectItem value="out_of_stock">缺货</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">分类</Label>
                                <Select
                                    value={filters.category || 'all'}
                                    onValueChange={(value) => get('/admin/products', {
                                        data: { ...filters, category: value === 'all' ? null : value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="所有分类" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">所有分类</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Products List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>商品列表</CardTitle>
                        <CardDescription>
                            显示 {products.from} 到 {products.to}，共 {products.total} 件商品
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {products.data.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-4 p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold truncate">{product.name}</p>
                                            <Badge variant={statusConfig[product.status].variant}>
                                                {statusConfig[product.status].label}
                                            </Badge>
                                        </div>
                                        {product.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                                                {product.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>积分: {product.points_required.toLocaleString()}</span>
                                            <span>•</span>
                                            <span>库存: {product.stock === -1 ? '无限' : product.stock}</span>
                                            <span>•</span>
                                            <span>兑换: {product.orders_count}次</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`确定要删除商品 "${product.name}" 吗？`)) {
                                                    // Use a form submission for DELETE
                                                    const form = document.createElement('form');
                                                    form.method = 'POST';
                                                    form.action = `/admin/products/${product.id}`;
                                                    const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                                                    if (csrfToken) {
                                                        const input = document.createElement('input');
                                                        input.name = '_token';
                                                        input.value = csrfToken;
                                                        form.appendChild(input);
                                                    }
                                                    const methodInput = document.createElement('input');
                                                    methodInput.name = '_method';
                                                    methodInput.value = 'DELETE';
                                                    form.appendChild(methodInput);
                                                    document.body.appendChild(form);
                                                    form.submit();
                                                }
                                            }}
                                            className="hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {products.links.map((link, index) => (
                                    <button
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        onClick={() => {
                                            if (link.url) {
                                                window.location.href = link.url;
                                            }
                                        }}
                                        disabled={!link.url || processing}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted hover:bg-muted/80'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
