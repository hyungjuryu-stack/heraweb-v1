
import React, { useState, useMemo, useEffect } from 'react';
import type { Class, Student, Teacher, LessonRecord, HomeworkGrade, User } from '../types';
import { KakaoTalkIcon } from '../components/Icons';

// --- Type Definitions ---
type DailyRecordData = Omit<LessonRecord, 'id' | 'date' | 'studentId'>;
const homeworkGrades: HomeworkGrade[] = ['A', 'B', 'C', 'D', 'F'];

// --- Helper Components ---

const StudentInfoCell: React.FC<{ student: Student, index: number }> = ({ student, index }) => {
    const labels = [
        "출석/태도/과제",
        "테스트 (1/2/3)",
        "본교재",
        "부교재",
        "보강교재",
        "준비요청",
        "비고",
    ];
    
    const shortenSchoolName = (school: string) => {
        return school.replace('중학교', '중').replace('고등학교', '고').replace('초등학교', '초');
    }

    return (
        <div className="p-1 text-xs h-full flex flex-col justify-between">
            <div className="flex-grow flex items-center mb-1">
                <span className="font-bold text-base mr-2 w-6 text-center">{index + 1}</span>
                <div className="border-l border-gray-700/50 pl-2">
                    <div className="font-semibold text-white text-sm">{student.name}</div>
                    <div className="text-gray-400 text-[11px]">{shortenSchoolName(student.school)} {student.grade}</div>
                </div>
            </div>
            <div className="border-t border-gray-700/50 text-center text-gray-400 text-[10px] flex flex-col">
                {labels.map((label, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center border-b border-dotted border-gray-700 last:border-b-0 py-1">{label}</div>
                ))}
            </div>
        </div>
    );
}

const AttendanceRecordView: React.FC<{ record?: LessonRecord }> = ({ record }) => {
    const fields = [
        <div className="flex justify-center items-center gap-2 px-1 text-[11px] w-full">
            <span>{record?.attendance || '-'}</span>
            <span>{record?.attitude || '-'}</span>
            <span>{record?.homework || '-'}</span>
        </div>,
        <div className="flex justify-center items-center gap-2 px-1 truncate text-[11px] w-full">
            <span>{record?.testScore1 || '-'}</span>/
            <span>{record?.testScore2 || '-'}</span>/
            <span>{record?.testScore3 || '-'}</span>
        </div>,
        <span className="truncate px-1" title={record?.main_textbook}>{record?.main_textbook || '-'}</span>,
        <span className="truncate px-1" title={record?.supplementary_textbook}>{record?.supplementary_textbook || '-'}</span>,
        <span className="truncate px-1" title={record?.reinforcement_textbook}>{record?.reinforcement_textbook || '-'}</span>,
        <span className="truncate px-1" title={record?.requested_test}>{record?.requested_test || '-'}</span>,
        <span className="truncate px-1" title={record?.notes}>{record?.notes || '-'}</span>,
    ];

    return (
        <div className="h-full w-full text-xs text-center flex flex-col">
            {fields.map((field, index) => (
                <div key={index} className="flex-1 flex items-center justify-center border-b border-dotted border-gray-700 last:border-b-0">
                    {field}
                </div>
            ))}
        </div>
    );
};


