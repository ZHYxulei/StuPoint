import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Trophy,
    Edit,
    Trash2,
    Gift,
    Award,
} from 'lucide-react';
import Heading from '@/components/heading';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format';
import { t } from '@/lib/i18n';
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

export default function ShowActivity({ activity }: PageProps) {
    // Built inside the component: at module scope `t()` would run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.home'), href: '/' },
        { title: t('nav.student_council'), href: '/student-council' },
        {
            title: t('council.activities.title'),
            href: '/student-council/activities',
        },
    ];

    const statusConfig: Record<
        string,
        {
            label: string;
            variant:
                | 'default'
                | 'secondary'
                | 'destructive'
                | 'outline'
                | 'success'
                | 'warning';
        }
    > = {
        draft: { label: t('council.status.draft'), variant: 'secondary' },
        active: { label: t('council.status.active'), variant: 'success' },
        closed: { label: t('council.status.closed'), variant: 'outline' },
    };

    const { processing: awardProcessing } = useForm({});
    const { delete: destroyDelete, processing: deleteProcessing } = useForm({});
    const { data, setData } = useForm({
        note: '',
    });

    const handleAwardPoints = () => {
        router.post(
            `/student-council/activities/${activity.id}/award-points`,
            {
                note: data.note,
            },
            {
                onSuccess: () => setData('note', ''),
            },
        );
    };

    const handleDelete = () => {
        destroyDelete(`/student-council/activities/${activity.id}`);
    };

    const awardedCount = activity.participants.filter(
        (p) => p.points_awarded,
    ).length;
    const canAward =
        activity.status === 'closed' &&
        awardedCount < activity.participants.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={activity.title} />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/student-council/activities">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Heading
                            title={activity.title}
                            description={t('council.activities.show_description')}
                        />
                    </div>
                    <div className="flex gap-2">
                        {activity.status !== 'closed' && (
                            <>
                                <Button asChild variant="outline">
                                    <Link
                                        href={`/student-council/activities/${activity.id}/edit`}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        {t('common.edit')}
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            disabled={
                                                activity.participants.length > 0
                                            }
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('common.delete')}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                {t(
                                                    'council.activities.delete_confirm_title',
                                                )}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {activity.participants.length >
                                                0
                                                    ? t(
                                                          'council.activities.delete_has_participants',
                                                      )
                                                    : t(
                                                          'council.activities.delete_warning',
                                                      )}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                {t('common.cancel')}
                                            </AlertDialogCancel>
                                            {activity.participants.length ===
                                                0 && (
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    disabled={deleteProcessing}
                                                >
                                                    {t(
                                                        'council.activities.confirm_delete',
                                                    )}
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
                            <CardTitle className="text-base">
                                {t('council.activities.info')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="mb-2 text-lg font-semibold">
                                        {activity.title}
                                    </h3>
                                    <Badge
                                        variant={
                                            statusConfig[activity.status]
                                                .variant
                                        }
                                    >
                                        {statusConfig[activity.status].label}
                                    </Badge>
                                </div>
                            </div>

                            {activity.description && (
                                <div>
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                        {activity.description}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {formatDateTime(
                                            activity.start_date,
                                        )}{' '}
                                        -{' '}
                                        {formatDateTime(activity.end_date)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{activity.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {t(
                                            'council.activities.participants_progress',
                                            {
                                                current:
                                                    activity.participants.length,
                                                max: activity.max_participants,
                                            },
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {t('council.activities.points_reward', {
                                            points: activity.points_reward,
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-2 text-xs text-muted-foreground">
                                {t('council.activities.created_by', {
                                    name: activity.organizer.name,
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Award Points Card */}
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('council.activities.award_card_title')}
                            </CardTitle>
                            <CardDescription>
                                {t('council.activities.award_card_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-2xl font-bold">
                                        {activity.participants.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t(
                                            'council.activities.total_participants',
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {awardedCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t(
                                            'council.activities.awarded_participants',
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <Label htmlFor="note">
                                    {t('council.activities.note_label')}
                                </Label>
                                <Textarea
                                    id="note"
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    placeholder={t(
                                        'council.activities.note_placeholder',
                                    )}
                                    rows={3}
                                />
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        className="w-full"
                                        disabled={!canAward || awardProcessing}
                                    >
                                        <Award className="mr-2 h-4 w-4" />
                                        {t('council.activities.award_button')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {t(
                                                'council.activities.award_confirm_title',
                                            )}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t(
                                                'council.activities.award_confirm_description',
                                                {
                                                    count:
                                                        activity.participants
                                                            .length -
                                                        awardedCount,
                                                    points: activity.points_reward,
                                                },
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                {t('common.cancel')}
                                            </Button>
                                        </DialogTrigger>
                                        <Button
                                            onClick={handleAwardPoints}
                                            disabled={awardProcessing}
                                        >
                                            {t(
                                                'council.activities.award_confirm',
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {!canAward && activity.participants.length > 0 && (
                                <p className="text-center text-xs text-muted-foreground">
                                    {activity.status !== 'closed'
                                        ? t(
                                              'council.activities.award_closed_only',
                                          )
                                        : t('council.activities.award_all_done')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Participants List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>
                            {t('council.activities.participants_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('council.activities.participants_description', {
                                count: activity.participants.length,
                                awarded: awardedCount,
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activity.participants.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>{t('council.activities.no_participants')}</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                {t('auth.name')}
                                            </TableHead>
                                            <TableHead>
                                                {t('auth.email')}
                                            </TableHead>
                                            <TableHead>
                                                {t(
                                                    'council.activities.participated_at',
                                                )}
                                            </TableHead>
                                            <TableHead>
                                                {t(
                                                    'council.activities.points_status',
                                                )}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activity.participants.map(
                                            (participant) => (
                                                <TableRow key={participant.id}>
                                                    <TableCell className="font-medium">
                                                        {participant.user.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {participant.user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDateTime(
                                                            participant.created_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {participant.points_awarded ? (
                                                            <Badge variant="success">
                                                                <Gift className="mr-1 h-3 w-3" />
                                                                {t(
                                                                    'council.activities.awarded',
                                                                )}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                {t(
                                                                    'council.activities.not_awarded',
                                                                )}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
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
