import React, { useState } from 'react';
import Card from './ui/Card';
import type { Student, MonthlyReport, Tuition, Counseling } from '../types';
import { ReportsIcon, TuitionIcon, CounselingIcon } from './Icons';

interface StudentDetailViewProps {
  student: Student;
  onClose: () => void;
  onEdit: (student: Student) => void;
  monthlyReports: MonthlyReport[];
  tuitions: Tuition[];
  counselings: Counseling[];
  teacherMap: Map<number, string>;
}

const ReportList: React.FC<{ studentId: number, monthlyReports: MonthlyReport[] }> = ({ studentId, monthlyReports }) => {
    const studentReports = monthlyReports.filter(r => r.studentId === studentId)
        .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
    
    if (studentReports.length === 0) {
        return <div className="text-center text-gray-500 py-4">리포트 기록이 없습니다.</div>;
    }

    return (
        <div className="space-y-3">
            {studentReports.map(report => (
                <div key={report.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-200">{report.period}</span>
                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            report.sentStatus === '발송완료' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>{report.sentStatus}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">발송일: {report.sentDate}</p>
                </div>
            ))}
        </div>
    );
};

const TuitionList: React.FC<{ studentId: number, tuitions: Tuition[] }> = ({ studentId, tuitions }) => {
    const studentTuitions = tuitions.filter(t => t.studentId === studentId);
    if (studentTuitions.length === 0) {
        return <div className="text-center text-gray-500 py-4">수강료 내역이 없습니다.</div>;
    }
    return (
        <div className="space-y-3">
            {studentTuitions.map(tuition => (
                <div key={tuition.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                     <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-200">{tuition.plan} ({tuition.course})</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tuition.paymentStatus === '결제완료' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>{tuition.paymentStatus}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">금액: {tuition.totalFee.toLocaleString()}원</p>
                </div>
            ))}
        </div>
    );
};

const CounselingList: React.FC<{ studentId: number, counselings: Counseling[], teacherMap: Map<number, string> }> = ({ studentId, counselings, teacherMap }) => {
    const studentCounselings = counselings.filter(c => c.studentId === studentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (studentCounselings.length === 0) {
        return <div className="text-center text-gray-500 py-4">상담 기록이 없습니다.</div>;
    }
    return (
        <div className="space-y-3">
            {studentCounselings.map(counsel => (
                <div key={counsel.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-200">{counsel.date}</span>
                        <span className="text-gray-400 text-xs">{teacherMap.get(counsel.teacherId)}</span>
                    </div>
                    <p className="text-gray-300 mt-2 truncate">{counsel.content}</p>
                </div>
            ))}
        </div>
    );
};

const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  onClose,
  onEdit,
  monthlyReports,
  tuitions,
  counselings,
  teacherMap,
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState<'reports' | 'tuition' | 'counseling'>('reports');

  const TabButton = ({ icon, label, tab }: { icon: React.ReactNode; label: string; tab: 'reports' | 'tuition' | 'counseling' }) => {
    const isActive = activeDetailTab === tab;
    return (
        <button
            onClick={() => setActiveDetailTab(tab)}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                ? 'border-[#E5A823] text-[#E5A823]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
            {icon}
            {label}
        </button>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{student.name}</h3>
          <p className="text-sm text-gray-400">{student.grade} / {student.school}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(student)}
            className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-medium py-1 px-3 rounded-md transition-colors"
          >
            수정
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-4">
        <TabButton icon={<ReportsIcon className="w-5 h-5 mr-2" />} label="리포트" tab="reports" />
        <TabButton icon={<TuitionIcon className="w-5 h-5 mr-2" />} label="수강료" tab="tuition" />
        <TabButton icon={<CounselingIcon className="w-5 h-5 mr-2"/>} label="상담" tab="counseling" />
      </div>

      <div className="max-h-[55vh] overflow-y-auto pr-2">
        {activeDetailTab === 'reports' && <ReportList studentId={student.id} monthlyReports={monthlyReports} />}
        {activeDetailTab === 'tuition' && <TuitionList studentId={student.id} tuitions={tuitions} />}
        {activeDetailTab === 'counseling' && <CounselingList studentId={student.id} counselings={counselings} teacherMap={teacherMap} />}
      </div>
    </Card>
  );
};

export default StudentDetailView;