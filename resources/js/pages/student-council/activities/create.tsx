import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PageProps {
    // 可以添加预填充数据
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '首页', href: '/' },
    { title: '学生会', href: '/student-council' },
    { title: '活动列表', href: '/student-council/activities' },
    { title: '创建活动', href: '/student-council/activities/create' },
];

export default function CreateActivity({ }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: '',
        points_reward: '',
        status: 'draft',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student-council/activities');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="创建活动" />

            <div className="space-y-6 p-4 max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/student-council/activities">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title="创建活动"
                        description="填写活动信息并发布"
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>基本信息</CardTitle>
                            <CardDescription>填写活动的基本信息</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">活动标题 *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="输入活动标题"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">活动描述</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="描述活动内容、目的等"
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">开始时间 *</Label>
                                    <Input
                                        id="start_date"
                                        type="datetime-local"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">结束时间 *</Label>
                                    <Input
                                        id="end_date"
                                        type="datetime-local"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">活动地点 *</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="输入活动地点"
                                    required
                                />
                                {errors.location && (
                                    <p className="text-sm text-destructive">{errors.location}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>活动设置</CardTitle>
                            <CardDescription>设置参与人数和积分奖励</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="max_participants">最大参与人数 *</Label>
                                    <Input
                                        id="max_participants"
                                        type="number"
                                        min="1"
                                        value={data.max_participants}
                                        onChange={(e) => setData('max_participants', e.target.value)}
                                        placeholder="输入最大人数"
                                        required
                                    />
                                    {errors.max_participants && (
                                        <p className="text-sm text-destructive">{errors.max_participants}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="points_reward">积分奖励 *</Label>
                                    <Input
                                        id="points_reward"
                                        type="number"
                                        min="0"
                                        value={data.points_reward}
                                        onChange={(e) => setData('points_reward', e.target.value)}
                                        placeholder="输入积分数量"
                                        required
                                    />
                                    {errors.points_reward && (
                                        <p className="text-sm text-destructive">{errors.points_reward}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">活动状态 *</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="选择状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">草稿</SelectItem>
                                        <SelectItem value="active">进行中</SelectItem>
                                        <SelectItem value="closed">已结束</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-destructive">{errors.status}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            创建活动
                        </Button>
                        <Link href="/student-council/activities">
                            <Button type="button" variant="outline">
                                取消
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
