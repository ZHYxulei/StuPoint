import { Head, Link, router, useForm } from '@inertiajs/react';
import { Package, Search, Coins, ShoppingCart, Star } from 'lucide-react';
import Heading from '@/components/heading';
import PaginationBar from '@/components/pagination-bar';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface ProductCategory {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    points_required: number;
    stock: number;
    category: ProductCategory | null;
    is_third_party: boolean;
}

interface Paginator {
    data: Product[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PageProps {
    products: Paginator;
    categories: ProductCategory[];
    filters: {
        category?: string;
        search?: string;
    };
}

export default function ShopIndex({
    products,
    categories,
    filters,
}: PageProps) {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('shop.title'),
            href: '/shop',
        },
    ];

    const { get, processing } = useForm({
        category: filters.category || 'all',
        search: filters.search || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/shop', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('shop.title')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('shop.title')}
                        description={t('shop.exchange_redeemable_points')}
                    />
                    <Button asChild variant="outline" size="sm">
                        <Link href="/shop/orders">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {t('shop.my_orders')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Search className="h-4 w-4" />
                            {t('shop.search_products')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-3"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="search">
                                    {t('common.search')}
                                </Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder={t('shop.search_placeholder')}
                                    value={filters.search || ''}
                                    onChange={(e) =>
                                        router.get(
                                            '/shop',
                                            {
                                                ...filters,
                                                search: e.target.value || null,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">
                                    {t('shop.category')}
                                </Label>
                                <Select
                                    value={filters.category || 'all'}
                                    onValueChange={(value) =>
                                        router.get(
                                            '/shop',
                                            {
                                                ...filters,
                                                category:
                                                    value === 'all'
                                                        ? null
                                                        : value,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue
                                            placeholder={t(
                                                'shop.all_categories',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('shop.all_categories')}
                                        </SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    {t('common.search')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Products Grid */}
                {products.data.length === 0 ? (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="py-12 text-center">
                            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
                            <p className="text-lg font-medium text-muted-foreground">
                                {t('errors.no_products_found')}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('errors.try_adjusting_filters')}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.data.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group overflow-hidden border-sidebar-border/70 transition-shadow hover:shadow-lg dark:border-sidebar-border"
                                >
                                    <Link href={`/shop/product/${product.id}`}>
                                        <div className="relative aspect-square overflow-hidden bg-muted">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-16 w-16 text-muted-foreground opacity-20" />
                                                </div>
                                            )}
                                            {product.is_third_party && (
                                                <Badge className="absolute top-2 right-2 bg-primary/90">
                                                    <Star className="mr-1 h-3 w-3" />
                                                    {t('shop.third_party')}
                                                </Badge>
                                            )}
                                            {product.stock === 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute top-2 left-2"
                                                >
                                                    {t('shop.out_of_stock')}
                                                </Badge>
                                            )}
                                        </div>
                                    </Link>
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1 text-base">
                                            <Link
                                                href={`/shop/product/${product.id}`}
                                                className="transition-colors hover:text-primary"
                                            >
                                                {product.name}
                                            </Link>
                                        </CardTitle>
                                        {product.category && (
                                            <Badge
                                                variant="outline"
                                                className="w-fit text-xs"
                                            >
                                                {product.category.name}
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-3 line-clamp-2 h-10">
                                            {product.description ||
                                                t('shop.no_description')}
                                        </CardDescription>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 font-semibold text-primary">
                                                <Coins className="h-4 w-4" />
                                                {formatNumber(
                                                    product.points_required,
                                                )}
                                            </div>
                                            <Button
                                                asChild
                                                size="sm"
                                                disabled={product.stock === 0}
                                            >
                                                <Link
                                                    href={`/shop/product/${product.id}`}
                                                >
                                                    {product.stock === 0
                                                        ? t('shop.unavailable')
                                                        : t('common.view')}
                                                </Link>
                                            </Button>
                                        </div>
                                        {product.stock > 0 &&
                                            product.stock < 10 && (
                                                <p className="mt-2 text-xs text-warning">
                                                    {t('shop.only_x_left', {
                                                        count: product.stock,
                                                    })}
                                                </p>
                                            )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <PaginationBar links={products.links} />
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
