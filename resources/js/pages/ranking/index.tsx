import { Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaginationBar from '@/components/pagination-bar';
import { Empty } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, User } from 'lucide-react';

interface RankingEntry {
    id: number;
    display_name: string;
    grade: string | null;
    class: string | null;
    total_points: number;
    redeemable_points: number;
    rank: number;
}

interface PageProps {
    rankings: {
        data: RankingEntry[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    userRanking: RankingEntry | null;
    filters: {
        type?: string;
        per_page?: string;
    };
}

export default function RankingIndex({ rankings, userRanking }: PageProps) {
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;
    const currentUserId = auth.user?.id;

    // Helper function to get display name
    const getDisplayName = (user: RankingEntry) => {
        return user.display_name;
    };

    const getRankDisplay = (rank: number, isCurrentUser?: boolean) => {
        const containerClass = isCurrentUser ? 'ring-2 ring-primary ring-offset-2 p-2 rounded-xl' : '';
        const rankText = (
            <span className="text-xl font-bold text-muted-foreground min-w-[3rem]">
                #{rank}
            </span>
        );

        if (rank === 1) {
            return (
                <div className={`flex items-center gap-3 ${containerClass}`}>
                    {rankText}
                    <div className="flex size-14 items-center justify-center rounded-full border border-warning/30 bg-warning-soft text-warning-foreground shadow-sm">
                        <Trophy className="size-7" aria-hidden="true" />
                    </div>
                </div>
            );
        }
        if (rank === 2) {
            return (
                <div className={`flex items-center gap-3 ${containerClass}`}>
                    {rankText}
                    <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface-3 text-muted-foreground shadow-sm">
                        <Trophy className="size-7" aria-hidden="true" />
                    </div>
                </div>
            );
        }
        if (rank === 3) {
            return (
                <div className={`flex items-center gap-3 ${containerClass}`}>
                    {rankText}
                    <div className="flex size-14 items-center justify-center rounded-full border border-warning/20 bg-warning-soft/70 text-warning-foreground shadow-sm">
                        <Trophy className="size-7" aria-hidden="true" />
                    </div>
                </div>
            );
        }
        return (
            <div className={`flex items-center ${containerClass}`}>
                <span className="text-xl font-bold text-muted-foreground">
                    #{rank}
                </span>
            </div>
        );
    };

    return (
        <PublicLayout>
            <Head title="积分排行榜" />

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="border-b bg-card/30 py-12">
                    <div className="container text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <Trophy className="h-7 w-7" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2">积分排行榜</h1>
                        <p className="text-muted-foreground">
                            查看学生积分排名，激励学习进步
                        </p>
                    </div>
                </div>

                <div className="container py-8 space-y-6">
                    {/* User's Ranking Card */}
                    {userRanking && userRanking.total_points && (
                        <Card className="border-primary/50 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    我的排名
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {getRankDisplay(userRanking.rank)}
                                        <div>
                                            <p className="font-semibold">{getDisplayName(userRanking)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {userRanking.grade} {userRanking.class}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-primary">
                                            {userRanking.total_points?.toLocaleString() || 0}
                                        </div>
                                        <p className="text-sm text-muted-foreground">总积分</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rankings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                学校积分排名
                            </CardTitle>
                            <CardDescription>
                                共 {rankings.total} 名学生
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {rankings.data.map((user) => {
                                    const isCurrentUser = currentUserId === user.id;

                                    return (
                                        <div
                                            key={user.id}
                                            className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${isCurrentUser ? 'border-primary/50 bg-primary/5' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-32 flex justify-center">
                                                    {getRankDisplay(user.rank, isCurrentUser)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">{getDisplayName(user)}</p>
                                                        {isCurrentUser && (
                                                            <Badge variant="default" className="text-xs">我</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.grade} {user.class}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary">
                                                    {user.total_points?.toLocaleString() || 0}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    可用: {user.redeemable_points?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {rankings.data.length === 0 && (
                                    <Empty
                                        icon={Trophy}
                                        title="暂无排名数据"
                                        description="积分产生后，学生排名会显示在这里。"
                                    />
                                )}
                            </div>

                            {rankings.last_page > 1 && (
                                <PaginationBar links={rankings.links} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}
