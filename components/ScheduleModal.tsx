import React, { useState, useEffect } from 'react';
import type { AcademyEvent } from '../types';
import Card from './ui/Card';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<AcademyEvent, 'id' | 'relatedClassIds'> & { id?: number }) => void;
  event: AcademyEvent | null;
}

const eventTypes: AcademyEvent['type'][] = ['학사', '시험', '행사', '방학'];

const defaultFormData = {
    title: '',
    type: '학사' as AcademyEvent['type'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    notes: '',
};

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, event }) => {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (isOpen) {
        if (event) {
            setFormData({
                title: event.title,
                type: event.type,
                startDate: event.startDate,
                endDate: event.endDate,
                notes: event.notes,
            });
        } else {
            setFormData(defaultFormData);
        }
    }
  }, [isOpen, event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newFormData = { ...prev, [name]: value };
        // Ensure end date is not before start date
        if (name === 'startDate' && newFormData.endDate < newFormData.startDate) {
            newFormData.endDate = newFormData.startDate;
        }
        return newFormData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({ ...formData, id: event?.id });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card title={event ? '일정 수정' : '신규 일정 등록'}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">일정 제목</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">일정 유형</label>
                <select
                  name="type"
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                >
                  {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">시작일</label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">종료일</label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">비고</label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                ></textarea>
              </div>
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

export default ScheduleModal;
