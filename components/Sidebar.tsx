import React from 'react';
import Logo from './Logo';
import { DashboardIcon, StudentsIcon, TestGeneratorIcon, ReportsIcon, ClassesIcon, TuitionIcon, ScheduleIcon } from './Icons';
import type { Page } from '../types';

// Placeholder icons for new items
const LessonRecordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18" /></svg>
);
const CounselingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const MeetingNotesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h2m-4 3h2m-4 3h2" /></svg>
);


interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  page: Page;
  currentPage: Page;
  onClick: (page: Page) => void;
}> = ({ icon, label, page, currentPage, onClick }) => {
  const isActive = currentPage === page;
  return (
    <li
      onClick={() => onClick(page)}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-[#E5A823] text-gray-900 shadow-lg'
          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      <div className="w-6 h-6 mr-4">{icon}</div>
      <span className="font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { page: 'dashboard', label: '대시보드', icon: <DashboardIcon /> },
    { page: 'students', label: '학생 관리', icon: <StudentsIcon /> },
    { page: 'classes', label: '반/수업 관리', icon: <ClassesIcon /> },
    { page: 'lesson-records', label: '수업 기록', icon: <LessonRecordIcon /> },
    { page: 'reports', label: '리포트 관리', icon: <ReportsIcon /> },
    { page: 'tuition', label: '수강료 관리', icon: <TuitionIcon /> },
    { page: 'counseling', label: '상담 기록', icon: <CounselingIcon /> },
    { page: 'schedule', label: '연간 일정', icon: <ScheduleIcon /> },
    { page: 'meeting-notes', label: '회의록', icon: <MeetingNotesIcon /> },
    { page: 'test-generator', label: '시험지 생성기', icon: <TestGeneratorIcon /> },
  ];

  return (
    <nav className="w-64 bg-[#142f29] flex flex-col">
      <Logo />
      <div className="flex-grow p-4">
        <ul>
          {menuItems.map(item => (
            <NavItem
              key={item.page}
              icon={item.icon}
              label={item.label}
              page={item.page as Page}
              currentPage={currentPage}
              onClick={setCurrentPage}
            />
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-400">&copy; 2024 Hera Math</p>
      </div>
    </nav>
  );
};

export default Sidebar;