import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coins, ArrowLeft, Search, Filter } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Points',
        href: '/points',
    },
    {
        title: 'History',
        href: '/points/history',
    },
];

export default function PointsHistory({ transactions, filters }: PageProps) {
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
            <Head title="Point History" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Transaction History"
                        description="View all your point transactions"
                    />
                    <Link href="/points">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Points
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={filters.type || 'all'}
                                    onValueChange={(value) => get('/points/history', {
                                        data: { ...filters, type: value === 'all' ? null : value },
                                        preserveScroll: true,
                                    })}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="total">Total Points</SelectItem>
                                        <SelectItem value="redeemable">Redeemable Points</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="source">Source</Label>
                                <Input
                                    id="source"
                                    type="text"
                                    placeholder="Search by source..."
                                    value={filters.source || ''}
                                    onChange={(e) => get('/points/history', {
                                        data: { ...filters, source: e.target.value || null },
                                        preserveScroll: true,
                                    })}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            Showing {transactions.from} to {transactions.to} of {transactions.total} transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No transactions found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.data.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${
                                                transaction.amount > 0
                                                    ? 'bg-green-100 dark:bg-green-900/20'
                                                    : 'bg-red-100 dark:bg-red-900/20'
                                            }`}>
                                                <Coins className={`h-5 w-5 ${
                                                    transaction.amount > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {transaction.description || transaction.source}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{transaction.source}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{transaction.type}</span>
                                                    <span>•</span>
                                                    <span>{new Date(transaction.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-semibold ${
                                                transaction.amount > 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Balance: {transaction.balance_after.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {transactions.links.map((link, index) => (
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
