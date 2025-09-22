import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Student, Class, Teacher, LessonRecord, MonthlyReport, Tuition, Counseling } from '../types';
import { StudentStatus } from '../types';
import StudentModal from '../components/StudentModal';
import StudentDetailView from '../components/StudentDetailView';

const StudentStatusBadge: React.FC<{ status: Student['status'] }> = ({ status }) => {
    const colorMap = {
        '재원': 'bg-green-500/20 text-green-300 border border-green-500/30',
        '상담': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        '대기': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        '퇴원': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
}

interface StudentsPageProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: Class[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  teachers: Teacher[];
  setLessonRecords: React.Dispatch<React.SetStateAction<LessonRecord[]>>;
  setMonthlyReports: React.Dispatch<React.SetStateAction<MonthlyReport[]>>;
  setTuitions: React.Dispatch<React.SetStateAction<Tuition[]>>;
  setCounselings: React.Dispatch<React.SetStateAction<Counseling[]>>;
  monthlyReports: MonthlyReport[];
  tuitions: Tuition[];
  counselings: Counseling[];
}

const Students: React.FC<StudentsPageProps> = ({
  students, setStudents,
  classes, setClasses,
  teachers,
  setLessonRecords,
  setMonthlyReports,
  setTuitions,
  setCounselings,
  monthlyReports,
  tuitions,
  counselings
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState(new Set<number>());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(10);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
  const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);

  const filteredAndSortedStudents = useMemo(() => {
    let filteredStudents = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      filteredStudents.sort((a, b) => {
        if (sortConfig.key === 'regularClassId') {
            const classA = a.regularClassId ? classMap.get(a.regularClassId) || '' : '';
            const classB = b.regularClassId ? classMap.get(b.regularClassId) || '' : '';
            if (classA < classB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (classA > classB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        const valA = a[sortConfig.key as keyof Student];
        const valB = b[sortConfig.key as keyof Student];
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredStudents;
  }, [students, sortConfig, searchTerm, classMap]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const { currentTableData, totalPages } = useMemo(() => {
      const numItems = filteredAndSortedStudents.length;
      if (itemsPerPage === 'ALL' || numItems === 0) {
          return { currentTableData: filteredAndSortedStudents, totalPages: 1 };
      }
      
      const totalPagesCalc = Math.ceil(numItems / itemsPerPage);
      const validCurrentPage = Math.max(1, Math.min(currentPage, totalPagesCalc));

      const start = (validCurrentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      
      return { currentTableData: filteredAndSortedStudents.slice(start, end), totalPages: totalPagesCalc };
  }, [filteredAndSortedStudents, currentPage, itemsPerPage]);
  
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
        const numSelected = selectedIds.size;
        const numItems = filteredAndSortedStudents.length;
        headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
    }
  }, [selectedIds, filteredAndSortedStudents]);


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

  const handleAddNewStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'avgScore' | 'attendanceRate' | 'homeworkRate'> & { id?: number }) => {
    let updatedStudent: Student;
    const originalStudent = students.find(s => s.id === studentData.id);

    if (studentData.id && originalStudent) {
        updatedStudent = { ...originalStudent, ...studentData };
        if (updatedStudent.status === StudentStatus.WITHDRAWN && originalStudent.status !== StudentStatus.WITHDRAWN) {
            updatedStudent.attendanceId = '';
        }
        setStudents(students.map(s => s.id === studentData.id ? updatedStudent : s));
        if (viewingStudent?.id === updatedStudent.id) {
          setViewingStudent(updatedStudent);
        }
    } else {
        updatedStudent = {
            ...studentData,
            id: Date.now(),
            avgScore: 0,
            attendanceRate: 100,
            homeworkRate: 100,
        };
        setStudents([...students, updatedStudent]);
    }

    const originalRegularClassId = originalStudent ? originalStudent.regularClassId : null;
    const newRegularClassId = updatedStudent.regularClassId;
    const originalAdvancedClassId = originalStudent ? originalStudent.advancedClassId : null;
    const newAdvancedClassId = updatedStudent.advancedClassId;

    if (originalRegularClassId !== newRegularClassId || originalAdvancedClassId !== newAdvancedClassId) {
        const updatedClasses = classes.map(c => {
            let studentIds = c.studentIds;

            // Remove from old regular class if changed
            if (c.id === originalRegularClassId && originalRegularClassId !== newRegularClassId) {
                studentIds = studentIds.filter(id => id !== updatedStudent.id);
            }
            // Remove from old advanced class if changed
            if (c.id === originalAdvancedClassId && originalAdvancedClassId !== newAdvancedClassId) {
                studentIds = studentIds.filter(id => id !== updatedStudent.id);
            }
            
            // Add to new regular class if changed
            if (c.id === newRegularClassId && originalRegularClassId !== newRegularClassId) {
                if (!studentIds.includes(updatedStudent.id)) {
                    studentIds = [...studentIds, updatedStudent.id];
                }
            }
            // Add to new advanced class if changed
            if (c.id === newAdvancedClassId && originalAdvancedClassId !== newAdvancedClassId) {
                 if (!studentIds.includes(updatedStudent.id)) {
                    studentIds = [...studentIds, updatedStudent.id];
                }
            }

            return { ...c, studentIds };
        });
        setClasses(updatedClasses);
    }

    handleCloseModal();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(new Set(filteredAndSortedStudents.map(s => s.id)));
      } else {
          setSelectedIds(new Set());
      }
  };

  const handleSelectItem = (id: number) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
      });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0 || !window.confirm(`${selectedIds.size}명의 학생을 정말로 삭제하시겠습니까? 학생과 관련된 모든 기록이 영구적으로 삭제됩니다.`)) {
        return;
    }

    const idsToDelete = selectedIds;

    if (viewingStudent && idsToDelete.has(viewingStudent.id)) {
        setViewingStudent(null);
    }

    setStudents(prev => prev.filter(s => !idsToDelete.has(s.id)));
    setClasses(prev => prev.map(c => ({
        ...c,
        studentIds: c.studentIds.filter(id => !idsToDelete.has(id))
    })));
    setLessonRecords(prev => prev.filter(r => !idsToDelete.has(r.studentId)));
    setMonthlyReports(prev => prev.filter(r => !idsToDelete.has(r.studentId)));
    setTuitions(prev => prev.filter(t => !idsToDelete.has(t.studentId)));
    setCounselings(prev => prev.filter(c => !idsToDelete.has(c.studentId)));
    
    setSelectedIds(new Set());
    setCurrentPage(1);
  };

  const handleSelectAllClick = () => {
    setSelectedIds(new Set(filteredAndSortedStudents.map(s => s.id)));
  };

  const handleDeselectAllClick = () => {
    setSelectedIds(new Set());
  };

  const headers: { key: string; label: string }[] = [
      { key: 'attendanceId', label: '출결번호' },
      { key: 'name', label: '이름' },
      { key: 'status', label: '상태' },
      { key: 'school', label: '학교' },
      { key: 'grade', label: '학년' },
      { key: 'regularClassId', label: '배정 반' },
      { key: 'teacherId', label: '담당 교사' },
      { key: 'enrollmentDate', label: '등록일' },
      { key: 'avgScore', label: '평균 점수' },
      { key: 'attendanceRate', label: '출석률' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">학생 관리</h1>
        <button 
            onClick={handleAddNewStudent}
            className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
            신규 학생 등록
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center min-h-[72px]">
          <div className="flex items-center gap-4">
              <span className="text-white font-medium">{selectedIds.size}명 선택됨</span>
              <div className="relative">
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
          </div>
          <div className="flex items-center gap-2">
              <button 
                  onClick={handleSelectAllClick}
                  className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors text-sm">
                  전체 선택
              </button>
              <button 
                  onClick={handleDeselectAllClick}
                  disabled={selectedIds.size === 0}
                  className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm">
                  선택 취소
              </button>
              <button 
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed text-sm">
                  선택 항목 삭제
              </button>
          </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
            {viewingStudent ? (
                <StudentDetailView
                  student={viewingStudent}
                  allStudents={students}
                  onClose={() => setViewingStudent(null)}
                  onEdit={handleEditStudent}
                  monthlyReports={monthlyReports}
                  tuitions={tuitions}
                  counselings={counselings}
                  teacherMap={teacherMap}
                />
            ) : (
                <Card className="flex items-center justify-center h-24">
                    <p className="text-gray-500">학생 목록에서 학생을 선택하여 상세 정보를 확인하세요.</p>
                </Card>
            )}
        </div>
        <div className="flex-1">
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
                    {currentTableData.map((student) => (
                        <tr 
                          key={student.id} 
                          onClick={() => setViewingStudent(student)}
                          className={`transition-colors cursor-pointer ${viewingStudent?.id === student.id ? 'bg-gray-800' : 'hover:bg-gray-800/40'}`}
                        >
                        <td className="w-4 p-4">
                            <div className="flex items-center">
                                <input id={`checkbox-${student.id}`} type="checkbox"
                                    checked={selectedIds.has(student.id)}
                                    onChange={() => handleSelectItem(student.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                                <label htmlFor={`checkbox-${student.id}`} className="sr-only">checkbox</label>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.attendanceId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <StudentStatusBadge status={student.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.school}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {(() => {
                                const regular = student.regularClassId ? classMap.get(student.regularClassId) : null;
                                const advanced = student.advancedClassId ? classMap.get(student.advancedClassId) : null;
                                if (regular && advanced) return `${regular} (${advanced})`;
                                return regular || advanced || '미배정';
                            })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.teacherId ? teacherMap.get(student.teacherId) : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.enrollmentDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.avgScore}점</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.attendanceRate}%</td>
                        </tr>
                    ))}
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
                      disabled={currentPage === 1}
                      className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                      aria-label="첫 페이지로 이동"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 5))}
                      disabled={currentPage === 1}
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
                    총 {filteredAndSortedStudents.length}명 중 {`페이지 ${totalPages > 0 ? currentPage : 0} / ${totalPages}`}
                  </div>
                </div>
            </Card>
        </div>
      </div>
       <StudentModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
        student={selectedStudent}
        allStudents={students}
        classes={classes}
        teachers={teachers}
      />
    </div>
  );
};

export default Students;