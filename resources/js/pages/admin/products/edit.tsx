import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, Package } from 'lucide-react';
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
    category_id: number | null;
    is_third_party: boolean;
    status: string;
}

interface PageProps {
    product: Product;
    categories: ProductCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '商品管理', href: '/admin/products' },
    { title: '编辑商品', href: '' },
];

export default function ProductEdit({ product, categories }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        description: product.description || '',
        image: null as File | null,
        points_required: product.points_required.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id?.toString() || '',
        is_third_party: product.is_third_party,
        status: product.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/products/${product.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`编辑: ${product.name}`} />

            <div className="space-y-6 p-4 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            返回
                        </Button>
                    </Link>
                    <Heading title={product.name} description="编辑商品信息" />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>商品信息</CardTitle>
                        <CardDescription>更新商品的详细信息</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">商品名称 *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="输入商品名称"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">商品描述</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="输入商品描述..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">商品图片</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                                        {data.image ? (
                                            <img
                                                src={URL.createObjectURL(data.image)}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
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
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setData('image', file);
                                                }
                                            }}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            留空则保持原图片，支持 JPG, PNG, GIF 格式，最大 2MB
                                        </p>
                                        <InputError message={errors.image} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="points_required">所需积分 *</Label>
                                <Input
                                    id="points_required"
                                    type="number"
                                    min="0"
                                    value={data.points_required}
                                    onChange={(e) => setData('points_required', e.target.value)}
                                    placeholder="0"
                                    required
                                />
                                <InputError message={errors.points_required} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stock">库存数量</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="-1"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value)}
                                    placeholder="-1"
                                />
                                <p className="text-xs text-muted-foreground">设置为 -1 表示库存无限</p>
                                <InputError message={errors.stock} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category_id">商品分类</Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(value) => setData('category_id', value)}
                                >
                                    <SelectTrigger id="category_id">
                                        <SelectValue placeholder="选择分类" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
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
                                    onCheckedChange={(checked) => setData('is_third_party', checked as boolean)}
                                />
                                <Label htmlFor="is_third_party">第三方商品</Label>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">状态</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">上架</SelectItem>
                                        <SelectItem value="inactive">下架</SelectItem>
                                        <SelectItem value="out_of_stock">缺货</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Link href="/admin/products" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">
                                        取消
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing ? '保存中...' : '保存更改'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
