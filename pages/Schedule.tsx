import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import type { AcademyEvent } from '../types';

const EventTypeBadge: React.FC<{ type: AcademyEvent['type'] }> = ({ type }) => {
    const colorMap = {
        '학사': 'bg-blue-500/30 text-blue-300 border-blue-500/40',
        '시험': 'bg-red-500/30 text-red-300 border-red-500/40',
        '행사': 'bg-green-500/30 text-green-300 border-green-500/40',
        '방학': 'bg-yellow-500/30 text-yellow-300 border-yellow-500/40',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[type]}`}>{type}</span>;
}

interface SchedulePageProps {
    academyEvents: AcademyEvent[];
    setAcademyEvents: React.Dispatch<React.SetStateAction<AcademyEvent[]>>;
}

const Schedule: React.FC<SchedulePageProps> = ({ academyEvents, setAcademyEvents }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const sortedEvents = useMemo(() => {
    return [...academyEvents].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [academyEvents, sortOrder]);

  const handleSelectItem = (id: number) => {
      setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
  };
  
  const handleDeleteSelected = () => {
      if (window.confirm(`${selectedIds.length}개의 일정을 정말로 삭제하시겠습니까?`)) {
          setAcademyEvents(prev => prev.filter(e => !selectedIds.includes(e.id)));
          setSelectedIds([]);
      }
  };
  
  const handleSelectAllClick = () => {
    setSelectedIds(sortedEvents.map(e => e.id));
  };

  const handleDeselectAllClick = () => {
    setSelectedIds([]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">연간 일정</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <button onClick={() => setSortOrder('asc')} className={`px-3 py-1 text-sm rounded-md ${sortOrder === 'asc' ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700'}`}>오래된순</button>
                <button onClick={() => setSortOrder('desc')} className={`px-3 py-1 text-sm rounded-md ${sortOrder === 'desc' ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700'}`}>최신순</button>
            </div>
            <button 
                onClick={() => alert("신규 일정 등록 기능은 준비 중입니다.")}
                className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                신규 일정 등록
            </button>
        </div>
      </div>
      
       <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center min-h-[72px]">
          <span className="text-white font-medium">{selectedIds.length}개 선택됨</span>
          <div className="flex items-center gap-2">
              <button 
                  onClick={handleSelectAllClick}
                  className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors text-sm">
                  전체 선택
              </button>
              <button 
                  onClick={handleDeselectAllClick}
                  disabled={selectedIds.length === 0}
                  className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm">
                  선택 취소
              </button>
              <button 
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                  className="bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed text-sm">
                  선택 항목 삭제
              </button>
          </div>
      </div>

      <div className="space-y-4">
        {sortedEvents.length > 0 ? sortedEvents.map(event => (
            <Card key={event.id} className="transition-all hover:border-gray-600">
               <div className="flex items-start gap-4">
                    <input 
                        type="checkbox"
                        checked={selectedIds.includes(event.id)}
                        onChange={() => handleSelectItem(event.id)}
                        className="w-5 h-5 mt-1 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2"
                    />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                        <div className="flex-1 mb-4 sm:mb-0">
                            <div className="flex items-center gap-4 mb-2">
                                <EventTypeBadge type={event.type} />
                                <h3 className="text-lg font-bold text-white">{event.title}</h3>
                            </div>
                            <p className="text-sm text-gray-400">{event.notes}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-gray-200">{event.startDate} ~ {event.endDate}</p>
                            <div className="mt-2">
                                <button className="text-xs text-yellow-400 hover:text-yellow-300">
                                    수정
                                </button>
                            </div>
                        </div>
                    </div>
               </div>
            </Card>
        )) : (
            <Card>
                <p className="text-center text-gray-400">등록된 일정이 없습니다.</p>
            </Card>
        )}
      </div>
    </div>
  );
};

export default Schedule;