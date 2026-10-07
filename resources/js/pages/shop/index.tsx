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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shop',
        href: '/shop',
    },
];

export default function ShopIndex({
    products,
    categories,
    filters,
}: PageProps) {
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
            <Head title="Shop" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Shop"
                        description="Exchange your redeemable points for rewards"
                    />
                    <Button asChild variant="outline" size="sm">
                        <Link href="/shop/orders">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            My Orders
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Search className="h-4 w-4" />
                            Search Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-3"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search products..."
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
                                <Label htmlFor="category">Category</Label>
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
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All categories
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
                                    Search
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
                                No products found
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try adjusting your search or filters
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
                                                    Third Party
                                                </Badge>
                                            )}
                                            {product.stock === 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute top-2 left-2"
                                                >
                                                    Out of Stock
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
                                                'No description available'}
                                        </CardDescription>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 font-semibold text-primary">
                                                <Coins className="h-4 w-4" />
                                                {product.points_required.toLocaleString()}
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
                                                        ? 'Unavailable'
                                                        : 'View'}
                                                </Link>
                                            </Button>
                                        </div>
                                        {product.stock > 0 &&
                                            product.stock < 10 && (
                                                <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                                                    Only {product.stock} left!
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
