import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import LessonRecords from './pages/LessonRecords';
import Reports from './pages/Reports';
import Tuition from './pages/Tuition';
import Counseling from './pages/Counseling';
import Schedule from './pages/Schedule';
import MeetingNotes from './pages/MeetingNotes';
import TestGenerator from './pages/TestGenerator';
import ComingSoon from './pages/ComingSoon';
import type { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'classes':
        return <Classes />;
      case 'lesson-records':
        return <LessonRecords />;
      case 'reports':
        return <Reports />;
      case 'tuition':
        return <Tuition />;
      case 'counseling':
        return <Counseling />;
      case 'schedule':
        return <Schedule />;
      case 'meeting-notes':
        return <MeetingNotes />;
      case 'test-generator':
        return <TestGenerator />;
      default:
        return <ComingSoon pageName={currentPage} />;
    }
  }, [currentPage]);

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