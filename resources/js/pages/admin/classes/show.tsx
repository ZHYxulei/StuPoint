import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Users2,
    Settings2,
    Plus,
    Trash2,
    Mail,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { t } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Student {
    id: number;
    name: string;
    student_id: string;
}

interface AssignedTeacher {
    id: number;
    teacher: {
        id: number;
        name: string;
        email: string;
    };
    subject: string | null;
}

interface AssignedStudent {
    id: number;
    student: {
        id: number;
        name: string;
        student_id: string;
    };
}

interface ClassData {
    id: number;
    name: string;
    grade: string;
    full_name: string;
    head_teacher: {
        id: number;
        name: string;
        email: string;
    } | null;
    teachers: AssignedTeacher[];
    students: AssignedStudent[];
}

interface PageProps {
    class: ClassData;
    availableTeachers: Teacher[];
    availableStudents: Student[];
}

export default function ShowClass({
    class: classData,
    availableTeachers,
    availableStudents,
}: PageProps) {
    // Built here, not at module scope: `t()` would otherwise run on import,
    // before the locale is known, and freeze the default language.
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.admin'), href: '/admin' },
        { title: t('nav.classes'), href: '/admin/classes' },
        { title: t('admin.classes.detail_title'), href: '/admin/classes/[id]' },
    ];

    const [activeTab, setActiveTab] = useState<'teachers' | 'students'>(
        'teachers',
    );

    const {
        data: teacherData,
        setData: setTeacherData,
        post: postTeacher,
        processing: teacherProcessing,
        reset: resetTeacher,
    } = useForm({
        teacher_id: '',
        subject: '',
    });

    const {
        data: studentData,
        setData: setStudentData,
        post: postStudent,
        processing: studentProcessing,
        reset: resetStudent,
    } = useForm({
        student_id: '',
    });

    const handleAssignTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        postTeacher(`/admin/classes/${classData.id}/teachers`, {
            onSuccess: () => resetTeacher(),
        });
    };

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        postStudent(`/admin/classes/${classData.id}/students`, {
            onSuccess: () => resetStudent(),
        });
    };

    const removeTeacher = (teacherId: string) => {
        if (confirm(t('admin.classes.confirm_remove_teacher'))) {
            router.delete(
                `/admin/classes/${classData.id}/teachers/${teacherId}`,
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const removeStudent = (studentId: string) => {
        if (confirm(t('admin.classes.confirm_remove_student'))) {
            router.delete(
                `/admin/classes/${classData.id}/students/${studentId}`,
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('admin.classes.detail_head_title', {
                    name: classData.full_name,
                })}
            />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/classes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title={classData.full_name}
                        description={t('admin.classes.detail_description')}
                    />
                </div>

                {/* Class Info */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users2 className="h-4 w-4" />
                                {t('admin.classes.info_title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t('admin.classes.grade')}
                                </span>
                                <span className="font-medium">
                                    {classData.grade}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t('admin.classes.class')}
                                </span>
                                <span className="font-medium">
                                    {classData.name}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                {t('admin.classes.head_teacher')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {classData.head_teacher ? (
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        {classData.head_teacher.name}
                                    </p>
                                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {classData.head_teacher.email}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t('profile.not_set')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                {t('admin.classes.statistics')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t('admin.classes.subject_teachers')}
                                </span>
                                <span className="font-medium">
                                    {t('admin.classes.people_count', {
                                        count: classData.teachers.length,
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t('admin.classes.students')}
                                </span>
                                <span className="font-medium">
                                    {t('admin.classes.people_count', {
                                        count: classData.students.length,
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Teachers and Students Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                >
                    <TabsList>
                        <TabsTrigger value="teachers">
                            <Settings2 className="mr-2 h-4 w-4" />
                            {t('admin.classes.teachers_tab', {
                                count: classData.teachers.length,
                            })}
                        </TabsTrigger>
                        <TabsTrigger value="students">
                            <Users2 className="mr-2 h-4 w-4" />
                            {t('admin.classes.students_tab', {
                                count: classData.students.length,
                            })}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="teachers" className="space-y-4">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>
                                    {t('admin.classes.assign_teacher_title')}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'admin.classes.assign_teacher_description',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleAssignTeacher}
                                    className="flex items-end gap-4"
                                >
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="teacher_id">
                                            {t('admin.classes.teacher')}
                                        </Label>
                                        <Select
                                            value={teacherData.teacher_id}
                                            onValueChange={(value) =>
                                                setTeacherData(
                                                    'teacher_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={t(
                                                        'admin.classes.select_teacher',
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTeachers.map(
                                                    (teacher) => (
                                                        <SelectItem
                                                            key={teacher.id}
                                                            value={teacher.id.toString()}
                                                        >
                                                            {teacher.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="subject">
                                            {t('admin.classes.subject')}
                                        </Label>
                                        <Input
                                            id="subject"
                                            placeholder={t(
                                                'admin.classes.subject_placeholder',
                                            )}
                                            value={teacherData.subject}
                                            onChange={(e) =>
                                                setTeacherData(
                                                    'subject',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={teacherProcessing}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('admin.classes.add')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            {classData.teachers.map((assignment) => (
                                <Card
                                    key={assignment.id}
                                    className="border-sidebar-border/70 dark:border-sidebar-border"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">
                                                {assignment.teacher.name}
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeTeacher(
                                                        assignment.teacher.id.toString(),
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            {assignment.teacher.email}
                                        </p>
                                        {assignment.subject && (
                                            <Badge variant="secondary">
                                                {assignment.subject}
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="students" className="space-y-4">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>
                                    {t('admin.classes.add_student_title')}
                                </CardTitle>
                                <CardDescription>
                                    {t(
                                        'admin.classes.add_student_description',
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleAddStudent}
                                    className="flex items-end gap-4"
                                >
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="student_id">
                                            {t('admin.classes.students')}
                                        </Label>
                                        <Select
                                            value={studentData.student_id}
                                            onValueChange={(value) =>
                                                setStudentData(
                                                    'student_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={t(
                                                        'admin.classes.select_student',
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStudents.map(
                                                    (student) => (
                                                        <SelectItem
                                                            key={student.id}
                                                            value={student.id.toString()}
                                                        >
                                                            {student.name} (
                                                            {student.student_id}
                                                            )
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={studentProcessing}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('admin.classes.add')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {classData.students.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-4 hover:bg-muted/50"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {assignment.student.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t(
                                                        'admin.classes.student_id_label',
                                                        {
                                                            id: assignment
                                                                .student
                                                                .student_id,
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeStudent(
                                                        assignment.student.id.toString(),
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
