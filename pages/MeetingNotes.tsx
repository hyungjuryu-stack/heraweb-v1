import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import type { MeetingNote, Teacher } from '../types';

interface MeetingNotesPageProps {
    meetingNotes: MeetingNote[];
    setMeetingNotes: React.Dispatch<React.SetStateAction<MeetingNote[]>>;
    teachers: Teacher[];
}

const MeetingNotes: React.FC<MeetingNotesPageProps> = ({ meetingNotes, setMeetingNotes, teachers }) => {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const sortedNotes = useMemo(() => {
        return [...meetingNotes].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [meetingNotes, sortOrder]);
    
    const handleSelectItem = (id: number) => {
      setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
    };
    
    const handleDeleteSelected = () => {
        if (window.confirm(`${selectedIds.length}개의 회의록을 정말로 삭제하시겠습니까?`)) {
            setMeetingNotes(prev => prev.filter(note => !selectedIds.includes(note.id)));
            setSelectedIds([]);
        }
    };

    const handleSelectAllClick = () => {
        setSelectedIds(sortedNotes.map(n => n.id));
    };

    const handleDeselectAllClick = () => {
        setSelectedIds([]);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">회의록</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSortOrder('asc')} className={`px-3 py-1 text-sm rounded-md ${sortOrder === 'asc' ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700'}`}>오래된순</button>
                        <button onClick={() => setSortOrder('desc')} className={`px-3 py-1 text-sm rounded-md ${sortOrder === 'desc' ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700'}`}>최신순</button>
                    </div>
                    <button 
                        onClick={() => alert("신규 회의록 작성 기능은 준비 중입니다.")}
                        className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                        새 회의록 작성
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
                {sortedNotes.map(note => (
                    <Card key={note.id}>
                       <div className="flex items-start gap-4">
                           <input 
                                type="checkbox"
                                checked={selectedIds.includes(note.id)}
                                onChange={() => handleSelectItem(note.id)}
                                className="w-5 h-5 mt-1 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2"
                            />
                            <div className="w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-400">{note.date}</p>
                                        <h3 className="text-lg font-bold text-white mt-1">{note.title}</h3>
                                        <p className="text-sm text-gray-300 mt-2">
                                            <span className="font-semibold">참석자: </span>
                                            {note.attendeeIds.map(id => teacherMap.get(id)).join(', ')}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button className="text-yellow-400 hover:text-yellow-300">열람</button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700/50">
                                    <p className="text-sm text-gray-300"><span className="font-semibold text-gray-200">주요 결정사항: </span>{note.decisions}</p>
                                </div>
                            </div>
                       </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MeetingNotes;