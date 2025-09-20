import React, { useState, useEffect } from 'react';
import type { Class, Teacher } from '../types';
import Card from './ui/Card';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<Class, 'id' | 'studentIds'> & { id?: number }) => void;
  classData: Class | null;
  teachers: Teacher[];
}

const defaultClassData = {
  name: '',
  teacherId: 0,
  grade: '',
  schedule: '',
  room: '',
  capacity: 10,
};

const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, classData, teachers }) => {
  const [formData, setFormData] = useState<Omit<Class, 'id'|'studentIds'>>(defaultClassData);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        teacherId: classData.teacherId,
        grade: classData.grade,
        schedule: classData.schedule,
        room: classData.room,
        capacity: classData.capacity,
      });
      // Parse schedule string to populate time and days
      const scheduleParts = classData.schedule.split(' ');
      if (scheduleParts.length === 2) {
          const days = scheduleParts[0].split('/');
          const times = scheduleParts[1].split('-');
          setSelectedDays(days);
          if (times.length === 2) {
              setStartTime(times[0]);
              setEndTime(times[1]);
          }
      } else {
        setSelectedDays([]);
        setStartTime('16:00');
        setEndTime('18:00');
      }
    } else {
      setFormData({...defaultClassData, teacherId: teachers[0]?.id || 0});
      setSelectedDays([]);
      setStartTime('16:00');
      setEndTime('18:00');
    }
  }, [classData, isOpen, teachers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['teacherId', 'capacity'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumericField ? parseInt(value, 10) : value }));
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduleString = selectedDays.length > 0
        ? `${selectedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)).join('/')} ${startTime}-${endTime}`
        : '';
    onSave({ ...formData, schedule: scheduleString, id: classData?.id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <Card title={classData ? '반 정보 수정' : '신규 반 등록'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">반 이름</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
              </div>
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-300 mb-1">대상 학년</label>
                <input type="text" name="grade" id="grade" value={formData.grade} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
              </div>
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-300 mb-1">담당 교사</label>
                <select name="teacherId" id="teacherId" value={formData.teacherId} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                    <option value="" disabled>선생님 선택</option>
                    {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                </select>
              </div>
               <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-300 mb-1">최대 정원</label>
                <input type="number" name="capacity" id="capacity" value={formData.capacity} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
              </div>
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-300 mb-1">강의실</label>
                <input type="text" name="room" id="room" value={formData.room} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">수업 요일</label>
                <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                        <button
                            type="button"
                            key={day}
                            onClick={() => handleDayToggle(day)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                selectedDays.includes(day)
                                ? 'bg-[#E5A823] text-gray-900'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
              </div>
               <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">시작 시간</label>
                    <input type="time" name="startTime" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">종료 시간</label>
                    <input type="time" name="endTime" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
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

export default ClassModal;