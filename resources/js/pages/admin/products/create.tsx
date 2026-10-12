import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, Package } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface ProductCategory {
    id: number;
    name: string;
}

interface PageProps {
    categories: ProductCategory[];
}

export default function ProductCreate({ categories }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.products'), href: '/admin/products' },
        { title: t('admin.products.create_title'), href: '' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        image: null as File | null,
        points_required: '',
        stock: '-1',
        category_id: '',
        is_third_party: false,
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/products');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.products.create_title')} />

            <div className="max-w-2xl space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common.back')}
                        </Link>
                    </Button>
                    <Heading
                        title={t('admin.products.create_title')}
                        description={t('admin.products.create_description')}
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('shop.product_information')}</CardTitle>
                        <CardDescription>
                            {t('admin.products.create_info_description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('admin.products.name_label')}
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.products.name_placeholder',
                                    )}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    {t('admin.products.description_label')}
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.products.description_placeholder',
                                    )}
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">
                                    {t('admin.products.image_label')}
                                </Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                                        {data.image ? (
                                            <img
                                                src={URL.createObjectURL(
                                                    data.image,
                                                )}
                                                alt="Preview"
                                                className="h-full w-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <Package className="h-12 w-12 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setData('image', file);
                                                }
                                            }}
                                            className="cursor-pointer"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {t('admin.products.image_hint')}
                                        </p>
                                        {errors.image && (
                                            <p className="text-sm text-destructive">
                                                {errors.image}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="points_required">
                                    {t('admin.products.points_required_label')}
                                </Label>
                                <Input
                                    id="points_required"
                                    type="number"
                                    min="0"
                                    value={data.points_required}
                                    onChange={(e) =>
                                        setData(
                                            'points_required',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0"
                                    required
                                />
                                {errors.points_required && (
                                    <p className="text-sm text-destructive">
                                        {errors.points_required}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stock">
                                    {t('admin.products.stock_label')}
                                </Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="-1"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData('stock', e.target.value)
                                    }
                                    placeholder="-1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('admin.products.stock_hint')}
                                </p>
                                {errors.stock && (
                                    <p className="text-sm text-destructive">
                                        {errors.stock}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category_id">
                                    {t('admin.products.category_label')}
                                </Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(value) =>
                                        setData('category_id', value)
                                    }
                                >
                                    <SelectTrigger id="category_id">
                                        <SelectValue
                                            placeholder={t(
                                                'admin.products.select_category',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
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

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_third_party"
                                    checked={data.is_third_party}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'is_third_party',
                                            checked as boolean,
                                        )
                                    }
                                />
                                <Label htmlFor="is_third_party">
                                    {t('admin.products.third_party_label')}
                                </Label>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">
                                    {t('common.status')}
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            {t(
                                                'admin.products.status_active',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            {t(
                                                'admin.products.status_inactive',
                                            )}
                                        </SelectItem>
                                        <SelectItem value="out_of_stock">
                                            {t('shop.out_of_stock')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link
                                        href="/admin/products"
                                        className="flex-1"
                                    >
                                        {t('common.cancel')}
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing
                                        ? t('admin.products.saving')
                                        : t('admin.products.create_button')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
