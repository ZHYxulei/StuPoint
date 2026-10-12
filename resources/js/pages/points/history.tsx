import { Head, Link, router, useForm } from '@inertiajs/react';
import { Coins, ArrowLeft, Search, Filter } from 'lucide-react';
import Heading from '@/components/heading';
import PaginationBar from '@/components/pagination-bar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { formatDateTime, formatNumber } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface PointTransaction {
    id: number;
    type: 'total' | 'redeemable';
    amount: number;
    balance_after: number;
    source: string;
    description: string | null;
    created_at: string;
}

interface Paginator {
    data: PointTransaction[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PageProps {
    transactions: Paginator;
    filters: {
        type?: string;
        source?: string;
    };
}

export default function PointsHistory({ transactions, filters }: PageProps) {
    // Built in the component: at module scope `t()` would run on import, before
    // the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('points.title'),
            href: '/points',
        },
        {
            title: t('points.history'),
            href: '/points/history',
        },
    ];

    const { get, processing } = useForm({
        type: filters.type || 'all',
        source: filters.source || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get('/points/history', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('points.history')} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title={t('points.transaction_history')}
                        description={t('points.history_description')}
                    />
                    <Button asChild variant="outline" size="sm">
                        <Link href="/points">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('points.back_to_points')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            {t('points.filter_transactions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-3"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="type">{t('points.type')}</Label>
                                <Select
                                    value={filters.type || 'all'}
                                    onValueChange={(value) =>
                                        router.get(
                                            '/points/history',
                                            {
                                                ...filters,
                                                type:
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
                                    <SelectTrigger id="type">
                                        <SelectValue
                                            placeholder={t('points.all_types')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('points.all_types')}
                                        </SelectItem>
                                        <SelectItem value="total">
                                            {t('points.total_points')}
                                        </SelectItem>
                                        <SelectItem value="redeemable">
                                            {t('points.redeemable_points')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="source">
                                    {t('points.source')}
                                </Label>
                                <Input
                                    id="source"
                                    type="text"
                                    placeholder={t('points.search_by_source')}
                                    value={filters.source || ''}
                                    onChange={(e) =>
                                        router.get(
                                            '/points/history',
                                            {
                                                ...filters,
                                                source: e.target.value || null,
                                            },
                                            {
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                />
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

                {/* Transactions List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{t('points.transactions')}</CardTitle>
                        <CardDescription>
                            {t('points.showing_range', {
                                from: transactions.from ?? 0,
                                to: transactions.to ?? 0,
                                total: transactions.total,
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Coins className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>{t('points.no_transactions_found')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.data.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`rounded-full p-3 ${
                                                    transaction.amount > 0
                                                        ? 'bg-success-soft/20'
                                                        : 'bg-destructive/10/20'
                                                }`}
                                            >
                                                <Coins
                                                    className={`h-5 w-5 ${
                                                        transaction.amount > 0
                                                            ? 'text-success'
                                                            : 'text-destructive'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {transaction.description ||
                                                        transaction.source}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>
                                                        {transaction.source}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {transaction.type ===
                                                        'total'
                                                            ? t(
                                                                  'points.total_points',
                                                              )
                                                            : t(
                                                                  'points.redeemable_points',
                                                              )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatDateTime(
                                                            transaction.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-lg font-semibold ${
                                                    transaction.amount > 0
                                                        ? 'text-success'
                                                        : 'text-destructive'
                                                }`}
                                            >
                                                {transaction.amount > 0
                                                    ? '+'
                                                    : ''}
                                                {formatNumber(
                                                    transaction.amount,
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t('points.balance')}:{' '}
                                                {formatNumber(
                                                    transaction.balance_after,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <PaginationBar links={transactions.links} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
