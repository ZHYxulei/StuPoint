import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Users2, Settings2, Plus, Trash2, Mail } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: '管理员', href: '/admin' },
    { title: '班级管理', href: '/admin/classes' },
    { title: '班级详情', href: '/admin/classes/[id]' },
];

export default function ShowClass({ class: classData, availableTeachers, availableStudents }: PageProps) {
    const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');

    const { data: teacherData, setData: setTeacherData, post: postTeacher, processing: teacherProcessing, reset: resetTeacher } = useForm({
        teacher_id: '',
        subject: '',
    });

    const { data: studentData, setData: setStudentData, post: postStudent, processing: studentProcessing, reset: resetStudent } = useForm({
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
        if (confirm('确认移除该任课老师？')) {
            useForm({}).delete(`/admin/classes/${classData.id}/teachers/${teacherId}`, {
                preserveScroll: true,
            });
        }
    };

    const removeStudent = (studentId: string) => {
        if (confirm('确认移除该学生？')) {
            useForm({}).delete(`/admin/classes/${classData.id}/students/${studentId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`班级详情 - ${classData.full_name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/classes">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading
                        title={classData.full_name}
                        description="管理班级信息、教师和学生"
                    />
                </div>

                {/* Class Info */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users2 className="h-4 w-4" />
                                班级信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">年级</span>
                                <span className="font-medium">{classData.grade}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">班级</span>
                                <span className="font-medium">{classData.name}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">班主任</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {classData.head_teacher ? (
                                <div className="space-y-1">
                                    <p className="font-medium">{classData.head_teacher.name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {classData.head_teacher.email}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">未设置</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">统计</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">任课老师</span>
                                <span className="font-medium">{classData.teachers.length} 人</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">学生</span>
                                <span className="font-medium">{classData.students.length} 人</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Teachers and Students Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList>
                        <TabsTrigger value="teachers">
                            <Settings2 className="mr-2 h-4 w-4" />
                            任课老师 ({classData.teachers.length})
                        </TabsTrigger>
                        <TabsTrigger value="students">
                            <Users2 className="mr-2 h-4 w-4" />
                            学生 ({classData.students.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="teachers" className="space-y-4">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>分配任课老师</CardTitle>
                                <CardDescription>
                                    为班级添加任课老师并指定任教科目
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAssignTeacher} className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="teacher_id">教师</Label>
                                        <Select
                                            value={teacherData.teacher_id}
                                            onValueChange={(value) => setTeacherData('teacher_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择教师" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTeachers.map((teacher) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                        {teacher.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="subject">任教科目</Label>
                                        <Input
                                            id="subject"
                                            placeholder="例如: 数学、语文"
                                            value={teacherData.subject}
                                            onChange={(e) => setTeacherData('subject', e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={teacherProcessing}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        添加
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            {classData.teachers.map((assignment) => (
                                <Card key={assignment.id} className="border-sidebar-border/70 dark:border-sidebar-border">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">
                                                {assignment.teacher.name}
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTeacher(assignment.teacher.id.toString())}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                            <Mail className="h-3 w-3" />
                                            {assignment.teacher.email}
                                        </p>
                                        {assignment.subject && (
                                            <Badge variant="secondary">{assignment.subject}</Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="students" className="space-y-4">
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle>添加学生</CardTitle>
                                <CardDescription>
                                    将学生添加到当前班级
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddStudent} className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="student_id">学生</Label>
                                        <Select
                                            value={studentData.student_id}
                                            onValueChange={(value) => setStudentData('student_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择学生" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStudents.map((student) => (
                                                    <SelectItem key={student.id} value={student.id.toString()}>
                                                        {student.name} ({student.student_id})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" disabled={studentProcessing}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        添加
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
                                                <p className="font-medium">{assignment.student.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    学号: {assignment.student.student_id}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeStudent(assignment.student.id.toString())}
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
