
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { generateTest } from '../services/geminiService';
import type { GeneratedTest } from '../types';

const TestGenerator: React.FC = () => {
    const [grade, setGrade] = useState('중2');
    const [unit, setUnit] = useState('일차함수와 그래프');
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState('중');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedTest(null);
        try {
            const test = await generateTest(grade, unit, numQuestions, difficulty);
            setGeneratedTest(test);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderQuestion = (q: GeneratedTest['questions'][0], index: number) => (
        <div key={index} className="mb-6 p-4 border border-gray-700 rounded-lg">
            <p className="font-semibold mb-2 text-gray-200">{index + 1}. {q.question}</p>
            {q.type === 'multiple-choice' && q.options && (
                <div className="grid grid-cols-2 gap-2 my-2">
                    {q.options.map((opt, i) => (
                        <p key={i} className="text-gray-400">({i + 1}) {opt}</p>
                    ))}
                </div>
            )}
            <p className="mt-2 text-sm text-[#E5A823]">정답: {q.answer}</p>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">AI 시험지 생성기</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="시험지 설정" className="lg:col-span-1">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">학년</label>
                            <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                                <option>초4</option>
                                <option>초5</option>
                                <option>초6</option>
                                <option>중1</option>
                                <option>중2</option>
                                <option>중3</option>
                                <option>고1</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">단원</label>
                            <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">문항 수</label>
                            <input type="number" value={numQuestions} onChange={e => setNumQuestions(parseInt(e.target.value, 10))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">난이도</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                                <option value="상">상</option>
                                <option value="중">중</option>
                                <option value="하">하</option>
                            </select>
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center">
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                생성 중...
                                </>
                            ) : "시험지 생성"}
                        </button>
                    </div>
                </Card>

                <div className="lg:col-span-2">
                    {error && <Card><p className="text-red-400">{error}</p></Card>}
                    {generatedTest && (
                         <Card title={generatedTest.title}>
                            <div>
                                {generatedTest.questions.map(renderQuestion)}
                            </div>
                        </Card>
                    )}
                     {!isLoading && !generatedTest && !error && (
                        <Card className="flex items-center justify-center h-full">
                           <p className="text-gray-400">설정을 완료하고 시험지를 생성해주세요.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestGenerator;
