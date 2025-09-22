
import React, { useState } from 'react';
import Card from './ui/Card';
import type { Student, MonthlyReport, Tuition, Counseling, TrendAnalysis, LessonSummary } from '../types';
import { ReportsIcon, TuitionIcon, CounselingIcon, AnalysisIcon, ClockIcon, SummariesIcon } from './Icons';
import TrendAnalysisView from './TrendAnalysisModal';

interface StudentDetailViewProps {
  student: Student;
  allStudents: Student[];
  onClose: () => void;
  onEdit: (student: Student) => void;
  monthlyReports: MonthlyReport[];
  tuitions: Tuition[];
  counselings: Counseling[];
  teacherMap: Map<number, string>;
  onSaveAnalysis: (studentId: number, analysis: TrendAnalysis) => void;
  onDeleteSummary: (summaryId: number) => void;
}

const ReportList: React.FC<{ studentId: number, monthlyReports: MonthlyReport[] }> = ({ studentId, monthlyReports }) => {
    const studentReports = monthlyReports.filter(r => r.studentId === studentId)
        .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
    
    const totalCount = studentReports.length;

    if (totalCount === 0) {
        return <div className="text-center text-gray-500 py-4">리포트 기록이 없습니다.</div>;
    }

    const recentReports = studentReports.slice(0, 3);

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-3 px-1">
                <h4 className="text-md font-bold text-gray-200">최근 리포트</h4>
                <span className="text-sm text-gray-400">총 {totalCount}회 발행</span>
            </div>
            <div className="space-y-3">
                {recentReports.map(report => (
                    <div key={report.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-200">{report.period}</span>
                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                report.sentStatus === '발송완료' 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>{report.sentStatus}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {report.sentStatus === '발송완료' ? `발송일: ${report.sentDate}` : '미발송'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TuitionList: React.FC<{ studentId: number, tuitions: Tuition[] }> = ({ studentId, tuitions }) => {
    const studentTuitions = tuitions.filter(t => t.studentId === studentId)
        .sort((a, b) => b.month.localeCompare(a.month));

    const totalCount = studentTuitions.length;

    if (totalCount === 0) {
        return <div className="text-center text-gray-500 py-4">수강료 내역이 없습니다.</div>;
    }

    const recentTuitions = studentTuitions.slice(0, 3);

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-3 px-1">
                <h4 className="text-md font-bold text-gray-200">최근 수강료 내역</h4>
                <span className="text-sm text-gray-400">총 {totalCount}건</span>
            </div>
            <div className="space-y-3">
                {recentTuitions.map(tuition => (
                    <div key={tuition.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-200">{tuition.month} 수강료</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                tuition.paymentStatus === '결제완료' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                            }`}>{tuition.paymentStatus}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">금액: {tuition.finalFee.toLocaleString()}원</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CounselingList: React.FC<{ studentId: number, counselings: Counseling[], teacherMap: Map<number, string> }> = ({ studentId, counselings, teacherMap }) => {
    const studentCounselings = counselings.filter(c => c.studentId === studentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalCount = studentCounselings.length;

    if (totalCount === 0) {
        return <div className="text-center text-gray-500 py-4">상담 기록이 없습니다.</div>;
    }

    const recentCounselings = studentCounselings.slice(0, 3);

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-3 px-1">
                <h4 className="text-md font-bold text-gray-200">최근 상담 기록</h4>
                <span className="text-sm text-gray-400">총 {totalCount}건</span>
            </div>
            <div className="space-y-3">
                {recentCounselings.map(counsel => (
                    <div key={counsel.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-200">{counsel.date}</span>
                            <span className="text-gray-400 text-xs">{teacherMap.get(counsel.teacherId)}</span>
                        </div>
                        <p className="text-gray-300 mt-2 truncate">{counsel.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StudyPeriodView: React.FC<{ student: Student }> = ({ student }) => {
    const calculateDuration = (start: string, end?: string) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date(); // Use today if not withdrawn

        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate();

        if (days < 0) {
            months--;
            const prevMonthLastDay = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
            days += prevMonthLastDay;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years > 0) parts.push(`${years}년`);
        if (months > 0) parts.push(`${months}개월`);
        if (days > 0) parts.push(`${days}일`);

        if (parts.length === 0) {
            return "0일";
        }

        return parts.join(' ');
    };

    const duration = calculateDuration(student.enrollmentDate, student.withdrawalDate);

    return (
        <div className="p-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-md font-bold text-[#E5A823] mb-3">재원 기간 정보</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between pb-2 border-b border-gray-700/50 mb-2">
                        <span className="text-gray-400">총 재원 기간:</span>
                        <span className="font-bold text-lg text-[#E5A823]">{duration}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">입학일:</span>
                        <span className="font-semibold text-white">{student.enrollmentDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">상태:</span>
                        <span className="font-semibold text-white">
                            {student.status === '퇴원' ? `퇴원 (${student.withdrawalDate})` : '재원 중'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryList: React.FC<{ student: Student; onDelete: (summaryId: number) => void; }> = ({ student, onDelete }) => {
    const summaries = student.lessonSummaries || [];

    if (summaries.length === 0) {
        return <div className="text-center text-gray-500 py-4">저장된 AI 요약 기록이 없습니다.</div>;
    }

    return (
        <div className="p-2 space-y-3">
            {summaries.sort((a,b) => b.generatedDate.localeCompare(a.generatedDate)).map(summary => (
                <div key={summary.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-200">분석 기간: {summary.period}</p>
                            <p className="text-xs text-gray-400 mt-1">생성일: {summary.generatedDate}</p>
                        </div>
                        <button 
                            onClick={() => onDelete(summary.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold"
                        >
                            삭제
                        </button>
                    </div>
                    <p className="text-gray-300 mt-2 whitespace-pre-wrap">{summary.summary}</p>
                </div>
            ))}
        </div>
    );
};

const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  allStudents,
  onClose,
  onEdit,
  monthlyReports,
  tuitions,
  counselings,
  teacherMap,
  onSaveAnalysis,
  onDeleteSummary,
}) => {
  type DetailTab = 'reports' | 'tuition' | 'counseling' | 'analysis' | 'study-period' | 'summaries';
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('reports');

  const siblingNames = student.siblings
    .map(id => allStudents.find(s => s.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const TabButton = ({ icon, label, tab }: { icon: React.ReactNode; label: string; tab: DetailTab }) => {
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
          {siblingNames && (
            <p className="text-xs text-yellow-400 mt-1">
              형제/자매: {siblingNames}
            </p>
          )}
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
        <TabButton icon={<ClockIcon className="w-5 h-5 mr-2"/>} label="수강 기간" tab="study-period" />
        <TabButton icon={<AnalysisIcon className="w-5 h-5 mr-2"/>} label="AI 장기분석" tab="analysis" />
        <TabButton icon={<SummariesIcon className="w-5 h-5 mr-2"/>} label="AI 요약기록" tab="summaries" />
      </div>

      <div className="max-h-[55vh] overflow-y-auto pr-2">
        {activeDetailTab === 'reports' && <ReportList studentId={student.id} monthlyReports={monthlyReports} />}
        {activeDetailTab === 'tuition' && <TuitionList studentId={student.id} tuitions={tuitions} />}
        {activeDetailTab === 'counseling' && <CounselingList studentId={student.id} counselings={counselings} teacherMap={teacherMap} />}
        {activeDetailTab === 'study-period' && <StudyPeriodView student={student} />}
        {activeDetailTab === 'analysis' && (
            <TrendAnalysisView
                student={student}
                reports={monthlyReports}
                onSaveAnalysis={(analysis) => onSaveAnalysis(student.id, analysis)}
            />
        )}
        {activeDetailTab === 'summaries' && <SummaryList student={student} onDelete={onDeleteSummary} />}
      </div>
    </Card>
  );
};

export default StudentDetailView;
