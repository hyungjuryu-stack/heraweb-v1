import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import type { Tuition, Student, Class } from '../types';
import { StudentStatus } from '../types';

interface TuitionPageProps {
    tuitions: Tuition[];
    setTuitions: React.Dispatch<React.SetStateAction<Tuition[]>>;
    students: Student[];
    classes: Class[];
}

const TuitionPage: React.FC<TuitionPageProps> = ({ tuitions, setTuitions, students, classes }) => {
    const today = new Date(2025, 8, 1);
    const [selectedMonth, setSelectedMonth] = useState(today.toISOString().substring(0, 7));
    const [courseStartDate, setCourseStartDate] = useState('');
    const [courseEndDate, setCourseEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'studentName', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(10);
    const [monthlyData, setMonthlyData] = useState<Tuition[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [addStudentSearch, setAddStudentSearch] = useState('');


    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    
    useEffect(() => {
        const dataForMonth = tuitions.filter(t => t.month === selectedMonth);
        setMonthlyData(dataForMonth);

        setCurrentPage(1);
        setSelectedIds([]);

        const [year, monthNum] = selectedMonth.split('-').map(Number);
        const firstDay = new Date(year, monthNum - 1, 1);
        const lastDay = new Date(year, monthNum, 0);

        setCourseStartDate(firstDay.toISOString().split('T')[0]);
        setCourseEndDate(lastDay.toISOString().split('T')[0]);
    }, [selectedMonth, tuitions]);

    const handleGenerateTuition = () => {
        setIsLoading(true);

        const [year, monthNum] = selectedMonth.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];
        
        const prevMonthDate = new Date(year, monthNum - 2, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        const prevMonthTuitionsMap = new Map(tuitions.filter(t => t.month === prevMonthStr).map(t => [t.studentId, t]));

        const endOfMonth = new Date(endDate);
        endOfMonth.setHours(23, 59, 59, 999);
        const startOfMonth = new Date(startDate);

        const eligibleStudents = students.filter(s => {
            const enrollmentDate = new Date(s.enrollmentDate);
            const withdrawalDate = s.withdrawalDate ? new Date(s.withdrawalDate) : null;
            
            const enrolledInTime = enrollmentDate <= endOfMonth;
            const notWithdrawnBefore = !withdrawalDate || withdrawalDate >= startOfMonth;

            return s.status === StudentStatus.ENROLLED && enrolledInTime && notWithdrawnBefore;
        });

        const eligibleStudentIds = new Set(eligibleStudents.map(s => s.id));
        
        const MIDDLE_SCHOOL_FEE = 450000;
        const HIGH_SCHOOL_FEE = 550000;
        const BASE_SESSIONS = 8;
        const SIBLING_DISCOUNT_RATE = 0.1;
        
        const newTuitionData: Tuition[] = eligibleStudents.map(student => {
            const prevTuition = prevMonthTuitionsMap.get(student.id);

            // Check for enrolled siblings for discount
            const hasEnrolledSibling = student.siblings.some(siblingId => eligibleStudentIds.has(siblingId));
            const shouldApplyDiscount = hasEnrolledSibling && student.id > (student.siblings[0] || 0);
            const siblingDiscountRate = shouldApplyDiscount ? SIBLING_DISCOUNT_RATE : 0;
            
            if (prevTuition) {
                // FIX: Replaced spread syntax with Object.assign to resolve "Spread types may only be created from object types" error. The if-check ensures prevTuition is defined.
                const copiedData = Object.assign({}, prevTuition);

                copiedData.id = `${student.id}-${selectedMonth}`;
                copiedData.month = selectedMonth;
                copiedData.calculationPeriodStart = startDate;
                copiedData.calculationPeriodEnd = endDate;
                copiedData.paymentStatus = '미결제';
                copiedData.siblingDiscountRate = siblingDiscountRate;

                const subtotal = copiedData.perSessionFee * copiedData.scheduledSessions;
                copiedData.siblingDiscountAmount = Math.round(subtotal * copiedData.siblingDiscountRate);
                copiedData.finalFee = Math.round(subtotal - copiedData.siblingDiscountAmount - copiedData.otherDiscount);

                return copiedData;
            } else {
                const baseFee = student.grade.startsWith('고') ? HIGH_SCHOOL_FEE : MIDDLE_SCHOOL_FEE;
                const perSessionFee = baseFee / BASE_SESSIONS;
                const subtotal = baseFee;
                const siblingDiscountAmount = Math.round(subtotal * siblingDiscountRate);
                const finalFee = subtotal - siblingDiscountAmount;

                return {
                    id: `${student.id}-${selectedMonth}`,
                    studentId: student.id,
                    month: selectedMonth,
                    calculationPeriodStart: startDate,
                    calculationPeriodEnd: endDate,
                    baseFee,
                    baseSessions: BASE_SESSIONS,
                    perSessionFee: Math.round(perSessionFee),
                    scheduledSessions: BASE_SESSIONS,
                    siblingDiscountRate,
                    siblingDiscountAmount,
                    otherDiscount: 0,
                    finalFee: Math.round(finalFee),
                    paymentStatus: '미결제',
                    notes: '신규 산정',
                };
            }
        });

        setTuitions(prev => [
            ...prev.filter(t => t.month !== selectedMonth),
            ...newTuitionData
        ]);
        
        setTimeout(() => setIsLoading(false), 500);
    };

    const handleSaveChanges = () => {
        setTuitions(prev => [
            ...prev.filter(t => t.month !== selectedMonth),
            ...monthlyData
        ]);
        alert(`${selectedMonth} 수강료 내역이 저장되었습니다.`);
    };
    
    const escapeCsvField = (field: any): string => {
        const stringField = String(field ?? '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            const escapedField = stringField.replace(/"/g, '""');
            return `"${escapedField}"`;
        }
        return stringField;
    };
    
    const handleExportCSV = () => {
        if (!courseStartDate || !courseEndDate) {
            alert("수강 시작일과 종료일을 설정해주세요.");
            return;
        }

        const dataToExport = selectedIds.length > 0
            ? monthlyData.filter(t => selectedIds.includes(t.id))
            : monthlyData;

        if (dataToExport.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const headers = [
            '수취인(선택입력항목)', '전화번호(필수항목)', '청구금액(필수항목)',
            '청구사유(필수항목-100자 이내)', '안내메시지(선택입력항목-500자 이내)'
        ];
        
        const csvRows = dataToExport.map(tuition => {
            const student = studentMap.get(tuition.studentId);
            if (!student) return null;

            let parentPhone = student.motherPhone;
            if (student.tuitionPayer === '부' && student.fatherPhone) {
                parentPhone = student.fatherPhone;
            }
            
            if (!parentPhone || !parentPhone.trim()) {
                return null;
            }

            const [year, month] = selectedMonth.split('-');
            const reason = `${student.name}, ${student.grade} 수학, ${parseInt(month, 10)}월 수강료`;

            const sDate = new Date(courseStartDate + 'T00:00:00');
            const eDate = new Date(courseEndDate + 'T00:00:00');
            const periodStr = `${sDate.getMonth() + 1}/${sDate.getDate()}~${eDate.getMonth() + 1}/${eDate.getDate()}`;
            const siblingText = tuition.siblingDiscountAmount > 0 ? ' (형제할인 적용)' : '';

            const message = `${parseInt(month, 10)}월 수강료 안내\n` +
                            `기간: ${periodStr}\n` +
                            `횟수: ${tuition.scheduledSessions}회${siblingText}\n\n` +
                            `납부하실 금액은 ${tuition.finalFee.toLocaleString()}원 입니다.\n\n`+
                            `계좌번호\n` +
                            `아이엠뱅크(구대구은행) 010-5600-0916\n` +
                            `헤라매쓰수학학원 류시내\n` +
                            `* 입금시 학생 이름으로 부탁드립니다.\n` +
                            `* 현금영수증 발행 가능합니다.`;

            const rowData = [
                student.name,
                parentPhone.replace(/-/g, ''),
                tuition.finalFee,
                reason,
                message
            ];
            
            return rowData.map((field, index) => {
                if (index === 1) { // Phone number column
                    return `="${String(field)}"`;
                }
                return escapeCsvField(field);
            }).join(',');
            
        }).filter((row): row is string => row !== null);

        if (csvRows.length === 0) {
            alert("연락처가 등록된 학생이 없어 다운로드할 데이터가 없습니다.");
            return;
        }

        const csvContent = [headers.map(escapeCsvField).join(','), ...csvRows].join('\n');
        
        const filename = selectedIds.length > 0
          ? `결제선생_수강료청구(선택)_${selectedMonth}.csv`
          : `결제선생_수강료청구_${selectedMonth}.csv`;

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleFieldChange = (tuitionId: string, field: keyof Tuition, value: string) => {
        setMonthlyData(prevData =>
            prevData.map(t => {
                if (t.id === tuitionId) {
                    const updatedTuition = { ...t };
                    const numericValue = parseInt(value, 10) || 0;
                    const floatValue = parseFloat(value) || 0;

                    switch (field) {
                        case 'baseFee':
                            updatedTuition.baseFee = numericValue;
                            break;
                        case 'scheduledSessions':
                            updatedTuition.scheduledSessions = numericValue;
                            break;
                        case 'otherDiscount':
                            updatedTuition.otherDiscount = numericValue;
                            break;
                        case 'baseSessions':
                            updatedTuition.baseSessions = numericValue;
                            break;
                        case 'siblingDiscountRate':
                            updatedTuition.siblingDiscountRate = floatValue / 100;
                            break;
                    }

                    updatedTuition.perSessionFee = updatedTuition.baseSessions > 0 ? Math.round(updatedTuition.baseFee / updatedTuition.baseSessions) : 0;
                    const subtotal = updatedTuition.perSessionFee * updatedTuition.scheduledSessions;
                    updatedTuition.siblingDiscountAmount = Math.round(subtotal * updatedTuition.siblingDiscountRate);
                    updatedTuition.finalFee = Math.round(subtotal - updatedTuition.siblingDiscountAmount - updatedTuition.otherDiscount);
                    return updatedTuition;
                }
                return t;
            })
        );
    };

    const handlePaymentStatusChange = (tuitionId: string, newStatus: Tuition['paymentStatus']) => {
        setMonthlyData(prev => prev.map(t => t.id === tuitionId ? {...t, paymentStatus: newStatus} : t));
    }
    
    const addableStudents = useMemo(() => {
        if (!addStudentSearch) return [];
        const existingStudentIds = new Set(monthlyData.map(t => t.studentId));
        const periodEndDate = new Date(courseEndDate + 'T23:59:59');

        return students.filter(s =>
            s.status === StudentStatus.ENROLLED &&
            !existingStudentIds.has(s.id) &&
            new Date(s.enrollmentDate) <= periodEndDate &&
            s.name.toLowerCase().includes(addStudentSearch.toLowerCase())
        );
    }, [addStudentSearch, students, monthlyData, courseEndDate]);

    const handleAddStudent = (student: Student) => {
        const MIDDLE_SCHOOL_FEE = 450000;
        const HIGH_SCHOOL_FEE = 550000;
        const BASE_SESSIONS = 8;
        
        const baseFee = student.grade.startsWith('고') ? HIGH_SCHOOL_FEE : MIDDLE_SCHOOL_FEE;
        const perSessionFee = baseFee / BASE_SESSIONS;

        const newTuition: Tuition = {
            id: `${student.id}-${selectedMonth}`,
            studentId: student.id,
            month: selectedMonth,
            calculationPeriodStart: courseStartDate,
            calculationPeriodEnd: courseEndDate,
            baseFee,
            baseSessions: BASE_SESSIONS,
            perSessionFee: Math.round(perSessionFee),
            scheduledSessions: BASE_SESSIONS,
            siblingDiscountRate: 0,
            siblingDiscountAmount: 0,
            otherDiscount: 0,
            finalFee: Math.round(baseFee),
            paymentStatus: '미결제',
            notes: '추가 등록',
        };
        
        setMonthlyData(prev => [...prev, newTuition]);
        setAddStudentSearch('');
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        if (!window.confirm(`${selectedIds.length}개의 수강료 내역을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        const idsToDelete = new Set(selectedIds);
        setTuitions(prev => prev.filter(t => !idsToDelete.has(t.id)));
        setSelectedIds([]);
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.checked = false;
            headerCheckboxRef.current.indeterminate = false;
        }
        setCurrentPage(1);
    };

    const enrichedData = useMemo(() => monthlyData.map(t => ({
        ...t,
        studentName: studentMap.get(t.studentId)?.name || '',
        studentGrade: studentMap.get(t.studentId)?.grade || '',
    })), [monthlyData, studentMap]);

    const sortedData = useMemo(() => {
        if (sortConfig !== null) {
            return [...enrichedData].sort((a, b) => {
                const valA = a[sortConfig.key as keyof typeof a];
                const valB = b[sortConfig.key as keyof typeof b];
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return enrichedData;
    }, [enrichedData, sortConfig]);
    
    const { currentTableData, totalPages } = useMemo(() => {
        if (itemsPerPage === 'ALL' || sortedData.length === 0) {
            return { currentTableData: sortedData, totalPages: 1 };
        }
        const totalPagesCalc = Math.ceil(sortedData.length / itemsPerPage);
        const validCurrentPage = Math.max(1, Math.min(currentPage, totalPagesCalc));
        const start = (validCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return {
            currentTableData: sortedData.slice(start, end),
            totalPages: totalPagesCalc
        };
    }, [sortedData, currentPage, itemsPerPage]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const allOnPageSelected = currentTableData.length > 0 && currentTableData.every(t => selectedIds.includes(t.id));
            const someOnPageSelected = currentTableData.some(t => selectedIds.includes(t.id));

            headerCheckboxRef.current.checked = allOnPageSelected;
            headerCheckboxRef.current.indeterminate = !allOnPageSelected && someOnPageSelected;
        }
    }, [selectedIds, currentTableData]);
    
    const paginationNumbers = useMemo(() => {
        if (totalPages <= 1) return [];
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            let startPage: number, endPage: number;
            if (currentPage <= 3) {
                startPage = 1; endPage = maxVisiblePages;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1; endPage = totalPages;
            } else {
                startPage = currentPage - 2; endPage = currentPage + 2;
            }
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        }
        return pageNumbers;
    }, [totalPages, currentPage]);

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
        const pageIds = currentTableData.map(t => t.id);
        if (e.target.checked) {
            setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
        } else {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        }
    };

    const handleSelectItem = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const headers = [
        { key: 'studentName', label: '학생' },
        { key: 'studentGrade', label: '학년' },
        { key: 'baseFee', label: '기본 수강료' },
        { key: 'perSessionFee', label: '1회 금액' },
        { key: 'baseSessions', label: '기준 횟수' },
        { key: 'scheduledSessions', label: '예정 횟수' },
        { key: 'siblingDiscountRate', label: '형제할인(%)' },
        { key: 'otherDiscount', label: '기타할인(금액)' },
        { key: 'finalFee', label: '최종 청구액' },
        { key: 'paymentStatus', label: '결제상태' },
    ];
    
    const inputStyle = "bg-transparent w-full text-right p-1 rounded-md hover:bg-gray-700/50 focus:bg-gray-700/80 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-colors";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">수강료 관리</h1>
                <div className="flex items-center gap-4">
                    <label htmlFor="month-select" className="text-white font-medium">산정월:</label>
                    <input type="month" id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"/>
                </div>
            </div>

            <Card>
                {monthlyData.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-4">{selectedMonth} 수강료 내역이 없습니다.</p>
                        <button onClick={handleGenerateTuition} disabled={isLoading} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">
                            {isLoading ? '생성 중...' : '수강료 내역 생성'}
                        </button>
                    </div>
                ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-2 bg-gray-800/50 rounded-lg gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                           <span className="text-white font-medium">{selectedIds.length}명 선택됨</span>
                           <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
                                <label htmlFor="course-start-date" className="text-sm text-gray-300">수강 기간:</label>
                                <input type="date" id="course-start-date" value={courseStartDate} onChange={e => setCourseStartDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm"/>
                                <span className="text-gray-400">~</span>
                                <input type="date" id="course-end-date" value={courseEndDate} onChange={e => setCourseEndDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white text-sm"/>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                             <button onClick={handleSaveChanges} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors flex-1 md:flex-initial">
                                변경사항 저장
                            </button>
                            <button onClick={handleExportCSV} className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors flex-1 md:flex-initial">
                                {selectedIds.length > 0 ? `${selectedIds.length}명 다운로드` : '전체 다운로드'}
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedIds.length === 0}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed flex-1 md:flex-initial"
                            >
                                선택 삭제
                            </button>
                        </div>
                    </div>

                     <div className="mb-4 p-2 bg-gray-800/50 rounded-lg">
                        <div className="relative">
                             <input 
                                type="text"
                                placeholder="추가할 학생 이름 검색..."
                                value={addStudentSearch}
                                onChange={e => setAddStudentSearch(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            {addableStudents.length > 0 && (
                                <ul className="absolute z-10 w-full bg-gray-900 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto">
                                    {addableStudents.map(student => (
                                        <li 
                                            key={student.id} 
                                            onClick={() => handleAddStudent(student)}
                                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
                                        >
                                            {student.name} ({student.grade})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

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
                                    {headers.map(({key, label}) => (<th key={key} scope="col" onClick={() => requestSort(key)} className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none">{label}<span className="ml-1">{getSortIndicator(key)}</span></th>))}
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-gray-700/50">
                            {currentTableData.map((tuition) => (
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
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-white">{tuition.studentName}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300">{tuition.studentGrade}</td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-300">
                                        <input type="number" step="10000" value={tuition.baseFee} onChange={e => handleFieldChange(tuition.id, 'baseFee', e.target.value)} className={inputStyle} />
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-300 text-right">{tuition.perSessionFee.toLocaleString()}원</td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-300">
                                        <input type="number" value={tuition.baseSessions} onChange={e => handleFieldChange(tuition.id, 'baseSessions', e.target.value)} className={`${inputStyle} text-center`} />
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-300">
                                        <input type="number" value={tuition.scheduledSessions} onChange={e => handleFieldChange(tuition.id, 'scheduledSessions', e.target.value)} className={`${inputStyle} text-center`} />
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-300">
                                        <div className="flex items-center justify-end">
                                            <input type="number" value={Math.round(tuition.siblingDiscountRate * 100)} onChange={e => handleFieldChange(tuition.id, 'siblingDiscountRate', e.target.value)} className={`${inputStyle} w-16`} />
                                            <span>%</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-300">
                                        <input type="number" step="1000" value={tuition.otherDiscount} onChange={e => handleFieldChange(tuition.id, 'otherDiscount', e.target.value)} className={inputStyle} />
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-white font-semibold text-right">{tuition.finalFee.toLocaleString()}원</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm">
                                        <select value={tuition.paymentStatus} onChange={(e) => handlePaymentStatusChange(tuition.id, e.target.value as Tuition['paymentStatus'])} className="bg-transparent border-0 focus:ring-0 w-full hover:bg-gray-700/50 rounded-md">
                                            <option value="미결제" className="bg-gray-800">미결제</option>
                                            <option value="결제완료" className="bg-gray-800">결제완료</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm">
                            <label htmlFor="itemsPerPageSelect" className="text-gray-400">페이지당 표시 개수:</label>
                            <select id="itemsPerPageSelect" value={itemsPerPage} onChange={e => setItemsPerPage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))} className="bg-gray-700 border border-gray-600 rounded-md py-1 pl-2 pr-8 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                                {[10, 20, 30, 50, 'ALL'].map(val => <option key={val} value={val}>{val === 'ALL' ? '전체' : val}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                            {paginationNumbers.map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page ? 'bg-[#E5A823] text-gray-900' : 'bg-gray-700 text-white'}`}>{page}</button>)}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                        </div>

                        <div className="text-sm text-gray-400 w-40 text-right">
                            총 {sortedData.length}건 중 {`페이지 ${totalPages > 0 ? currentPage : 0} / ${totalPages}`}
                        </div>
                    </div>
                </>
                )}
            </Card>
        </div>
    );
};

export default TuitionPage;