const AttendanceRecordEdit: React.FC<{
    record?: LessonRecord,
    onSave: (data: DailyRecordData) => void,
    onCancel: () => void
}> = ({ record, onSave, onCancel }) => {
    const [formData, setFormData] = useState<DailyRecordData>({
        attendance: record?.attendance || '출석',
        testScore1: record?.testScore1 || null,
        testScore2: record?.testScore2 || null,
        testScore3: record?.testScore3 || null,
        homework: record?.homework || 'A',
        attitude: record?.attitude || '보통',
        notes: record?.notes || '',
        requested_test: record?.requested_test || '',
        main_textbook: record?.main_textbook || '',
        supplementary_textbook: record?.supplementary_textbook || '',
        reinforcement_textbook: record?.reinforcement_textbook || '',
    });

    const handleChange = (field: keyof DailyRecordData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const commonInputClass = "w-full bg-gray-800 border-gray-600 rounded p-1 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500";
    const commonSelectClass = `${commonInputClass} appearance-none`;

    return (
        <div className="absolute inset-0 bg-[#0d211c] p-1 z-10 border-2 border-yellow-500 rounded-md text-xs flex flex-col space-y-1">
            <div className="grid grid-cols-3 gap-1">
                <select value={formData.attendance} onChange={e => handleChange('attendance', e.target.value)} className={commonSelectClass}><option>출석</option><option>지각</option><option>결석</option></select>
                <select value={formData.attitude} onChange={e => handleChange('attitude', e.target.value)} className={commonSelectClass}><option>매우 좋음</option><option>보통</option><option>부족</option></select>
                <select value={formData.homework} onChange={e => handleChange('homework', e.target.value as HomeworkGrade)} className={commonSelectClass}>{homeworkGrades.map(g => <option key={g}>{g}</option>)}</select>
            </div>
            <div className="grid grid-cols-3 gap-1">
                <input type="text" placeholder="점수1" value={formData.testScore1 ?? ''} onChange={e => handleChange('testScore1', e.target.value === '' ? null : e.target.value)} className={commonInputClass} />
                <input type="text" placeholder="점수2" value={formData.testScore2 ?? ''} onChange={e => handleChange('testScore2', e.target.value === '' ? null : e.target.value)} className={commonInputClass} />
                <input type="text" placeholder="점수3" value={formData.testScore3 ?? ''} onChange={e => handleChange('testScore3', e.target.value === '' ? null : e.target.value)} className={commonInputClass} />
            </div>
            <input type="text" placeholder="본교재" value={formData.main_textbook} onChange={e => handleChange('main_textbook', e.target.value)} className={commonInputClass} />
            <input type="text" placeholder="부교재" value={formData.supplementary_textbook} onChange={e => handleChange('supplementary_textbook', e.target.value)} className={commonInputClass} />
            <input type="text" placeholder="보강교재" value={formData.reinforcement_textbook} onChange={e => handleChange('reinforcement_textbook', e.target.value)} className={commonInputClass} />
            <input type="text" placeholder="준비요청" value={formData.requested_test} onChange={e => handleChange('requested_test', e.target.value)} className={commonInputClass} />
            <textarea placeholder="비고..." value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={1} className={`${commonInputClass} resize-none`} />
            <div className="flex justify-end space-x-1 pt-1">
                <button onClick={onCancel} className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white">취소</button>
                <button onClick={() => onSave(formData)} className="px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-500 text-white font-semibold">저장</button>
            </div>
        </div>
    );
};


const NotificationPreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  cls: Class | undefined;
  studentsInClass: Student[];
  recordsMap: Map<string, LessonRecord>;
}> = ({ isOpen, onClose, date, cls, studentsInClass, recordsMap }) => {
    if (!isOpen || !date || !cls) return null;

    const dateString = date.toISOString().split('T')[0];
    const poorHomeworkGrades: HomeworkGrade[] = ['C', 'D', 'F'];

    const studentsToNotify = studentsInClass.map(student => {
        const record = recordsMap.get(`${student.id}-${dateString}`);
        const issues: string[] = [];
        if (record) {
            if (record.attendance === '지각' || record.attendance === '결석') {
                issues.push(record.attendance);
            }
            if (record.attitude === '부족') {
                issues.push('수업태도 부족');
            }
            if (poorHomeworkGrades.includes(record.homework)) {
                issues.push(`과제 미흡(${record.homework})`);
            }
        }
        return { student, issues };
    }).filter(item => item.issues.length > 0);
    
    const allStudentsAttendanceSummary = studentsInClass.reduce(
        (acc, student) => {
            const record = recordsMap.get(`${student.id}-${dateString}`);
            const status = record?.attendance || '결석';
            if (status === '출석') acc.present++;
            else if (status === '지각') acc.late++;
            else if (status === '결석') acc.absent++;
            return acc;
        },
        { present: 0, late: 0, absent: 0 }
    );


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="bg-[#1A3A32] border border-gray-700/50 rounded-xl shadow-lg">
          <div className="border-b border-gray-700/50 px-6 py-4">
            <h3 className="text-lg font-bold text-[#E5A823]">알림톡 발송 내용</h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="bg-[#FEE500] p-4 rounded-lg text-black">
                    <div className="flex items-start mb-3">
                        <KakaoTalkIcon className="w-8 h-8 mr-2 flex-shrink-0" />
                        <h4 className="font-bold text-sm leading-tight">
                            [헤라매쓰] {cls.name} {date.getMonth() + 1}월 {date.getDate()}일 알림
                        </h4>
                    </div>
                    <div className="bg-white p-3 rounded space-y-1 text-sm">
                       {studentsToNotify.length > 0 ? (
                            studentsToNotify.map(({ student, issues }) => (
                                <p key={student.id}>- {student.name}: {issues.join(', ')}</p>
                            ))
                       ) : (
                           <p>전원 출석 및 특이사항 없음.</p>
                       )}
                        <div className="pt-2 mt-2 border-t border-gray-200 text-xs text-gray-600">
                           총원 {studentsInClass.length}명: 출석 {allStudentsAttendanceSummary.present}, 지각 {allStudentsAttendanceSummary.late}, 결석 {allStudentsAttendanceSummary.absent}
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    * 위 내용은 학부모님께 카카오톡 알림톡으로 발송됩니다.
                </p>
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end space-x-4 border-t border-gray-700/50">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---

interface ClassAttendanceProps {
  user: User;
  classes: Class[];
  students: Student[];
  teachers: Teacher[];
  lessonRecords: LessonRecord[];
  setLessonRecords: React.Dispatch<React.SetStateAction<LessonRecord[]>>;
}

const ClassAttendance: React.FC<ClassAttendanceProps> = ({ user, classes, students, lessonRecords, setLessonRecords }) => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [editingCell, setEditingCell] = useState<{ studentId: number; date: string } | null>(null);
  const [sentNotifications, setSentNotifications] = useState<Record<string, { sent: boolean, sending: boolean }>>({});
  const [notificationPreviewDate, setNotificationPreviewDate] = useState<Date | null>(null);
  const [resendingKey, setResendingKey] = useState<string | null>(null);

  const canEdit = user.role === 'admin' || user.role === 'operator';

  useEffect(() => {
    // If classes are loaded and no class is selected, select the first one.
    if (classes.length > 0 && !selectedClassId) {
        setSelectedClassId(classes[0].id);
    }
    // If a class was selected, but it no longer exists (e.g., deleted),
    // select the first available class.
    if (selectedClassId && !classes.some(c => c.id === selectedClassId)) {
        setSelectedClassId(classes[0]?.id || null);
    }
  }, [classes, selectedClassId]);

  const handlePrevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  
  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [selectedClassId, classes]);

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return selectedClass.studentIds
      .map(id => students.find(s => s.id === id))
      .filter((s): s is Student => !!s)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedClass, students]);

  const classScheduleDays = useMemo(() => {
      if (!selectedClass) return [];
      const scheduleMap: { [key: string]: number } = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };
      const scheduleString = selectedClass.schedule.split(' ')[0];
      const days = scheduleString.split('/');
      return days.map(day => scheduleMap[day]).filter(dayNum => dayNum !== undefined);
  }, [selectedClass]);

  const classDaysInMonth = useMemo(() => {
      if (classScheduleDays.length === 0) return [];
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const days = [];
      const date = new Date(year, month, 1);

      while (date.getMonth() === month) {
          if (classScheduleDays.includes(date.getDay())) {
              days.push(new Date(date));
          }
          date.setDate(date.getDate() + 1);
      }
      return days;
  }, [currentDate, classScheduleDays]);

  const recordsMap = useMemo(() => {
    return new Map(lessonRecords.map(r => [`${r.studentId}-${r.date}`, r]));
  }, [lessonRecords]);
  
  useEffect(() => {
    if (!selectedClassId) return;

    const simToday = new Date(2025, 8, 15);
    simToday.setHours(0, 0, 0, 0); // Normalize to start of day

    const notificationsToUpdate: Record<string, { sent: boolean; sending: boolean }> = {};
    
    classDaysInMonth.forEach(date => {
        const classDate = new Date(date);
        classDate.setHours(0, 0, 0, 0); // Normalize

        if (classDate < simToday) {
            const key = `${classDate.toISOString().split('T')[0]}-${selectedClassId}`;
            notificationsToUpdate[key] = { sent: true, sending: false };
        }
    });

    setSentNotifications(prev => ({ ...prev, ...notificationsToUpdate }));
  }, [classDaysInMonth, selectedClassId]);
  
  const notificationTriggers = useMemo(() => {
      const triggers: Record<string, boolean> = {};
      const poorHomeworkGrades: HomeworkGrade[] = ['C', 'D', 'F'];

      classDaysInMonth.forEach(date => {
          const dateString = date.toISOString().split('T')[0];
          const hasTrigger = studentsInClass.some(student => {
              const record = recordsMap.get(`${student.id}-${dateString}`);
              if (!record) return false;
              return record.attendance === '지각' ||
                     record.attendance === '결석' ||
                     record.attitude === '부족' ||
                     poorHomeworkGrades.includes(record.homework);
          });
          triggers[dateString] = hasTrigger;
      });
      return triggers;
  }, [classDaysInMonth, studentsInClass, recordsMap]);

  const handleSaveRecord = (studentId: number, dateString: string, data: DailyRecordData) => {
    setLessonRecords(prevRecords => {
      const existingRecord = prevRecords.find(r => r.studentId === studentId && r.date === dateString);
      if (existingRecord) {
        return prevRecords.map(r => r.id === existingRecord.id ? { ...existingRecord, ...data } : r);
      } else {
        const newRecord: LessonRecord = { id: Date.now(), studentId, date: dateString, ...data };
        return [...prevRecords, newRecord];
      }
    });
    setEditingCell(null);
  };

  const handleSendNotification = (date: Date, isResend = false) => {
    if (!selectedClassId) return;
    const key = `${date.toISOString().split('T')[0]}-${selectedClassId}`;
    if (sentNotifications[key]?.sent && !isResend) return;
    
    if (isResend) {
        setResendingKey(key);
    }

    setSentNotifications(prev => ({ ...prev, [key]: { ...prev[key], sending: true } }));
    setTimeout(() => {
        setSentNotifications(prev => ({ ...prev, [key]: { sent: true, sending: false } }));
        if (isResend) {
            setResendingKey(null);
            alert('알림톡을 재발송했습니다.');
        }
    }, 1000);
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold text-white mb-4">수업 출석부</h1>

      <div className="bg-[#1A3A32]/80 border border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm p-4 mb-4 flex justify-between items-center">
         <div className="flex-1">
            <label htmlFor="class-select" className="sr-only">반 선택</label>
            <select
              id="class-select"
              value={selectedClassId || ''}
              onChange={e => setSelectedClassId(Number(e.target.value))}
              className="w-full max-w-xs bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-center bg-gray-800 border border-gray-600 rounded-md">
                <button onClick={handlePrevMonth} className="px-4 py-2 text-white hover:bg-gray-700 rounded-l-md" aria-label="이전 달">‹</button>
                <span className="w-40 text-center font-semibold text-white">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </span>
                <button onClick={handleNextMonth} className="px-4 py-2 text-white hover:bg-gray-700 rounded-r-md" aria-label="다음 달">›</button>
            </div>
            <div className="flex-1"></div>
      </div>
      
      <div className="flex-grow overflow-auto border border-gray-700/50 rounded-xl bg-[#1A3A32]/50">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-800/80 backdrop-blur-sm">
              <tr className="border-b border-gray-600">
                <th scope="col" className="sticky left-0 z-10 bg-gray-800/80 px-2 py-2 text-xs font-bold text-gray-300 w-48 border-r border-gray-600">학생 정보</th>
                {classDaysInMonth.map(date => (
                   <th key={date.toISOString()} scope="col" className="px-2 py-1 text-center text-xs font-bold text-gray-300 w-44 border-r border-gray-600">
                    {date.getMonth() + 1}/{date.getDate()}<br/>({dayNames[date.getDay()]})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {studentsInClass.map((student, index) => (
                <tr key={student.id} className="h-48 border-b border-gray-700/50">
                  <td className="sticky left-0 bg-[#142f29]/90 p-0 align-top w-48 h-48 border-r border-gray-600">
                      <StudentInfoCell student={student} index={index} />
                  </td>
                  {classDaysInMonth.map(date => {
                     const dateString = date.toISOString().split('T')[0];
                     const record = recordsMap.get(`${student.id}-${dateString}`);
                     const isEditing = editingCell?.studentId === student.id && editingCell?.date === dateString;
                     return (
                       <td 
                          key={dateString} 
                          onClick={() => !isEditing && canEdit && setEditingCell({ studentId: student.id, date: dateString })}
                          className={`p-0 align-top w-44 h-48 border-r border-gray-600 relative ${canEdit ? 'cursor-pointer hover:bg-gray-700/30' : 'cursor-default'}`}
                       >
                         {isEditing ? (
                            <AttendanceRecordEdit 
                                record={record}
                                onSave={(data) => handleSaveRecord(student.id, dateString, data)}
                                onCancel={() => setEditingCell(null)}
                            />
                         ) : (
                           <AttendanceRecordView record={record} />
                         )}
                       </td>
                     );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-800/80 backdrop-blur-sm text-xs">
                 <tr className="border-t-2 border-gray-600">
                    <td className="sticky left-0 bg-gray-800/80 px-2 py-2 text-center font-bold text-gray-300 border-r border-gray-600">알림톡 발송</td>
                    {classDaysInMonth.map(date => {
                        const dateString = date.toISOString().split('T')[0];
                        const key = `${dateString}-${selectedClassId}`;
                        const status = sentNotifications[key];
                        const isSent = status?.sent;
                        const isSending = status?.sending;
                        const needsNotification = notificationTriggers[dateString];
                        const isResending = resendingKey === key;

                        return (
                             <td key={date.toISOString()} className="p-2 align-middle text-center border-r border-gray-600">
                                {isSent ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="font-semibold text-green-400">발송완료</span>
                                        <div className="flex w-full gap-1">
                                            <button onClick={() => setNotificationPreviewDate(date)} className="flex-1 text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white">
                                                내용보기
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm('이미 발송된 알림입니다. 다시 보내시겠습니까?')) {
                                                        handleSendNotification(date, true);
                                                    }
                                                }}
                                                disabled={isResending}
                                                className="flex-1 text-xs px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
                                            >
                                                {isResending ? '재발송 중...' : '재발송'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleSendNotification(date)} 
                                        disabled={isSending || !needsNotification}
                                        className="w-full text-xs px-2 py-1.5 rounded bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? '전송중...' : (needsNotification ? '발송' : '발송 대상 없음')}
                                    </button>
                                )}
                            </td>
                        )
                    })}
                 </tr>
            </tfoot>
          </table>
      </div>

       <NotificationPreviewModal
        isOpen={!!notificationPreviewDate}
        onClose={() => setNotificationPreviewDate(null)}
        date={notificationPreviewDate}
        cls={selectedClass}
        studentsInClass={studentsInClass}
        recordsMap={recordsMap}
      />
    </div>
  );
};

export default ClassAttendance;