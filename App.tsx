

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
// FIX: Changed to a named import to resolve the "no default export" error.
import { Students } from './pages/Students';
import TestGenerator from './pages/TestGenerator';
import Reports from './pages/Reports';
import Classes from './pages/Classes';
import Schedule from './pages/Schedule';
import DailySchedule from './pages/DailySchedule';
import LessonRecords from './pages/LessonRecords';
import Tuition from './pages/Tuition';
import Counseling from './pages/Counseling';
import MeetingNotes from './pages/MeetingNotes';
import ClassAttendance from './pages/ClassAttendance';
import Teachers from './pages/Teachers';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import UserManual from './pages/UserManual';
import Messaging from './pages/Messaging';
import { useMockData } from './hooks/useMockData';
import { useAuth } from './hooks/useAuth';
import type { Page } from './types';

const App: React.FC = () => {
    const data = useMockData();
    const auth = useAuth();
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    useEffect(() => {
        if (auth.user?.mustChangePassword) {
            setCurrentPage('mypage');
        } else if (!auth.user) {
            setCurrentPage('dashboard');
        }
    }, [auth.user]);
    
    if (!auth.user) {
        return <LoginPage auth={auth} />;
    }

    if (auth.user.mustChangePassword) {
        return (
            <div className="flex h-screen bg-[#0d211c] text-white">
                <Sidebar 
                    currentPage="mypage"
                    setCurrentPage={() => {}}
                    user={auth.user} 
                    onLogout={auth.logout} 
                />
                <main className="flex-1 p-8 overflow-y-auto">
                    <MyPage user={auth.user} onChangePassword={auth.changePassword} />
                </main>
            </div>
        );
    }
    
    // Role-based data filtering
    let pageData = { ...data };
    if (auth.user.role === 'teacher') {
        const teacherId = auth.user.teacherId;
        const teacherClasses = data.classes.filter(c => c.teacherIds.includes(teacherId));
        const teacherClassIds = new Set(teacherClasses.map(c => c.id));
        const teacherStudents = data.students.filter(s => 
            (s.regularClassId && teacherClassIds.has(s.regularClassId)) || 
            (s.advancedClassId && teacherClassIds.has(s.advancedClassId))
        );
        const teacherStudentIds = new Set(teacherStudents.map(s => s.id));

        pageData = {
            ...data,
            classes: teacherClasses,
            students: teacherStudents,
            lessonRecords: data.lessonRecords.filter(r => teacherStudentIds.has(r.studentId)),
            monthlyReports: data.monthlyReports.filter(r => teacherStudentIds.has(r.studentId)),
            counselings: data.counselings.filter(c => teacherStudentIds.has(c.studentId)),
            // Dashboard data would also need filtering, handled inside the component for simplicity
        };
    }
    
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard 
                    user={auth.user}
                    dashboardData={data.dashboardData}
                    students={pageData.students}
                    classes={pageData.classes}
                    teachers={data.teachers}
                />;
            case 'students':
                return <Students 
                    user={auth.user}
                    students={pageData.students} setStudents={data.setStudents}
                    classes={data.classes} setClasses={data.setClasses}
                    teachers={data.teachers}
                    monthlyReports={pageData.monthlyReports} setMonthlyReports={data.setMonthlyReports}
                    tuitions={pageData.tuitions} setTuitions={data.setTuitions}
                    counselings={pageData.counselings} setCounselings={data.setCounselings}
                    lessonRecords={pageData.lessonRecords}
                    setLessonRecords={data.setLessonRecords}
                 />;
            case 'classes':
                return <Classes user={auth.user} classes={pageData.classes} setClasses={data.setClasses} teachers={data.teachers} students={data.students} setStudents={data.setStudents} />;
            case 'teachers':
                 if (auth.user.role === 'teacher') return <Dashboard user={auth.user} {...data} students={pageData.students} classes={pageData.classes}/>;
                return <Teachers user={auth.user} teachers={data.teachers} setTeachers={data.setTeachers} setStudents={data.setStudents} setClasses={data.setClasses} />;
            case 'lesson-records':
                return <LessonRecords 
                    lessonRecords={pageData.lessonRecords} 
                    setLessonRecords={data.setLessonRecords} 
                    students={pageData.students}
                    classes={pageData.classes} 
                    teachers={data.teachers} 
                />;
            case 'class-attendance':
                return <ClassAttendance user={auth.user} classes={pageData.classes} students={data.students} teachers={data.teachers} lessonRecords={data.lessonRecords} setLessonRecords={data.setLessonRecords} />;
            case 'reports':
                return <Reports user={auth.user} monthlyReports={pageData.monthlyReports} setMonthlyReports={data.setMonthlyReports} students={pageData.students} teachers={data.teachers} lessonRecords={data.lessonRecords} classes={data.classes}/>;
            case 'tuition':
                 if (auth.user.role === 'teacher') return <Dashboard user={auth.user} {...data} students={pageData.students} classes={pageData.classes}/>;
                return <Tuition tuitions={data.tuitions} setTuitions={data.setTuitions} students={data.students} classes={data.classes} />;
            case 'counseling':
                return <Counseling user={auth.user} counselings={pageData.counselings} setCounselings={data.setCounselings} students={pageData.students} teachers={data.teachers} />;
            case 'messaging':
                return <Messaging students={pageData.students} classes={pageData.classes} />;
            case 'schedule':
                return <Schedule academyEvents={data.academyEvents} setAcademyEvents={data.setAcademyEvents} />;
            case 'daily-schedule':
                return <DailySchedule classes={pageData.classes} students={data.students} teachers={data.teachers} />;
            case 'meeting-notes':
                 if (auth.user.role === 'teacher') return <Dashboard user={auth.user} {...data} students={pageData.students} classes={pageData.classes}/>;
                return <MeetingNotes meetingNotes={data.meetingNotes} setMeetingNotes={data.setMeetingNotes} teachers={data.teachers} />;
            case 'test-generator':
                return <TestGenerator />;
            case 'user-manual':
                return <UserManual />;
            case 'mypage':
                return auth.user ? <MyPage user={auth.user} onChangePassword={auth.changePassword} /> : null;
            default:
                return <Dashboard 
                    user={auth.user}
                    dashboardData={data.dashboardData}
                    students={data.students}
                    classes={data.classes}
                    teachers={data.teachers}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-[#0d211c] text-white">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} user={auth.user} onLogout={auth.logout} />
            <main className="flex-1 p-8 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;