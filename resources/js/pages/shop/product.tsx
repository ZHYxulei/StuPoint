import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Coins,
    Package,
    Star,
    ShoppingCart,
    MapPin,
    Phone,
    User,
} from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface PageProps {
    product: Product;
}

export default function ShopProduct({ product }: PageProps) {
    // Built in the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('shop.title'),
            href: '/shop',
        },
        {
            title: t('shop.product'),
            href: '',
        },
    ];

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
                <Button asChild variant="ghost" size="sm">
                    <Link href="/shop">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('shop.back_to_shop')}
                    </Link>
                </Button>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Product Image */}
                    <Card className="overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="aspect-square bg-muted">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <Package className="h-32 w-32 text-muted-foreground opacity-20" />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="mb-2 flex items-start justify-between gap-4">
                                <h1 className="text-3xl font-bold">
                                    {product.name}
                                </h1>
                                {product.is_third_party && (
                                    <Badge className="shrink-0 bg-primary/90">
                                        <Star className="mr-1 h-3 w-3" />
                                        {t('shop.third_party')}
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
                                    {formatNumber(product.points_required)}{' '}
                                    {t('points.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t('shop.required_to_exchange')}
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {product.description && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {t('common.description')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-muted-foreground">
                                        {product.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {t('shop.stock_information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isInfiniteStock ? (
                                    <p className="font-medium text-success">
                                        ✓ {t('shop.in_stock')}
                                    </p>
                                ) : isOutOfStock ? (
                                    <p className="font-medium text-destructive">
                                        × {t('shop.out_of_stock')}
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="font-medium text-success">
                                            ✓{' '}
                                            {t('shop.in_stock_count', {
                                                count: product.stock,
                                            })}
                                        </p>
                                        {product.stock < 10 && (
                                            <p className="text-sm text-warning">
                                                {t(
                                                    'shop.only_x_left_order_soon',
                                                    { count: product.stock },
                                                )}
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
                                    {isOutOfStock
                                        ? t('shop.out_of_stock')
                                        : t('shop.exchange_now')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {t('shop.exchange_product')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('shop.enter_shipping_info')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                                            <Package className="h-10 w-10 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatNumber(
                                                        product.points_required,
                                                    )}{' '}
                                                    {t('points.title')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            <User className="mr-1 inline h-4 w-4" />
                                            {t('shop.recipient_name')}
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.shipping_info.name}
                                            onChange={(e) =>
                                                setData('shipping_info', {
                                                    ...data.shipping_info,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder={t(
                                                'shop.enter_recipient_name',
                                            )}
                                            required
                                        />
                                        {errors['shipping_info.name'] && (
                                            <p className="text-sm text-destructive">
                                                {errors['shipping_info.name']}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            <Phone className="mr-1 inline h-4 w-4" />
                                            {t('shop.phone_number')}
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.shipping_info.phone}
                                            onChange={(e) =>
                                                setData('shipping_info', {
                                                    ...data.shipping_info,
                                                    phone: e.target.value,
                                                })
                                            }
                                            placeholder={t(
                                                'shop.enter_phone_number',
                                            )}
                                            required
                                        />
                                        {errors['shipping_info.phone'] && (
                                            <p className="text-sm text-destructive">
                                                {errors['shipping_info.phone']}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">
                                            <MapPin className="mr-1 inline h-4 w-4" />
                                            {t('shop.delivery_address')}
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={data.shipping_info.address}
                                            onChange={(e) =>
                                                setData('shipping_info', {
                                                    ...data.shipping_info,
                                                    address: e.target.value,
                                                })
                                            }
                                            placeholder={t(
                                                'shop.enter_complete_address',
                                            )}
                                            rows={3}
                                            required
                                        />
                                        {errors['shipping_info.address'] && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    errors[
                                                        'shipping_info.address'
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                        </DialogTrigger>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1"
                                        >
                                            {processing
                                                ? t('common.processing')
                                                : t('shop.confirm_exchange')}
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
