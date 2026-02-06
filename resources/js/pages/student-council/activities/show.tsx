import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Edit, Trash2, Gift, Award } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Participant {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    points_awarded: boolean;
    awarded_at: string | null;
    created_at: string;
}

interface CouncilActivity {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    points_reward: number;
    status: 'draft' | 'active' | 'closed';
    organizer: {
        id: number;
        name: string;
    };
    participants: Participant[];
}

interface PageProps {
    activity: CouncilActivity;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '首页', href: '/' },
    { title: '学生会', href: '/student-council' },
    { title: '活动列表', href: '/student-council/activities' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
    draft: { label: '草稿', variant: 'secondary' },
    active: { label: '进行中', variant: 'success' },
    closed: { label: '已结束', variant: 'outline' },
};

export default function ShowActivity({ activity }: PageProps) {
    const { post: awardPost, processing: awardProcessing } = useForm({});
    const { delete: destroyDelete, processing: deleteProcessing } = useForm({});
    const { data, setData, post, put, processing: updateProcessing } = useForm({
        note: '',
    });

    const handleAwardPoints = () => {
        awardPost(`/student-council/activities/${activity.id}/award-points`, {
            data: { note: data.note },
            onSuccess: () => setData('note', ''),
        });
    };

    const handleDelete = () => {
        destroyDelete(`/student-council/activities/${activity.id}`);
    };

    const awardedCount = activity.participants.filter(p => p.points_awarded).length;
    const canAward = activity.status === 'closed' && awardedCount < activity.participants.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={activity.title} />

            <div className="space-y-6 p-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/student-council/activities">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Heading
                            title={activity.title}
                            description="活动详情和参与人员"
                        />
                    </div>
                    <div className="flex gap-2">
                        {activity.status !== 'closed' && (
                            <>
                                <Link href={`/student-council/activities/${activity.id}/edit`}>
                                    <Button variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        编辑
                                    </Button>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={activity.participants.length > 0}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            删除
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>确定要删除这个活动吗？</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {activity.participants.length > 0
                                                    ? '活动已有参与者，无法删除。'
                                                    : '此操作无法撤销，活动将被永久删除。'}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>取消</AlertDialogCancel>
                                            {activity.participants.length === 0 && (
                                                <AlertDialogAction onClick={handleDelete} disabled={deleteProcessing}>
                                                    确认删除
                                                </AlertDialogAction>
                                            )}
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </div>
                </div>

                {/* Activity Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">活动信息</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                                    <Badge variant={statusConfig[activity.status].variant}>
                                        {statusConfig[activity.status].label}
                                    </Badge>
                                </div>
                            </div>

                            {activity.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {activity.description}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {new Date(activity.start_date).toLocaleString('zh-CN')} - {new Date(activity.end_date).toLocaleString('zh-CN')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{activity.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{activity.participants.length}/{activity.max_participants} 人参与</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-muted-foreground" />
                                    <span>{activity.points_reward} 积分奖励</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t text-xs text-muted-foreground">
                                创建者：{activity.organizer.name}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Award Points Card */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">积分奖励</CardTitle>
                            <CardDescription>为参与者发放积分</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-2xl font-bold">{activity.participants.length}</p>
                                    <p className="text-xs text-muted-foreground">总参与人数</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{awardedCount}</p>
                                    <p className="text-xs text-muted-foreground">已奖励人数</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <Label htmlFor="note">备注（可选）</Label>
                                <Textarea
                                    id="note"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="添加备注信息..."
                                    rows={3}
                                />
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        className="w-full"
                                        disabled={!canAward || awardProcessing}
                                    >
                                        <Award className="h-4 w-4 mr-2" />
                                        发放积分
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>确认发放积分</DialogTitle>
                                        <DialogDescription>
                                            将为 {activity.participants.length - awardedCount} 名未奖励参与者每人发放 {activity.points_reward} 积分。
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">取消</Button>
                                        </DialogTrigger>
                                        <Button onClick={handleAwardPoints} disabled={awardProcessing}>
                                            确认发放
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {!canAward && activity.participants.length > 0 && (
                                <p className="text-xs text-muted-foreground text-center">
                                    {activity.status !== 'closed' ? '活动结束后才可发放积分' : '所有参与者已获得积分'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Participants List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>参与人员</CardTitle>
                        <CardDescription>
                            共 {activity.participants.length} 人参与，{awardedCount} 人已获得积分
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activity.participants.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>暂无参与者</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>姓名</TableHead>
                                            <TableHead>邮箱</TableHead>
                                            <TableHead>参与时间</TableHead>
                                            <TableHead>积分状态</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activity.participants.map((participant) => (
                                            <TableRow key={participant.id}>
                                                <TableCell className="font-medium">
                                                    {participant.user.name}
                                                </TableCell>
                                                <TableCell>{participant.user.email}</TableCell>
                                                <TableCell>
                                                    {new Date(participant.created_at).toLocaleString('zh-CN')}
                                                </TableCell>
                                                <TableCell>
                                                    {participant.points_awarded ? (
                                                        <Badge variant="success">
                                                            <Gift className="h-3 w-3 mr-1" />
                                                            已发放
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">未发放</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
