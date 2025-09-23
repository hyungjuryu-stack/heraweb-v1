
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import type { LessonRecord, Student, Class, Teacher, HomeworkGrade } from '../types';
import { KakaoTalkIcon } from '../components/Icons';

const AttendanceBadge: React.FC<{ status: LessonRecord['attendance'] }> = ({ status }) => {
    const colorMap = {
        '출석': 'bg-green-500/20 text-green-300',
        '지각': 'bg-yellow-500/20 text-yellow-300',
        '결석': 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
}

const NotificationPreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record: LessonRecord | null;
  student: Student | null;
  className: string | null;
}> = ({ isOpen, onClose, onConfirm, record, student, className }) => {
    if (!isOpen || !record || !student) return null;

    const poorGrades: HomeworkGrade[] = ['C', 'D', 'F'];
    const details: string[] = [];

    if (record.attendance !== '출석') {
        details.push(record.attendance);
    }
    // Fix: Replaced .includes() with explicit checks to avoid a potential type inference issue.
    if (record.attitude === 'C' || record.attitude === 'D' || record.attitude === 'F') {
        details.push(`수업태도 미흡(${record.attitude})`);
    }
    if (record.homework === 'C' || record.homework === 'D' || record.homework === 'F') {
        details.push(`과제 미흡(${record.homework})`);
    }
    const scores = [record.testScore1, record.testScore2, record.testScore3].filter(Boolean);
    if (scores.length > 0) {
        if (details.length === 0 && record.attendance === '출석') {
            details.push(record.attendance);
        }
        details.push(`테스트: ${scores.join(', ')}`);
    }

    const message = details.length > 0 ? details.join(', ') : '특이사항 없음.';
    const date = new Date(record.date);
    const canBeNotified = student && (student.motherPhone || (student.sendSmsToBoth && student.fatherPhone));

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="bg-[#1A3A32] border border-gray-700/50 rounded-xl shadow-lg">
                    <div className="border-b border-gray-700/50 px-6 py-4">
                        <h3 className="text-lg font-bold text-[#E5A823]">알림톡 재발송 확인</h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                            <div className="bg-[#FEE500] p-4 rounded-lg text-black">
                                <div className="flex items-start mb-3">
                                    <KakaoTalkIcon className="w-8 h-8 mr-2 flex-shrink-0" />
                                    <h4 className="font-bold text-sm leading-tight">
                                        [헤라매쓰] {className || '수업'} {date.getUTCMonth() + 1}월 {date.getUTCDate()}일 알림
                                    </h4>
                                </div>
                                <div className="bg-white p-3 rounded space-y-1 text-sm">
                                    <p>- {student.name}: {message}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                * 위 내용은 학부모님께 카카오톡 알림톡으로 재발송됩니다.
                            </p>
                            {!canBeNotified && (
                                <p className="text-xs text-red-400 mt-2 text-center font-semibold">
                                    * 학부모 연락처가 등록되지 않아 발송이 불가능합니다.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end space-x-4 border-t border-gray-700/50">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600">취소</button>
                        <button type="button" onClick={onConfirm} disabled={!canBeNotified} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 text-gray-900 font-bold disabled:bg-gray-600 disabled:cursor-not-allowed">재발송</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface LessonRecordsPageProps {
    lessonRecords: LessonRecord[];
    setLessonRecords: React.Dispatch<React.SetStateAction<LessonRecord[]>>;
    students: Student[];
    classes: Class[];
    teachers: Teacher[];
}

const LessonRecords: React.FC<LessonRecordsPageProps> = ({ lessonRecords, setLessonRecords, students, classes, teachers }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [sendingStatus, setSendingStatus] = useState<Record<number, 'sending' | 'sent'>>({});
    const [previewRecord, setPreviewRecord] = useState<LessonRecord | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(10);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
    const studentObjMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
    
    const filteredAndSortedRecords = useMemo(() => {
        let filteredItems = lessonRecords.filter(record => {
            const studentMatch = selectedStudentId ? record.studentId === selectedStudentId : true;
            const recordDate = record.date;
            const startDateMatch = startDate ? recordDate >= startDate : true;
            const endDateMatch = endDate ? recordDate <= endDate : true;
            return studentMatch && startDateMatch && endDateMatch;
        });
        
        if (sortConfig !== null) {
            filteredItems.sort((a, b) => {
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
        return filteredItems;
    }, [lessonRecords, sortConfig, studentMap, selectedStudentId, startDate, endDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStudentId, startDate, endDate, itemsPerPage]);

    const { currentTableData, totalPages } = useMemo(() => {
        const numItems = filteredAndSortedRecords.length;
        if (itemsPerPage === 'ALL' || numItems === 0) {
            return { currentTableData: filteredAndSortedRecords, totalPages: 1 };
        }
        
        const totalPagesCalc = Math.ceil(numItems / itemsPerPage);
        const validCurrentPage = Math.max(1, Math.min(currentPage, totalPagesCalc));

        const start = (validCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        
        return { currentTableData: filteredAndSortedRecords.slice(start, end), totalPages: totalPagesCalc };
    }, [filteredAndSortedRecords, currentPage, itemsPerPage]);
  
    const paginationNumbers = useMemo(() => {
        if (totalPages <= 1) {
            return [];
        }
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage: number;
            let endPage: number;

            if (currentPage <= 3) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }
        return pageNumbers;
    }, [totalPages, currentPage]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedIds.length;
            const numItems = filteredAndSortedRecords.length;
            headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
        }
    }, [selectedIds, filteredAndSortedRecords]);

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
            setSelectedIds(filteredAndSortedRecords.map(r => r.id));
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
        setSelectedIds(filteredAndSortedRecords.map(r => r.id));
    };

    const handleDeselectAllClick = () => {
        setSelectedIds([]);
    };
    
    const poorHomeworkGrades: HomeworkGrade[] = ['C', 'D', 'F'];
    const shouldNotify = (record: LessonRecord): boolean => {
      if (!record) return false;
      const scores = [record.testScore1, record.testScore2, record.testScore3].filter(Boolean);
      return record.attendance !== '출석' ||
             poorHomeworkGrades.includes(record.attitude) ||
             poorHomeworkGrades.includes(record.homework) ||
             poorHomeworkGrades.includes(record.selfDirectedLearning) ||
             scores.length > 0;
    };
    
    const handleResendClick = (record: LessonRecord) => {
        setPreviewRecord(record);
    };

    const handleConfirmResend = () => {
        if (!previewRecord) return;
    
        const recordId = previewRecord.id;
        setPreviewRecord(null); // Close modal immediately
    
        setSendingStatus(prev => ({ ...prev, [recordId]: 'sending' }));
        
        // Simulate API call, always succeeds
        setTimeout(() => {
            setSendingStatus(prev => ({ ...prev, [recordId]: 'sent' }));
    
            // After showing 'sent' for 2 seconds, reset the button so it can be clicked again.
            setTimeout(() => {
                setSendingStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[recordId];
                    return newStatus;
                });
            }, 2000);
        }, 1000); 
    };

    const headers: { key: string; label: string }[] = [
        { key: 'date', label: '날짜' },
        { key: 'studentId', label: '학생' },
        { key: 'attendance', label: '출결' },
        { key: 'attitude', label: '태도' },
        { key: 'homework', label: '과제' },
        { key: 'selfDirectedLearning', label: '자기주도' },
        { key: 'testScore1', label: '테스트(1/2/3)' },
        { key: 'main_textbook', label: '본교재' },
        { key: 'supplementary_textbook', label: '부교재' },
        { key: 'reinforcement_textbook', label: '보강교재' },
        { key: 'requested_test', label: '준비요청' },
        { key: 'notes', label: '비고' },
        { key: 'notification', label: '알림톡' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">수업 기록</h1>
                <p className="text-gray-400">모든 학생의 수업 기록을 조회하고 알림톡을 재발송할 수 있습니다.</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : '')}
                        className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-8 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                        aria-label="학생 선택"
                    >
                        <option value="">전체 학생</option>
                        {students.sort((a,b) => a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                    </select>
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
                    <span className="text-white font-medium text-sm mr-2">{`${selectedIds.length} / ${filteredAndSortedRecords.length}개 선택됨`}</span>
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
                    </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-700/50">
                    {currentTableData.map((record) => {
                        const isNotifiable = shouldNotify(record);
                        const status = sendingStatus[record.id];

                        return (
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.attitude}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.homework}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.selfDirectedLearning}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[10rem]" title={[record.testScore1, record.testScore2, record.testScore3].filter(Boolean).join(' / ')}>
                                {[record.testScore1, record.testScore2, record.testScore3].filter(Boolean).join(' / ') || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[10rem]" title={record.main_textbook}>{record.main_textbook || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[10rem]" title={record.supplementary_textbook}>{record.supplementary_textbook || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[10rem]" title={record.reinforcement_textbook}>{record.reinforcement_textbook || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[10rem]" title={record.requested_test}>{record.requested_test || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[10rem]" title={record.notes}>{record.notes || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                {isNotifiable ? (
                                    status === 'sent' ? (
                                        <span className="text-green-400 font-semibold">재발송 완료</span>
                                    ) : status === 'sending' ? (
                                        <div className="flex justify-center items-center text-gray-400">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            전송 중...
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleResendClick(record)} 
                                            className="text-yellow-400 hover:text-yellow-300 font-semibold"
                                        >
                                            재발송
                                        </button>
                                    )
                                ) : (
                                    '-'
                                )}
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>
                 <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="itemsPerPageSelect" className="text-gray-400">페이지당 표시 인원:</label>
                    <select
                      id="itemsPerPageSelect"
                      value={itemsPerPage}
                      onChange={e => setItemsPerPage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                      className="bg-gray-700 border border-gray-600 rounded-md py-1 pl-2 pr-8 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                      aria-label="페이지당 표시 인원"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="ALL">All</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1 || totalPages === 0}
                      className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                      aria-label="첫 페이지로 이동"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 5))}
                      disabled={currentPage === 1 || totalPages === 0}
                      className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                      aria-label="5 페이지 이전으로 이동"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {paginationNumbers.map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors w-9 ${
                          currentPage === pageNumber
                            ? 'bg-[#E5A823] text-gray-900'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                        aria-current={currentPage === pageNumber ? 'page' : undefined}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 5))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                      aria-label="5 페이지 다음으로 이동"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                      aria-label="마지막 페이지로 이동"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-sm text-gray-400 w-40 text-right">
                    총 {filteredAndSortedRecords.length}개 중 {`페이지 ${totalPages > 0 ? currentPage : 0} / ${totalPages}`}
                  </div>
                </div>
            </Card>

            <NotificationPreviewModal
                isOpen={!!previewRecord}
                onClose={() => setPreviewRecord(null)}
                onConfirm={handleConfirmResend}
                record={previewRecord}
                student={previewRecord ? studentObjMap.get(previewRecord.studentId) || null : null}
                className={previewRecord ? (classMap.get(studentObjMap.get(previewRecord.studentId)?.regularClassId || -1) || '수업') : null}
            />
        </div>
    );
};

export default LessonRecords;
