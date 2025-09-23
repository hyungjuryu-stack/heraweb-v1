
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
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
        // This effect handles automatic navigation.
        // When a user logs in with a temporary password, they are directed to 'mypage'.
        if (auth.user?.mustChangePassword) {
            setCurrentPage('mypage');
        }
    }, [auth.user]);
    
    if (!auth.user) {
        return <LoginPage auth={auth} />;
    }

    // If a password change is required, render a locked-down UI that only shows the MyPage component.
    // Navigation via the sidebar is disabled until the password is changed.
    if (auth.user.mustChangePassword) {
        return (
            <div className="flex h-screen bg-[#0d211c] text-white">
                <Sidebar 
                    currentPage="mypage" // Lock the active page display to 'mypage'
                    setCurrentPage={() => {}} // Disable sidebar navigation
                    user={auth.user} 
                    onLogout={auth.logout} 
                />
                <main className="flex-1 p-8 overflow-y-auto">
                    <MyPage user={auth.user} onChangePassword={auth.changePassword} />
                </main>
            </div>
        );
    }
    
    // Normal application flow when no password change is required.
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard 
                    dashboardData={data.dashboardData}
                    students={data.students}
                    classes={data.classes}
                    teachers={data.teachers}
                />;
            case 'students':
                return <Students 
                    students={data.students} setStudents={data.setStudents}
                    classes={data.classes} setClasses={data.setClasses}
                    teachers={data.teachers}
                    monthlyReports={data.monthlyReports} setMonthlyReports={data.setMonthlyReports}
                    tuitions={data.tuitions} setTuitions={data.setTuitions}
                    counselings={data.counselings} setCounselings={data.setCounselings}
                    lessonRecords={data.lessonRecords}
                    setLessonRecords={data.setLessonRecords}
                 />;
            case 'classes':
                return <Classes classes={data.classes} setClasses={data.setClasses} teachers={data.teachers} students={data.students} setStudents={data.setStudents} />;
            case 'teachers':
                return <Teachers teachers={data.teachers} setTeachers={data.setTeachers} setStudents={data.setStudents} setClasses={data.setClasses} />;
            case 'lesson-records':
                return <LessonRecords 
                    lessonRecords={data.lessonRecords} 
                    setLessonRecords={data.setLessonRecords} 
                    students={data.students}
                    classes={data.classes} 
                    teachers={data.teachers} 
                />;
            case 'class-attendance':
                // Pass the user object to enable role-based permissions for editing attendance records.
                return <ClassAttendance user={auth.user} classes={data.classes} students={data.students} teachers={data.teachers} lessonRecords={data.lessonRecords} setLessonRecords={data.setLessonRecords} />;
            case 'reports':
                return <Reports monthlyReports={data.monthlyReports} setMonthlyReports={data.setMonthlyReports} students={data.students} teachers={data.teachers} lessonRecords={data.lessonRecords} classes={data.classes}/>;
            case 'tuition':
                // FIX: Added the missing 'classes' prop required by the Tuition component for calculations.
                return <Tuition tuitions={data.tuitions} setTuitions={data.setTuitions} students={data.students} classes={data.classes} />;
            case 'counseling':
                return <Counseling counselings={data.counselings} setCounselings={data.setCounselings} students={data.students} teachers={data.teachers} />;
            case 'messaging':
                return <Messaging students={data.students} classes={data.classes} />;
            case 'schedule':
                return <Schedule academyEvents={data.academyEvents} setAcademyEvents={data.setAcademyEvents} />;
            case 'daily-schedule':
                return <DailySchedule classes={data.classes} students={data.students} teachers={data.teachers} />;
            case 'meeting-notes':
                return <MeetingNotes meetingNotes={data.meetingNotes} setMeetingNotes={data.setMeetingNotes} teachers={data.teachers} />;
            case 'test-generator':
                return <TestGenerator />;
            case 'user-manual':
                return <UserManual />;
            case 'mypage':
                return auth.user ? <MyPage user={auth.user} onChangePassword={auth.changePassword} /> : null;
            default:
                return <Dashboard 
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
