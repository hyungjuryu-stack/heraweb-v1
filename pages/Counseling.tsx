import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import type { Counseling, Student, Teacher } from '../types';
import CounselingModal from '../components/CounselingModal';

interface CounselingPageProps {
    counselings: Counseling[];
    setCounselings: React.Dispatch<React.SetStateAction<Counseling[]>>;
    students: Student[];
    teachers: Teacher[];
}

const Counseling: React.FC<CounselingPageProps> = ({ counselings, setCounselings, students, teachers }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(10);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCounseling, setSelectedCounseling] = useState<Counseling | null>(null);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const filteredAndSortedCounselings = useMemo(() => {
        let filteredItems = counselings.filter(item => {
            const studentName = studentMap.get(item.studentId)?.toLowerCase() || '';
            const nameMatch = searchTerm ? studentName.includes(searchTerm.toLowerCase()) : true;
            const startDateMatch = startDate ? item.date >= startDate : true;
            const endDateMatch = endDate ? item.date <= endDate : true;

            return nameMatch && startDateMatch && endDateMatch;
        });

        if (sortConfig !== null) {
            filteredItems.sort((a, b) => {
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
                    valA = a[key as keyof typeof a] || '';
                    valB = b[key as keyof typeof b] || '';
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
        return filteredItems;
    }, [counselings, sortConfig, studentMap, teacherMap, searchTerm, startDate, endDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate, itemsPerPage]);

    const { currentTableData, totalPages } = useMemo(() => {
        if (itemsPerPage === 'ALL' || filteredAndSortedCounselings.length === 0) {
            return { currentTableData: filteredAndSortedCounselings, totalPages: 1 };
        }
        const totalPagesCalc = Math.ceil(filteredAndSortedCounselings.length / itemsPerPage);
        const validCurrentPage = Math.max(1, Math.min(currentPage, totalPagesCalc));
        const start = (validCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return { currentTableData: filteredAndSortedCounselings.slice(start, end), totalPages: totalPagesCalc };
    }, [filteredAndSortedCounselings, currentPage, itemsPerPage]);

    const paginationNumbers = useMemo(() => {
        if (totalPages <= 1) return [];
        const pageNumbers = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);
            if (currentPage <= 3) {
                endPage = maxVisiblePages;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
            }
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        }
        return pageNumbers;
    }, [totalPages, currentPage]);
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedIds.length;
            const numTotalItems = filteredAndSortedCounselings.length;
            headerCheckboxRef.current.checked = numSelected === numTotalItems && numTotalItems > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numTotalItems;
        }
    }, [selectedIds, filteredAndSortedCounselings]);

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
            setSelectedIds(filteredAndSortedCounselings.map(c => c.id));
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

    const handleAddNewCounseling = () => {
        setSelectedCounseling(null);
        setIsModalOpen(true);
    };

    const handleEditCounseling = (item: Counseling) => {
        setSelectedCounseling(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCounseling(null);
    };

    const handleSaveCounseling = (counselingData: Omit<Counseling, 'id'> & { id?: number }) => {
        if (counselingData.id) {
            setCounselings(prev => prev.map(c => (c.id === counselingData.id ? { ...c, ...counselingData } as Counseling : c)));
        } else {
            const newCounseling: Counseling = { ...counselingData, id: Date.now() };
            setCounselings(prev => [...prev, newCounseling]);
        }
        handleCloseModal();
    };
    
    const headers: { key: string; label: string }[] = [
        { key: 'date', label: '상담일' },
        { key: 'studentId', label: '학생' },
        { key: 'type', label: '상담 유형' },
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
                    onClick={handleAddNewCounseling}
                    className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
                    신규 상담 등록
                </button>
            </div>
            
             <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                         <input
                            type="text"
                            placeholder="학생 이름 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                        />
                    </div>
                </div>
                 <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white font-medium text-sm mr-2">{`${selectedIds.length} / ${filteredAndSortedCounselings.length}개 선택됨`}</span>
                    <button 
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.length === 0}
                        className="bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed text-sm">
                        선택 삭제
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
                    {currentTableData.map((item) => (
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.type || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.parentName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacherMap.get(item.teacherId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-md" title={item.content}>{item.content}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-sm" title={item.followUp}>{item.followUp}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleEditCounseling(item)} className="text-yellow-400 hover:text-yellow-300">수정</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-sm">
                        <label htmlFor="itemsPerPageSelect" className="text-gray-400">페이지당 표시 개수:</label>
                        <select
                            id="itemsPerPageSelect"
                            value={itemsPerPage}
                            onChange={e => setItemsPerPage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                            className="bg-gray-700 border border-gray-600 rounded-md py-1 pl-2 pr-8 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                            <option value="ALL">All</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1 text-sm">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                        {paginationNumbers.map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700 text-white'}`}>{page}</button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                    </div>

                    <div className="text-sm text-gray-400 w-40 text-right">
                        총 {filteredAndSortedCounselings.length}개 중 {`페이지 ${totalPages > 0 ? currentPage : 0} / ${totalPages}`}
                    </div>
                </div>
            </Card>

            <CounselingModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveCounseling}
                counseling={selectedCounseling}
                students={students}
                teachers={teachers}
                counselings={counselings}
            />
        </div>
    );
};

export default Counseling;