import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Student, Class, Teacher, LessonRecord, MonthlyReport, Tuition, Counseling } from '../types';
import { StudentStatus } from '../types';
import StudentModal from '../components/StudentModal';

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
}

const Students: React.FC<StudentsPageProps> = ({
  students, setStudents,
  classes, setClasses,
  teachers,
  setLessonRecords,
  setMonthlyReports,
  setTuitions,
  setCounselings
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Student, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
  const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);

  const sortedStudents = useMemo(() => {
    let sortableItems = [...students];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
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
  }, [students, sortConfig]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
        const numSelected = selectedIds.length;
        const numItems = sortedStudents.length;
        headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
    }
  }, [selectedIds, sortedStudents]);


  const requestSort = (key: keyof Student) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Student) => {
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
        // 학생 상태가 '퇴원'으로 변경되면 출결번호를 삭제
        if (updatedStudent.status === StudentStatus.WITHDRAWN && originalStudent.status !== StudentStatus.WITHDRAWN) {
            updatedStudent.attendanceId = '';
        }
        setStudents(students.map(s => s.id === studentData.id ? updatedStudent : s));
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

    const originalClassId = originalStudent ? originalStudent.currentClassId : null;
    const newClassId = updatedStudent.currentClassId;

    if (originalClassId !== newClassId) {
        const updatedClasses = classes.map(c => {
            if (c.id === originalClassId) {
                return { ...c, studentIds: c.studentIds.filter(id => id !== updatedStudent.id) };
            }
            if (c.id === newClassId) {
                return { ...c, studentIds: [...c.studentIds, updatedStudent.id] };
            }
            return c;
        });
        setClasses(updatedClasses);
    }

    handleCloseModal();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(sortedStudents.map(s => s.id));
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
    if (window.confirm(`${selectedIds.length}명의 학생을 정말로 삭제하시겠습니까? 학생과 관련된 모든 기록이 영구적으로 삭제됩니다.`)) {
        setStudents(prev => prev.filter(s => !selectedIds.includes(s.id)));
        setClasses(prev => prev.map(c => ({
            ...c,
            studentIds: c.studentIds.filter(id => !selectedIds.includes(id))
        })));
        setLessonRecords(prev => prev.filter(r => !selectedIds.includes(r.studentId)));
        setMonthlyReports(prev => prev.filter(r => !selectedIds.includes(r.studentId)));
        setTuitions(prev => prev.filter(t => !selectedIds.includes(t.studentId)));
        setCounselings(prev => prev.filter(c => !selectedIds.includes(c.studentId)));
        setSelectedIds([]);
    }
  };

  const handleSelectAllClick = () => {
    setSelectedIds(sortedStudents.map(s => s.id));
  };

  const handleDeselectAllClick = () => {
    setSelectedIds([]);
  };

  const headers: { key: keyof Student; label: string }[] = [
      { key: 'attendanceId', label: '출결번호' },
      { key: 'name', label: '이름' },
      { key: 'status', label: '상태' },
      { key: 'school', label: '학교' },
      { key: 'grade', label: '학년' },
      { key: 'currentClassId', label: '현재 반' },
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
          <span className="text-white font-medium">{selectedIds.length}명 선택됨</span>
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
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="w-4 p-4">
                      <div className="flex items-center">
                          <input id={`checkbox-${student.id}`} type="checkbox"
                              checked={selectedIds.includes(student.id)}
                              onChange={() => handleSelectItem(student.id)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.currentClassId ? classMap.get(student.currentClassId) : '미배정'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.teacherId ? teacherMap.get(student.teacherId) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.enrollmentDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.avgScore}점</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{student.attendanceRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditStudent(student)} className="text-yellow-400 hover:text-yellow-300">상세</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
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