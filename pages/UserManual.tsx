import React, { useState } from 'react';
import Card from '../components/ui/Card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import PptSlide from '../components/PptSlide';
import { DownloadIcon } from '../components/Icons';

const MockupScreen: React.FC<{ title: string; children?: React.ReactNode; full?: boolean }> = ({ title, children, full = false }) => (
    <div className={`w-full bg-gray-800 border-2 border-gray-600 rounded-lg flex flex-col shadow-lg ${full ? 'h-full' : 'h-56'}`}>
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
        description: `이 사용설명서는 시스템의 모든 핵심 기능을 상세히 안내하는 종합 가이드입니다. 
        
'다음' 버튼을 눌러 순서대로 기능을 익히거나, 좌측 목차에서 원하는 기능으로 바로 이동하여 필요한 정보만 빠르게 확인할 수 있습니다. 

각 슬라이드는 실제 시스템 화면과 동일한 예시 이미지, 그리고 각 버튼과 프로세스에 대한 상세한 설명을 포함하고 있어, 누구나 쉽고 정확하게 시스템을 마스터할 수 있도록 돕습니다.`,
        mockup: (
            <MockupScreen title="Hera Math Academy Management" full>
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h1 className="text-6xl font-bold font-gowun text-[#E5A823] tracking-wider select-none">
                        헤라매쓰
                    </h1>
                    <p className="text-lg text-gray-400 select-none">
                        통합 관리 시스템
                    </p>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "대시보드: 학원 현황을 한눈에",
        description: `로그인 후 가장 먼저 마주하는 화면으로, 학원의 핵심 지표를 실시간으로 시각화하여 제공합니다. 이 화면을 통해 학원의 전반적인 건강 상태를 신속하게 파악할 수 있습니다.

- **원생 현황**: 총 재원생, 당월 신규/퇴원생, 상담/대기 학생 수를 보여주어 학원의 성장 추이를 직관적으로 이해하게 돕습니다.
- **오늘 출결 현황**: 당일 수업의 출석, 결석, 지각 현황을 원형 차트로 보여주어 즉각적인 학생 관리를 지원합니다.
- **학년별 분포**: 재원생의 학년 비율을 시각적으로 파악하여 학년별 전략 수립에 필요한 데이터를 제공합니다.
- **평균 점수 추이**: 최근 5개월간 학생들의 평균 점수 변화를 추적하여 학원의 학업 성취도 동향을 분석할 수 있습니다.
- **강사별 담당 반 현황**: 강사별 업무량을 파악하고 효율적인 인력 배치를 위한 기초 자료로 활용됩니다.
- **오늘 학원 일정**: 당일의 시험, 행사, 방학 등 주요 학사 일정을 놓치지 않도록 알려줍니다.`,
        mockup: (
            <MockupScreen title="대시보드" full>
                 <div className="grid grid-cols-6 gap-2 h-full text-xs text-gray-300">
                    <div className="lg:col-span-2 col-span-6 bg-gray-700/50 rounded p-2">
                        <h3 className="font-bold text-yellow-400 mb-2">원생 현황</h3>
                        <div className="grid grid-cols-2 gap-2 text-center h-full content-around">
                            <div><p className="text-gray-400">총 재원생</p><p className="text-xl font-bold">130</p></div>
                            <div><p className="text-gray-400">신규</p><p className="text-xl font-bold">5</p></div>
                            <div><p className="text-gray-400">퇴원</p><p className="text-xl font-bold">2</p></div>
                            <div><p className="text-gray-400">상담/대기</p><p className="text-xl font-bold">0</p></div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 col-span-3 bg-gray-700/50 rounded p-2 flex flex-col items-center justify-center"><h3 className="font-bold text-yellow-400">오늘 출결 현황</h3><p className="mt-2">[원형 차트]</p></div>
                    <div className="lg:col-span-2 col-span-3 bg-gray-700/50 rounded p-2 flex flex-col items-center justify-center"><h3 className="font-bold text-yellow-400">학년별 재원생 분포</h3><p className="mt-2">[원형 차트]</p></div>
                    <div className="lg:col-span-3 col-span-6 bg-gray-700/50 rounded p-2 flex flex-col items-center justify-center"><h3 className="font-bold text-yellow-400">최근 5개월 평균 점수 추이</h3><p className="mt-2">[라인 차트]</p></div>
                    <div className="lg:col-span-3 col-span-6 bg-gray-700/50 rounded p-2 flex flex-col items-center justify-center"><h3 className="font-bold text-yellow-400">강사별 담당 반 현황</h3><p className="mt-2">[막대 차트]</p></div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "오늘의 수업일정",
        description: `상단의 날짜 선택기를 이용해 특정일의 전체 수업 스케줄을 시간순으로 조회할 수 있습니다. 이 기능은 하루의 수업 흐름을 미리 파악하고, 강의실 배정이나 강사 스케줄 충돌을 예방하는 데 필수적입니다.

- **프로세스**: 날짜를 선택하면, 시스템은 등록된 모든 '반' 정보에서 해당 요일에 수업이 있는 반을 자동으로 필터링합니다. 필터링된 수업들은 시작 시간순으로 정렬되어 화면에 표시됩니다.
- **시간**: 수업의 시작과 종료 시간을 명확히 보여줍니다.
- **반 이름, 강사, 강의실**: 수업의 기본 정보를 제공합니다.
- **인원**: 해당 반에 배정된 총 학생 수를 표시합니다.
- **학생 명단**: 수업에 참여하는 모든 학생의 이름이 나열됩니다. 특히 '수'요일과 같이 학생별 시간이 다른 자율반의 경우, 학생 이름 옆에 괄호로 개별 등원/하원 시간이 표시되어 더욱 정밀한 관리가 가능합니다.`,
        mockup: (
            <MockupScreen title="오늘의 수업일정 (2025-09-15)" full>
                <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-12 gap-2 p-2 bg-gray-700/80 rounded-t-md font-bold text-xs text-gray-300">
                        <div className="col-span-2">시간</div>
                        <div className="col-span-2">반 이름</div>
                        <div className="col-span-2">강사</div>
                        <div className="col-span-1">강의실</div>
                        <div className="col-span-1">인원</div>
                        <div className="col-span-4">학생 명단</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 p-2 bg-gray-700/50 rounded">
                        <div className="col-span-2 font-semibold text-yellow-400">14:30 - 16:30</div>
                        <div className="col-span-2 text-white font-bold">월목1A</div>
                        <div className="col-span-2">이선생</div>
                        <div className="col-span-1">201호</div>
                        <div className="col-span-1">4명</div>
                        <div className="col-span-4 text-xs flex flex-wrap gap-1">
                            <span className="bg-gray-600 px-2 rounded-full">김민준</span>
                            <span className="bg-gray-600 px-2 rounded-full">박서아</span>
                            <span className="bg-gray-600 px-2 rounded-full">최지안</span>
                            <span className="bg-gray-600 px-2 rounded-full">정서윤</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 p-2 bg-gray-700/50 rounded">
                        <div className="col-span-2 font-semibold text-yellow-400">16:40 - 18:40</div>
                        <div className="col-span-2 text-white font-bold">화금2B</div>
                        <div className="col-span-2">박선생</div>
                        <div className="col-span-1">302호</div>
                        <div className="col-span-1">5명</div>
                        <div className="col-span-4 text-xs flex flex-wrap gap-1">
                            <span className="bg-gray-600 px-2 rounded-full">이도윤</span>
                            <span className="bg-gray-600 px-2 rounded-full">강하윤</span>
                            <span className="bg-gray-600 px-2 rounded-full">조지우</span>
                            <span className="bg-gray-600 px-2 rounded-full">윤아윤</span>
                            <span className="bg-gray-600 px-2 rounded-full">장서연</span>
                        </div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수업 출석부: 기본 사용법",
        description: `반과 해당 월을 선택하면 달력 형태로 해당 반의 수업일만 표시됩니다. 이 화면은 한 달간의 학생별 학습 현황을 한눈에 파악하는 데 최적화되어 있습니다.

- **레이아웃**: 학생 목록이 세로로, 수업일이 가로로 배열되어 있어 특정 학생의 한 달간 출결 및 성취도 변화를 쉽게 추적할 수 있습니다.
- **기록 확인**: 각 셀에는 해당 학생의 그날 수업 기록(출결, 태도, 과제, 자기주도, 테스트 점수 등)이 요약되어 표시됩니다.
- **기록 입력/수정**: 기록이 필요한 셀을 클릭하면, 해당 위치에 상세 정보를 입력할 수 있는 수정 창이 나타납니다. 이 직관적인 인터페이스는 수업 중에도 빠르고 간편하게 기록을 남길 수 있도록 지원합니다. (수정 권한은 '관리자', '운영자'에게만 부여됩니다.)`,
        mockup: (
            <MockupScreen title="수업 출석부 - 월목1A (2025년 9월)" full>
                <div className="grid grid-cols-5 gap-1 h-full text-xs text-center text-gray-300">
                    <div className="bg-gray-700/80 rounded p-1 font-bold">학생 정보</div>
                    <div className="bg-gray-700/80 rounded p-1">9/15 (월)</div>
                    <div className="bg-gray-700/80 rounded p-1">9/18 (목)</div>
                    <div className="bg-gray-700/80 rounded p-1">9/22 (월)</div>
                    <div className="bg-gray-700/80 rounded p-1">9/25 (목)</div>
                    
                    <div className="bg-gray-700/50 rounded p-1 font-bold">김민준</div>
                    <div className="bg-yellow-500/20 rounded border-2 border-yellow-500 flex flex-col items-center justify-center text-[10px]"><p>편집 중...</p><p className="mt-1">출석/A/B/B</p><p>85, 18/20</p></div>
                    <div className="bg-gray-700/30 rounded p-1 text-[10px]">출석/A/A/B<br/>90, 19/20</div>
                    <div className="bg-gray-700/30 rounded p-1 text-[10px]">지각/B/A/B<br/>88</div>
                    <div className="bg-gray-700/30 rounded p-1 text-[10px]">결석/F/F/F</div>

                     <div className="bg-gray-700/50 rounded p-1 font-bold">박서아</div>
                    <div className="bg-gray-700/30 rounded p-1 text-[10px]">출석/B/A/A<br/>92</div>
                    <div className="bg-gray-700/30 rounded p-1 text-[10px]">출석/B/B/A<br/>95, 20/20</div>
                    <div className="bg-gray-700/30 rounded p-1 text-[10px]">출석/A/A/A<br/>100</div>
                    <div className="bg-gray-700/30 rounded p-1 text-[10px]"></div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수업 출석부: 상세 기록 입력",
        description: `수정 창에서 학생의 하루 학습 내용을 8가지 항목에 걸쳐 상세하게 기록할 수 있습니다. 이는 학생의 상태를 다각도로 파악하고, 학부모 상담 및 월간 리포트 작성 시 중요한 데이터로 활용됩니다.

- **출결/태도/과제/자기주도**: 드롭다운 메뉴에서 선택합니다. (A~F 등급)
- **테스트 (1/2/3)**: 총 3개까지 점수를 입력할 수 있습니다. (예: 85, 17/20 등 자유 형식)
- **본교재/부교재/보강교재**: 교재명과 함께 학습한 페이지 범위를 기록하여 진도를 관리합니다. (예: 쎈 50-55p)
- **준비요청**: 다음 수업까지 학생이 준비해야 할 사항(오답노트, 프린트물 등)을 명시합니다.
- **비고**: 학생의 특이사항, 질문 내용, 칭찬 등 수업 중 관찰한 내용을 자유롭게 기록합니다.

'저장' 버튼을 누르면 모든 내용이 즉시 반영되며, '취소' 시 변경사항은 저장되지 않습니다.`,
        mockup: (
            <MockupScreen title="상세 기록 입력 - 김민준 (9/15)" full>
                <div className="text-sm text-gray-200 p-4 bg-gray-700/50 rounded-lg h-full flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-xs">
                            <p>출결: [출석 ▼]</p><p>태도: [A ▼]</p><p>과제: [B ▼]</p><p>자기주도: [B ▼]</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" value="85" className="bg-gray-600 px-2 py-1 rounded w-full text-xs" readOnly/>
                            <input type="text" value="18/20" className="bg-gray-600 px-2 py-1 rounded w-full text-xs" readOnly/>
                            <input type="text" placeholder="점수3" className="bg-gray-600 px-2 py-1 rounded w-full text-xs" readOnly/>
                        </div>
                         <input type="text" value="본교재: 쎈 50-55p" className="bg-gray-600 px-2 py-1 rounded w-full text-xs" readOnly/>
                         <textarea value="비고: 오답노트 확인 완료. 질문 내용 좋음." className="bg-gray-600 px-2 py-1 rounded w-full text-xs h-12" readOnly/>
                    </div>
                    <div className="text-right pt-2">
                        <button className="bg-gray-600 text-white px-3 py-1 rounded mr-2 text-xs">취소</button>
                        <button className="bg-yellow-600 text-white px-3 py-1 rounded text-xs">저장</button>
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

출결(지각, 결석) 상태만으로는 발송 대상이 되지 않으며, 다른 특이사항이 있을 때 참고 정보로 함께 발송됩니다.

- **프로세스**: 
  1. **발송**: '발송' 버튼을 누르면 위 조건에 해당하는 학생들의 정보만 요약되어 학부모님께 자동 발송됩니다.
  2. **상태 변경**: 발송이 시작되면 버튼은 '전송 중...'으로, 성공 시 '발송완료'로 변경됩니다. '발송완료' 버튼을 누르면 발송 내용을 다시 확인할 수 있습니다.
  3. **실패 및 재시도**: 통신 오류 등으로 실패 시 '발송실패'로 표시되며, '재시도' 버튼이 활성화됩니다.`,
        mockup: (
            <MockupScreen title="수업 출석부 - 알림톡" full>
                 <div className="flex flex-col h-full">
                    <div className="flex-grow grid grid-cols-5 gap-1">
                        {Array(15).fill(0).map((_,i) => <div key={i} className="bg-gray-700/30 rounded"></div>)}
                    </div>
                    <div className="grid grid-cols-5 gap-1 items-center h-12 flex-shrink-0 border-t-2 border-gray-600 pt-1">
                        <div className="text-xs text-gray-300 font-bold text-center">알림톡 발송</div>
                        <button className="text-xs bg-yellow-600 text-gray-900 font-bold px-2 py-1 rounded h-full">발송</button>
                        <button className="text-xs bg-red-600 text-white font-bold px-2 py-1 rounded h-full">재시도</button>
                        <button className="text-xs bg-blue-600 text-white font-bold px-2 py-1 rounded h-full">발송 내용 확인</button>
                        <button className="text-xs bg-gray-700 text-gray-500 font-bold px-2 py-1 rounded h-full" disabled>발송 대상 없음</button>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 관리: 목록 및 검색",
        description: `전체 학생 목록을 조회하고 관리하는 페이지입니다. 학생 정보의 중앙 허브 역할을 합니다.

- **신규 학생 등록**: 우측 상단 버튼을 통해 새로운 학생 정보를 시스템에 추가합니다.
- **상단 제어판**: 
  - **검색**: 학생 이름으로 신속하게 검색합니다.
  - **일괄 선택**: '전체 선택', '선택 취소' 버튼으로 여러 학생을 효율적으로 관리합니다.
  - **일괄 삭제**: 선택된 학생들의 모든 관련 데이터(수업, 상담, 수강료 기록 등)를 영구적으로 삭제합니다. (주의 필요)
- **학생 목록**: 학생의 핵심 정보가 표 형태로 제공됩니다. 각 열의 제목(헤더)을 클릭하면 해당 기준으로 오름차순/내림차순 정렬이 가능합니다.
- **상세 정보**: 목록에서 특정 학생 행을 클릭하면, 하단에 해당 학생의 모든 상세 정보가 담긴 '상세 정보 뷰'가 나타납니다.`,
        mockup: (
            <MockupScreen title="학생 관리" full>
                <div className="flex flex-col h-full text-xs text-gray-300">
                    <div className="flex-shrink-0 flex items-center justify-between gap-2 p-2 bg-gray-700/80 rounded mb-2">
                        <div className="flex items-center gap-2">
                            <span>5명 선택됨</span>
                            <input type="text" placeholder="학생 이름 검색..." className="bg-gray-600 px-2 py-1 rounded w-28" />
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="bg-gray-600 px-2 py-1 rounded">전체 선택</button>
                            <button className="bg-red-600 text-white px-2 py-1 rounded">선택 삭제</button>
                        </div>
                    </div>
                    <div className="flex-grow bg-gray-700/50 rounded p-1 text-[10px]">
                        <p className="font-bold border-b border-gray-600 pb-1">이름▲  상태  학교  학년  배정 반...</p>
                        <p className="bg-gray-800/50 rounded mt-1 p-1">김민준  재원  헤라중  중1  월목1A...</p>
                        <p className="mt-1 p-1">박서아  재원  가온중  중1  월목1A...</p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 관리: 신규 등록 및 정보 수정",
        description: `학생 정보 입력/수정 창에서 학생의 모든 정보를 체계적으로 관리할 수 있습니다.

- **핵심 기능**: 학생의 기본 정보, 학부모 연락처, 재원 상태(재원, 상담, 대기, 퇴원), 반 배정 등 모든 정보를 이곳에서 관리합니다.
- **출결번호**: 재원생의 경우, 중복되지 않는 4자리 출결번호를 반드시 입력해야 합니다. 시스템이 중복 여부를 실시간으로 확인해줍니다.
- **반 이동 기록 자동화**: 학생의 정규반 또는 심화반 배정을 변경하고 저장하면, '상담 기록'에 '반 이동' 내역이 지정된 '이동일' 기준으로 자동으로 생성됩니다. 이 기능은 학생의 모든 학업적 변화를 놓치지 않고 추적할 수 있게 해줍니다.
- **저장**: 모든 정보를 입력하거나 수정한 후 '저장' 버튼을 눌러야 변경사항이 시스템에 최종 반영됩니다.`,
        mockup: (
             <MockupScreen title="학생 정보 등록/수정" full>
                <div className="text-xs text-gray-300 grid grid-cols-3 gap-4 h-full">
                    <div className="space-y-2">
                        <p>출결번호: <span className="bg-gray-600 px-2 py-1 rounded">1001</span></p>
                        <p>이름: <span className="bg-gray-600 px-2 py-1 rounded">김민준</span></p>
                        <p>학교: <span className="bg-gray-600 px-2 py-1 rounded">헤라중학교</span></p>
                        <p>학년: [중1 ▼]</p>
                    </div>
                     <div className="space-y-2">
                        <p>상태: [재원 ▼]</p>
                        <p>등록일: [2024-06-05]</p>
                        <p>정규반: [월목1A ▼]</p>
                        <p>심화반: [수B ▼]</p>
                    </div>
                     <div className="space-y-2 bg-gray-700/50 p-2 rounded">
                        <p className="font-bold">학부모 (모)</p>
                        <p>이름: <span className="bg-gray-600 px-2 py-1 rounded">김영희</span></p>
                        <p>연락처: <span className="bg-gray-600 px-2 py-1 rounded">010-1234-5678</span></p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (1): 리포트/수강료/상담",
        description: `학생 목록에서 학생을 클릭하면 나타나는 상세 정보 뷰입니다. 탭을 통해 학생의 모든 이력을 통합 조회할 수 있습니다.

- **리포트 탭**: 해당 학생에게 발행된 모든 월간 리포트 이력을 확인합니다. 발행일, 발송 상태를 통해 학부모와의 소통 기록을 추적합니다.
- **수강료 탭**: 학생의 월별 수강료 납부 내역을 확인합니다. 월, 청구 금액, 결제 상태(결제완료/미결제)가 표시되어 미납 여부 등을 빠르게 파악할 수 있습니다.
- **상담 탭**: 학생과 관련하여 진행된 모든 상담 기록을 시간순으로 보여줍니다. 상담일, 담당 교사, 상담 유형, 주요 내용을 요약하여 학생과의 소통 이력을 체계적으로 관리할 수 있습니다.`,
        mockup: (
             <MockupScreen title="상세 정보 - 김민준" full>
                <div className="text-xs text-gray-300 h-full flex flex-col">
                    <div className="flex border-b border-gray-600">
                        <button className="px-3 py-1 border-b-2 border-yellow-400 text-yellow-400">리포트</button>
                        <button className="px-3 py-1 text-gray-400">수강료</button>
                        <button className="px-3 py-1 text-gray-400">상담</button>
                    </div>
                    <div className="flex-grow p-1">
                        <h3 className="font-bold text-white mb-2">최근 리포트 (총 5회)</h3>
                        <div className="bg-gray-800/50 p-2 rounded">2025년 8월 <span className="text-green-400 ml-2">발송완료</span></div>
                        <div className="bg-gray-800/50 p-2 rounded mt-1">2025년 7월 <span className="text-green-400 ml-2">발송완료</span></div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "학생 상세 정보 (2): 수강 기간/AI 분석",
        description: `학생의 장기적인 데이터를 분석하고 관리하는 고급 기능 탭입니다.

- **수강 기간 탭**: 학생의 입학일부터 현재(또는 퇴원일)까지 총 재원 기간을 자동으로 계산하여 보여줍니다. 학생의 학원 수강 이력을 명확하게 확인할 수 있습니다.
- **AI 장기분석 탭**: 학생의 누적된 리포트 데이터를 AI가 종합 분석하여 장기적인 학습 추세를 도출합니다. 'AI 분석 리포트 생성' 버튼을 누르면 **전반적인 추세, 주요 강점, 성장 영역, 맞춤 학습 추천** 항목으로 구성된 심층 분석 결과를 제공합니다. 이 결과는 월간 리포트의 AI 리뷰 생성 시 참고 자료로 활용되어 더욱 깊이 있는 리뷰 작성을 돕습니다.
- **AI 요약기록 탭**: 특정 기간의 모든 수업 기록을 AI가 분석하여 핵심 내용만 간추려줍니다. 생성된 요약은 목록으로 저장되어 언제든지 다시 확인할 수 있습니다.`,
        mockup: (
            <MockupScreen title="상세 정보 - 김민준" full>
                <div className="text-xs text-gray-300 h-full flex flex-col">
                    <div className="flex border-b border-gray-600">
                        <button className="px-3 py-1 text-gray-400">...</button>
                        <button className="px-3 py-1 border-b-2 border-yellow-400 text-yellow-400">AI 장기분석</button>
                        <button className="px-3 py-1 text-gray-400">AI 요약기록</button>
                    </div>
                    <div className="flex-grow p-2">
                        <h3 className="font-bold text-white mb-2">📈 전반적인 학습 추세</h3>
                        <p className="bg-gray-800/50 p-2 rounded">꾸준한 상승세를 보였으나 최근 주춤하는 경향이 있습니다.</p>
                        <div className="text-center mt-4">
                            <button className="bg-gray-600 px-3 py-1 rounded">다시 분석하기</button>
                        </div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "리포트 관리: 생성 및 발송",
        description: `학생들의 월간 리포트를 통합 관리합니다.

- **월별 리포트 일괄 생성**: 버튼을 누르면 나오는 창에서 특정 월을 선택하면, 해당 월에 재원한 모든 학생의 리포트 초안을 한번에 만듭니다. 각 학생의 수업 기록을 바탕으로 평균 점수, 출석률 등의 통계가 자동으로 계산됩니다.
- **수정 및 AI 리뷰**: '수정' 버튼으로 개별 리포트 내용을 편집합니다. 여기서 'AI로 리뷰 생성' 버튼을 누르면, Gemini AI가 해당 기간의 모든 데이터와 'AI 장기분석' 결과까지 종합하여 전문적이고 따뜻한 종합 리뷰 초안을 작성해줍니다.
- **발송 및 PDF**: '발송' 버튼으로 학부모에게 미리보기 후 전송하며, 'PDF' 버튼으로 고품질의 인쇄용 파일을 다운로드할 수 있습니다.`,
         mockup: (
            <MockupScreen title="리포트 관리" full>
                <div className="text-xs text-gray-300 h-full flex flex-col">
                    <div className="flex justify-between items-center p-2 bg-gray-700/80 rounded mb-2">
                        <input type="text" placeholder="학생 이름 검색..." className="bg-gray-600 px-2 py-1 rounded w-28" />
                        <button className="bg-yellow-600 text-gray-900 font-bold px-3 py-1 rounded">월별 리포트 일괄 생성</button>
                    </div>
                    <div className="flex-grow bg-gray-700/50 rounded p-1 text-[10px]">
                        <p className="font-bold border-b border-gray-600 pb-1">학생  기간  상태  발송일...</p>
                        <div className="bg-gray-800/50 rounded mt-1 p-1 flex justify-between items-center">
                            <span>김민준  2025년 8월  <span className="text-green-400">발송완료</span> 2025-09-05</span>
                            <div>
                                <button className="text-yellow-400">수정</button>
                                <button className="text-gray-300 ml-2">PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "수강료 관리 및 CSV 다운로드",
        description: `월별 수강료 내역을 관리하고 외부 결제 시스템과 연동합니다.

- **프로세스**: 
  1. **산정월 선택**: 관리할 월을 선택합니다.
  2. **내역 생성**: '수강료 내역 생성' 버튼을 누르면 재원생 기준으로 학년, 형제 여부를 고려하여 수강료가 자동 계산됩니다.
  3. **수동 조정**: 표에서 직접 횟수, 기타 할인/할증 금액을 수정하면 최종 청구액이 실시간으로 변경됩니다.
  4. **저장**: '변경사항 저장'을 눌러야 수정 내용이 최종 반영됩니다.
- **CSV 다운로드**: '결제선생' 양식에 맞는 CSV 파일을 다운로드합니다. 이 파일에는 학부모 연락처, 청구 금액, 그리고 납부 안내 메시지까지 모두 포함되어 있어, 파일을 업로드하는 것만으로 수납 요청을 일괄 처리할 수 있습니다.`,
        mockup: (
            <MockupScreen title="수강료 관리 (2025-09)" full>
                <div className="text-xs text-gray-300 h-full flex flex-col">
                    <div className="flex-shrink-0 flex items-center justify-between p-2 bg-gray-700/80 rounded mb-2">
                        <p>수강 기간: 2025-09-01 ~ 2025-09-30</p>
                        <button className="bg-yellow-600 text-gray-900 font-bold px-3 py-1 rounded">전체 다운로드</button>
                    </div>
                    <div className="flex-grow bg-gray-700/50 rounded p-1 text-[10px]">
                        <p className="font-bold border-b border-gray-600 pb-1">학생  청구액  결제상태...</p>
                        <div className="bg-gray-800/50 rounded mt-1 p-1 flex justify-between items-center">
                            <span>김민준  450,000원  [미결제 ▼]</span>
                            <button className="text-yellow-400">조정</button>
                        </div>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "AI 시험지 생성기",
        description: `학년, 단원, 문항 수, 난이도를 설정하면 AI가 조건에 맞는 수학 시험지를 즉시 생성해주는 강력한 도구입니다.

- **프로세스**: 
  1. **조건 설정**: '학년', '단원'(예: "일차함수와 그래프"), '문항 수', '난이도'(상/중/하)를 입력하고 선택합니다.
  2. **생성**: '시험지 생성' 버튼을 클릭합니다.
  3. **결과 확인**: 시스템이 입력된 정보를 바탕으로 Gemini API에 요청을 보내고, 몇 초 안에 조건에 맞는 시험지를 생성하여 오른쪽에 표시합니다.
- **결과물**: 생성된 시험지에는 객관식과 주관식이 균형 있게 혼합된 문제와 명확한 정답이 함께 제공됩니다. 이를 통해 선생님은 문제 출제에 드는 시간을 획기적으로 줄이고, 학생 수준에 맞는 다양한 유형의 문제를 손쉽게 확보할 수 있습니다.`,
         mockup: (
            <MockupScreen title="AI 시험지 생성기" full>
                 <div className="flex gap-4 h-full text-sm">
                    <div className="w-1/3 bg-gray-700/50 rounded p-4 text-gray-300 space-y-4">
                        <h3 className="font-bold text-base text-white">시험지 설정</h3>
                        <p>학년: [중2 ▼]</p>
                        <p>단원: <input type="text" value="일차함수와 그래프" className="bg-gray-600 px-2 py-1 rounded w-full text-xs" readOnly/></p>
                        <p>문항 수: <input type="number" value="5" className="bg-gray-600 px-2 py-1 rounded w-full text-xs" readOnly/></p>
                        <button className="w-full bg-yellow-600 text-gray-900 font-bold py-2 rounded">시험지 생성</button>
                    </div>
                    <div className="w-2/3 bg-gray-700/50 rounded p-4 text-gray-300 text-xs">
                        <h3 className="text-white font-bold text-base">일차함수와 그래프 시험지</h3>
                        <p className="mt-2">1. 다음 중 일차함수 y = 2x + 1의 그래프에 대한 설명으로 옳은 것은?</p>
                        <p className="mt-1 ml-2">(1) y절편은 -1이다.</p>
                        <p className="mt-1 ml-2">(2) 점 (1, 3)을 지난다.</p>
                        <p className="mt-2 font-bold text-yellow-400">정답: (2)</p>
                    </div>
                </div>
            </MockupScreen>
        )
    },
    {
        title: "요약 및 마무리",
        description: `헤라매쓰 통합 관리 시스템은 학원 운영의 모든 과정을 효율적으로 만들고, 교육의 질을 한 단계 높이기 위해 설계되었습니다.

- **자동화와 효율성**: 반복적인 기록, 통계, 생성 작업을 자동화하여 선생님이 학생 교육이라는 본질에 더 집중할 수 있는 환경을 제공합니다.
- **데이터 기반 의사결정**: 모든 학생 데이터를 중앙에서 체계적으로 관리하고, AI 분석을 통해 얻은 통찰력으로 데이터에 기반한 맞춤형 교육 전략을 수립할 수 있습니다.
- **강화된 소통**: 정확한 데이터 기반의 리포트와 시기적절한 알림톡 발송 기능으로 학부모와의 신뢰 관계를 더욱 공고히 할 수 있습니다.

이 설명서를 통해 시스템의 모든 기능을 100% 활용하시어, 학원 운영의 새로운 가능성을 경험하시길 바랍니다.`,
        mockup: (
             <MockupScreen title="Hera Math - Empowering Education" full>
                <div className="text-center p-4 text-gray-300 h-full flex flex-col justify-center items-center">
                     <p className="text-4xl font-bold">"교육의 본질에 더 집중할 수 있도록"</p>
                     <p className="mt-6 text-lg text-gray-400">헤라매쓰 통합 관리 시스템은 선생님과 함께 성장합니다.</p>
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
        tempContainer.style.top = '0';
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
                // Allow time for rendering, especially for complex components
                setTimeout(resolve, 150);
            });
            
            const canvas = await html2canvas(tempContainer, {
                scale: 2, // Increase scale for higher resolution
                useCORS: true,
                backgroundColor: '#0d211c', // Match the app's dark theme
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

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
                        <ul className="space-y-1 max-h-[65vh] overflow-y-auto pr-2">
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
                        <div className="flex flex-col h-full min-h-[70vh]">
                            <div className="mb-4 h-80">
                                {mockup}
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg flex-grow">
                                <h2 className="text-xl font-bold text-[#E5A823] mb-3">{title}</h2>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{description}</p>
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