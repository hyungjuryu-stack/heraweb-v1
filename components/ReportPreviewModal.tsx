import React, { useState } from 'react';
import Card from './ui/Card';
import type { MonthlyReport, Student } from '../types';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: () => void;
  report: MonthlyReport | null;
  student: Student | null;
  teacherName: string | null | undefined;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ isOpen, onClose, onConfirmSend, report, student, teacherName }) => {
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !report || !student) return null;

  const handleConfirm = () => {
    setIsSending(true);
    // Simulate network delay
    setTimeout(() => {
        onConfirmSend();
        setIsSending(false);
    }, 700);
  };

  const receiverPhone = student.sendSmsToBoth && student.fatherPhone 
    ? `${student.motherPhone}(모), ${student.fatherPhone}(부)`
    : student.motherPhone;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card title="리포트 발송 미리보기">
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-3 rounded-lg text-sm">
                <p className="text-gray-400">받는 사람:</p>
                <p className="text-white font-semibold">{student.motherName} 학부모님 ({receiverPhone})</p>
            </div>
            
            <div className="bg-[#2c3e50]/40 p-4 rounded-xl border border-gray-700/50">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-[#E5A823]">
                        [헤라매쓰] {student.name} 학생 {report.period} 리포트
                    </h4>
                    <p className="mt-4 text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                        {report.reviewText}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-700/50 text-sm space-y-1">
                        <p className="text-gray-300">· 평균 점수: <span className="font-semibold text-white">{report.avgScore}점</span></p>
                        <p className="text-gray-300">· 출석률: <span className="font-semibold text-white">{report.attendanceRate}%</span></p>
                        <p className="text-gray-300">· 과제율: <span className="font-semibold text-white">{report.homeworkRate}%</span></p>
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                        담당강사: {teacherName || '배정된 강사 없음'}
                    </p>
                </div>
                 <p className="text-xs text-gray-500 mt-2 text-center">
                    * 위 내용은 카카오톡 알림톡 또는 문자로 발송됩니다.
                 </p>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">
              취소
            </button>
            <button 
              type="button" 
              onClick={handleConfirm}
              disabled={isSending}
              className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold disabled:bg-blue-800 flex items-center">
              {isSending && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSending ? '발송 중...' : '알림톡/문자 발송'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
