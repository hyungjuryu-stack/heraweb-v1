import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useMockData } from '../hooks/useMockData';
import type { Counseling } from '../types';

const Counseling: React.FC = () => {
    const { counselings, setCounselings, students, teachers } = useMockData();
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const sortedCounselings = useMemo(() => {
        let sortableItems = [...counselings];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const key = sortConfig.key as keyof Counseling;
                let valA, valB;
                
                if (key === 'studentId') {
                    valA = studentMap.get(a.studentId) || '';
                    valB = studentMap.get(b.studentId) || '';
                } else if (key === 'teacherId') {
                    valA = teacherMap.get(a.teacherId) || '';
                    valB = teacherMap.get(b.teacherId) || '';
                }
                else {
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
    }, [counselings, sortConfig, studentMap, teacherMap]);
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedIds.length;
            const numItems = sortedCounselings.length;
            headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
        }
    }, [selectedIds, sortedCounselings]);

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

    const handleDeleteCounseling = (counselingId: number) => {
        if (window.confirm('이 상담 기록을 삭제하시겠습니까?')) {
            setCounselings(prev => prev.filter(c => c.id !== counselingId));
        }
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(sortedCounselings.map(c => c.id));
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
        if (window.confirm(`${selectedIds.length}개의 상담 기록을 정말로 삭제하시겠습니까?`)) {
            setCounselings(prev => prev.filter(c => !selectedIds.includes(c.id)));
            setSelectedIds([]);
        }
    };
    
    const handleSelectAllClick = () => {
        setSelectedIds(sortedCounselings.map(c => c.id));
    };

    const handleDeselectAllClick = () => {
        setSelectedIds([]);
    };

    const headers: { key: string; label: string }[] = [
        { key: 'date', label: '상담일' },
        { key: 'studentId', label: '학생' },
        { key: 'parentName', label: '학부모' },
        { key: 'teacherId', label: '담당 교사' },
        { key: 'content', label: '상담 내용' },
        { key: 'followUp', label: '후속 조치' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">상담 기록</h1>
                <button 
                    onClick={() => alert("신규 상담 기록 기능은 준비 중입니다.")}
                    className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                    신규 상담 등록
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
                        {headers.map(({key, label}) => (
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
                    {sortedCounselings.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input id={`checkbox-${item.id}`} type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                        className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                                    <label htmlFor={`checkbox-${item.id}`} className="sr-only">checkbox</label>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{studentMap.get(item.studentId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.parentName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacherMap.get(item.teacherId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-md">{item.content}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-sm">{item.followUp}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                <button className="text-yellow-400 hover:text-yellow-300">상세</button>
                                <button onClick={() => handleDeleteCounseling(item.id)} className="text-red-500 hover:text-red-400">삭제</button>
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

export default Counseling;