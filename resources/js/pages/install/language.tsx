import { Head } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const languages = [
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function InstallLanguage() {
    return (
        <>
            <Head title="语言选择 - 安装向导">
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="w-full max-w-2xl">
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle>语言选择</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action="/install/language" method="POST" className="space-y-4">
                                <input type="hidden" name="_token" value={window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                                {languages.map((lang) => (
                                    <label key={lang.code} className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <input type="radio" name="locale" value={lang.code} defaultChecked={lang.code === 'zh'} className="w-5 h-5" />
                                        <span className="text-2xl">{lang.flag}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 dark:text-white">{lang.name}</div>
                                            <div className="text-xs text-gray-500">{lang.code === 'zh' && '简体中文'}</div>
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
