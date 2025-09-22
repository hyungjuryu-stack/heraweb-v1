
import React from 'react';
import Card from './ui/Card';

interface LessonSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  summary: string | null;
  studentName: string;
  periodString: string;
}

const LessonSummaryModal: React.FC<LessonSummaryModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  error,
  summary,
  studentName,
  periodString,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <Card title={`${studentName} 학생 AI 학습 요약`}>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <p className="text-sm text-gray-400 mb-4">분석 기간: {periodString}</p>
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-10">
                <svg className="animate-spin h-10 w-10 text-[#E5A823]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-300">AI가 학습 기록을 분석하고 있습니다...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-10">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            {summary && (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{summary}</p>
                 <p className="text-xs text-green-400 mt-3 text-center pt-2 border-t border-gray-700/50">
                  이 요약은 학생 정보에 저장되었습니다.
               </p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium"
            >
              닫기
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LessonSummaryModal;
