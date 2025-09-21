import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import type { Class, Student, Teacher } from '../types';
import { ClockIcon, TeacherIcon, StudentsIcon } from '../components/Icons';

interface DailyScheduleProps {
  classes: Class[];
  students: Student[];
  teachers: Teacher[];
}

interface ScheduledClass {
  id: number;
  name: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
  students: {
    id: number;
    name: string;
    individualSchedule?: string;
  }[];
}

const DailySchedule: React.FC<DailyScheduleProps> = ({ classes, students, teachers }) => {
  const [selectedDate, setSelectedDate] = useState('2025-09-15');

  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);
  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

  const scheduleForSelectedDate = useMemo(() => {
    const dateObj = new Date(selectedDate + 'T00:00:00'); // Use local timezone
    const dayOfWeek = dateObj.getDay();
    const scheduleMap: { [key: string]: number } = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };
    
    const scheduledClasses: ScheduledClass[] = [];

    classes.forEach(cls => {
      const scheduleParts = cls.schedule.split(', ');
      
      for (const part of scheduleParts) {
        const timeMatch = part.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
        const daysStr = part.split(' ')[0];

        if (daysStr && timeMatch) {
            const days = daysStr.split('/').map(day => scheduleMap[day]);
            if (days.includes(dayOfWeek)) {
                scheduledClasses.push({
                    id: cls.id,
                    name: cls.name,
                    teacherName: teacherMap.get(cls.teacherId) || '미배정',
                    startTime: timeMatch[1],
                    endTime: timeMatch[2],
                    room: cls.room,
                    students: cls.studentIds.map(studentId => {
                        const individualSchedule = cls.studentSchedules?.find(ss => ss.studentId === studentId);
                        return {
                            id: studentId,
                            name: studentMap.get(studentId) || 'Unknown',
                            individualSchedule: individualSchedule ? `${individualSchedule.startTime}-${individualSchedule.endTime}` : undefined,
                        };
                    }).sort((a,b) => a.name.localeCompare(b.name)),
                });
            }
        }
      }
    });

    return scheduledClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, classes, students, teachers, teacherMap, studentMap]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">오늘의 수업일정</h1>
        <div className="relative">
             <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-base"
            />
        </div>
      </div>
      
      {scheduleForSelectedDate.length > 0 ? (
        <div className="space-y-6">
            {scheduleForSelectedDate.map(cls => (
                <Card key={cls.id}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Class Info */}
                        <div className="md:col-span-1 md:border-r md:border-gray-700/50 pr-6">
                            <h2 className="text-2xl font-bold text-[#E5A823] mb-3">{cls.name}</h2>
                            <div className="space-y-3 text-gray-300">
                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
                                    <span className="font-semibold">{cls.startTime} - {cls.endTime}</span>
                                </div>
                                <div className="flex items-center">
                                    <TeacherIcon className="w-5 h-5 mr-3 text-gray-400" />
                                    <span>{cls.teacherName}</span>
                                </div>
                                <div className="flex items-center">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{cls.room}</span>
                                </div>
                                 <div className="flex items-center">
                                    <StudentsIcon className="w-5 h-5 mr-3 text-gray-400" />
                                    <span>{cls.students.length}명</span>
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-white mb-3">학생 명단</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                                {cls.students.map(student => (
                                    <div key={student.id} className="bg-gray-800/50 p-2 rounded-md text-sm text-center">
                                        <p className="text-gray-200 truncate">{student.name}</p>
                                        {student.individualSchedule && (
                                            <p className="text-xs text-yellow-400">{student.individualSchedule}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      ) : (
        <Card>
            <div className="text-center py-12">
                <p className="text-gray-400 text-lg">선택한 날짜에 예정된 수업이 없습니다.</p>
            </div>
        </Card>
      )}
    </div>
  );
};

export default DailySchedule;
