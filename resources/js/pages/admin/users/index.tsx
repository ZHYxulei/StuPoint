import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, UserPlus, Edit, Trash2, MoreHorizontal, Shield, Award, Clock, Globe, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useRef } from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '用户管理', href: '/admin/users' },
];

export default function UserIndex({ users, roles, filters, import_results }: PageProps) {
    const { get, processing } = useForm({
        search: filters.search || '',
        role: filters.role || 'all',
    });

    const [importDialogOpen, setImportDialogOpen] = useState(!!import_results);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing: importProcessing, reset } = useForm({
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
            <Head title="用户管理" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="用户管理"
                        description="管理系统用户和角色权限"
                    />
                    <div className="flex items-center gap-2">
                        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    批量导入
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5" />
                                        批量导入用户
                                    </DialogTitle>
                                    <DialogDescription>
                                        通过 CSV 文件批量导入用户，文件格式须符合模板要求。
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {/* Import results */}
                                    {import_results && (
                                        <div className={`rounded-lg border p-4 ${
                                            import_results.failed > 0
                                                ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
                                                : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                                        }`}>
                                            <div className="flex items-center gap-2 font-medium text-sm mb-2">
                                                {import_results.failed > 0 ? (
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                )}
                                                导入完成
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <p>成功导入：<span className="font-semibold text-green-600">{import_results.success}</span> 条</p>
                                                <p>跳过空行：<span className="font-semibold text-muted-foreground">{import_results.skipped}</span> 条</p>
                                                {import_results.failed > 0 && (
                                                    <p>失败：<span className="font-semibold text-red-600">{import_results.failed}</span> 条</p>
                                                )}
                                            </div>
                                            {import_results.errors.length > 0 && (
                                                <div className="mt-3 max-h-32 overflow-y-auto text-xs text-red-600 space-y-1">
                                                    {import_results.errors.map((err, i) => (
                                                        <p key={i}>{err}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Template download */}
                                    <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                                        <FileSpreadsheet className="h-8 w-8 text-muted-foreground shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">下载导入模板</p>
                                            <p className="text-xs text-muted-foreground">
                                                包含表头和示例数据，请按照格式填写
                                            </p>
                                        </div>
                                        <a href="/admin/users/import-template" download>
                                            <Button variant="outline" size="sm">
                                                <Download className="mr-1 h-3 w-3" />
                                                下载
                                            </Button>
                                        </a>
                                    </div>

                                    {/* File upload */}
                                    <form onSubmit={handleImportSubmit} className="space-y-3">
                                        <div
                                            className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
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
                                                    <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
                                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        点击或拖拽 CSV 文件到此处
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        支持 .csv 和 .txt 格式，最大 10MB
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={!selectedFile || importProcessing}
                                            >
                                                {importProcessing ? (
                                                    <>
                                                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                        导入中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        开始导入
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Link href="/admin/users/create">
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                添加用户
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            筛选用户
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="search">搜索</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="姓名或邮箱..."
                                    value={filters.search || ''}
                                    onChange={(e) => get('/admin/users', {
                                        data: { ...filters, search: e.target.value || null },
                                        preserveScroll: true,
                                    })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">角色</Label>
                                <Select
                                    value={filters.role || 'all'}
                                    onValueChange={(value) => get('/admin/users', {
                                        data: { ...filters, role: value === 'all' ? null : value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="所有角色" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">所有角色</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.slug}>
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
                                    搜索
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>用户列表</CardTitle>
                        <CardDescription>
                            显示 {users.from} 到 {users.to}，共 {users.total} 名用户
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <UserPlus className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold truncate">{getDisplayName(user)}</p>
                                                {user.id === currentUserId && (
                                                    <Badge variant="outline" className="text-xs">
                                                        当前用户
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-xs">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                            {user.last_login_at && (
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>最后登录: {new Date(user.last_login_at).toLocaleDateString('zh-CN')}</span>
                                                    </div>
                                                    {user.last_login_ip && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            <span>IP: {user.last_login_ip}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {user.points && (
                                            <div className="flex items-center gap-1 text-primary font-semibold mb-1">
                                                <Award className="h-4 w-4" />
                                                {user.points.total_points.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {user.id !== currentUserId && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
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
                            <div className="flex justify-center gap-2 mt-6">
                                {users.links.map((link, index) => (
                                    <button
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        onClick={() => {
                                            if (link.url) {
                                                window.location.href = link.url;
                                            }
                                        }}
                                        disabled={!link.url || processing}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted hover:bg-muted/80'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
