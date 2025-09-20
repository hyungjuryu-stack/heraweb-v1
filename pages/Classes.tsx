import React, { useState, useMemo, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
import Card from '../components/ui/Card';
import type { Class } from '../types';
import ClassModal from '../components/ClassModal';

const Classes: React.FC = () => {
  const { classes, setClasses, teachers, students, setStudents } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
  
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

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
  }, [classes, sortConfig, teacherMap]);

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

  const handleSaveClass = (classData: Omit<Class, 'id' | 'studentIds'> & { id?: number }) => {
    if (classData.id) {
      setClasses(classes.map(c => c.id === classData.id ? { ...c, ...classData } : c));
    } else {
      const newClass: Class = {
        ...classData,
        id: Date.now(),
        studentIds: [],
      };
      setClasses([...classes, newClass]);
    }
    handleCloseModal();
  };

  const handleDeleteClass = (classId: number) => {
    if (window.confirm('정말로 이 반을 삭제하시겠습니까? 해당 반에 속한 학생들은 "미배정" 상태가 됩니다.')) {
        setStudents(prev => prev.map(s => 
            s.currentClassId === classId ? { ...s, currentClassId: null, teacherId: null } : s
        ));
        setClasses(prev => prev.filter(c => c.id !== classId));
    }
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
          setStudents(prev => prev.map(s =>
              selectedIds.includes(s.currentClassId ?? -1) ? { ...s, currentClassId: null, teacherId: null } : s
          ));
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
              {sortedClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="w-4 p-4">
                      <div className="flex items-center">
                          <input id={`checkbox-${classItem.id}`} type="checkbox"
                              checked={selectedIds.includes(classItem.id)}
                              onChange={() => handleSelectItem(classItem.id)}
                              className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                          <label htmlFor={`checkbox-${classItem.id}`} className="sr-only">checkbox</label>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{classItem.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacherMap.get(classItem.teacherId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{`${classItem.studentIds.length}명`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.schedule}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.room}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{classItem.capacity}명</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleEditClass(classItem)} className="text-yellow-400 hover:text-yellow-300">상세</button>
                      <button onClick={() => handleDeleteClass(classItem.id)} className="text-red-500 hover:text-red-400">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <ClassModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClass}
        classData={selectedClass}
        teachers={teachers}
      />
    </div>
  );
};

export default Classes;