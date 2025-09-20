import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import LessonRecords from './pages/LessonRecords';
import Reports from './pages/Reports';
import Tuition from './pages/Tuition';
import Counseling from './pages/Counseling';
import Schedule from './pages/Schedule';
import MeetingNotes from './pages/MeetingNotes';
import TestGenerator from './pages/TestGenerator';
import ClassAttendance from './pages/ClassAttendance';
import ComingSoon from './pages/ComingSoon';
import type { Page } from './types';
import { useMockData } from './hooks/useMockData';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const allData = useMockData();

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard dashboardData={allData.dashboardData} />;
      case 'students':
        return <Students 
            students={allData.students} setStudents={allData.setStudents}
            classes={allData.classes} setClasses={allData.setClasses}
            teachers={allData.teachers}
            setLessonRecords={allData.setLessonRecords}
            setMonthlyReports={allData.setMonthlyReports}
            setTuitions={allData.setTuitions}
            setCounselings={allData.setCounselings}
        />;
      case 'classes':
        return <Classes 
            classes={allData.classes} setClasses={allData.setClasses}
            teachers={allData.teachers}
            students={allData.students} setStudents={allData.setStudents}
        />;
      case 'teachers':
        return <Teachers
            teachers={allData.teachers} setTeachers={allData.setTeachers}
            setStudents={allData.setStudents}
            setClasses={allData.setClasses}
        />;
      case 'lesson-records':
        return <LessonRecords 
            lessonRecords={allData.lessonRecords} setLessonRecords={allData.setLessonRecords}
            students={allData.students}
        />;
      case 'class-attendance':
          return <ClassAttendance 
              classes={allData.classes}
              students={allData.students}
              lessonRecords={allData.lessonRecords}
              setLessonRecords={allData.setLessonRecords}
          />;
      case 'reports':
        return <Reports 
            monthlyReports={allData.monthlyReports} setMonthlyReports={allData.setMonthlyReports}
            students={allData.students}
            teachers={allData.teachers}
        />;
      case 'tuition':
        return <Tuition 
            tuitions={allData.tuitions} setTuitions={allData.setTuitions}
            students={allData.students}
        />;
      case 'counseling':
        return <Counseling 
            counselings={allData.counselings} setCounselings={allData.setCounselings}
            students={allData.students}
            teachers={allData.teachers}
        />;
      case 'schedule':
        return <Schedule 
            academyEvents={allData.academyEvents} setAcademyEvents={allData.setAcademyEvents}
        />;
      case 'meeting-notes':
        return <MeetingNotes 
            meetingNotes={allData.meetingNotes} setMeetingNotes={allData.setMeetingNotes}
            teachers={allData.teachers}
        />;
      case 'test-generator':
        return <TestGenerator />;
      default:
        return <ComingSoon pageName={currentPage} />;
    }
  }, [currentPage, allData]);

  return (
    <div className="flex h-screen bg-[#1A3A32] text-gray-200">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900/50">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
