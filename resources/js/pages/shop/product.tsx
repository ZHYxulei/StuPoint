import { Head, Link, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { ArrowLeft, Coins, Package, Star, ShoppingCart, MapPin, Phone, User } from 'lucide-react';
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

interface PageProps {
    product: Product;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shop',
        href: '/shop',
    },
    {
        title: 'Product',
        href: '',
    },
];

export default function ShopProduct({ product }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: product.id.toString(),
        shipping_info: {
            name: '',
            phone: '',
            address: '',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shop/orders', {
            onSuccess: () => reset(),
        });
    };

    const isOutOfStock = product.stock === 0;
    const isInfiniteStock = product.stock === -1;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="space-y-6 p-4">
                <Link href="/shop">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Shop
                    </Button>
                </Link>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Product Image */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        <div className="aspect-square bg-muted">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-32 w-32 text-muted-foreground opacity-20" />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h1 className="text-3xl font-bold">{product.name}</h1>
                                {product.is_third_party && (
                                    <Badge className="bg-primary/90 shrink-0">
                                        <Star className="h-3 w-3 mr-1" />
                                        Third Party
                                    </Badge>
                                )}
                            </div>
                            {product.category && (
                                <Badge variant="outline" className="mb-4">
                                    {product.category.name}
                                </Badge>
                            )}
                        </div>

                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5 text-primary" />
                                    {product.points_required.toLocaleString()} Points
                                </CardTitle>
                                <CardDescription>Required to exchange</CardDescription>
                            </CardHeader>
                        </Card>

                        {product.description && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="text-base">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="text-base">Stock Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isInfiniteStock ? (
                                    <p className="text-green-600 dark:text-green-400 font-medium">
                                        ✓ In Stock
                                    </p>
                                ) : isOutOfStock ? (
                                    <p className="text-red-600 dark:text-red-400 font-medium">
                                        × Out of Stock
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-green-600 dark:text-green-400 font-medium">
                                            ✓ In Stock ({product.stock} available)
                                        </p>
                                        {product.stock < 10 && (
                                            <p className="text-sm text-orange-600 dark:text-orange-400">
                                                Only {product.stock} left! Order soon.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Exchange Button */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="w-full"
                                    disabled={isOutOfStock}
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    {isOutOfStock ? 'Out of Stock' : 'Exchange Now'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Exchange Product</DialogTitle>
                                    <DialogDescription>
                                        Enter your shipping information to complete the exchange
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                            <Package className="h-10 w-10 text-muted-foreground" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {product.points_required.toLocaleString()} points
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            <User className="h-4 w-4 inline mr-1" />
                                            Recipient Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.shipping_info.name}
                                            onChange={(e) => setData('shipping_info', { ...data.shipping_info, name: e.target.value })}
                                            placeholder="Enter recipient name"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            <Phone className="h-4 w-4 inline mr-1" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.shipping_info.phone}
                                            onChange={(e) => setData('shipping_info', { ...data.shipping_info, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                            required
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">
                                            <MapPin className="h-4 w-4 inline mr-1" />
                                            Delivery Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={data.shipping_info.address}
                                            onChange={(e) => setData('shipping_info', { ...data.shipping_info, address: e.target.value })}
                                            placeholder="Enter complete delivery address"
                                            rows={3}
                                            required
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline" className="flex-1">
                                                Cancel
                                            </Button>
                                        </DialogTrigger>
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            {processing ? 'Processing...' : 'Confirm Exchange'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
