
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { LessonRecord, HomeworkGrade } from '../types';

type DailyRecordData = Omit<LessonRecord, 'id' | 'date' | 'studentId'>;

const homeworkGrades: HomeworkGrade[] = ['A', 'B', 'C', 'D', 'F'];

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DailyRecordData) => void;
  recordData: DailyRecordData | null;
  studentName: string;
  date: string;
  targetElement: HTMLElement | null;
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen, onClose, onSave, recordData, studentName, date, targetElement
}) => {
  const [formData, setFormData] = useState<DailyRecordData>({
    attendance: '출석',
    testScore1: null,
    testScore2: null,
    testScore3: null,
    homework: 'A',
    attitude: '보통',
    notes: '',
    requested_test: '',
    main_textbook: '',
    supplementary_textbook: '',
    reinforcement_textbook: '',
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });


  useEffect(() => {
    if (recordData) {
      setFormData(recordData);
    }
  }, [recordData]);
  
  useLayoutEffect(() => {
    if (targetElement && popoverRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = targetRect.bottom + 8;
        let left = targetRect.left;

        // Adjust if it goes off-screen vertically
        if (top + popoverRect.height > viewportHeight - 16) {
            top = targetRect.top - popoverRect.height - 8;
        }
        
        // Adjust if it goes off-screen horizontally
        if (left + popoverRect.width > viewportWidth - 16) {
            left = viewportWidth - popoverRect.width - 16;
        }

        if (left < 16) {
            left = 16;
        }

        if (top < 16) {
            top = 16;
        }
        
        setPosition({ top, left });
    }
  }, [targetElement, isOpen]);

  const handleChange = (field: keyof DailyRecordData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    onSave(formData);
  };

  if (!isOpen) return null;
  
  const commonInputClass = "w-full bg-gray-800 border-gray-600 rounded-md p-2 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500";
  const commonSelectClass = `${commonInputClass} appearance-none`;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="attendance-modal-title">
      <div
        ref={popoverRef}
        style={position}
        className="absolute bg-[#1A3A32] border border-gray-700/50 rounded-xl shadow-lg w-full max-w-sm" 
        onClick={e => e.stopPropagation()}
      >
        <div className="border-b border-gray-700/50 px-6 py-4">
          <h3 id="attendance-modal-title" className="text-lg font-bold text-[#E5A823]">{studentName} - {date}</h3>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="attendance-status" className="block text-xs font-medium text-gray-300 mb-1">출결</label>
              <select id="attendance-status" value={formData.attendance} onChange={e => handleChange('attendance', e.target.value)} className={commonSelectClass}>
                  <option value="출석">출석</option>
                  <option value="지각">지각</option>
                  <option value="결석">결석</option>
              </select>
            </div>
            <div>
              <label htmlFor="attitude" className="block text-xs font-medium text-gray-300 mb-1">태도</label>
              <select id="attitude" value={formData.attitude} onChange={e => handleChange('attitude', e.target.value)} className={commonSelectClass}>
                  <option>매우 좋음</option>
                  <option>보통</option>
                  <option>안좋음</option>
              </select>
            </div>
            <div>
              <label htmlFor="homework" className="block text-xs font-medium text-gray-300 mb-1">과제</label>
              <select id="homework" value={formData.homework} onChange={e => handleChange('homework', e.target.value as HomeworkGrade)} className={commonSelectClass}>
                  {homeworkGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">테스트 점수</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="점수1" value={formData.testScore1 ?? ''} onChange={e => handleChange('testScore1', e.target.value === '' ? null : e.target.value)} className={commonInputClass} />
              <input type="text" placeholder="점수2" value={formData.testScore2 ?? ''} onChange={e => handleChange('testScore2', e.target.value === '' ? null : e.target.value)} className={commonInputClass} />
              <input type="text" placeholder="점수3" value={formData.testScore3 ?? ''} onChange={e => handleChange('testScore3', e.target.value === '' ? null : e.target.value)} className={commonInputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="main_textbook" className="block text-sm font-medium text-gray-300 mb-1">본교재</label>
            <input id="main_textbook" type="text" value={formData.main_textbook} onChange={e => handleChange('main_textbook', e.target.value)} className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="supplementary_textbook" className="block text-sm font-medium text-gray-300 mb-1">부교재</label>
            <input id="supplementary_textbook" type="text" value={formData.supplementary_textbook} onChange={e => handleChange('supplementary_textbook', e.target.value)} className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="reinforcement_textbook" className="block text-sm font-medium text-gray-300 mb-1">보강교재</label>
            <input id="reinforcement_textbook" type="text" value={formData.reinforcement_textbook} onChange={e => handleChange('reinforcement_textbook', e.target.value)} className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="requested_test" className="block text-sm font-medium text-gray-300 mb-1">준비요청</label>
            <input id="requested_test" type="text" value={formData.requested_test} onChange={e => handleChange('requested_test', e.target.value)} className={commonInputClass} />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">비고</label>
            <textarea id="notes" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} className={commonInputClass} />
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end space-x-4 border-t border-gray-700/50">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
          <button type="button" onClick={handleSave} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold">저장</button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailModal;