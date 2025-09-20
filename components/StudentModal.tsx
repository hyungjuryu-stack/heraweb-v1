import React, { useState, useEffect, useMemo } from 'react';
import type { Student, Class, Teacher } from '../types';
import { StudentStatus } from '../types';
import Card from './ui/Card';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id' | 'avgScore' | 'attendanceRate' | 'homeworkRate'> & { id?: number }) => void;
  student: Student | null;
  allStudents: Student[];
  classes: Class[];
  teachers: Teacher[];
}

const gradeOptions = ['초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSave, student, allStudents, classes, teachers }) => {
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'avgScore' | 'attendanceRate' | 'homeworkRate'>>({
      attendanceId: '',
      name: '',
      gender: '남',
      school: '',
      grade: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      withdrawalDate: '',
      status: StudentStatus.ENROLLED,
      siblings: [],
      studentPhone: '',
      motherName: '',
      motherPhone: '',
      fatherName: '',
      fatherPhone: '',
      sendSmsToBoth: false,
      tuitionPayer: '모',
      regularClassId: null,
      advancedClassId: null,
      teacherId: null,
      diagnosticTestScore: null,
      diagnosticTestNotes: '',
  });
  const [idError, setIdError] = useState<string | null>(null);

  const regularClasses = useMemo(() => classes.filter(c => !c.name.startsWith('수')), [classes]);
  const advancedClasses = useMemo(() => classes.filter(c => c.name.startsWith('수')), [classes]);

  useEffect(() => {
    if (student) {
      setFormData({
        attendanceId: student.attendanceId,
        name: student.name,
        gender: student.gender,
        school: student.school,
        grade: student.grade,
        enrollmentDate: student.enrollmentDate,
        withdrawalDate: student.withdrawalDate || '',
        status: student.status,
        siblings: student.siblings,
        studentPhone: student.studentPhone,
        motherName: student.motherName,
        motherPhone: student.motherPhone,
        fatherName: student.fatherName || '',
        fatherPhone: student.fatherPhone || '',
        sendSmsToBoth: student.sendSmsToBoth,
        tuitionPayer: student.tuitionPayer,
        regularClassId: student.regularClassId,
        advancedClassId: student.advancedClassId,
        teacherId: student.teacherId,
        diagnosticTestScore: student.diagnosticTestScore ?? null,
        diagnosticTestNotes: student.diagnosticTestNotes || '',
      });
    } else {
       setFormData({
            attendanceId: '',
            name: '',
            gender: '남',
            school: '',
            grade: '',
            enrollmentDate: new Date().toISOString().split('T')[0],
            withdrawalDate: '',
            status: StudentStatus.ENROLLED,
            siblings: [],
            studentPhone: '',
            motherName: '',
            motherPhone: '',
            fatherName: '',
            fatherPhone: '',
            sendSmsToBoth: false,
            tuitionPayer: '모',
            regularClassId: null,
            advancedClassId: null,
            teacherId: null,
            diagnosticTestScore: null,
            diagnosticTestNotes: '',
        });
    }
    setIdError(null);
  }, [student, isOpen]);

  useEffect(() => {
    if (formData.regularClassId) {
        const selectedClass = classes.find(c => c.id === formData.regularClassId);
        if (selectedClass) {
            setFormData(prev => ({...prev, teacherId: selectedClass.teacherId}));
        }
    }
  }, [formData.regularClassId, classes]);
  
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value;
    
    if (!/^\d*$/.test(newId) || newId.length > 4) {
        return;
    }

    setFormData(prev => ({ ...prev, attendanceId: newId }));

    if (newId.length === 0 && formData.status === StudentStatus.WITHDRAWN) {
        setIdError(null);
        return;
    }

    if (newId.length !== 4) {
        setIdError('출결번호는 4자리 숫자여야 합니다.');
    } else {
        const isDuplicate = allStudents.some(s => s.attendanceId === newId && s.id !== student?.id);
        if (isDuplicate) {
            setIdError('이미 사용 중인 번호입니다.');
        } else {
            setIdError(null);
        }
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'regularClassId' || name === 'advancedClassId' || name === 'teacherId') {
        setFormData(prev => ({...prev, [name]: value ? parseInt(value, 10) : null}));
    } else if (name === 'diagnosticTestScore') {
        setFormData(prev => ({...prev, [name]: value === '' ? null : value}));
    }
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaveDisabled) return;
    onSave({ ...formData, id: student?.id });
  };

  if (!isOpen) return null;

  const isWithdrawn = formData.status === StudentStatus.WITHDRAWN;
  const isIdRequired = !isWithdrawn;
  const isSaveDisabled = (isIdRequired && (!!idError || formData.attendanceId.length !== 4)) || !formData.name;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <Card title={student ? '학생 정보 수정' : '신규 학생 등록'}>
          <form onSubmit={handleSubmit}>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="attendanceId" className="block text-sm font-medium text-gray-300 mb-1">출결번호</label>
                    <input 
                        type="text" 
                        name="attendanceId" 
                        id="attendanceId" 
                        value={formData.attendanceId} 
                        onChange={handleIdChange} 
                        required={isIdRequired}
                        disabled={isWithdrawn}
                        maxLength={4}
                        className={`w-full bg-gray-800 border rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823] ${idError && isIdRequired ? 'border-red-500' : 'border-gray-600'} disabled:bg-gray-700 disabled:cursor-not-allowed`} 
                    />
                    {isIdRequired && idError && <p className="mt-1 text-xs text-red-400">{idError}</p>}
                    {isIdRequired && !idError && formData.attendanceId.length === 4 && <p className="mt-1 text-xs text-green-400">사용 가능한 번호입니다.</p>}
                    {isWithdrawn && <p className="mt-1 text-xs text-gray-400">퇴원생은 출결번호가 없습니다.</p>}
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">이름</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-300 mb-1">학교</label>
                    <input type="text" name="school" id="school" value={formData.school} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-300 mb-1">학년</label>
                      <select name="grade" id="grade" value={formData.grade} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                        <option value="" disabled>학년 선택</option>
                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-300 mb-1">학생 연락처</label>
                    <input type="tel" name="studentPhone" id="studentPhone" value={formData.studentPhone} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">성별</label>
                    <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                      <option value="남">남</option>
                      <option value="여">여</option>
                    </select>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">상태</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                      {Object.values(StudentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-300 mb-1">등록일</label>
                    <input type="date" name="enrollmentDate" id="enrollmentDate" value={formData.enrollmentDate} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div>
                    <label htmlFor="withdrawalDate" className="block text-sm font-medium text-gray-300 mb-1">퇴원일</label>
                    <input type="date" name="withdrawalDate" id="withdrawalDate" value={formData.withdrawalDate} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div>
                    <label htmlFor="regularClassId" className="block text-sm font-medium text-gray-300 mb-1">정규수업반</label>
                    <select name="regularClassId" id="regularClassId" value={formData.regularClassId || ''} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                        <option value="">반 배정 없음</option>
                        {regularClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="advancedClassId" className="block text-sm font-medium text-gray-300 mb-1">현행심화반</label>
                    <select name="advancedClassId" id="advancedClassId" value={formData.advancedClassId || ''} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                        <option value="">반 배정 없음</option>
                        {advancedClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="teacherId" className="block text-sm font-medium text-gray-300 mb-1">담당 교사</label>
                    <select name="teacherId" id="teacherId" value={formData.teacherId || ''} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                        <option value="">담당 없음</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                
                {/* Column 3 */}
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/50 rounded-lg space-y-2">
                      <label className="block text-sm font-medium text-gray-300">학부모 (모)</label>
                      <input type="text" name="motherName" placeholder="이름" value={formData.motherName} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                      <input type="tel" name="motherPhone" placeholder="연락처" value={formData.motherPhone} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg space-y-2">
                      <label className="block text-sm font-medium text-gray-300">학부모 (부)</label>
                      <input type="text" name="fatherName" placeholder="이름" value={formData.fatherName} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                      <input type="tel" name="fatherPhone" placeholder="연락처" value={formData.fatherPhone} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center">
                      <input id="sendSmsToBoth" name="sendSmsToBoth" type="checkbox" checked={formData.sendSmsToBoth} onChange={handleChange} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-yellow-500 focus:ring-yellow-600" />
                      <label htmlFor="sendSmsToBoth" className="ml-2 block text-sm text-gray-300">문자 동시 발송</label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tuitionPayer" className="block text-sm font-medium text-gray-300 mb-1">수강료 청구 대상</label>
                    <select name="tuitionPayer" id="tuitionPayer" value={formData.tuitionPayer} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                      <option value="모">모</option>
                      <option value="부">부</option>
                    </select>
                  </div>
                   <div>
                    <label htmlFor="diagnosticTestScore" className="block text-sm font-medium text-gray-300 mb-1">진단테스트 성적</label>
                    <input 
                      type="text" 
                      name="diagnosticTestScore" 
                      id="diagnosticTestScore" 
                      value={formData.diagnosticTestScore ?? ''} 
                      onChange={handleChange} 
                      className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                      placeholder="예: 85 또는 17/20"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                  <label htmlFor="diagnosticTestNotes" className="block text-sm font-medium text-gray-300 mb-1">진단테스트 관련 내용 비고</label>
                  <textarea 
                    name="diagnosticTestNotes" 
                    id="diagnosticTestNotes" 
                    rows={3}
                    value={formData.diagnosticTestNotes} 
                    onChange={handleChange} 
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  ></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">
                취소
              </button>
              <button 
                type="submit" 
                disabled={isSaveDisabled}
                className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">
                저장
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentModal;