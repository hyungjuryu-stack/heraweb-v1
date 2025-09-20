import React, { useState, useEffect } from 'react';
import type { Teacher, Position } from '../types';
import Card from './ui/Card';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Omit<Teacher, 'id'> & { id?: number }) => void;
  teacher: Teacher | null;
}

const defaultFormData: Omit<Teacher, 'id'> = {
    name: '',
    position: '강사',
    role: 'teacher',
    hireDate: new Date().toISOString().split('T')[0],
    resignationDate: '',
    phone: '',
    email: ''
};

const positionOptions: Position[] = ['원장', '강사', '직원'];

const TeacherModal: React.FC<TeacherModalProps> = ({ isOpen, onClose, onSave, teacher }) => {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (isOpen) {
        if (teacher) {
            setFormData({
                name: teacher.name,
                position: teacher.position,
                // 'operator' role is shown as 'admin' in the dropdown and will be saved as 'admin'.
                role: teacher.role === 'operator' ? 'admin' : teacher.role,
                hireDate: teacher.hireDate,
                resignationDate: teacher.resignationDate || '',
                phone: teacher.phone,
                email: teacher.email,
            });
        } else {
            setFormData(defaultFormData);
        }
    }
  }, [isOpen, teacher]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave({ ...formData, id: teacher?.id });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <Card title={teacher ? '강사 정보 수정' : '신규 강사 등록'}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">이름</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  autoFocus
                />
              </div>
               <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-1">직위</label>
                <select
                  name="position"
                  id="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                >
                  {positionOptions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">권한</label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                >
                  <option value="admin">관리자 권한</option>
                  <option value="teacher">강사 권한</option>
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">연락처</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">이메일</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                />
              </div>
               <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-300 mb-1">입사일</label>
                <input
                  type="date"
                  name="hireDate"
                  id="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                />
              </div>
              <div>
                <label htmlFor="resignationDate" className="block text-sm font-medium text-gray-300 mb-1">퇴사일</label>
                <input
                  type="date"
                  name="resignationDate"
                  id="resignationDate"
                  value={formData.resignationDate}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">
                취소
              </button>
              <button type="submit" className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold">
                저장
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TeacherModal;