import React, { useState, useEffect, useMemo } from 'react';
import type { Class, Teacher, Student } from '../types';
import Card from './ui/Card';
import { SettingsIcon } from './Icons';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<Class, 'id' | 'studentIds'> & { id?: number; studentSchedules?: Required<Class>['studentSchedules'] }) => void;
  classData: Class | null;
  teachers: Teacher[];
  students: Student[];
}

const defaultClassData = {
  name: '',
  teacherId: 0,
  grade: [],
  schedule: '',
  room: '1호실',
  capacity: 6,
};

const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
const gradeOptions = ['초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];
const roomOptions = ['1호실', '2호실', '3호실', '4호실', '5호실'];

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, classData, teachers, students }) => {
  const [formData, setFormData] = useState<Omit<Class, 'id'|'studentIds'>>(defaultClassData);
  
  // --- Schedule State ---
  type ScheduleType = 'periods' | 'weekday_weekend' | 'flexible' | 'custom';
  const [scheduleType, setScheduleType] = useState<ScheduleType>('custom');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // For 'periods' type
  const [showPeriodSettings, setShowPeriodSettings] = useState(false);
  const [periodTimes, setPeriodTimes] = useState({
    1: { start: '14:30', end: '16:30' },
    2: { start: '16:40', end: '18:40' },
    3: { start: '19:30', end: '21:30' },
  });
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(1);

  // For 'weekday_weekend' and 'custom' types
  const [customTime, setCustomTime] = useState({ start: '16:00', end: '18:00' });
  const [weekdayTime, setWeekdayTime] = useState({ start: '19:00', end: '22:00' });
  const [weekendTime, setWeekendTime] = useState({ start: '13:00', end: '16:00' });

  // For 'flexible' type
  const [flexibleTime, setFlexibleTime] = useState({ start: '13:30', end: '18:30' });
  const [studentSchedules, setStudentSchedules] = useState<Required<Class>['studentSchedules']>([]);

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
  
  const assignableTeachers = useMemo(() => {
    return teachers.filter(t => t.position === '원장' || t.position === '강사');
  }, [teachers]);

  // Determine schedule type based on selected days and grades
  useEffect(() => {
    const isMonThu = selectedDays.length === 2 && selectedDays.includes('월') && selectedDays.includes('목');
    const isTueFri = selectedDays.length === 2 && selectedDays.includes('화') && selectedDays.includes('금');
    const isMiddleSchool = formData.grade.some(g => g.startsWith('중')) && !formData.grade.some(g => g.startsWith('고'));
    
    const isWeekendIncluded = selectedDays.some(d => ['토', '일'].includes(d));
    const isWeekdayIncluded = selectedDays.some(d => !['토', '일'].includes(d));
    const isHighSchool = formData.grade.some(g => g.startsWith('고'));

    const isWednesdayClinic = selectedDays.length === 1 && selectedDays[0] === '수';

    if ((isMonThu || isTueFri) && isMiddleSchool) {
        setScheduleType('periods');
    } else if (isHighSchool && isWeekendIncluded && isWeekdayIncluded) {
        setScheduleType('weekday_weekend');
    } else if (isWednesdayClinic) {
        setScheduleType('flexible');
    } else {
        setScheduleType('custom');
    }
  }, [selectedDays, formData.grade]);

  // Initialize state when modal opens or classData changes
  useEffect(() => {
    if (isOpen) {
      if (classData) {
        setFormData({
          name: classData.name,
          teacherId: classData.teacherId,
          grade: classData.grade,
          schedule: classData.schedule,
          room: classData.room,
          capacity: classData.capacity,
        });
        
        const scheduleParts = classData.schedule.split(', ');
        const firstPart = scheduleParts[0];
        const [daysStr, timeStr] = firstPart.split(' ');
        
        setSelectedDays(daysStr ? daysStr.split('/') : []);

        // Time parsing logic
        if (timeStr && timeStr.includes('-')) {
          const [start, end] = timeStr.split('-');
          // FIX: Explicitly type the destructured arguments from Object.entries to resolve `t.start` and `t.end` being of type `unknown`.
          const periodMatch = Object.entries(periodTimes).find(([p, t]: [string, { start: string; end: string }]) => t.start === start && t.end === end);
          if (periodMatch) {
            setSelectedPeriod(parseInt(periodMatch[0]));
          } else {
            setSelectedPeriod(null);
            setCustomTime({start, end});
          }
          
          if (scheduleParts.length > 1) { // Weekday/Weekend
            const secondPart = scheduleParts[1];
            const [weekendDaysStr, weekendTimeStr] = secondPart.split(' ');
            if (weekendTimeStr) {
                const [weekendStart, weekendEnd] = weekendTimeStr.split('-');
                setWeekdayTime({start, end});
                setWeekendTime({start: weekendStart, end: weekendEnd});
            }
          }
        }
        
        setStudentSchedules(classData.studentSchedules || []);

      } else {
        // Reset for new class
        setFormData({...defaultClassData, teacherId: assignableTeachers[0]?.id || 0});
        setSelectedDays([]);
        setSelectedPeriod(1);
        setCustomTime({ start: '16:00', end: '18:00' });
        setStudentSchedules([]);
      }
    }
  }, [classData, isOpen, assignableTeachers, periodTimes]);

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
  
  const handleGradeToggle = (grade: string) => {
    setFormData(prev => {
        const newGrades = prev.grade.includes(grade)
            ? prev.grade.filter(g => g !== grade)
            : [...prev.grade, grade];
        return { ...prev, grade: newGrades.sort() };
    });
  };

  const handleStudentScheduleChange = (studentId: number, field: 'startTime' | 'endTime', value: string) => {
    setStudentSchedules(prev => {
        const existing = prev.find(s => s.studentId === studentId);
        if (existing) {
            return prev.map(s => s.studentId === studentId ? { ...s, [field]: value } : s);
        } else {
            return [...prev, { studentId, startTime: '13:30', endTime: '15:30', [field]: value }];
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let scheduleString = '';
    const sortedDays = selectedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));

    switch (scheduleType) {
        case 'periods':
            if (selectedPeriod && periodTimes[selectedPeriod as keyof typeof periodTimes]) {
                const time = periodTimes[selectedPeriod as keyof typeof periodTimes];
                scheduleString = `${sortedDays.join('/')} ${time.start}-${time.end}`;
            }
            break;
        case 'weekday_weekend':
            const weekdays = sortedDays.filter(d => !['토', '일'].includes(d)).join('/');
            const weekends = sortedDays.filter(d => ['토', '일'].includes(d)).join('/');
            scheduleString = `${weekdays} ${weekdayTime.start}-${weekdayTime.end}, ${weekends} ${weekendTime.start}-${weekendTime.end}`;
            break;
        case 'flexible':
            scheduleString = `${sortedDays.join('/')} ${flexibleTime.start}-${flexibleTime.end} (자율)`;
            break;
        case 'custom':
            scheduleString = `${sortedDays.join('/')} ${customTime.start}-${customTime.end}`;
            break;
    }

    onSave({ ...formData, schedule: scheduleString, id: classData?.id, studentSchedules });
  };
  
  const renderScheduleControls = () => {
    switch(scheduleType) {
        case 'periods':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-300">수업 교시</label>
                      <button type="button" onClick={() => setShowPeriodSettings(!showPeriodSettings)} className="flex items-center text-xs text-yellow-400 hover:text-yellow-300">
                          <SettingsIcon className="w-4 h-4 mr-1" /> 교시 시간 설정
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3].map(p => (
                            <button
                                type="button"
                                key={p}
                                onClick={() => setSelectedPeriod(p)}
                                className={`flex-1 px-3 py-2 text-sm text-center font-medium rounded-md transition-colors ${
                                    selectedPeriod === p
                                    ? 'bg-[#E5A823] text-gray-900'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                }`}
                            >
                                <p>{p}교시</p>
                                <p className="text-xs">{periodTimes[p as keyof typeof periodTimes].start} - {periodTimes[p as keyof typeof periodTimes].end}</p>
                            </button>
                        ))}
                    </div>
                    {showPeriodSettings && (
                        <div className="p-3 bg-gray-900/50 rounded-lg space-y-2">
                           {[1, 2, 3].map(p => (
                               <div key={p} className="grid grid-cols-3 items-center gap-2">
                                   <label className="text-sm text-gray-300">{p}교시</label>
                                   <input type="time" value={periodTimes[p as keyof typeof periodTimes].start} onChange={e => setPeriodTimes(prev => ({...prev, [p]: {...prev[p as keyof typeof periodTimes], start: e.target.value}}))} className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-sm" />
                                   <input type="time" value={periodTimes[p as keyof typeof periodTimes].end} onChange={e => setPeriodTimes(prev => ({...prev, [p]: {...prev[p as keyof typeof periodTimes], end: e.target.value}}))} className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-sm" />
                               </div>
                           ))}
                        </div>
                    )}
                </div>
            );
        case 'weekday_weekend':
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="weekdayStartTime" className="block text-sm font-medium text-gray-300 mb-1">평일 시작</label>
                          <input type="time" name="weekdayStartTime" id="weekdayStartTime" value={weekdayTime.start} onChange={e => setWeekdayTime(p => ({...p, start: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                        </div>
                        <div>
                          <label htmlFor="weekdayEndTime" className="block text-sm font-medium text-gray-300 mb-1">평일 종료</label>
                          <input type="time" name="weekdayEndTime" id="weekdayEndTime" value={weekdayTime.end} onChange={e => setWeekdayTime(p => ({...p, end: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="weekendTime" className="block text-sm font-medium text-gray-300 mb-1">주말 시작</label>
                          <input type="time" name="weekendTime" id="weekendTime" value={weekendTime.start} onChange={e => setWeekendTime(p => ({...p, start: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                        </div>
                        <div>
                          <label htmlFor="weekendEndTime" className="block text-sm font-medium text-gray-300 mb-1">주말 종료</label>
                          <input type="time" name="weekendEndTime" id="weekendEndTime" value={weekendTime.end} onChange={e => setWeekendTime(p => ({...p, end: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                        </div>
                    </div>
                </div>
            );
        case 'flexible':
            return (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">자율반 운영 시간</label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="flexibleStartTime" className="block text-xs font-medium text-gray-400 mb-1">시작 시간</label>
                        <input type="time" name="flexibleStartTime" id="flexibleStartTime" value={flexibleTime.start} onChange={e => setFlexibleTime(p => ({...p, start: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                      </div>
                      <div>
                        <label htmlFor="flexibleEndTime" className="block text-xs font-medium text-gray-400 mb-1">종료 시간</label>
                        <input type="time" name="flexibleEndTime" id="flexibleEndTime" value={flexibleTime.end} onChange={e => setFlexibleTime(p => ({...p, end: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                      </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">학생별 시간 설정</label>
                  <div className="space-y-2 p-3 bg-gray-900/50 rounded-lg max-h-48 overflow-y-auto">
                      {(classData?.studentIds || []).length > 0 ? (classData?.studentIds || []).map(studentId => {
                          const schedule = studentSchedules.find(s => s.studentId === studentId);
                          return (
                              <div key={studentId} className="grid grid-cols-3 items-center gap-2">
                                  <span className="text-sm text-gray-200 truncate">{studentMap.get(studentId) || `학생 ID: ${studentId}`}</span>
                                  <input type="time" value={schedule?.startTime || ''} onChange={e => handleStudentScheduleChange(studentId, 'startTime', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-sm" />
                                  <input type="time" value={schedule?.endTime || ''} onChange={e => handleStudentScheduleChange(studentId, 'endTime', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-sm" />
                              </div>
                          )
                      }) : <p className="text-center text-sm text-gray-500">배정된 학생이 없습니다.</p>}
                  </div>
                </div>
            );
        default: // 'custom'
            return (
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">시작 시간</label>
                    <input type="time" name="startTime" id="startTime" value={customTime.start} onChange={e => setCustomTime(p=>({...p, start: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">종료 시간</label>
                    <input type="time" name="endTime" id="endTime" value={customTime.end} onChange={e => setCustomTime(p=>({...p, end: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
                  </div>
              </div>
            );
    }
  }


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <Card title={classData ? '반 정보 수정' : '신규 반 등록'}>
          <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto p-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">반 이름</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
              </div>
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-300 mb-1">담당 교사</label>
                <select name="teacherId" id="teacherId" value={formData.teacherId} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                    <option value="" disabled>선생님 선택</option>
                    {assignableTeachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">대상 학년 (중복 선택 가능)</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-800/50 rounded-lg">
                  {gradeOptions.map(grade => (
                      <button
                          type="button"
                          key={grade}
                          onClick={() => handleGradeToggle(grade)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                              formData.grade.includes(grade)
                              ? 'bg-[#E5A823] text-gray-900'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          }`}
                      >
                          {grade}
                      </button>
                  ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-300 mb-1">강의실</label>
                <select name="room" id="room" value={formData.room} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]">
                      {roomOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-300 mb-1">최대 정원</label>
                <input type="number" name="capacity" id="capacity" value={formData.capacity} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">수업 요일</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-800/50 rounded-lg">
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
            
            <div>
              {renderScheduleControls()}
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