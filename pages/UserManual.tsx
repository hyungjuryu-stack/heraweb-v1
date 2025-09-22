
import React, { useState } from 'react';
import Card from '../components/ui/Card';

const MockupScreen: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="w-full h-56 bg-gray-800 border-2 border-gray-600 rounded-lg flex flex-col shadow-lg">
        <div className="flex-shrink-0 h-8 bg-gray-700 rounded-t-md flex items-center px-4">
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <p className="text-xs text-gray-300 text-center flex-grow font-mono">{title}</p>
        </div>
        <div className="flex-grow p-4 overflow-hidden">
            {children}
        </div>
    </div>
);

const slides = [
    {
        title: "환영합니다! 헤라매쓰 통합 관리 시스템",
        description: "이 사용설명서는 시스템의 주요 기능을 안내합니다. '다음' 버튼을 눌러 시작하거나, 아래 목차에서 원하는 기능으로 바로 이동할 수 있습니다. 각 슬라이드는 기능 설명과 함께 화면 예시를 제공하여 쉽게 이해할 수 있도록 돕습니다.",
        mockup: (
            <MockupScreen title="Hera Math Academy Management">
                <div className="flex items-center justify-center h-full">
                    <h1 className="text-3xl font-bold text-[#E5A823] tracking-wider select-none">헤라매쓰</h1>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "대시보드: 학원 현황을 한눈에",
        description: "로그인 후 가장 먼저 마주하는 화면입니다. 총 재원생, 상담/대기 학생 수, 당일 출결, 학년별 분포 등 학원의 핵심 지표를 차트와 그래프로 시각화하여 제공합니다. 이를 통해 학원 운영 상태를 직관적으로 파악할 수 있습니다.",
        mockup: (
            <MockupScreen title="대시보드">
                <div className="grid grid-cols-4 gap-2 h-full">
                    <div className="col-span-1 bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400">총 재원생</div>
                    <div className="col-span-1 bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400">상담/대기</div>
                    <div className="col-span-2 bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400">출결 현황</div>
                    <div className="col-span-4 bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400 h-20">평균 점수 추이</div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "오늘의 수업일정",
        description: "선택한 날짜의 모든 수업 스케줄을 시간순으로 보여줍니다. 반 이름, 담당 강사, 강의실, 학생 명단을 한눈에 확인할 수 있어 하루의 수업을 체계적으로 준비하고 관리하는 데 도움을 줍니다.",
        mockup: (
            <MockupScreen title="오늘의 수업일정">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 p-1 bg-gray-700/50 rounded">
                        <div className="font-bold text-xs text-yellow-400 w-16">14:30-16:30</div>
                        <div className="text-xs text-gray-300 flex-grow">월목1A (이선생)</div>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-gray-700/50 rounded">
                        <div className="font-bold text-xs text-yellow-400 w-16">16:40-18:40</div>
                        <div className="text-xs text-gray-300 flex-grow">화금2B (박선생)</div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수업 출석부: 상세 기록과 관리",
        description: "반과 월을 선택하면 해당 반의 수업일만 달력 형태로 표시됩니다. 각 학생의 수업 칸을 클릭하여 출결, 태도, 과제, 테스트 점수, 사용 교재, 비고 등 상세한 내용을 기록하고 저장할 수 있습니다. 모든 기록은 학생 데이터와 연동됩니다.",
        mockup: (
            <MockupScreen title="수업 출석부">
                <div className="grid grid-cols-5 gap-1 h-full">
                    <div className="bg-gray-700/50 rounded text-xs p-1">학생</div>
                    <div className="bg-gray-700/50 rounded text-xs p-1 text-center">9/2 (월)</div>
                    <div className="bg-gray-700/50 rounded text-xs p-1 text-center">9/4 (수)</div>
                    <div className="bg-gray-700/50 rounded text-xs p-1 text-center">9/6 (금)</div>
                    <div className="bg-gray-700/50 rounded text-xs p-1 text-center">...</div>
                    <div className="bg-gray-700/50 rounded text-xs p-1">김민준</div>
                    <div className="bg-yellow-500/20 rounded border-2 border-yellow-500"></div>
                    <div className="bg-gray-700/30 rounded"></div>
                    <div className="bg-gray-700/30 rounded"></div>
                    <div className="bg-gray-700/30 rounded"></div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수업 출석부: 간편한 알림톡 발송",
        description: "각 수업일 하단에는 '알림톡 발송' 버튼이 있습니다. 수업 내용 기록을 마친 후 이 버튼을 누르면, 해당일의 출결 및 주요 사항이 학부모님께 알림톡으로 자동 발송됩니다. 발송 실패 시 재시도도 가능하여 소통 누락을 방지합니다.",
        mockup: (
            <MockupScreen title="수업 출석부">
                 <div className="flex flex-col h-full">
                    <div className="flex-grow grid grid-cols-5 gap-1">
                        {Array(10).fill(0).map((_,i) => <div key={i} className="bg-gray-700/30 rounded"></div>)}
                    </div>
                    <div className="flex justify-around items-center h-8 flex-shrink-0">
                        <div className="text-xs text-gray-400">...</div>
                        <button className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">알림톡 발송</button>
                        <button className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">재시도</button>
                        <button className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">발송완료</button>
                        <div className="text-xs text-gray-400">...</div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 관리: 종합 정보 조회",
        description: "학생 목록에서 학생을 선택하면 상세 정보를 볼 수 있습니다. 탭을 통해 재원 기간, 최근 리포트, 수강료, 상담 내역 등을 종합적으로 확인할 수 있어 학생 개개인에 대한 깊이 있는 파악이 가능합니다.",
        mockup: (
            <MockupScreen title="학생 관리">
                 <div className="flex gap-2 h-full">
                    <div className="w-1/3 bg-gray-700/50 rounded p-1 text-xs text-gray-400">학생 목록</div>
                    <div className="w-2/3 bg-gray-700/50 rounded p-1 text-xs text-gray-400">
                        학생 상세 정보
                        <div className="flex gap-1 mt-1">
                            <div className="bg-yellow-500/50 text-white px-2 py-0.5 rounded-t-sm text-[10px]">리포트</div>
                            <div className="bg-gray-600/50 px-2 py-0.5 rounded-t-sm text-[10px]">수강료</div>
                            <div className="bg-gray-600/50 px-2 py-0.5 rounded-t-sm text-[10px]">상담</div>
                        </div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "AI 장기분석 & AI 요약기록",
        description: "학생 상세 정보에서 AI 기능을 활용할 수 있습니다. 'AI 장기분석'은 여러 리포트 데이터를 기반으로 학습 추세와 맞춤 전략을 제시하며, 'AI 요약기록'은 특정 기간의 수업 기록을 핵심 내용만 요약하여 학생의 변화를 빠르게 파악하도록 돕습니다.",
        mockup: (
            <MockupScreen title="AI 분석 기능">
                <div className="flex gap-2 h-full">
                    <div className="w-1/2 bg-gray-700/50 rounded p-2 text-xs text-gray-400">
                        <h3 className="font-bold text-white mb-1">AI 장기분석</h3>
                        <p>📈 전반적 추세: 꾸준한 상승세...</p>
                    </div>
                    <div className="w-1/2 bg-gray-700/50 rounded p-2 text-xs text-gray-400">
                        <h3 className="font-bold text-white mb-1">AI 요약기록</h3>
                        <p>📝 종합 평가: 기간 내 성실히 참여...</p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "AI 리포트 관리: 스마트한 리뷰 생성",
        description: "리포트 관리 페이지에서 'AI로 리뷰 생성' 버튼을 누르면, 학생의 정량적 데이터와 수업 기록을 종합 분석하여 선생님의 관점에서 작성한 듯한 따뜻하고 전문적인 종합 리뷰 초안을 생성해줍니다. 이를 통해 리포트 작성 시간을 획기적으로 단축할 수 있습니다.",
         mockup: (
            <MockupScreen title="리포트 관리">
                <div className="flex flex-col h-full">
                    <div className="flex-grow bg-gray-700/50 rounded p-1 text-xs text-gray-400">리포트 내용...</div>
                    <button className="w-full mt-2 text-sm bg-yellow-600 text-white py-1 rounded">AI로 리뷰 생성</button>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "AI 시험지 생성기",
        description: "학년, 단원, 문항 수, 난이도를 설정하면 AI가 조건에 맞는 수학 시험지를 즉시 생성해줍니다. 객관식과 주관식이 혼합된 문제와 정답이 함께 제공되어, 선생님의 테스트 준비 시간을 크게 줄여주고 수업의 질을 높입니다.",
         mockup: (
            <MockupScreen title="시험지 생성기">
                 <div className="flex gap-2 h-full">
                    <div className="w-1/3 bg-gray-700/50 rounded p-1 text-xs text-gray-400">설정</div>
                    <div className="w-2/3 bg-gray-700/50 rounded p-1 text-xs text-gray-400">생성된 시험지</div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "그 외 다양한 관리 기능",
        description: "수강료 관리(CSV 다운로드), 반/수업 관리, 강사 관리, 연간 일정, 회의록 등 학원 운영에 필요한 모든 기능을 체계적으로 관리할 수 있습니다. 각 메뉴를 탐색하며 헤라매쓰 통합 관리 시스템의 모든 기능을 활용해보세요!",
        mockup: (
             <MockupScreen title="기타 관리 메뉴">
                <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400">수강료 관리</div>
                    <div className="bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400">반/수업 관리</div>
                    <div className="bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400">강사 관리</div>
                    <div className="bg-gray-700/50 rounded flex items-center justify-center text-xs text-gray-400">연간 일정</div>
                </div>
            </MockupScreen>
        )
    },
];

const UserManual: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToNext = () => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
    };

    const goToPrev = () => {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    };
    
    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    }

    const { title, description, mockup } = slides[currentSlide];

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">헤라매쓰 시스템 사용설명서</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                     <Card title="목차">
                        <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
                            {slides.map((slide, index) => (
                                <li key={index}>
                                    <button 
                                        onClick={() => goToSlide(index)}
                                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                                            index === currentSlide 
                                                ? 'bg-gray-700 text-[#E5A823] font-semibold' 
                                                : 'text-gray-300 hover:bg-gray-700/50'
                                        }`}
                                    >
                                        {index + 1}. {slide.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                     </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                {mockup}
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <h2 className="text-xl font-bold text-[#E5A823] mb-3">{title}</h2>
                                <p className="text-gray-300 leading-relaxed">{description}</p>
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                                <button onClick={goToPrev} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
                                    이전
                                </button>
                                <span className="text-sm font-medium text-gray-400">
                                    {currentSlide + 1} / {slides.length}
                                </span>
                                <button onClick={goToNext} className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                                    다음
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserManual;
