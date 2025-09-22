
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Class, Teacher, Student } from '../types';
import ClassModal from '../components/ClassModal';

interface ClassesPageProps {
  classes: Class[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  teachers: Teacher[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const Classes: React.FC<ClassesPageProps> = ({ classes, setClasses, teachers, students, setStudents }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(10);
  
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

  const sortedClasses = useMemo(() => {
    let sortableItems = [...classes];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key as keyof Class;
        let valA, valB;

        if (key === 'studentIds') {
            valA = a.studentIds.length;
            valB = b.studentIds.length;
        } else if (key === 'teacherId') {
            valA = teacherMap.get(a.teacherId) || '';
            valB = teacherMap.get(b.teacherId) || '';
        } else if (key === 'grade') {
            valA = a.grade.join(', ');
            valB = b.grade.join(', ');
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
  }, [classes, sortConfig, teacherMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const { currentTableData, totalPages } = useMemo(() => {
    const numItems = sortedClasses.length;
    if (itemsPerPage === 'ALL' || numItems === 0) {
        return { currentTableData: sortedClasses, totalPages: 1 };
    }
    
    const totalPagesCalc = Math.ceil(numItems / itemsPerPage);
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPagesCalc));

    const start = (validCurrentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    return { currentTableData: sortedClasses.slice(start, end), totalPages: totalPagesCalc };
  }, [sortedClasses, currentPage, itemsPerPage]);
  
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
        const numItems = sortedClasses.length;
        headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
    }
  }, [selectedIds, sortedClasses]);

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


  const handleAddNewClass = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleEditClass = (classData: Class) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleSaveClass = (classData: Omit<Class, 'id' | 'studentIds'> & { id?: number; studentSchedules?: Required<Class>['studentSchedules'] }) => {
    const { studentSchedules, ...restOfClassData } = classData;

    if (restOfClassData.id) {
        setClasses(classes.map(c => 
            c.id === restOfClassData.id 
                ? { ...c, ...restOfClassData, studentSchedules: studentSchedules || c.studentSchedules } 
                : c
        ));
    } else {
        const newClass: Class = {
            ...restOfClassData,
            id: Date.now(),
            studentIds: [],
            studentSchedules: studentSchedules || [],
        };
        setClasses([...classes, newClass]);
    }
    handleCloseModal();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(sortedClasses.map(c => c.id));
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
      if (window.confirm(`${selectedIds.length}개의 반을 정말로 삭제하시겠습니까? 해당 반에 속한 학생들은 "미배정" 상태가 됩니다.`)) {
          setStudents(prev => prev.map(s => {
              const isRegularClassDeleted = s.regularClassId && selectedIds.includes(s.regularClassId);
              const isAdvancedClassDeleted = s.advancedClassId && selectedIds.includes(s.advancedClassId);

              if (isRegularClassDeleted || isAdvancedClassDeleted) {
                  const updatedStudent = { ...s };
                  if (isRegularClassDeleted) {
                      updatedStudent.regularClassId = null;
                      updatedStudent.teacherId = null;
                  }
                  if (isAdvancedClassDeleted) {
                      updatedStudent.advancedClassId = null;
                  }
                  return updatedStudent;
              }
              return s;
          }));
          setClasses(prev => prev.filter(c => !selectedIds.includes(c.id)));
          setSelectedIds([]);
      }
  };

  const handleSelectAllClick = () => {
    setSelectedIds(sortedClasses.map(c => c.id));
  };

  const handleDeselectAllClick = () => {
    setSelectedIds([]);
  };
  
  const headers: { key: string; label: string }[] = [
      { key: 'name', label: '반 이름' },
      { key: 'teacherId', label: '담당 교사' },
      { key: 'grade', label: '대상 학년' },
      { key: 'studentIds', label: '학생 수' },
      { key: 'schedule', label: '수업 시간' },
      { key: 'room', label: '강의실' },
      { key: 'capacity', label: '정원' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">반/수업 관리</h1>
        <button 
            onClick={handleAddNewClass}
            className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
            신규 반 등록
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
              {currentTableData.map((classItem) => (
                <React.Fragment key={classItem.id}>
                  <tr 
                    className={`hover:bg-gray-800/40 transition-colors cursor-pointer ${expandedClassId === classItem.id ? 'bg-gray-800/60' : ''}`}
                    onClick={() => setExpandedClassId(prev => (prev === classItem.id ? null : classItem.id))}
                  >
                    <td className="w-4 p-4">
                        <div className="flex items-center">
                            <input id={`checkbox-${classItem.id}`} type="checkbox"
                                checked={selectedIds.includes(classItem.id)}
                                onChange={() => handleSelectItem(classItem.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                            <label htmlFor={`checkbox-${classItem.id}`} className="sr-only">checkbox</label>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{classItem.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacherMap.get(classItem.teacherId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.grade.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{`${classItem.studentIds.length}명`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.schedule}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.room}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.capacity}명</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClass(classItem); }} 
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          상세
                        </button>
                    </td>
                  </tr>
                  {expandedClassId === classItem.id && (
                     <tr className="bg-gray-800/20">
                      <td colSpan={headers.length + 2} className="p-0">
                        <div className="p-4 bg-gray-900/30">
                          <h4 className="text-md font-bold text-[#E5A823] mb-3">{classItem.name} 학생 명단</h4>
                          <p className="text-sm text-gray-300 mb-3"><span className="font-semibold">담당 강사:</span> {teacherMap.get(classItem.teacherId)}</p>
                          
                          {classItem.studentIds.length > 0 ? (
                            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {classItem.studentIds.map(studentId => {
                                const studentName = studentMap.get(studentId);
                                return studentName ? (
                                  <li key={studentId} className="bg-gray-700/50 p-2 rounded-md text-center text-sm text-gray-200 truncate">{studentName}</li>
                                ) : null;
                              })}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-center py-4">배정된 학생이 없습니다.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
                aria-label="페이지당 표시 개수"
            >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
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
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                aria-label="이전 페이지로 이동"
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
                aria-label="다음 페이지로 이동"
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
            총 {sortedClasses.length}개 중 {`페이지 ${totalPages > 0 ? currentPage : 0} / ${totalPages}`}
            </div>
        </div>
      </Card>
      <ClassModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClass}
        classData={selectedClass}
        teachers={teachers}
        students={students}
      />
    </div>
  );
};

export default Classes;
