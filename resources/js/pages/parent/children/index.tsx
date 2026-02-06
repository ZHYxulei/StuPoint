import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users2, Award, Coins, Eye, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Child {
    id: number;
    name: string;
    student_id: string;
    grade: string | null;
    class: string | null;
    relationship: string;
    is_approved: boolean;
    points: {
        total_points: number;
        redeemable_points: number;
    };
}

interface PageProps {
    children: Child[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '家长中心', href: '/parent' },
    { title: '我的子女', href: '/parent/children' },
];

export default function ParentChildrenIndex({ children }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="我的子女" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="我的子女"
                        description="查看和管理您绑定的子女账户"
                    />
                    <Link href="/parent/children/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            绑定子女
                        </Button>
                    </Link>
                </div>

                {children.length === 0 ? (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">暂无绑定的子女</p>
                            <Link href="/parent/children/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    绑定第一个子女
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {children.map((child) => (
                            <Card
                                key={child.id}
                                className="border-sidebar-border/70 dark:border-sidebar-border hover:shadow-md transition-shadow"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {child.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary">{child.relationship}</Badge>
                                                {child.is_approved && (
                                                    <Badge variant="default">已确认</Badge>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">学号</span>
                                            <span className="font-medium">{child.student_id}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">年级班级</span>
                                            <span className="font-medium">
                                                {child.grade} {child.class}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Coins className="h-3.5 w-3.5" />
                                                总积分
                                            </span>
                                            <span className="font-bold text-primary">
                                                {child.points.total_points}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Award className="h-3.5 w-3.5" />
                                                可兑换
                                            </span>
                                            <span className="font-bold text-primary">
                                                {child.points.redeemable_points}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Link href={`/parent/children/${child.id}`} className="flex-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    查看详情
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
