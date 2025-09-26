import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import type { AcademyEvent } from '../types';
import ScheduleModal from '../components/ScheduleModal';

const EventTypeBadge: React.FC<{ type: AcademyEvent['type']; small?: boolean }> = ({ type, small = false }) => {
    const colorMap = {
        '학사': 'bg-blue-500/30 text-blue-300 border-blue-500/40',
        '시험': 'bg-red-500/30 text-red-300 border-red-500/40',
        '행사': 'bg-green-500/30 text-green-300 border-green-500/40',
        '방학': 'bg-yellow-500/30 text-yellow-300 border-yellow-500/40',
    };
    const sizeClass = small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';
    return <span className={`${sizeClass} font-semibold rounded-full ${colorMap[type]}`}>{type}</span>;
}

interface SchedulePageProps {
    academyEvents: AcademyEvent[];
    setAcademyEvents: React.Dispatch<React.SetStateAction<AcademyEvent[]>>;
}

const ListView: React.FC<{ 
    events: AcademyEvent[]; 
    onEdit: (event: AcademyEvent) => void;
    onDelete: (ids: number[]) => void;
}> = ({ events, onEdit, onDelete }) => {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [events, sortOrder]);
    
    const handleSelectItem = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };
    const handleSelectAllClick = () => setSelectedIds(sortedEvents.map(e => e.id));
    const handleDeselectAllClick = () => setSelectedIds([]);
    const handleDeleteSelected = () => {
        if (selectedIds.length > 0) {
            onDelete(selectedIds);
            setSelectedIds([]);
        }
    };
    
    return (
        <>
            <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center min-h-[72px]">
                <div className='flex items-center gap-4'>
                    <span className="text-white font-medium">{selectedIds.length}개 선택됨</span>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setSortOrder('asc')} className={`px-3 py-1 text-sm rounded-md ${sortOrder === 'asc' ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700'}`}>오래된순</button>
                        <button onClick={() => setSortOrder('desc')} className={`px-3 py-1 text-sm rounded-md ${sortOrder === 'desc' ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700'}`}>최신순</button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSelectAllClick} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 text-sm">전체 선택</button>
                    <button onClick={handleDeselectAllClick} disabled={selectedIds.length === 0} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm">선택 취소</button>
                    <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-sm">선택 항목 삭제</button>
                </div>
            </div>

            <div className="space-y-4">
                {sortedEvents.length > 0 ? sortedEvents.map(event => (
                    <Card key={event.id} className="transition-all hover:border-gray-600">
                    <div className="flex items-start gap-4">
                        <input type="checkbox" checked={selectedIds.includes(event.id)} onChange={() => handleSelectItem(event.id)} className="w-5 h-5 mt-1 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600" />
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
                                    <button onClick={() => onEdit(event)} className="text-xs text-yellow-400 hover:text-yellow-300">수정</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    </Card>
                )) : (
                    <Card><p className="text-center text-gray-400">등록된 일정이 없습니다.</p></Card>
                )}
            </div>
        </>
    );
}

const CalendarView: React.FC<{ events: AcademyEvent[]; onEventClick: (event: AcademyEvent) => void }> = ({ events, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 15)); // Sim date

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfMonth) {
                    const prevMonthDays = new Date(year, month, 0).getDate();
                    week.push({ day: prevMonthDays - firstDayOfMonth + j + 1, isCurrentMonth: false });
                } else if (day > daysInMonth) {
                    week.push({ day: day - daysInMonth, isCurrentMonth: false });
                    day++;
                } else {
                    const dateObj = new Date(year, month, day);
                    const eventsForDay = events.filter(event => {
                         const eventStart = new Date(event.startDate + 'T00:00:00');
                         const eventEnd = new Date(event.endDate + 'T00:00:00');
                         return dateObj >= eventStart && dateObj <= eventEnd;
                    });
                    week.push({ day, isCurrentMonth: true, date: dateObj, events: eventsForDay });
                    day++;
                }
            }
            grid.push(week);
            if (day > daysInMonth) break;
        }
        return grid;
    }, [currentDate, events]);
    
    const handlePrevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="px-4 py-2 text-white hover:bg-gray-700 rounded-md">‹</button>
                <h2 className="text-xl font-bold text-white">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
                <button onClick={handleNextMonth} className="px-4 py-2 text-white hover:bg-gray-700 rounded-md">›</button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-700 border border-gray-700 rounded-lg overflow-hidden">
                {dayNames.map(day => <div key={day} className="text-center font-bold text-gray-300 py-2 bg-gray-800">{day}</div>)}
                {calendarGrid.flat().map((cell, index) => (
                    <div key={index} className={`relative min-h-[100px] p-1.5 ${cell.isCurrentMonth ? 'bg-[#1A3A32]/80' : 'bg-gray-800/50'}`}>
                        <span className={`text-xs font-semibold ${cell.isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>{cell.day}</span>
                        <div className="mt-1 space-y-1">
                            {cell.events?.map(event => (
                                <div key={event.id} onClick={() => onEventClick(event)} className="truncate cursor-pointer">
                                    <EventTypeBadge type={event.type} small />
                                    <span className="ml-1 text-xs text-gray-200">{event.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const Schedule: React.FC<SchedulePageProps> = ({ academyEvents, setAcademyEvents }) => {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AcademyEvent | null>(null);

    const handleAddNewEvent = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEditEvent = (event: AcademyEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleDeleteEvents = (idsToDelete: number[]) => {
      if (window.confirm(`${idsToDelete.length}개의 일정을 정말로 삭제하시겠습니까?`)) {
          setAcademyEvents(prev => prev.filter(e => !idsToDelete.includes(e.id)));
      }
    };
    
    const handleSaveEvent = (eventData: Omit<AcademyEvent, 'id' | 'relatedClassIds'> & { id?: number }) => {
        if (eventData.id) {
            setAcademyEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as AcademyEvent : e));
        } else {
            const newEvent: AcademyEvent = { ...eventData, relatedClassIds: [], id: Date.now() };
            setAcademyEvents(prev => [...prev, newEvent]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">연간 일정</h1>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg">
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'list' ? 'bg-[#E5A823] text-gray-900 font-semibold' : 'text-gray-300'}`}>목록 보기</button>
                        <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'calendar' ? 'bg-[#E5A823] text-gray-900 font-semibold' : 'text-gray-300'}`}>캘린더 보기</button>
                    </div>
                    <button onClick={handleAddNewEvent} className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                        신규 일정 등록
                    </button>
                </div>
            </div>
            
            {viewMode === 'list' ? (
                <ListView events={academyEvents} onEdit={handleEditEvent} onDelete={handleDeleteEvents} />
            ) : (
                <CalendarView events={academyEvents} onEventClick={handleEditEvent} />
            )}
            
            <ScheduleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                event={selectedEvent}
            />
        </div>
    );
};

export default Schedule;
