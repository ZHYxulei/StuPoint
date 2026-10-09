import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const languages = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function InstallLanguage() {
    return (
        <>
            <Head title="语言选择 - 安装向导">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="flex min-h-screen items-center justify-center bg-muted p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>语言选择</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                action="/install/language"
                                method="POST"
                                className="space-y-4"
                            >
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={
                                        window.document
                                            .querySelector(
                                                'meta[name="csrf-token"]',
                                            )
                                            ?.getAttribute('content') || ''
                                    }
                                />
                                {languages.map((lang) => (
                                    <label
                                        key={lang.code}
                                        className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                                    >
                                        <input
                                            type="radio"
                                            name="locale"
                                            value={lang.code}
                                            defaultChecked={
                                                lang.code === 'zh-CN'
                                            }
                                            className="h-5 w-5"
                                        />
                                        <span className="text-2xl">
                                            {lang.flag}
                                        </span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-foreground">
                                                {lang.name}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" className="w-full">
                                        下一步
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
