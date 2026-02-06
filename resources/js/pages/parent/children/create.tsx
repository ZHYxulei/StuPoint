import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: '家长中心', href: '/parent' },
    { title: '我的子女', href: '/parent/children' },
    { title: '绑定子女', href: '/parent/children/create' },
];

export default function ParentChildCreate() {
    const { data, setData, post, processing, errors } = useForm({
        child_student_id: '',
        relationship: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/parent/children');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="绑定子女" />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/parent/children">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title="绑定子女"
                        description="输入子女的学号以绑定账户"
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border max-w-2xl">
                    <CardHeader>
                        <CardTitle>绑定子女</CardTitle>
                        <CardDescription>
                            请输入子女的学号和您与子女的关系
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="child_student_id">
                                    子女学号 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="child_student_id"
                                    placeholder="请输入子女的学号"
                                    value={data.child_student_id}
                                    onChange={(e) => setData('child_student_id', e.target.value)}
                                />
                                <InputError message={errors.child_student_id} />
                                <p className="text-sm text-muted-foreground">
                                    子女学号可以在子女的个人资料中找到
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="relationship">
                                    关系 <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.relationship}
                                    onValueChange={(value) => setData('relationship', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择您与子女的关系" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="父亲">父亲</SelectItem>
                                        <SelectItem value="母亲">母亲</SelectItem>
                                        <SelectItem value="其他">其他</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.relationship} />
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    绑定后，您可以查看子女的积分、排名、兑换记录等信息。
                                    绑定关系需要经过确认后方可查看详细信息。
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <Link href="/parent/children" className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        取消
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={processing}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    确认绑定
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
