import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Search,
    UserPlus,
    Edit,
    Trash2,
    Award,
    Clock,
    Globe,
    Upload,
    Download,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { useState, useRef } from 'react';
import Heading from '@/components/heading';
import PaginationBar from '@/components/pagination-bar';
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
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface User {
    id: number;
    name: string;
    nickname: string | null;
    email: string;
    phone: string | null;
    student_id: string | null;
    grade: string | null;
    class: string | null;
    last_login_at: string | null;
    last_login_ip: string | null;
    roles: Role[];
    points?: {
        total_points: number;
        redeemable_points: number;
    } | null;
}

interface Paginator {
    data: User[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ImportResults {
    success: number;
    skipped: number;
    failed: number;
    errors: string[];
}

interface PageProps {
    users: Paginator;
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
    };
    import_results?: ImportResults;
}

export default function UserIndex({
    users,
    roles,
    filters,
    import_results,
}: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.user_management'), href: '/admin/users' },
    ];

    const { get, processing } = useForm({
        search: filters.search || '',
        role: filters.role || 'all',
    });

    const [importDialogOpen, setImportDialogOpen] = useState(!!import_results);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        data,
        setData,
        post,
        processing: importProcessing,
        reset,
    } = useForm({
        file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/users', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        setData('file', file);
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;
        post('/admin/users/batch-import', {
            forceFormData: true,
            onSuccess: () => {
                setSelectedFile(null);
                reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const { auth } = usePage().props as any;
    const currentUserId = auth.user?.id;

    // Helper function to get display name
    const getDisplayName = (user: User) => {
        return user.nickname || user.name;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('nav.user_management')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('nav.user_management')}
                        description={t('admin.users.index_description')}
                    />
                    <div className="flex items-center gap-2">
                        <Dialog
                            open={importDialogOpen}
                            onOpenChange={setImportDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t('admin.users.batch_import')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5" />
                                        {t('admin.users.batch_import_title')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('admin.users.batch_import_desc')}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {/* Import results */}
                                    {import_results && (
                                        <div
                                            className={`rounded-lg border p-4 ${
                                                import_results.failed > 0
                                                    ? 'border-warning/30 bg-warning-soft'
                                                    : 'border-success/30 bg-success-soft'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                                {import_results.failed > 0 ? (
                                                    <AlertCircle className="h-4 w-4 text-warning" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                                )}
                                                {t('admin.users.import_completed')}
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <p>
                                                    {t(
                                                        'admin.users.import_success_label',
                                                    )}
                                                    <span className="font-semibold text-success">
                                                        {import_results.success}
                                                    </span>{' '}
                                                    {t(
                                                        'admin.users.import_count_unit',
                                                    )}
                                                </p>
                                                <p>
                                                    {t(
                                                        'admin.users.import_skipped_label',
                                                    )}
                                                    <span className="font-semibold text-muted-foreground">
                                                        {import_results.skipped}
                                                    </span>{' '}
                                                    {t(
                                                        'admin.users.import_count_unit',
                                                    )}
                                                </p>
                                                {import_results.failed > 0 && (
                                                    <p>
                                                        {t(
                                                            'admin.users.import_failed_label',
                                                        )}
                                                        <span className="font-semibold text-destructive">
                                                            {
                                                                import_results.failed
                                                            }
                                                        </span>{' '}
                                                        {t(
                                                            'admin.users.import_count_unit',
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            {import_results.errors.length >
                                                0 && (
                                                <div className="mt-3 max-h-32 space-y-1 overflow-y-auto text-xs text-destructive">
                                                    {import_results.errors.map(
                                                        (err, i) => (
                                                            <p key={i}>{err}</p>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Template download */}
                                    <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                                        <FileSpreadsheet className="h-8 w-8 shrink-0 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {t('admin.users.download_template')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {t('admin.users.template_desc')}
                                            </p>
                                        </div>
                                        <a
                                            href="/admin/users/import-template"
                                            download
                                        >
                                            <Button variant="outline" size="sm">
                                                <Download className="mr-1 h-3 w-3" />
                                                {t('admin.users.download')}
                                            </Button>
                                        </a>
                                    </div>

                                    {/* File upload */}
                                    <form
                                        onSubmit={handleImportSubmit}
                                        className="space-y-3"
                                    >
                                        <div
                                            className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv,.txt"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            {selectedFile ? (
                                                <>
                                                    <FileSpreadsheet className="mb-2 h-8 w-8 text-primary" />
                                                    <p className="text-sm font-medium">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(
                                                            selectedFile.size /
                                                            1024
                                                        ).toFixed(1)}{' '}
                                                        KB
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {t('admin.users.drop_hint')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('admin.users.file_formats')}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !selectedFile ||
                                                    importProcessing
                                                }
                                            >
                                                {importProcessing ? (
                                                    <>
                                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                        {t('admin.users.importing')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        {t('admin.users.start_import')}
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button asChild>
                            <Link href="/admin/users/create">
                                <UserPlus className="mr-2 h-4 w-4" />
                                {t('admin.users.add_user')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Search className="h-4 w-4" />
                            {t('admin.users.filter_users')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-3"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="search">
                                    {t('common.search')}
                                </Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder={t(
                                        'admin.users.search_placeholder',
                                    )}
                                    value={filters.search || ''}
                                    onChange={(e) =>
                                        router.get(
                                            '/admin/users',
                                            {
                                                ...filters,
                                                search: e.target.value || null,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">
                                    {t('profile.role')}
                                </Label>
                                <Select
                                    value={filters.role || 'all'}
                                    onValueChange={(value) =>
                                        router.get(
                                            '/admin/users',
                                            {
                                                ...filters,
                                                role:
                                                    value === 'all'
                                                        ? null
                                                        : value,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue
                                            placeholder={t(
                                                'admin.users.all_roles',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('admin.users.all_roles')}
                                        </SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.slug}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    {t('common.search')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('nav.user_list')}</CardTitle>
                        <CardDescription>
                            {t('admin.users.showing', {
                                from: formatNumber(users.from),
                                to: formatNumber(users.to),
                                total: formatNumber(users.total),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <UserPlus className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <p className="truncate font-semibold">
                                                    {getDisplayName(user)}
                                                </p>
                                                {user.id === currentUserId && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {t(
                                                            'admin.users.current_user',
                                                        )}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                            {user.last_login_at && (
                                                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {t(
                                                                'admin.users.last_login',
                                                                {
                                                                    date: formatDate(
                                                                        user.last_login_at,
                                                                    ),
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                    {user.last_login_ip && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            <span>
                                                                IP:{' '}
                                                                {
                                                                    user.last_login_ip
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {user.points && (
                                            <div className="mb-1 flex items-center gap-1 font-semibold text-primary">
                                                <Award className="h-4 w-4" />
                                                {formatNumber(
                                                    user.points.total_points,
                                                )}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {user.id !== currentUserId && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                t(
                                                                    'admin.users.delete_confirm',
                                                                    {
                                                                        name: user.name,
                                                                    },
                                                                ),
                                                            )
                                                        ) {
                                                            window.location.href = `/admin/users/${user.id}`;
                                                        }
                                                    }}
                                                    className="hover:bg-destructive hover:text-destructive-foreground"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <PaginationBar links={users.links} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
