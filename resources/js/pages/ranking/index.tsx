import { Head, Link, usePage } from '@inertiajs/react';
import PublicNavbar from '@/components/public-navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';

interface UserPoint {
    total_points: number;
    redeemable_points: number;
}

interface UserRole {
    slug: string;
}

interface UserWithPoints {
    id: number;
    name: string;
    nickname: string | null;
    email: string;
    grade: string | null;
    class: string | null;
    student_id: string | null;
    total_points: number;
    redeemable_points: number;
    points?: UserPoint;
    rank: number;
    roles: UserRole[];
}

interface PageProps {
    rankings: {
        data: UserWithPoints[];
        current_page: number;
        last_page: number;
        total: number;
    };
    userRanking: UserWithPoints | null;
    filters: {
        type?: string;
        per_page?: string;
    };
}

export default function RankingIndex({ rankings, userRanking, filters }: PageProps) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;
    const currentUserId = auth.user?.id;

    // Helper function to get display name
    const getDisplayName = (user: UserWithPoints) => {
        return user.nickname || user.name;
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
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg">
                        <Trophy className="h-7 w-7" />
                    </div>
                </div>
            );
        }
        if (rank === 2) {
            return (
                <div className={`flex items-center gap-3 ${containerClass}`}>
                    {rankText}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg">
                        <Trophy className="h-7 w-7" />
                    </div>
                </div>
            );
        }
        if (rank === 3) {
            return (
                <div className={`flex items-center gap-3 ${containerClass}`}>
                    {rankText}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg">
                        <Trophy className="h-7 w-7" />
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
        <>
            <Head title="积分排行榜" />
            <PublicNavbar showMobileMenu={showMobileMenu} onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)} />

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
                    <div className="container text-center">
                        <Trophy className="h-12 w-12 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold mb-2">积分排行榜</h1>
                        <p className="text-blue-100">
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
                                                        {user.student_id && ` · ${user.student_id}`}
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
                                    <div className="text-center py-12 text-muted-foreground">
                                        暂无排名数据
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {rankings.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {rankings.current_page > 1 && (
                                        <Link
                                            href={`?page=${rankings.current_page - 1}`}
                                            className="px-4 py-2 border rounded-md hover:bg-accent"
                                        >
                                            上一页
                                        </Link>
                                    )}
                                    <span className="px-4 py-2">
                                        第 {rankings.current_page} / {rankings.last_page} 页
                                    </span>
                                    {rankings.current_page < rankings.last_page && (
                                        <Link
                                            href={`?page=${rankings.current_page + 1}`}
                                            className="px-4 py-2 border rounded-md hover:bg-accent"
                                        >
                                            下一页
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
