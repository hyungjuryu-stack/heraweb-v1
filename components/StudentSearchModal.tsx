import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Student, Class } from '../types';
import { StudentStatus } from '../types';

interface StudentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudents: (students: Student[]) => void;
  allStudents: Student[];
  classes: Class[];
}

const StudentSearchModal: React.FC<StudentSearchModalProps> = ({ isOpen, onClose, onAddStudents, allStudents, classes }) => {
    const [filters, setFilters] = useState({
        grade: '',
        classId: '',
        status: StudentStatus.ENROLLED,
        searchTerm: '',
    });
    const [selectedIds, setSelectedIds] = useState(new Set<number>());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
    const uniqueGrades = useMemo(() => [...new Set(allStudents.map(s => s.grade))].sort(), [allStudents]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ grade: '', classId: '', status: StudentStatus.ENROLLED, searchTerm: '' });
    };

    const filteredStudents = useMemo(() => {
        return allStudents.filter(student => {
            if (filters.status && student.status !== filters.status) return false;
            if (filters.grade && student.grade !== filters.grade) return false;
            if (filters.classId && (student.regularClassId !== parseInt(filters.classId) && student.advancedClassId !== parseInt(filters.classId))) return false;
            if (filters.searchTerm && !student.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
            return true;
        });
    }, [allStudents, filters]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds(new Set());
    }, [filters, filteredStudents.length]);

    const { currentTableData, totalPages } = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return {
            currentTableData: filteredStudents.slice(start, end),
            totalPages: Math.ceil(filteredStudents.length / itemsPerPage)
        };
    }, [filteredStudents, currentPage, itemsPerPage]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const pageIds = currentTableData.map(s => s.id);
            const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
            const someOnPageSelected = pageIds.some(id => selectedIds.has(id));
            headerCheckboxRef.current.checked = allOnPageSelected;
            headerCheckboxRef.current.indeterminate = someOnPageSelected && !allOnPageSelected;
        }
    }, [selectedIds, currentTableData]);
    
    const handleAddSelected = () => {
        const studentsToAdd = allStudents.filter(s => selectedIds.has(s.id));
        onAddStudents(studentsToAdd);
        onClose();
    };

    const handleAddAll = () => {
        onAddStudents(filteredStudents);
        onClose();
    };
    
    const handleSelectIndividual = (student: Student) => {
        onAddStudents([student]);
        onClose();
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pageIds = currentTableData.map(s => s.id);
        if (e.target.checked) {
            setSelectedIds(prev => new Set([...prev, ...pageIds]));
        } else {
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                pageIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    };
    
    const handleSelectItem = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#0d211c] w-full max-w-6xl h-[90vh] rounded-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 py-4 bg-[#4A5568] rounded-t-lg">
                    <h2 className="text-xl font-bold text-white">원생검색</h2>
                    <button onClick={onClose} className="text-white text-2xl">&times;</button>
                </div>
                <div className="p-4 flex-grow flex flex-col overflow-hidden">
                    <div className="bg-white p-3 rounded-md border border-gray-200 mb-4 text-sm text-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-2 items-end">
                            <div className="flex gap-2">
                                <select name="grade" value={filters.grade} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm"><option value="">학년 전체</option>{uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">반명</label>
                                <select name="classId" value={filters.classId} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm"><option value="">반 전체</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-500">원생 구분</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm">{Object.values(StudentStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">검색</label>
                                <input type="text" name="searchTerm" placeholder="검색어를 입력하세요." value={filters.searchTerm} onChange={handleFilterChange} className="w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={resetFilters} className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">검색조건 초기화</button>
                                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4A5568] hover:bg-gray-800">검색</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-md border border-gray-200 flex-grow flex flex-col overflow-hidden text-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm">총 <span className="font-bold text-blue-600">{filteredStudents.length}</span>건</p>
                            <div className="flex items-center gap-2">
                                <button onClick={handleAddAll} className="py-1 px-3 border border-gray-300 rounded-md text-sm">전체 추가</button>
                                <button onClick={handleAddSelected} className="py-1 px-3 border border-gray-300 rounded-md text-sm">선택 추가</button>
                                <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="border-gray-300 rounded-md shadow-sm text-sm">
                                    <option value={20}>20건</option><option value={50}>50건</option><option value={100}>100건</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2"><input ref={headerCheckboxRef} onChange={handleSelectAll} type="checkbox"/></th>
                                        {['No', '원생명', '원생구분', '학년', '학교', '휴대폰', '반', '선택'].map(h => <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentTableData.map((student, index) => (
                                        <tr key={student.id}>
                                            <td className="px-3 py-2"><input type="checkbox" checked={selectedIds.has(student.id)} onChange={() => handleSelectItem(student.id)} /></td>
                                            <td className="px-3 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-3 py-2 font-semibold">{student.name}</td>
                                            <td className="px-3 py-2 text-blue-600 font-semibold">[{student.status}]</td>
                                            <td className="px-3 py-2">{student.grade}</td>
                                            <td className="px-3 py-2">{student.school}</td>
                                            <td className="px-3 py-2">{student.studentPhone}</td>
                                            <td className="px-3 py-2 truncate max-w-xs">{classMap.get(student.regularClassId || -1)}{student.advancedClassId ? ` / ${classMap.get(student.advancedClassId)}` : ''}</td>
                                            <td className="px-3 py-2"><button onClick={() => handleSelectIndividual(student)} className="bg-gray-700 text-white text-xs px-3 py-1 rounded hover:bg-gray-800">선택</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSearchModal;