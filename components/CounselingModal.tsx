import React, { useState, useEffect } from 'react';
import type { Counseling, Student, Teacher } from '../types';
import Card from './ui/Card';

interface CounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (counseling: Omit<Counseling, 'id'> & { id?: number }) => void;
  counseling: Counseling | null;
  students: Student[];
  teachers: Teacher[];
  counselings: Counseling[];
}

const counselingTypes = ['정기상담', '학습상담', '진로상담', '내신대비', '신규상담', '기타'];

const defaultFormData: Omit<Counseling, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    studentId: 0,
    parentName: '',
    teacherId: 0,
    content: '',
    followUp: '',
    type: counselingTypes[0],
};

const CounselingModal: React.FC<CounselingModalProps> = ({ isOpen, onClose, onSave, counseling, students, teachers, counselings }) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);
  const [counselingHistory, setCounselingHistory] = useState<Counseling[]>([]);

  useEffect(() => {
    if (isOpen) {
        if (counseling) {
            const counselType = counseling.type || counselingTypes[0];
            const isStandardType = counselingTypes.includes(counselType);
            setFormData({
                date: counseling.date,
                studentId: counseling.studentId,
                parentName: counseling.parentName,
                teacherId: counseling.teacherId,
                content: counseling.content,
                followUp: counseling.followUp,
                type: counselType,
            });
            setIsCustomType(!isStandardType);
        } else {
            setFormData(defaultFormData);
            setIsCustomType(false);
        }
        setStudentSearchTerm('');
        setCounselingHistory([]);
    }
  }, [isOpen, counseling]);


  useEffect(() => {
    if (formData.studentId) {
        const selectedStudent = students.find(s => s.id === formData.studentId);
        if (selectedStudent) {
            setFormData(prev => ({
                ...prev,
                parentName: selectedStudent.motherName,
                teacherId: selectedStudent.teacherId || 0,
            }));
            const history = counselings
              .filter(c => c.studentId === formData.studentId)
              .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setCounselingHistory(history);
        }
    } else {
      setCounselingHistory([]);
    }
  }, [formData.studentId, students, counselings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['studentId', 'teacherId'].includes(name);

    if (isNumericField) {
        setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '기타') {
        setIsCustomType(true);
        setFormData(prev => ({ ...prev, type: '' })); 
    } else {
        setIsCustomType(false);
        setFormData(prev => ({ ...prev, type: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // HTML5 `required` attribute is now correctly configured on all necessary fields,
    // so this handler will only be called when the form is valid.
    onSave({ ...formData, id: counseling?.id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card title={counseling ? '상담 기록 수정' : '신규 상담 등록'}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentSearch" className="block text-sm font-medium text-gray-300 mb-1">학생 검색</label>
                  <input
                    type="text"
                    id="studentSearch"
                    placeholder="학생 이름으로 검색..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  />
                </div>
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-300 mb-1">학생</label>
                  <select
                    name="studentId"
                    id="studentId"
                    value={formData.studentId || ''}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  >
                    <option value="" disabled>학생을 선택하세요</option>
                    {students
                      .filter(s => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="counselingType" className="block text-sm font-medium text-gray-300 mb-1">상담 유형</label>
                    <select
                        id="counselingType"
                        value={isCustomType ? '기타' : formData.type}
                        onChange={handleTypeChange}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                    >
                        {counselingTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                {isCustomType && (
                    <div>
                        <label htmlFor="customCounselingType" className="block text-sm font-medium text-gray-300 mb-1">상담 유형 (직접 입력)</label>
                        <input
                            type="text"
                            id="customCounselingType"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            placeholder="상담 유형 입력"
                            required
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                        />
                    </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">상담일</label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  />
                </div>
                 <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-300 mb-1">학부모</label>
                    <input
                      type="text"
                      name="parentName"
                      id="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                    />
                  </div>
              </div>
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-300 mb-1">담당 교사</label>
                 <select
                    name="teacherId"
                    id="teacherId"
                    value={formData.teacherId || ''}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  >
                    <option value="" disabled>교사 선택</option>
                    {teachers.filter(t => t.position !== '직원').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">상담 내용</label>
                <textarea
                  name="content"
                  id="content"
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                ></textarea>
              </div>
              <div>
                <label htmlFor="followUp" className="block text-sm font-medium text-gray-300 mb-1">후속 조치</label>
                <textarea
                  name="followUp"
                  id="followUp"
                  rows={3}
                  value={formData.followUp}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                ></textarea>
              </div>

              {counselingHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <h4 className="text-md font-semibold text-gray-200 mb-3">
                    {students.find(s => s.id === formData.studentId)?.name} 학생 상담 이력 ({counselingHistory.length}건)
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {counselingHistory.map(hist => (
                      <div key={hist.id} className="bg-gray-800/50 p-3 rounded-md text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <span className="font-bold text-gray-300">{hist.date}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-300">{hist.type}</span>
                          </div>
                          <span className="text-xs text-gray-400">{teachers.find(t => t.id === hist.teacherId)?.name}</span>
                        </div>
                        <p className="text-gray-400 leading-snug">{hist.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
              <button type="submit" className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold">저장</button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CounselingModal;