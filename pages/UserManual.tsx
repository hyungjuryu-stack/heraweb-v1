import React, { useState } from 'react';
import Card from '../components/ui/Card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import PptSlide from '../components/PptSlide';
import { DownloadIcon } from '../components/Icons';

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
        description: `로그인 후 가장 먼저 마주하는 화면입니다. 학원의 핵심 지표를 실시간으로 시각화하여 제공합니다.
- **원생 현황**: 총 재원생, 당월 신규/퇴원생, 상담/대기 학생 수를 보여줍니다.
- **오늘 출결 현황**: 당일 수업의 출석, 결석, 지각 현황을 원형 차트로 보여줍니다.
- **학년별 분포**: 재원생의 학년 비율을 직관적으로 파악할 수 있습니다.
- **평균 점수 추이**: 최근 5개월간 학생들의 평균 점수 변화를 추적합니다.
- **강사별 담당 반 현황**: 강사별로 몇 개의 반을 담당하는지 보여줍니다.
- **오늘 학원 일정**: 당일의 주요 학사 일정을 확인할 수 있습니다.`,
        mockup: (
            <MockupScreen title="대시보드">
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full text-xs text-gray-300">
                    <div className="col-span-1 row-span-1 bg-gray-700/50 rounded flex flex-col items-center justify-center p-1"><p className="text-gray-400">총 재원생</p><p className="font-bold text-lg text-yellow-400">130</p></div>
                    <div className="col-span-1 row-span-1 bg-gray-700/50 rounded flex flex-col items-center justify-center p-1"><p className="text-gray-400">신규</p><p className="font-bold text-lg text-white">5</p></div>
                    <div className="col-span-2 row-span-2 bg-gray-700/50 rounded flex items-center justify-center">출결 현황 (원형 차트)</div>
                    <div className="col-span-1 row-span-1 bg-gray-700/50 rounded flex flex-col items-center justify-center p-1"><p className="text-gray-400">퇴원</p><p className="font-bold text-lg text-white">2</p></div>
                    <div className="col-span-1 row-span-1 bg-gray-700/50 rounded flex flex-col items-center justify-center p-1"><p className="text-gray-400">상담/대기</p><p className="font-bold text-lg text-white">0</p></div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "오늘의 수업일정",
        description: "상단의 날짜 선택기를 이용해 특정일의 전체 수업 스케줄을 시간순으로 조회할 수 있습니다. 각 수업의 시간, 반 이름, 담당 강사, 강의실, 배정된 학생 명단을 한눈에 확인할 수 있어 하루의 수업을 체계적으로 준비하고 관리하는 데 도움을 줍니다.",
        mockup: (
            <MockupScreen title="오늘의 수업일정 (2025-09-15)">
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 p-1 bg-gray-700/50 rounded">
                        <div className="font-bold text-yellow-400 w-16">14:30-16:30</div>
                        <div className="text-gray-300 flex-grow">월목1A (이선생)</div>
                        <div className="text-gray-400">김민준, 박서아...</div>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-gray-700/50 rounded">
                        <div className="font-bold text-yellow-400 w-16">16:40-18:40</div>
                        <div className="text-gray-300 flex-grow">화금2B (박선생)</div>
                        <div className="text-gray-400">이도윤, 최하윤...</div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수업 출석부: 기본 사용법",
        description: "반과 해당 월을 선택하면 달력 형태로 해당 반의 수업일만 표시됩니다. 학생 목록이 세로로, 수업일이 가로로 배열되어 전체 출결 상황을 쉽게 파악할 수 있습니다. 각 학생의 해당 날짜 칸을 클릭하면 상세 기록을 입력할 수 있는 수정 창이 나타납니다.",
        mockup: (
            <MockupScreen title="수업 출석부 - 월목1A">
                <div className="grid grid-cols-5 gap-1 h-full text-[10px] text-center">
                    <div className="bg-gray-700/50 rounded p-1 font-bold">학생</div>
                    <div className="bg-gray-700/50 rounded p-1">9/15 (월)</div>
                    <div className="bg-gray-700/50 rounded p-1">9/18 (목)</div>
                    <div className="bg-gray-700/50 rounded p-1">9/22 (월)</div>
                    <div className="bg-gray-700/50 rounded p-1">...</div>
                    <div className="bg-gray-700/50 rounded p-1 font-bold">김민준</div>
                    <div className="bg-yellow-500/20 rounded border-2 border-yellow-500 flex items-center justify-center">편집 중...</div>
                    <div className="bg-gray-700/30 rounded flex items-center justify-center">출석/A/B</div>
                    <div className="bg-gray-700/30 rounded flex items-center justify-center">출석/B/A</div>
                    <div className="bg-gray-700/30 rounded"></div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수업 출석부: 상세 기록 입력",
        description: `수정 창에서 학생의 하루 학습 내용을 상세하게 기록할 수 있습니다.
- **출결/태도/과제/자기주도**: 드롭다운 메뉴에서 선택합니다. (A~F 등급)
- **테스트**: 총 3개까지 점수를 입력할 수 있습니다. (예: 85, 17/20)
- **교재**: 본교재, 부교재, 보강교재의 진도를 각각 입력합니다.
- **준비요청 및 비고**: 다음 수업을 위한 준비사항이나 학생의 특이사항을 기록합니다.
'저장' 버튼을 누르면 모든 내용이 즉시 반영됩니다.`,
        mockup: (
            <MockupScreen title="상세 기록 입력 - 김민준 (9/15)">
                <div className="text-xs text-gray-300 space-y-1">
                    <p>출결: [출석 ▼] 태도: [A ▼]</p>
                    <p>테스트1: <span className="bg-gray-600 px-2 rounded">85</span> 테스트2: <span className="bg-gray-600 px-2 rounded">18/20</span></p>
                    <p>본교재: <span className="bg-gray-600 px-2 rounded">쎈 50-55p</span></p>
                    <p>비고: <span className="bg-gray-600 px-2 rounded">오답노트 확인 완료</span></p>
                    <div className="text-right pt-2">
                        <button className="bg-yellow-600 text-white px-2 py-0.5 rounded">저장</button>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수업 출석부: 알림톡 발송 기준 및 방법",
        description: `각 수업일 하단에는 알림톡 발송 상태가 표시됩니다. **다음 조건 중 하나라도 해당되는 학생이 있을 경우 '발송' 버튼이 활성화됩니다:**
- **평가**: '수업 태도', '과제 수행', '자기주도 학습' 중 하나라도 C등급 이하
- **테스트**: 기록된 테스트 점수가 하나 이상 있는 경우
출결(지각, 결석) 상태만으로는 발송 대상이 되지 않으며, 다른 특이사항이 있을 때 참고 정보로 함께 발송됩니다. 버튼을 누르면 위 조건에 해당하는 학생들의 정보만 요약되어 학부모님께 자동 발송됩니다.`,
        mockup: (
            <MockupScreen title="수업 출석부 - 알림톡">
                 <div className="flex flex-col h-full">
                    <div className="flex-grow grid grid-cols-5 gap-1">
                        {Array(10).fill(0).map((_,i) => <div key={i} className="bg-gray-700/30 rounded"></div>)}
                    </div>
                    <div className="flex justify-around items-center h-8 flex-shrink-0 border-t-2 border-gray-600">
                        <div className="text-xs text-gray-300 font-bold">알림톡 발송</div>
                        <button className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">발송</button>
                        <button className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">재시도</button>
                        <button className="text-xs bg-green-600 text-white px-2 py-0.5 rounded" disabled>발송완료</button>
                        <div className="text-xs text-gray-400">...</div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 관리: 목록 및 검색",
        description: "전체 학생 목록을 조회하고 관리하는 페이지입니다. 상단의 검색창에 이름을 입력하여 특정 학생을 찾거나, 테이블 헤더를 클릭하여 출결번호, 이름, 등록일 등 원하는 기준으로 정렬할 수 있습니다. 체크박스를 사용하여 여러 학생을 선택한 후 일괄 삭제하는 것도 가능합니다.",
        mockup: (
            <MockupScreen title="학생 관리">
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 flex items-center gap-2 p-1 bg-gray-700/50 rounded mb-1">
                        <input type="text" placeholder="학생 이름 검색..." className="bg-gray-600 text-xs px-2 py-0.5 rounded w-24" />
                        <button className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">선택 삭제</button>
                    </div>
                    <div className="flex-grow text-[10px] text-gray-300">
                        <p>[  ] 이름   상태   학교   학년...</p>
                        <p className="bg-gray-800/50 rounded mt-1">[✓] 김민준  재원   헤라중  중1...</p>
                        <p>[  ] 박서아  재원   가온중  중1...</p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 관리: 신규 등록 및 정보 수정",
        description: "우측 상단의 '신규 학생 등록' 버튼을 누르거나, 상세 정보 창에서 '수정' 버튼을 누르면 학생 정보 입력/수정 창이 열립니다. 학생의 기본 정보, 학부모 연락처, 재원 상태, 반 배정 등 모든 정보를 이곳에서 관리할 수 있습니다. 특히 반을 변경할 경우, 상담 기록에 '반 이동' 내역이 자동으로 생성됩니다.",
        mockup: (
             <MockupScreen title="학생 정보 등록/수정">
                <div className="text-xs text-gray-300 space-y-1">
                    <p>이름: <span className="bg-gray-600 px-2 rounded">김민준</span></p>
                    <p>학교: <span className="bg-gray-600 px-2 rounded">헤라중학교</span></p>
                    <p>정규반: [월목1A ▼]</p>
                    <p>모 연락처: <span className="bg-gray-600 px-2 rounded">010-1234-5678</span></p>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (1): 리포트 탭",
        description: "학생 목록에서 학생 이름을 클릭하면 나타나는 상세 정보 창의 첫 번째 탭입니다. 해당 학생에게 발행된 모든 월간 리포트 이력을 확인할 수 있습니다. 가장 최근 3개의 리포트가 요약 표시되며, 총 발행 횟수를 통해 학생의 학습 리포트 이력을 한눈에 파악할 수 있습니다.",
        mockup: (
             <MockupScreen title="상세 정보 - 리포트 탭">
                <div className="text-xs text-gray-300 p-1">
                    <h3 className="font-bold text-white mb-2">최근 리포트 (총 5회)</h3>
                    <div className="bg-gray-800/50 p-1 rounded">2025년 8월 <span className="text-green-400 ml-2">발송완료</span></div>
                    <div className="bg-gray-800/50 p-1 rounded mt-1">2025년 7월 <span className="text-green-400 ml-2">발송완료</span></div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (2): 수강료 탭",
        description: "학생의 월별 수강료 납부 내역을 확인합니다. 월, 청구 금액, 결제 상태(결제완료/미결제)가 표시되어 특정 학생의 수강료 이력을 빠르게 파악할 수 있습니다.",
        mockup: (
             <MockupScreen title="상세 정보 - 수강료 탭">
                <div className="text-xs text-gray-300 p-1">
                    <h3 className="font-bold text-white mb-2">최근 수강료 내역</h3>
                    <div className="bg-gray-800/50 p-1 rounded">2025-09 <span className="text-red-400 ml-2">미결제</span> 450,000원</div>
                    <div className="bg-gray-800/50 p-1 rounded mt-1">2025-08 <span className="text-green-400 ml-2">결제완료</span> 450,000원</div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (3): 상담 탭",
        description: "학생과 관련하여 진행된 모든 상담 기록을 시간순으로 보여줍니다. 상담일, 담당 교사, 상담 유형, 주요 내용을 요약하여 학생과의 소통 이력을 체계적으로 관리할 수 있습니다.",
        mockup: (
            <MockupScreen title="상세 정보 - 상담 탭">
                <div className="text-xs text-gray-300 p-1">
                    <h3 className="font-bold text-white mb-2">최근 상담 기록</h3>
                    <div className="bg-gray-800/50 p-1 rounded">
                        <p>2025-08-20 (이선생) <span className="text-yellow-300 ml-1">학습상담</span></p>
                        <p className="mt-1 truncate">2학기 내신 대비 학습 전략 상담</p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (4): 수강 기간 탭",
        description: "학생의 입학일부터 현재(또는 퇴원일)까지 총 재원 기간을 자동으로 계산하여 보여줍니다. 입학일과 퇴원일 정보도 함께 표시되어 학생의 학원 수강 이력을 명확하게 확인할 수 있습니다.",
        mockup: (
            <MockupScreen title="상세 정보 - 수강 기간 탭">
                 <div className="text-sm text-gray-300 p-2 space-y-2">
                    <h3 className="font-bold text-white text-base mb-2">재원 기간 정보</h3>
                    <div className="flex justify-between items-center"><span>총 재원 기간:</span><span className="font-bold text-lg text-yellow-400">1년 3개월 10일</span></div>
                    <div className="flex justify-between"><span>입학일:</span><span>2024-06-05</span></div>
                    <div className="flex justify-between"><span>상태:</span><span>재원 중</span></div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (5): AI 장기분석 탭",
        description: "학생의 누적된 리포트 데이터를 AI가 종합 분석하여 장기적인 학습 추세를 도출합니다. 'AI 분석 리포트 생성' 버튼을 누르면 **전반적인 추세, 주요 강점, 성장 영역, 맞춤 학습 추천** 항목으로 구성된 심층 분석 결과를 제공합니다. 이 결과는 월간 리포트의 AI 리뷰 생성 시 참고 자료로 활용되어 더욱 깊이 있는 리뷰 작성을 돕습니다.",
        mockup: (
             <MockupScreen title="상세 정보 - AI 장기분석 탭">
                <div className="text-xs text-gray-300 p-1">
                    <h3 className="font-bold text-white mb-2">📈 전반적인 학습 추세</h3>
                    <p className="bg-gray-800/50 p-1 rounded">꾸준한 상승세를 보였으나 최근 주춤...</p>
                    <button className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded mt-4">다시 분석하기</button>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (6): AI 요약기록 탭",
        description: "특정 기간을 설정하고 'AI 요약 생성' 버튼을 누르면, 해당 기간의 모든 수업 기록(출결, 태도, 점수, 비고 등)을 AI가 분석하여 핵심적인 내용만 간추려줍니다. 학생의 단기적인 변화나 특정 이벤트에 대한 학습 상태를 빠르게 파악해야 할 때 유용합니다. 생성된 요약은 목록으로 저장되어 언제든지 다시 확인할 수 있습니다.",
        mockup: (
             <MockupScreen title="상세 정보 - AI 요약기록 탭">
                <div className="text-xs text-gray-300 p-1">
                    <div className="flex gap-1">
                        <input type="date" className="bg-gray-600 rounded text-[10px] w-20 p-0.5" />
                        <input type="date" className="bg-gray-600 rounded text-[10px] w-20 p-0.5" />
                        <button className="bg-yellow-600 text-white px-2 py-0.5 rounded">요약 생성</button>
                    </div>
                    <div className="bg-gray-800/50 p-1 rounded mt-2">
                        <p className="font-bold text-white">기간: 2025-08-01 ~ 2025-08-31</p>
                        <p>종합 평가: 기간 내 성실히 참여...</p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "리포트 관리: 생성 및 발송",
        description: "학생들의 월간 리포트를 통합 관리합니다. 학생 이름이나 기간으로 검색하고, '월별 리포트 일괄 생성' 기능으로 모든 재원생의 리포트 초안을 한번에 만들 수 있습니다. '수정'을 통해 개별 리포트 내용을 편집하고, '발송' 버튼으로 학부모에게 전송할 수 있으며, 'PDF' 버튼으로 인쇄용 파일을 다운로드할 수 있습니다.",
         mockup: (
            <MockupScreen title="리포트 관리">
                <div className="text-xs text-gray-300">
                    <p className="font-bold text-white">학생  기간        상태   ...</p>
                    <div className="bg-gray-800/50 p-1 rounded mt-1 flex justify-between items-center">
                        <span>김민준 2025년 8월 <span className="text-green-400">발송완료</span></span>
                        <div>
                            <button className="text-yellow-400">수정</button>
                            <button className="text-blue-400 ml-2">발송</button>
                            <button className="text-gray-300 ml-2">PDF</button>
                        </div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수강료 관리 및 CSV 다운로드",
        description: "월별 수강료 내역을 관리합니다. 산정월을 선택하고 '수강료 내역 생성'을 누르면 재원생 기준으로 수강료가 자동 계산됩니다. 각 학생의 횟수, 할인율, 기타 할인 금액을 직접 수정할 수 있으며, '변경사항 저장'으로 반영합니다. '결제선생' 양식에 맞는 CSV 파일 다운로드 기능으로 수납 업무를 간소화할 수 있습니다.",
        mockup: (
            <MockupScreen title="수강료 관리">
                <div className="text-xs text-gray-300">
                    <p className="font-bold text-white">학생  기본료  횟수  할인  청구액...</p>
                     <div className="bg-gray-800/50 p-1 rounded mt-1 flex justify-between items-center">
                        <span>김민준 450,000  8회  0  450,000</span>
                        <select className="bg-gray-600 text-xs rounded"><option>미결제</option></select>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "AI 시험지 생성기",
        description: "학년, 단원, 문항 수, 난이도를 설정하면 AI가 조건에 맞는 수학 시험지를 즉시 생성해줍니다. 객관식과 주관식이 혼합된 문제와 정답이 함께 제공되어, 선생님의 테스트 준비 시간을 크게 줄여주고 수업의 질을 높입니다.",
         mockup: (
            <MockupScreen title="시험지 생성기">
                 <div className="flex gap-2 h-full text-xs">
                    <div className="w-1/3 bg-gray-700/50 rounded p-2 text-gray-400 space-y-2">
                        <p>학년: 중2</p>
                        <p>단원: 일차함수</p>
                        <p>문항 수: 5</p>
                    </div>
                    <div className="w-2/3 bg-gray-700/50 rounded p-2 text-gray-400">
                        <p className="text-white font-bold">생성된 시험지</p>
                        <p>1. y = 2x + 1의 그래프는...?</p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "요약 및 마무리",
        description: `헤라매쓰 통합 관리 시스템은 학원 운영의 모든 과정을 효율적으로 만듭니다.
- **자동화**: 반복적인 작업을 줄여 선생님이 교육에 더 집중할 수 있게 합니다.
- **데이터 중심**: 모든 학생 데이터를 중앙에서 관리하고 분석하여 맞춤형 교육을 지원합니다.
- **AI 활용**: 리포트 작성, 시험지 생성 등 AI 기술로 업무 부담을 줄이고 교육의 질을 높입니다.
- **원활한 소통**: 알림톡, 리포트 발송 기능으로 학부모와의 소통을 강화합니다.
이 설명서를 통해 시스템을 100% 활용하시길 바랍니다.`,
        mockup: (
             <MockupScreen title="Hera Math - Empowering Education">
                <div className="text-center p-4 text-gray-300 h-full flex flex-col justify-center items-center">
                     <p className="text-lg font-bold">"교육의 본질에 더 집중할 수 있도록"</p>
                     <p className="mt-4 text-xs text-gray-400">헤라매쓰 통합 관리 시스템은 선생님과 함께 성장합니다.</p>
                </div>
            </MockupScreen>
        )
    },
];

const UserManual: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const goToNext = () => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
    };

    const goToPrev = () => {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    };
    
    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    }
    
    const handleDownloadPpt = async () => {
        setIsGeneratingPdf(true);

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '1280px';
        tempContainer.style.height = '720px';
        document.body.appendChild(tempContainer);

        const root = ReactDOM.createRoot(tempContainer);

        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            
            await new Promise<void>(resolve => {
                root.render(
                    <React.StrictMode>
                        <PptSlide title={slide.title} description={slide.description} mockup={slide.mockup} pageNumber={i + 1} totalPages={slides.length} />
                    </React.StrictMode>
                );
                setTimeout(resolve, 100);
            });
            
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#1A3A32',
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            if (i < slides.length - 1) {
                pdf.addPage();
            }
        }
        
        pdf.save('Hera_Math_User_Manual.pdf');

        root.unmount();
        document.body.removeChild(tempContainer);
        setIsGeneratingPdf(false);
    };

    const { title, description, mockup } = slides[currentSlide];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">헤라매쓰 시스템 사용설명서</h1>
                 <button 
                    onClick={handleDownloadPpt}
                    disabled={isGeneratingPdf}
                    className="bg-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2 disabled:bg-gray-600"
                >
                    <DownloadIcon className="w-5 h-5" />
                    {isGeneratingPdf ? 'PDF 생성 중...' : 'PPT로 다운로드 (PDF)'}
                </button>
            </div>
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
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{description}</p>
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