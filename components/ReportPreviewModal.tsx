
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import type { MonthlyReport, Student } from '../types';
import { KakaoTalkIcon, PdfIcon } from './Icons';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: () => void;
  report: MonthlyReport | null;
  student: Student | null;
  teacherName: string | null | undefined;
}

type SendStep = 'initial' | 'sending_kakao' | 'failed_kakao' | 'sending_sms' | 'success';

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ isOpen, onClose, onConfirmSend, report, student, teacherName }) => {
  const [sendStep, setSendStep] = useState<SendStep>('initial');

  useEffect(() => {
    if (isOpen) {
        setSendStep('initial');
    }
  }, [isOpen]);

  if (!isOpen || !report || !student) return null;

  const handleInitialSend = () => {
    setSendStep('sending_kakao');
    setTimeout(() => {
        // Simulate 20% failure rate for KakaoTalk
        if (Math.random() < 0.2) {
            setSendStep('failed_kakao');
        } else {
            handleSuccess();
        }
    }, 1200);
  };
  
  const handleSmsSend = () => {
    setSendStep('sending_sms');
    setTimeout(() => {
        handleSuccess();
    }, 800);
  }

  const handleSuccess = () => {
    onConfirmSend();
    setSendStep('success');
    setTimeout(() => {
      onClose();
    }, 1500); // Close modal after showing success message
  };

  const receiverPhone = student.sendSmsToBoth && student.fatherPhone 
    ? `${student.motherPhone}(모), ${student.fatherPhone}(부)`
    : student.motherPhone;
    
  const pdfFilename = `${student.name}_${report.period.replace(/ /g, '_')}_리포트.pdf`;

  const renderButtons = () => {
    switch(sendStep) {
        case 'initial':
            return (
                <>
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
                    <button type="button" onClick={handleInitialSend} className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold">알림톡 발송</button>
                </>
            );
        case 'sending_kakao':
        case 'sending_sms':
            return <button type="button" disabled className="w-36 py-2 px-4 rounded-lg bg-blue-800 text-white font-bold flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {sendStep === 'sending_kakao' ? '발송 중...' : '문자 발송 중...'}
            </button>;
        case 'failed_kakao':
            return (
                 <>
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
                    <button type="button" onClick={handleSmsSend} className="py-2 px-4 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-white font-bold">일반 문자로 발송</button>
                </>
            );
        case 'success':
            return <p className="text-green-400 font-semibold">발송 완료!</p>;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={sendStep === 'initial' ? onClose : undefined} role="dialog" aria-modal="true">
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card title="카카오톡 발송 미리보기">
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-3 rounded-lg text-sm">
                <p className="text-gray-400">받는 사람:</p>
                <p className="text-white font-semibold">{student.motherName} 학부모님 ({receiverPhone})</p>
            </div>
            
            <div className="bg-[#FEE500] p-4 rounded-xl text-black">
                <div className="flex items-start mb-3">
                    <KakaoTalkIcon className="w-8 h-8 mr-2 flex-shrink-0" />
                    <h4 className="font-bold text-sm leading-tight">
                        헤라매쓰
                    </h4>
                </div>
                <div className="bg-white p-3 rounded space-y-2 text-sm">
                    <p>{`[${student.name}] 학생의 ${report.period} 리포트입니다.`}</p>
                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
                        <PdfIcon className="w-10 h-10 text-red-500 flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                            <p className="font-semibold truncate text-gray-800">{pdfFilename}</p>
                            <p className="text-xs text-gray-500">문서 ∙ PDF</p>
                        </div>
                    </div>
                </div>
            </div>

            {sendStep === 'failed_kakao' && (
                <div className="p-3 text-center bg-red-900/50 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm font-semibold">카카오톡 발송 실패</p>
                    <p className="text-red-400 text-xs mt-1">수신이 불가한 번호이거나 일시적인 오류입니다.</p>
                </div>
            )}
          </div>
          <div className="mt-8 flex justify-end space-x-4 h-10 items-center">
            {renderButtons()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportPreviewModal;