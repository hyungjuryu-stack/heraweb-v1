import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useMockData } from '../hooks/useMockData';
import type { LessonRecord } from '../types';

const AttendanceBadge: React.FC<{ status: LessonRecord['attendance'] }> = ({ status }) => {
    const colorMap = {
        '출석': 'bg-green-500/20 text-green-300',
        '지각': 'bg-yellow-500/20 text-yellow-300',
        '결석': 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
}

const LessonRecords: React.FC = () => {
    const { lessonRecords, setLessonRecords, students } = useMockData();
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
    
    const sortedRecords = useMemo(() => {
        let sortableItems = [...lessonRecords];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const key = sortConfig.key as keyof LessonRecord;
                let valA, valB;

                if (key === 'studentId') {
                    valA = studentMap.get(a.studentId) || '';
                    valB = studentMap.get(b.studentId) || '';
                } else {
                    valA = a[key];
                    valB = b[key];
                }
                
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [lessonRecords, sortConfig, studentMap]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedIds.length;
            const numItems = sortedRecords.length;
            headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
        }
    }, [selectedIds, sortedRecords]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };
    
    const handleDeleteRecord = (recordId: number) => {
        if (window.confirm('이 수업 기록을 삭제하시겠습니까?')) {
            setLessonRecords(prev => prev.filter(r => r.id !== recordId));
        }
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(sortedRecords.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`${selectedIds.length}개의 수업 기록을 정말로 삭제하시겠습니까?`)) {
            setLessonRecords(prev => prev.filter(r => !selectedIds.includes(r.id)));
            setSelectedIds([]);
        }
    };

    const handleSelectAllClick = () => {
        setSelectedIds(sortedRecords.map(r => r.id));
    };

    const handleDeselectAllClick = () => {
        setSelectedIds([]);
    };

    const headers: { key: string; label: string }[] = [
        { key: 'date', label: '날짜' },
        { key: 'studentId', label: '학생' },
        { key: 'attendance', label: '출결' },
        { key: 'testScore', label: '테스트 점수' },
        { key: 'homeworkCompleted', label: '과제' },
        { key: 'attitude', label: '수업 태도' },
        { key: 'notes', label: '비고' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">수업 기록</h1>
                <button 
                    onClick={() => alert("신규 기록 작성 기능은 준비 중입니다.")}
                    className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                    신규 기록 작성
                </button>
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

            <Card>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800/50">
                    <tr>
                        <th scope="col" className="p-4">
                          <div className="flex items-center">
                              <input id="checkbox-all" type="checkbox"
                                  ref={headerCheckboxRef}
                                  onChange={handleSelectAll}
                                  className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                              <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                          </div>
                        </th>
                        {headers.map(({ key, label }) => (
                        <th key={key} scope="col" onClick={() => requestSort(key)} className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                           {label}
                           <span className="ml-1">{getSortIndicator(key)}</span>
                        </th>
                        ))}
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-700/50">
                    {sortedRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-800/40 transition-colors">
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input id={`checkbox-${record.id}`} type="checkbox"
                                        checked={selectedIds.includes(record.id)}
                                        onChange={() => handleSelectItem(record.id)}
                                        className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                                    <label htmlFor={`checkbox-${record.id}`} className="sr-only">checkbox</label>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{studentMap.get(record.studentId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><AttendanceBadge status={record.attendance} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.testScore ?? '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.homeworkCompleted ? 'O' : 'X'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.attitude}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-xs">{record.notes}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                <button className="text-yellow-400 hover:text-yellow-300">수정</button>
                                <button onClick={() => handleDeleteRecord(record.id)} className="text-red-500 hover:text-red-400">삭제</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </Card>
        </div>
    );
};

export default LessonRecords;