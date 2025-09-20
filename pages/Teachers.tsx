import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Teacher, Student, Class } from '../types';
import TeacherModal from '../components/TeacherModal';

interface TeachersPageProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
}

const Teachers: React.FC<TeachersPageProps> = ({ teachers, setTeachers, setStudents, setClasses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Teacher, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

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

  const handleSaveTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher = { ...teacherData, id: Date.now() };
    setTeachers(prev => [...prev, newTeacher]);
    setIsModalOpen(false);
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

  const handleDeleteSelected = () => {
    if (window.confirm(`${selectedIds.length}명의 강사를 정말로 삭제하시겠습니까? 해당 강사가 배정된 반과 학생 정보에서 강사 배정이 해제됩니다.`)) {
      setTeachers(prev => prev.filter(t => !selectedIds.includes(t.id)));
      setClasses(prev => prev.map(c => selectedIds.includes(c.teacherId) ? { ...c, teacherId: 0 } : c));
      setStudents(prev => prev.map(s => selectedIds.includes(s.teacherId ?? -1) ? { ...s, teacherId: null } : s));
      setSelectedIds([]);
    }
  };

  const handleSelectAllClick = () => setSelectedIds(sortedTeachers.map(t => t.id));
  const handleDeselectAllClick = () => setSelectedIds([]);
  
  const headers: { key: keyof Teacher; label: string }[] = [
      { key: 'id', label: '강사 ID' },
      { key: 'name', label: '이름' },
      { key: 'phone', label: '연락처' },
      { key: 'email', label: '이메일' },
      { key: 'hireDate', label: '입사일' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">강사 관리</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
          신규 강사 등록
        </button>
      </div>

       <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center min-h-[72px]">
          <span className="text-white font-medium">{selectedIds.length}명 선택됨</span>
          <div className="flex items-center gap-2">
              <button onClick={handleSelectAllClick} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors text-sm">전체 선택</button>
              <button onClick={handleDeselectAllClick} disabled={selectedIds.length === 0} className="bg-gray-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-sm">선택 취소</button>
              <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed text-sm">선택 항목 삭제</button>
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
                  <th key={key} scope="col" onClick={() => requestSort(key)} className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                    {label}
                    <span className="ml-1">{getSortIndicator(key)}</span>
                  </th>
                ))}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacher.hireDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <TeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTeacher} />
    </div>
  );
};

export default Teachers;