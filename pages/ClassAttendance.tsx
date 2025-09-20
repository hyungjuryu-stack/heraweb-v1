import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { LessonRecord, Class, Student } from '../types';

type DailyRecordData = Omit<LessonRecord, 'id' | 'date' | 'studentId'>;

const AttendanceBadge: React.FC<{ status: LessonRecord['attendance'] }> = ({ status }) => {
    const colorMap = {
        '출석': 'bg-green-500/20 text-green-300',
        '지각': 'bg-yellow-500/20 text-yellow-300',
        '결석': 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
}

interface ClassAttendancePageProps {
    classes: Class[];
    students: Student[];
    lessonRecords: LessonRecord[];
    setLessonRecords: React.Dispatch<React.SetStateAction<LessonRecord[]>>;
}

const ClassAttendance: React.FC<ClassAttendancePageProps> = ({ classes, students, lessonRecords, setLessonRecords }) => {
    const [selectedClassId, setSelectedClassId] = useState<number | string>(classes[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [recordsData, setRecordsData] = useState<Map<number, DailyRecordData>>(new Map());

    const studentsInClass = useMemo(() => {
        if (!selectedClassId) return [];
        const classId = Number(selectedClassId);
        const selectedClass = classes.find(c => c.id === classId);
        if (!selectedClass) return [];
        return students.filter(s => selectedClass.studentIds.includes(s.id));
    }, [selectedClassId, classes, students]);

    useEffect(() => {
        const newRecordsData = new Map<number, DailyRecordData>();
        studentsInClass.forEach(student => {
            const existingRecord = lessonRecords.find(
                r => r.studentId === student.id && r.date === selectedDate
            );
            if (existingRecord) {
                newRecordsData.set(student.id, {
                    attendance: existingRecord.attendance,
                    testScore: existingRecord.testScore,
                    homeworkCompleted: existingRecord.homeworkCompleted,
                    attitude: existingRecord.attitude,
                    notes: existingRecord.notes,
                });
            } else {
                newRecordsData.set(student.id, {
                    attendance: '출석',
                    testScore: null,
                    homeworkCompleted: true,
                    attitude: '보통',
                    notes: '',
                });
            }
        });
        setRecordsData(newRecordsData);
    }, [studentsInClass, selectedDate, lessonRecords]);

    const handleRecordChange = (studentId: number, field: keyof DailyRecordData, value: any) => {
        setRecordsData(prev => {
            const newMap = new Map(prev);
            const currentRecord = newMap.get(studentId);
            if (currentRecord) {
                if (field === 'testScore') {
                    const score = value === '' ? null : Number(value);
                    newMap.set(studentId, { ...currentRecord, [field]: score });
                } else if(field === 'homeworkCompleted') {
                    newMap.set(studentId, { ...currentRecord, [field]: Boolean(value) });
                }
                else {
                    newMap.set(studentId, { ...currentRecord, [field]: value });
                }
            }
            return newMap;
        });
    };

    const handleSaveRecords = () => {
        const updatedLessonRecords = [...lessonRecords];

        recordsData.forEach((data, studentId) => {
            const existingRecordIndex = updatedLessonRecords.findIndex(
                r => r.studentId === studentId && r.date === selectedDate
            );

            if (existingRecordIndex > -1) {
                const originalRecord = updatedLessonRecords[existingRecordIndex];
                updatedLessonRecords[existingRecordIndex] = { ...originalRecord, ...data };
            } else {
                const newRecord: LessonRecord = {
                    id: Date.now() + studentId,
                    studentId,
                    date: selectedDate,
                    ...data
                };
                updatedLessonRecords.push(newRecord);
            }
        });

        setLessonRecords(updatedLessonRecords);
        alert('수업 기록이 저장되었습니다.');
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-white">수업 출석부</h1>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="w-48 bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                    />
                    <button
                        onClick={handleSaveRecords}
                        className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        기록 저장
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">학생</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">출결</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">테스트 점수</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">과제</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">수업 태도</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">비고</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-gray-700/50">
                            {studentsInClass.map(student => {
                                const record = recordsData.get(student.id);
                                if (!record) return null;

                                return (
                                    <tr key={student.id} className="hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select value={record.attendance} onChange={e => handleRecordChange(student.id, 'attendance', e.target.value)} className="bg-gray-700 border-gray-600 rounded-md p-1.5 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500">
                                                <option value="출석">출석</option>
                                                <option value="지각">지각</option>
                                                <option value="결석">결석</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input type="number" value={record.testScore ?? ''} onChange={e => handleRecordChange(student.id, 'testScore', e.target.value)} className="w-20 bg-gray-700 border-gray-600 rounded-md p-1.5 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <input type="checkbox" checked={record.homeworkCompleted} onChange={e => handleRecordChange(student.id, 'homeworkCompleted', e.target.checked)} className="w-5 h-5 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select value={record.attitude} onChange={e => handleRecordChange(student.id, 'attitude', e.target.value)} className="bg-gray-700 border-gray-600 rounded-md p-1.5 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500">
                                                <option>매우 좋음</option>
                                                <option>보통</option>
                                                <option>부족</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input type="text" value={record.notes} onChange={e => handleRecordChange(student.id, 'notes', e.target.value)} className="w-full min-w-[200px] bg-gray-700 border-gray-600 rounded-md p-1.5 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500" />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                     {studentsInClass.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            선택한 반에 배정된 학생이 없습니다.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ClassAttendance;