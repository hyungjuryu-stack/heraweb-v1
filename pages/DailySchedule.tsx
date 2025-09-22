import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import type { Class, Student, Teacher } from '../types';

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
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                    <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">시간</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">반 이름</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">강사</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">강의실</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">인원</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-300 uppercase tracking-wider w-2/5">학생 명단</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-gray-700/50">
                    {scheduleForSelectedDate.map(cls => (
                    <tr key={cls.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 font-semibold">{cls.startTime} - {cls.endTime}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-white">{cls.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{cls.teacherName}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{cls.room}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{cls.students.length}명</td>
                        <td className="px-3 py-2 text-sm text-gray-300 align-top">
                        <div className="flex flex-wrap gap-1">
                            {cls.students.map(student => (
                            <div key={student.id} className="bg-gray-700/60 px-2 py-0.5 rounded-full text-xs text-gray-200">
                                {student.name}
                                {student.individualSchedule && (
                                <span className="text-yellow-400/90 ml-1 text-[10px]">({student.individualSchedule})</span>
                                )}
                            </div>
                            ))}
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </Card>
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