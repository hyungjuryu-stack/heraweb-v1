
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Teacher, Student, Class } from '../types';
import TeacherModal from '../components/TeacherModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface TeachersPageProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
}

const Teachers: React.FC<TeachersPageProps> = ({ teachers, setTeachers, setStudents, setClasses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Teacher, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

  const roleNameMap: Record<Teacher['role'], string> = {
    admin: '관리자',
    operator: '운영자',
    teacher: '강사',
  };

  const sortedTeachers = useMemo(() => {
    let sortableItems = [...teachers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [teachers, sortConfig]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
        const numSelected = selectedIds.length;
        const numItems = sortedTeachers.length;
        headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
    }
  }, [selectedIds, sortedTeachers]);

  const requestSort = (key: keyof Teacher) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Teacher) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const handleAddNewTeacher = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };
  
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleSaveTeacher = (teacherData: Omit<Teacher, 'id'> & { id?: number }) => {
    if (teacherData.id) {
        setTeachers(prev => prev.map(t => t.id === teacherData.id ? { ...t, ...teacherData } as Teacher : t));
    } else {
        const newTeacher: Teacher = { ...teacherData, id: Date.now() };
        setTeachers(prev => [...prev, newTeacher]);
    }
    handleCloseModal();
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(sortedTeachers.map(t => t.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleSelectItem = (id: number) => {
      setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
  };

  const handleOpenDeleteConfirmModal = () => {
    if (selectedIds.length > 0) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    setTeachers(prev => prev.filter(t => !selectedIds.includes(t.id)));
    setClasses(prev => prev.map(c => selectedIds.includes(c.teacherId) ? { ...c, teacherId: 0 } : c));
    setStudents(prev => prev.map(s => selectedIds.includes(s.teacherId ?? -1) ? { ...s, teacherId: null } : s));
    setSelectedIds([]);
    setIsConfirmModalOpen(false);
  };

  const handleSelectAllClick = () => setSelectedIds(sortedTeachers.map(t => t.id));
  const handleDeselectAllClick = () => setSelectedIds([]);
  
  const headers: { key: keyof Teacher; label: string }[] = [
      { key: 'id', label: '강사 ID' },
      { key: 'name', label: '이름' },
      { key: 'position', label: '직위' },
      { key: 'role', label: '권한' },
      { key: 'phone', label: '연락처' },
      { key: 'email', label: '이메일' },
      { key: 'hireDate', label: '입사일' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">강사 관리</h1>
        <button onClick={handleAddNewTeacher} className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
          신규 강사 등록
        </button>
      </div>

       <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center min-h-[72px]">
          <span className="text-white font-medium">{selectedIds.length}명 선택됨</span>
          <div className="flex items-center gap-2">
              <button onClick={handleSelectAllClick} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors text-sm">전체 선택</button>
              <button onClick={handleDeselectAllClick} disabled={selectedIds.length === 0} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm">선택 취소</button>
              <button onClick={handleOpenDeleteConfirmModal} disabled={selectedIds.length === 0} className="bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed text-sm">선택 항목 삭제</button>
          </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input id="checkbox-all" type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                    <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                  </div>
                </th>
                {headers.map(({ key, label }) => (
                  <th key={String(key)} scope="col" onClick={() => requestSort(key)} className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none">
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
              {sortedTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                      <input id={`checkbox-${teacher.id}`} type="checkbox" checked={selectedIds.includes(teacher.id)} onChange={() => handleSelectItem(teacher.id)} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                      <label htmlFor={`checkbox-${teacher.id}`} className="sr-only">checkbox</label>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{roleNameMap[teacher.role]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.hireDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditTeacher(teacher)} className="text-yellow-400 hover:text-yellow-300">수정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <TeacherModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveTeacher} 
        teacher={selectedTeacher} 
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="강사 삭제 확인"
      >
        <p>정말로 다음 {selectedIds.length}명의 강사를 삭제하시겠습니까?</p>
        <ul className="list-disc list-inside mt-2 bg-gray-800/50 p-3 rounded-md max-h-40 overflow-y-auto">
            {teachers
                .filter(t => selectedIds.includes(t.id))
                .map(t => <li key={t.id}>{t.name}</li>)
            }
        </ul>
        <p className="mt-4 text-sm text-yellow-400/90">
            해당 강사가 배정된 반과 학생 정보에서 강사 배정이 해제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default Teachers;