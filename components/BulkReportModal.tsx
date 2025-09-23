import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import type { MonthlyReport, Student, LessonRecord, HomeworkGrade, Teacher } from '../types';
import { generateStudentReview } from '../services/geminiService';

// Helper function to calculate stats, adapted from ReportModal
const calculateReportStats = (studentId: number, startDate: Date, endDate: Date, lessonRecords: LessonRecord[]) => {
    const records = lessonRecords.filter(r => {
        const recordDate = new Date(r.date);
        return r.studentId === studentId && recordDate >= startDate && recordDate <= endDate;
    });

    if (records.length === 0) {
        return { attendanceRate: 0, avgScore: 0, homeworkRate: 0, attitudeRate: 0, selfDirectedLearningRate: 0, recordsForPeriod: [] };
    }

    const attendanceCounts = records.reduce((acc, r) => {
        acc[r.attendance] = (acc[r.attendance] || 0) + 1;
        return acc;
    }, {} as Record<LessonRecord['attendance'], number>);
    const totalAttendance = (attendanceCounts['출석'] || 0) + (attendanceCounts['지각'] || 0);
    const attendanceRate = Math.round((totalAttendance / records.length) * 100);

    const homeworkScoreMap: Record<HomeworkGrade, number> = { A: 100, B: 85, C: 70, D: 50, F: 30 };
    const totalHomeworkScore = records.reduce((sum, r) => sum + (homeworkScoreMap[r.homework] || 0), 0);
    const homeworkRate = Math.round(totalHomeworkScore / records.length);

    const normalizeScore = (score: string | null): number | null => {
        if (!score) return null;
        if (score.includes('/')) {
            const [correct, total] = score.split('/').map(Number);
            return total > 0 ? (correct / total) * 100 : null;
        }
        const num = parseFloat(score);
        return isNaN(num) ? null : num;
    };
    const scores = records.flatMap(r => [normalizeScore(r.testScore1), normalizeScore(r.testScore2), normalizeScore(r.testScore3)]).filter((s): s is number => s !== null);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
    
    const attitudeScoreMap: Record<HomeworkGrade, number> = { 'A': 100, 'B': 85, 'C': 70, 'D': 60, 'F': 50 };
    const totalAttitudeScore = records.reduce((sum, r) => sum + (attitudeScoreMap[r.attitude] || 85), 0);
    const attitudeRate = Math.round(totalAttitudeScore / records.length);

    const selfDirectedLearningScoreMap: Record<HomeworkGrade, number> = { A: 100, B: 90, C: 80, D: 70, F: 60 };
    const totalSelfDirectedLearningScore = records.reduce((sum, r) => sum + (selfDirectedLearningScoreMap[r.selfDirectedLearning] || 80), 0);
    const selfDirectedLearningRate = Math.round(totalSelfDirectedLearningScore / records.length);

    return { attendanceRate, homeworkRate, avgScore, attitudeRate, selfDirectedLearningRate, recordsForPeriod: records };
};


interface BulkReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (newReports: MonthlyReport[]) => void;
  students: Student[];
  lessonRecords: LessonRecord[];
  monthlyReports: MonthlyReport[];
  teachers: Teacher[];
}

const BulkReportModal: React.FC<BulkReportModalProps> = ({ isOpen, onClose, onGenerate, students, lessonRecords, monthlyReports, teachers }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [isLoading, setIsLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
    const years = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

    useEffect(() => {
        if(isOpen) {
            setResultMessage(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setResultMessage('리포트 생성을 시작합니다. 학생 수에 따라 시간이 걸릴 수 있습니다...');

        const period = `${year}년 ${month}월`;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const existingReportsForPeriod = new Set(
            monthlyReports.filter(r => r.period === period).map(r => r.studentId)
        );

        const eligibleStudents = students.filter(s => {
            const enrollmentDate = new Date(s.enrollmentDate);
            const withdrawalDate = s.withdrawalDate ? new Date(s.withdrawalDate) : null;
            return enrollmentDate <= endDate && (!withdrawalDate || withdrawalDate >= startDate);
        });

        let skippedCount = 0;
        let successCount = 0;
        let failedCount = 0;

        const reportGenerationPromises = eligibleStudents.map(async (student) => {
            if (existingReportsForPeriod.has(student.id)) {
                skippedCount++;
                return null;
            }

            const { recordsForPeriod, ...stats } = calculateReportStats(student.id, startDate, endDate, lessonRecords);
            
            try {
                const studentDataForAI = { ...student, ...stats };
                const teacherName = student.teacherId ? teacherMap.get(student.teacherId) || null : null;
                
                const reviewText = await generateStudentReview(studentDataForAI, recordsForPeriod, teacherName, student.trendAnalysis || null);

                successCount++;
                return {
                    id: Date.now() + student.id,
                    studentId: student.id,
                    period,
                    ...stats,
                    counselingSummary: '',
                    sentDate: '',
                    teacherId: student.teacherId || 0,
                    reviewText,
                    sentStatus: '미발송' as '미발송',
                };
            } catch (error) {
                console.error(`AI 리뷰 생성 실패 (학생: ${student.name}):`, error);
                failedCount++;
                // AI 리뷰 생성에 실패하더라도 리포트는 생성
                return {
                    id: Date.now() + student.id,
                    studentId: student.id,
                    period,
                    ...stats,
                    counselingSummary: '',
                    sentDate: '',
                    teacherId: student.teacherId || 0,
                    reviewText: 'AI 리뷰 생성에 실패했습니다. 데이터를 확인하고 수동으로 작성해주세요.',
                    sentStatus: '미발송' as '미발송',
                };
            }
        });

        const generatedReports = (await Promise.all(reportGenerationPromises)).filter((r): r is MonthlyReport => r !== null);
        
        if (generatedReports.length > 0) {
            onGenerate(generatedReports);
        }

        let message = `완료: ${successCount}개의 리포트를 AI 리뷰와 함께 생성했습니다.`;
        if (failedCount > 0) {
            message += ` ${failedCount}개는 AI 리뷰 생성에 실패했습니다.`;
        }
        if (skippedCount > 0) {
            message += ` ${skippedCount}명은 이미 리포트가 있어 건너뛰었습니다.`;
        }
        setResultMessage(message);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <Card title="월별 리포트 일괄 생성">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">
                            선택한 월에 재원한 모든 학생의 리포트와 AI 종합 리뷰를 함께 생성합니다. 이미 해당 월의 리포트가 있는 학생은 제외됩니다.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="year-select" className="block text-sm font-medium text-gray-300 mb-1">년도</label>
                                <select id="year-select" value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                                    {years.map(y => <option key={y} value={y}>{y}년</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="month-select" className="block text-sm font-medium text-gray-300 mb-1">월</label>
                                <select id="month-select" value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                                    {months.map(m => <option key={m} value={m}>{m}월</option>)}
                                </select>
                            </div>
                        </div>

                        {resultMessage && (
                            <div className="p-3 bg-gray-800/50 rounded-lg text-center text-sm text-gray-300">
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{resultMessage}</span>
                                    </div>
                                ) : (
                                    <p>{resultMessage}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
                        <button type="button" onClick={handleGenerate} disabled={isLoading} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold disabled:bg-gray-600">
                            {isLoading ? '생성 중...' : '생성하기'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BulkReportModal;