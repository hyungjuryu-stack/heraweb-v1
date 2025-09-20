import React, { useState, useEffect, useMemo } from 'react';
import type { MonthlyReport, Student, Teacher, LessonRecord } from '../types';
import Card from './ui/Card';
import { generateStudentReview } from '../services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';


interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Omit<MonthlyReport, 'id' | 'sentStatus'> & { id?: number }) => void;
  report: MonthlyReport | null;
  students: Student[];
  teachers: Teacher[];
  lessonRecords: LessonRecord[];
}

type PeriodType = 'monthly' | 'quarterly' | 'half-yearly' | 'custom';

const PeriodTypeButton: React.FC<{ label: string; type: PeriodType; currentType: PeriodType; onClick: (type: PeriodType) => void;}> = ({ label, type, currentType, onClick }) => {
    const isActive = type === currentType;
    return (
        <button
            type="button"
            onClick={() => onClick(type)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                ? 'bg-[#E5A823] text-gray-900'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
        >
            {label}
        </button>
    );
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSave, report, students, teachers, lessonRecords }) => {
    const [formData, setFormData] = useState<Omit<MonthlyReport, 'id' | 'sentStatus'>>({
        studentId: 0,
        period: '',
        attendanceRate: 0,
        avgScore: 0,
        homeworkRate: 0,
        counselingSummary: '',
        sentDate: new Date().toISOString().split('T')[0],
        teacherId: 0,
        reviewText: '',
    });
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const [periodType, setPeriodType] = useState<PeriodType>('monthly');
    const [periodConfig, setPeriodConfig] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        quarter: Math.floor(new Date().getMonth() / 3) + 1,
        half: new Date().getMonth() < 6 ? 1 : 2,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
    
    const years = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const quarters = [1, 2, 3, 4];
    const halves = [{ value: 1, label: '상반기'}, { value: 2, label: '하반기'}];

    // Update period string whenever config changes
    useEffect(() => {
        let newPeriod = '';
        switch (periodType) {
            case 'monthly':
                newPeriod = `${periodConfig.year}년 ${periodConfig.month}월`;
                break;
            case 'quarterly':
                newPeriod = `${periodConfig.year}년 ${periodConfig.quarter}분기`;
                break;
            case 'half-yearly':
                newPeriod = `${periodConfig.year}년 ${periodConfig.half === 1 ? '상반기' : '하반기'}`;
                break;
            case 'custom':
                newPeriod = `${periodConfig.startDate} ~ ${periodConfig.endDate}`;
                break;
        }
        setFormData(prev => ({ ...prev, period: newPeriod }));
    }, [periodType, periodConfig]);

    useEffect(() => {
        if (isOpen) {
            const parsePeriod = (periodString: string) => {
                if (!periodString) return;
                const customMatch = periodString.match(/^(\d{4}-\d{2}-\d{2}) ~ (\d{4}-\d{2}-\d{2})$/);
                if (customMatch) {
                    setPeriodType('custom');
                    setPeriodConfig(p => ({...p, startDate: customMatch[1], endDate: customMatch[2] }));
                    return;
                }
                const halfMatch = periodString.match(/^(\d{4})년 (상반기|하반기)$/);
                if (halfMatch) {
                    setPeriodType('half-yearly');
                    setPeriodConfig(p => ({...p, year: parseInt(halfMatch[1]), half: halfMatch[2] === '상반기' ? 1 : 2 }));
                    return;
                }
                const quarterMatch = periodString.match(/^(\d{4})년 (\d)분기$/);
                if (quarterMatch) {
                    setPeriodType('quarterly');
                    setPeriodConfig(p => ({...p, year: parseInt(quarterMatch[1]), quarter: parseInt(quarterMatch[2]) }));
                    return;
                }
                const monthMatch = periodString.match(/^(\d{4})년 (\d{1,2})월$/);
                if (monthMatch) {
                    setPeriodType('monthly');
                    setPeriodConfig(p => ({...p, year: parseInt(monthMatch[1]), month: parseInt(monthMatch[2]) }));
                    return;
                }
            };
            
            if (report) {
                const studentForReport = students.find(s => s.id === report.studentId);
                setSelectedStudent(studentForReport || null);
                setFormData({ ...report });
                parsePeriod(report.period);

            } else {
                // Reset for new report
                setSelectedStudent(null);
                 setPeriodType('monthly');
                 setPeriodConfig({
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                    quarter: Math.floor(new Date().getMonth() / 3) + 1,
                    half: new Date().getMonth() < 6 ? 1 : 2,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                });
                setFormData({
                    studentId: 0,
                    period: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월`,
                    attendanceRate: 0,
                    avgScore: 0,
                    homeworkRate: 0,
                    counselingSummary: '',
                    sentDate: new Date().toISOString().split('T')[0],
                    teacherId: 0,
                    reviewText: '',
                });
            }
            setGenerationError(null);
        }
    }, [isOpen, report, students]);
    
    const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const studentId = parseInt(e.target.value, 10);
        const student = students.find(s => s.id === studentId);
        if (student) {
            setSelectedStudent(student);
            setFormData(prev => ({
                ...prev,
                studentId: student.id,
                attendanceRate: student.attendanceRate,
                avgScore: student.avgScore,
                homeworkRate: student.homeworkRate,
                teacherId: student.teacherId || 0,
                reviewText: '', // Clear previous review
            }));
        } else {
            setSelectedStudent(null);
            setFormData(prev => ({...prev, studentId: 0, reviewText: ''}));
        }
    };

    const handleGenerateReview = async () => {
        if (!selectedStudent) return;
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const teacherName = selectedStudent.teacherId ? teacherMap.get(selectedStudent.teacherId) || null : null;
            const studentRecords = lessonRecords.filter(r => r.studentId === selectedStudent.id);
            const review = await generateStudentReview(selectedStudent, studentRecords, teacherName);
            setFormData(prev => ({...prev, reviewText: review}));
        } catch (error: any) {
            setGenerationError(error.message || '리뷰 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handlePeriodConfigChange = (field: keyof typeof periodConfig, value: string | number) => {
        setPeriodConfig(prev => ({...prev, [field]: value}));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: report?.id });
    };

    const chartData = useMemo(() => selectedStudent ? [
      { subject: '평균 점수', value: selectedStudent.avgScore, fullMark: 100 },
      { subject: '출석률', value: selectedStudent.attendanceRate, fullMark: 100 },
      { subject: '과제 수행률', value: selectedStudent.homeworkRate, fullMark: 100 },
    ] : [], [selectedStudent]);

    if (!isOpen) return null;
    
    const renderPeriodInputs = () => {
        switch (periodType) {
            case 'monthly':
                return (
                    <>
                        <select value={periodConfig.year} onChange={e => handlePeriodConfigChange('year', parseInt(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                            {years.map(y => <option key={y} value={y}>{y}년</option>)}
                        </select>
                        <select value={periodConfig.month} onChange={e => handlePeriodConfigChange('month', parseInt(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                            {months.map(m => <option key={m} value={m}>{m}월</option>)}
                        </select>
                    </>
                );
            case 'quarterly':
                return (
                    <>
                         <select value={periodConfig.year} onChange={e => handlePeriodConfigChange('year', parseInt(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                            {years.map(y => <option key={y} value={y}>{y}년</option>)}
                        </select>
                        <select value={periodConfig.quarter} onChange={e => handlePeriodConfigChange('quarter', parseInt(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                            {quarters.map(q => <option key={q} value={q}>{q}분기</option>)}
                        </select>
                    </>
                );
            case 'half-yearly':
                 return (
                    <>
                        <select value={periodConfig.year} onChange={e => handlePeriodConfigChange('year', parseInt(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                            {years.map(y => <option key={y} value={y}>{y}년</option>)}
                        </select>
                        <select value={periodConfig.half} onChange={e => handlePeriodConfigChange('half', parseInt(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                            {halves.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                        </select>
                    </>
                );
            case 'custom':
                 return (
                    <>
                        <input type="date" value={periodConfig.startDate} onChange={e => handlePeriodConfigChange('startDate', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500" />
                        <input type="date" value={periodConfig.endDate} onChange={e => handlePeriodConfigChange('endDate', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-yellow-500 focus:border-yellow-500" />
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <Card title={report ? '리포트 수정' : '신규 리포트 작성'}>
                    <form onSubmit={handleSubmit}>
                        <div className="max-h-[70vh] overflow-y-auto p-2 space-y-4">
                           <div>
                                <label htmlFor="studentId" className="block text-sm font-medium text-gray-300 mb-1">학생 선택</label>
                                <select 
                                    name="studentId"
                                    id="studentId"
                                    value={formData.studentId}
                                    onChange={handleStudentChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                                >
                                    <option value={0} disabled>학생을 선택하세요</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                                </select>
                           </div>
                           
                           <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">리포트 기간</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <PeriodTypeButton label="월별" type="monthly" currentType={periodType} onClick={setPeriodType} />
                                    <PeriodTypeButton label="분기별" type="quarterly" currentType={periodType} onClick={setPeriodType} />
                                    <PeriodTypeButton label="반기별" type="half-yearly" currentType={periodType} onClick={setPeriodType} />
                                    <PeriodTypeButton label="기간 직접입력" type="custom" currentType={periodType} onClick={setPeriodType} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800/50 rounded-lg">
                                    {renderPeriodInputs()}
                                </div>
                           </div>
                            
                            {selectedStudent && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800/50 rounded-lg items-center">
                                    <div className="space-y-3">
                                        <div className="text-center md:text-left">
                                            <p className="text-sm text-gray-400">평균 점수</p>
                                            <p className="text-2xl font-bold text-white">{selectedStudent.avgScore}점</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-sm text-gray-400">출석률</p>
                                            <p className="text-2xl font-bold text-white">{selectedStudent.attendanceRate}%</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-sm text-gray-400">과제 수행률</p>
                                            <p className="text-2xl font-bold text-white">{selectedStudent.homeworkRate}%</p>
                                        </div>
                                    </div>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                                <PolarGrid gridType="circle" stroke="rgba(255, 255, 255, 0.2)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                                                <PolarRadiusAxis axisLine={false} tick={false} domain={[0, 100]} />
                                                <Radar name={selectedStudent.name} dataKey="value" stroke="#E5A823" fill="#E5A823" fillOpacity={0.6} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-end gap-4">
                               <div className="flex-grow">
                                  <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300 mb-1">총평 및 리뷰</label>
                                  <textarea
                                    name="reviewText"
                                    id="reviewText"
                                    rows={5}
                                    value={formData.reviewText}
                                    onChange={e => setFormData(p => ({...p, reviewText: e.target.value}))}
                                    placeholder="AI로 리뷰 초안을 생성하거나 직접 입력하세요."
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                                  ></textarea>
                               </div>
                               <button
                                  type="button"
                                  onClick={handleGenerateReview}
                                  disabled={!selectedStudent || isGenerating}
                                  className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold disabled:bg-gray-600 disabled:cursor-not-allowed h-fit flex items-center"
                               >
                                  {isGenerating ? (
                                    <>
                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    생성 중...
                                    </>
                                  ) : 'AI로 리뷰 생성'}
                               </button>
                            </div>
                            {generationError && <p className="text-red-400 text-sm">{generationError}</p>}
                        </div>
                        
                        <div className="mt-8 flex justify-end space-x-4">
                            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
                            <button type="submit" disabled={!formData.studentId} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">저장</button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ReportModal;