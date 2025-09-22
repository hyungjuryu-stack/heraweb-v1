
import React from 'react';
import Logo from './Logo';
import { 
    DashboardIcon, 
    StudentsIcon, 
    TestGeneratorIcon, 
    ReportsIcon, 
    ClassesIcon, 
    TeacherIcon, 
    TuitionIcon, 
    ScheduleIcon, 
    ClassAttendanceIcon,
    LessonRecordIcon,
    CounselingIcon,
    MeetingNotesIcon,
    ClockIcon,
    LogoutIcon,
    SettingsIcon,
    ManualIcon
} from './Icons';
import type { Page, User } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User;
  onLogout: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const menuItems = [
    { page: 'dashboard', label: '대시보드', icon: <DashboardIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'daily-schedule', label: '오늘의 수업일정', icon: <ClockIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'class-attendance', label: '수업 출석부', icon: <ClassAttendanceIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'reports', label: '리포트 관리', icon: <ReportsIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'counseling', label: '상담 기록', icon: <CounselingIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'students', label: '학생 관리', icon: <StudentsIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'classes', label: '반/수업 관리', icon: <ClassesIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'teachers', label: '강사 관리', icon: <TeacherIcon />, allowedRoles: ['admin', 'operator'] },
    { page: 'lesson-records', label: '수업 기록', icon: <LessonRecordIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'tuition', label: '수강료 관리', icon: <TuitionIcon />, allowedRoles: ['admin', 'operator'] },
    { page: 'schedule', label: '연간 일정', icon: <ScheduleIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
    { page: 'meeting-notes', label: '회의록', icon: <MeetingNotesIcon />, allowedRoles: ['admin', 'operator'] },
    { page: 'test-generator', label: '시험지 생성기', icon: <TestGeneratorIcon />, allowedRoles: ['admin', 'operator', 'teacher'] },
  ];

  const accessibleMenuItems = menuItems.filter(item => item.allowedRoles.includes(user.role));

  const roleNameMap = {
    admin: '관리자',
    operator: '운영자',
    teacher: '강사',
  };

  return (
    <nav className="w-64 bg-[#142f29] flex flex-col">
      <Logo />
      <div className="flex-grow p-4 overflow-y-auto">
        <ul>
          {accessibleMenuItems.map(item => (
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
      <div className="p-4">
        <ul>
            <NavItem
                icon={<ManualIcon />}
                label="사용설명서"
                page="user-manual"
                currentPage={currentPage}
                onClick={setCurrentPage}
            />
            <NavItem
                icon={<SettingsIcon />}
                label="내 정보 / 변경"
                page="mypage"
                currentPage={currentPage}
                onClick={setCurrentPage}
            />
        </ul>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="text-center mb-4">
            <p className="text-sm font-medium text-white">{user.name}님</p>
            <p className="text-xs text-gray-400">{roleNameMap[user.role]}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200 bg-gray-700/50 hover:bg-red-800/50 text-red-400 hover:text-white"
          aria-label="로그아웃"
        >
          <LogoutIcon className="w-5 h-5 mr-2" />
          <span className="font-medium text-sm">로그아웃</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;