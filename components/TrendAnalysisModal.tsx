import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import { generateTrendAnalysis } from '../services/geminiService';
import type { Student, MonthlyReport, TrendAnalysis } from '../types';

interface TrendAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  reports: MonthlyReport[];
  onSaveAnalysis: (analysis: TrendAnalysis) => void;
}

const TrendAnalysisModal: React.FC<TrendAnalysisModalProps> = ({ isOpen, onClose, student, reports, onSaveAnalysis }) => {
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const studentReports = reports.filter(r => r.studentId === student.id);

  const performAnalysis = async () => {
    if (studentReports.length < 2) {
      setError("장기 추세 분석을 위해서는 최소 2개 이상의 리포트가 필요합니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await generateTrendAnalysis(student, studentReports);
      setAnalysis(result);
      onSaveAnalysis(result); // Save the newly generated analysis
    } catch (err: any) {
      setError(err.message || '분석 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // If there's a saved analysis, show it immediately.
      // Otherwise, generate a new one.
      if (student.trendAnalysis) {
        setAnalysis(student.trendAnalysis);
        setError(null);
        setIsLoading(false);
      } else {
        performAnalysis();
      }
    }
  }, [isOpen, student]);

  if (!isOpen) return null;
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <svg className="animate-spin h-10 w-10 text-[#E5A823]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-300">AI가 학습 데이터를 심층 분석 중입니다...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center h-64 flex flex-col justify-center items-center">
            <p className="text-red-400">{error}</p>
        </div>
      );
    }
    
    if (analysis) {
        return (
            <div className="space-y-6 text-gray-200">
                <div>
                    <h4 className="font-bold text-lg text-[#E5A823] mb-2">📈 전반적인 학습 추세</h4>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded-md">{analysis.overallTrend}</p>
                </div>
                 <div>
                    <h4 className="font-bold text-lg text-[#E5A823] mb-2">💪 주요 강점</h4>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded-md">{analysis.keyStrengths}</p>
                </div>
                 <div>
                    <h4 className="font-bold text-lg text-[#E5A823] mb-2">🌱 성장 영역</h4>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded-md">{analysis.areasForGrowth}</p>
                </div>
                 <div>
                    <h4 className="font-bold text-lg text-[#E5A823] mb-2">💡 맞춤 학습 추천</h4>
                    <ul className="list-disc list-inside space-y-2 bg-gray-800/50 p-4 rounded-md">
                        {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-gray-300">{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <Card title={`${student.name} 학생 장기 학습 트렌드 분석`}>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {renderContent()}
          </div>
          <div className="mt-8 flex justify-between items-center">
             <button 
                type="button" 
                onClick={performAnalysis} 
                disabled={isLoading}
                className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                새로 분석하기
            </button>
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">
              닫기
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TrendAnalysisModal;