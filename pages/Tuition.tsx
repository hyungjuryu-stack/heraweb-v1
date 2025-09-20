import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Tuition, Student } from '../types';

const PaymentStatusBadge: React.FC<{ status: Tuition['paymentStatus'] }> = ({ status }) => {
    const colorMap = {
        '결제완료': 'bg-green-500/20 text-green-300',
        '미결제': 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
}

interface TuitionPageProps {
    tuitions: Tuition[];
    setTuitions: React.Dispatch<React.SetStateAction<Tuition[]>>;
    students: Student[];
}

const Tuition: React.FC<TuitionPageProps> = ({ tuitions, setTuitions, students }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

    const sortedTuitions = useMemo(() => {
        let sortableItems = [...tuitions];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const key = sortConfig.key as keyof Tuition;
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
    }, [tuitions, sortConfig, studentMap]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedIds.length;
            const numItems = sortedTuitions.length;
            headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
        }
    }, [selectedIds, sortedTuitions]);

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
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(sortedTuitions.map(t => t.id));
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
        if (window.confirm(`${selectedIds.length}개의 수강료 내역을 정말로 삭제하시겠습니까?`)) {
            setTuitions(prev => prev.filter(t => !selectedIds.includes(t.id)));
            setSelectedIds([]);
        }
    };

    const handleSelectAllClick = () => {
        setSelectedIds(sortedTuitions.map(t => t.id));
    };

    const handleDeselectAllClick = () => {
        setSelectedIds([]);
    };

    const headers: { key: string; label: string }[] = [
        { key: 'studentId', label: '학생' },
        { key: 'course', label: '과정' },
        { key: 'plan', label: '수강항목' },
        { key: 'baseFee', label: '기본 수강료' },
        { key: 'siblingDiscount', label: '형제할인' },
        { key: 'totalFee', label: '총 수강료' },
        { key: 'paymentMethod', label: '결제방식' },
        { key: 'paymentStatus', label: '결제상태' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">수강료 관리</h1>
                <button 
                    onClick={() => alert("신규 수강료 등록 기능은 준비 중입니다.")}
                    className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                    신규 등록
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
                    {sortedTuitions.map((tuition) => (
                        <tr key={tuition.id} className="hover:bg-gray-800/40 transition-colors">
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input id={`checkbox-${tuition.id}`} type="checkbox"
                                        checked={selectedIds.includes(tuition.id)}
                                        onChange={() => handleSelectItem(tuition.id)}
                                        className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                                    <label htmlFor={`checkbox-${tuition.id}`} className="sr-only">checkbox</label>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{studentMap.get(tuition.studentId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tuition.course}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tuition.plan}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tuition.baseFee.toLocaleString()}원</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tuition.siblingDiscount ? 'Y' : 'N'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold">{tuition.totalFee.toLocaleString()}원</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{tuition.paymentMethod}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><PaymentStatusBadge status={tuition.paymentStatus} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-yellow-400 hover:text-yellow-300">수정</button>
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

export default Tuition;