import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Minus, Zap, Trophy, Star, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

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

export default function QuickGrading({
    classes,
    selectedClassId,
    students,
    presets,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.quick_grading'), href: '/admin/quick-grading' },
    ];

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(
        null,
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const addPresets = useMemo(
        () => presets.filter((p) => p.type === 'add'),
        [presets],
    );
    const deductPresets = useMemo(
        () => presets.filter((p) => p.type === 'deduct'),
        [presets],
    );

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
                setSuccessMessage(t('admin.users.points_adjusted'));
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
            <Head title={t('nav.quick_grading')} />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {t('nav.quick_grading')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('admin.quick_grading.description')}
                        </p>
                    </div>
                    <Select
                        value={selectedClassId?.toString() || ''}
                        onValueChange={handleClassChange}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue
                                placeholder={t(
                                    'admin.quick_grading.select_class',
                                )}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem
                                    key={cls.id}
                                    value={cls.id.toString()}
                                >
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
                            <span className="shrink-0 text-sm font-medium text-muted-foreground">
                                {t('admin.quick_grading.quick_add')}
                            </span>
                            {addPresets.slice(0, 4).map((preset, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className="shrink-0 border-success/30 bg-success-soft text-success"
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    {preset.name} +{preset.amount}
                                </Badge>
                            ))}
                            <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">
                                {t('admin.quick_grading.quick_deduct')}
                            </span>
                            {deductPresets.slice(0, 4).map((preset, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className="shrink-0 border-destructive/30 bg-destructive/10 text-destructive"
                                >
                                    <Minus className="mr-1 h-3 w-3" />
                                    {preset.name} -{preset.amount}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Students Grid */}
                {students.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <p>{t('admin.quick_grading.select_class_hint')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {students.map((student) => {
                            const totalPoints =
                                student.points?.total_points ?? 0;
                            const rank = student.rank;
                            const rankBadgeColor =
                                rank <= 3
                                    ? 'bg-yellow-500 text-white'
                                    : rank <= 10
                                      ? 'bg-gray-400 text-white'
                                      : 'bg-muted text-muted-foreground';

                            return (
                                <Card
                                    key={student.id}
                                    className="cursor-pointer border-sidebar-border/70 transition-all hover:border-primary/50 hover:shadow-md active:scale-95 dark:border-sidebar-border"
                                    onClick={() => handleStudentClick(student)}
                                >
                                    <CardContent className="p-3 text-center">
                                        {/* Avatar */}
                                        <div className="relative mx-auto mb-2">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                                                {student.name.charAt(0)}
                                            </div>
                                            {/* Rank badge */}
                                            <div
                                                className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${rankBadgeColor}`}
                                            >
                                                {rank}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <p className="truncate text-sm font-medium">
                                            {student.name}
                                        </p>

                                        {/* Points */}
                                        <div className="mt-1 flex items-center justify-center gap-1">
                                            <Star className="h-3 w-3 text-warning" />
                                            <span className="text-lg font-bold text-primary">
                                                {formatNumber(totalPoints)}
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
                            <Zap className="h-5 w-5 text-warning" />
                            {t('admin.quick_grading.dialog_title', {
                                name: selectedStudent?.name ?? '',
                            })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.quick_grading.current_points_prefix')}
                            <span className="font-bold text-primary">
                                {selectedStudent?.points?.total_points ?? 0}
                            </span>
                            &nbsp;·&nbsp;{' '}
                            {t('admin.quick_grading.rank_prefix')}{' '}
                            <span className="font-bold">
                                {selectedStudent?.rank}
                            </span>{' '}
                            {t('admin.quick_grading.rank_suffix')}
                        </DialogDescription>
                    </DialogHeader>

                    {successMessage && (
                        <div className="rounded-md bg-success-soft px-4 py-2 text-sm text-success">
                            {successMessage}
                        </div>
                    )}

                    {/* Preset Buttons */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                            {t('admin.quick_grading.quick_add_label')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {addPresets.map((preset, i) => (
                                <Button
                                    key={i}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-success/30 text-success hover:bg-success-soft hover:text-green-700 dark:hover:bg-green-950"
                                    onClick={() => handlePresetClick(preset)}
                                    disabled={processing}
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    {preset.name} +{preset.amount}
                                </Button>
                            ))}
                        </div>

                        <p className="text-sm font-medium text-muted-foreground">
                            {t('admin.quick_grading.quick_deduct_label')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {deductPresets.map((preset, i) => (
                                <Button
                                    key={i}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-red-700 dark:hover:bg-red-950"
                                    onClick={() => handlePresetClick(preset)}
                                    disabled={processing}
                                >
                                    <Minus className="mr-1 h-3 w-3" />
                                    {preset.name} -{preset.amount}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-3 border-t pt-2"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    {t('points.type')}
                                </label>
                                <Select
                                    value={data.type}
                                    onValueChange={(v) => setData('type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="add">
                                            <Plus className="mr-1 inline h-3 w-3" />
                                            {t('admin.quick_grading.add')}
                                        </SelectItem>
                                        <SelectItem value="deduct">
                                            <Minus className="mr-1 inline h-3 w-3" />
                                            {t('admin.quick_grading.deduct')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    {t('admin.quick_grading.score')}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData('amount', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.quick_grading.score_placeholder',
                                    )}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                {t('admin.quick_grading.reason')}
                            </label>
                            <input
                                type="text"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                placeholder={t(
                                    'admin.quick_grading.reason_placeholder',
                                )}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDialogOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={
                                    processing || !data.amount || !data.reason
                                }
                            >
                                {processing
                                    ? t('common.processing')
                                    : t('admin.users.confirm_adjust')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
