import React, { useState, useEffect } from 'react';
import { generateTrendAnalysis } from '../services/geminiService';
import type { Student, MonthlyReport, TrendAnalysis } from '../types';

interface TrendAnalysisViewProps {
  student: Student;
  reports: MonthlyReport[];
  onSaveAnalysis: (analysis: TrendAnalysis) => void;
}

const TrendAnalysisView: React.FC<TrendAnalysisViewProps> = ({ student, reports, onSaveAnalysis }) => {
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(student.trendAnalysis || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const studentReports = reports.filter(r => r.studentId === student.id);

  useEffect(() => {
    // Reset view when student changes
    setAnalysis(student.trendAnalysis || null);
    setError(null);
    setIsLoading(false);
  }, [student]);

  const performAnalysis = async () => {
    if (studentReports.length < 2) {
      setError("장기 추세 분석을 위해서는 최소 2개 이상의 리포트가 필요합니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateTrendAnalysis(student, studentReports);
      setAnalysis(result);
      onSaveAnalysis(result);
    } catch (err: any) {
      setError(err.message || '분석 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
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
      <div className="text-center py-10">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={performAnalysis} 
            className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium"
          >
            분석 재시도
          </button>
      </div>
    );
  }
  
  if (analysis) {
    return (
        <div className="space-y-6 text-gray-200 py-2">
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
             <div className="mt-6 text-center">
                <button 
                    onClick={performAnalysis} 
                    disabled={isLoading}
                    className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                    다시 분석하기
                </button>
            </div>
        </div>
    );
  }
  
  return (
      <div className="text-center py-10">
          <p className="text-gray-400 mb-4">학생의 장기 학습 데이터를 분석하여 맞춤형 성장 전략을 제안합니다.</p>
          <button 
              onClick={performAnalysis} 
              disabled={isLoading}
              className="py-2 px-6 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold disabled:bg-gray-600"
          >
              AI 분석 리포트 생성
          </button>
      </div>
  );
};

export default TrendAnalysisView;