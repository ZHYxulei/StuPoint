import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';
import { Plus, Minus, Zap, Trophy, Star, X } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    grade: string;
    full_name: string;
}

interface StudentPoints {
    total_points: number;
    redeemable_points: number;
}

interface Student {
    id: number;
    name: string;
    nickname: string | null;
    avatar: string | null;
    rank: number;
    points: StudentPoints | null;
}

interface Preset {
    name: string;
    type: 'add' | 'deduct';
    amount: number;
    reason: string;
}

interface PageProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    students: Student[];
    presets: Preset[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '快速加分', href: '/admin/quick-grading' },
];

export default function QuickGrading({ classes, selectedClassId, students, presets }: PageProps) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const addPresets = useMemo(() => presets.filter(p => p.type === 'add'), [presets]);
    const deductPresets = useMemo(() => presets.filter(p => p.type === 'deduct'), [presets]);

    const { data, setData, post, processing, reset } = useForm({
        type: 'add' as string,
        amount: '',
        reason: '',
    });

    const handleClassChange = (classId: string) => {
        router.get(`/admin/quick-grading?class_id=${classId}`);
    };

    const handleStudentClick = (student: Student) => {
        setSelectedStudent(student);
        reset();
        setSuccessMessage('');
        setDialogOpen(true);
    };

    const handlePresetClick = (preset: Preset) => {
        setData({
            type: preset.type,
            amount: preset.amount.toString(),
            reason: preset.reason,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        post(`/admin/quick-grading/${selectedStudent.id}/adjust-points`, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('积分调整成功');
                reset();
                setTimeout(() => {
                    setDialogOpen(false);
                    setSuccessMessage('');
                }, 1000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="快速加分" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">快速加分</h1>
                        <p className="text-sm text-muted-foreground">点击学生卡片快速加减积分</p>
                    </div>
                    <Select value={selectedClassId?.toString() || ''} onValueChange={handleClassChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="选择班级" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                    {cls.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Presets Preview */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="py-3">
                        <div className="flex items-center gap-4 overflow-x-auto">
                            <span className="text-sm font-medium text-muted-foreground shrink-0">快捷加分：</span>
                            {addPresets.slice(0, 4).map((preset, i) => (
                                <Badge key={i} variant="outline" className="shrink-0 text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                                    <Plus className="h-3 w-3 mr-1" />
                                    {preset.name} +{preset.amount}
                                </Badge>
                            ))}
                            <span className="text-sm font-medium text-muted-foreground shrink-0 ml-4">快捷减分：</span>
                            {deductPresets.slice(0, 4).map((preset, i) => (
                                <Badge key={i} variant="outline" className="shrink-0 text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                                    <Minus className="h-3 w-3 mr-1" />
                                    {preset.name} -{preset.amount}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Students Grid */}
                {students.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>请选择一个班级查看学生列表</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {students.map((student) => {
                            const totalPoints = student.points?.total_points ?? 0;
                            const rank = student.rank;
                            const rankBadgeColor = rank <= 3
                                ? 'bg-yellow-500 text-white'
                                : rank <= 10
                                    ? 'bg-gray-400 text-white'
                                    : 'bg-muted text-muted-foreground';

                            return (
                                <Card
                                    key={student.id}
                                    className="border-sidebar-border/70 dark:border-sidebar-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-95"
                                    onClick={() => handleStudentClick(student)}
                                >
                                    <CardContent className="p-3 text-center">
                                        {/* Avatar */}
                                        <div className="relative mx-auto mb-2">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mx-auto">
                                                {student.name.charAt(0)}
                                            </div>
                                            {/* Rank badge */}
                                            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rankBadgeColor}`}>
                                                {rank}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <p className="font-medium text-sm truncate">{student.name}</p>

                                        {/* Points */}
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <Star className="h-3 w-3 text-yellow-500" />
                                            <span className="text-lg font-bold text-primary">
                                                {totalPoints.toLocaleString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Grading Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            为 {selectedStudent?.name} 调整积分
                        </DialogTitle>
                        <DialogDescription>
                            当前积分：<span className="font-bold text-primary">{selectedStudent?.points?.total_points ?? 0}</span>
                            &nbsp;·&nbsp;
                            排名：第 <span className="font-bold">{selectedStudent?.rank}</span> 名
                        </DialogDescription>
                    </DialogHeader>

                    {successMessage && (
                        <div className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-2 rounded-md text-sm">
                            {successMessage}
                        </div>
                    )}

                    {/* Preset Buttons */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">快捷加分</p>
                        <div className="flex flex-wrap gap-2">
                            {addPresets.map((preset, i) => (
                                <Button
                                    key={i}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                                    onClick={() => handlePresetClick(preset)}
                                    disabled={processing}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {preset.name} +{preset.amount}
                                </Button>
                            ))}
                        </div>

                        <p className="text-sm font-medium text-muted-foreground">快捷减分</p>
                        <div className="flex flex-wrap gap-2">
                            {deductPresets.map((preset, i) => (
                                <Button
                                    key={i}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                    onClick={() => handlePresetClick(preset)}
                                    disabled={processing}
                                >
                                    <Minus className="h-3 w-3 mr-1" />
                                    {preset.name} -{preset.amount}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Form */}
                    <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">类型</label>
                                <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="add"><Plus className="h-3 w-3 mr-1 inline" />加分</SelectItem>
                                        <SelectItem value="deduct"><Minus className="h-3 w-3 mr-1 inline" />减分</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">分数</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="输入分数"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">原因</label>
                            <input
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder="输入加分/减分原因"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                                取消
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={processing || !data.amount || !data.reason}
                            >
                                {processing ? '处理中...' : '确认调整'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
