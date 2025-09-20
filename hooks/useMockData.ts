import { useState } from 'react';
import { StudentStatus } from '../types';
import type { Student, Class, Teacher, LessonRecord, MonthlyReport, Tuition, Counseling, AcademyEvent, MeetingNote } from '../types';

const initialTeachers: Teacher[] = [
  { id: 1, name: '이선생' },
  { id: 2, name: '박선생' },
  { id: 3, name: '김선생' },
];

const initialStudents: Student[] = [
  { id: 1, attendanceId: '1023', name: '김민준', gender: '남', school: '헤라중학교', grade: '중2', enrollmentDate: '2023-03-05', status: StudentStatus.ENROLLED, currentClassId: 1, teacherId: 1, avgScore: 92, attendanceRate: 100, homeworkRate: 95, siblings: [], studentPhone: '010-1234-5678', parent1Phone: '010-1111-2222', sendSmsToBoth: false, tuitionPayer: '부' },
  { id: 2, attendanceId: '1024', name: '이서연', gender: '여', school: '가온초등학교', grade: '초6', enrollmentDate: '2023-09-01', status: StudentStatus.ENROLLED, currentClassId: 2, teacherId: 2, avgScore: 98, attendanceRate: 98, homeworkRate: 100, siblings: [], studentPhone: '010-2345-6789', parent1Phone: '010-2222-3333', sendSmsToBoth: true, tuitionPayer: '모', parent2Phone: '010-2222-4444'},
  { id: 3, attendanceId: '1025', name: '박도윤', gender: '남', school: '대한고등학교', grade: '고1', enrollmentDate: '2022-11-20', status: StudentStatus.ENROLLED, currentClassId: 3, teacherId: 3, avgScore: 88, attendanceRate: 95, homeworkRate: 90, siblings: [], studentPhone: '010-3456-7890', parent1Phone: '010-3333-4444', sendSmsToBoth: false, tuitionPayer: '부' },
  { id: 4, attendanceId: '1026', name: '최지우', gender: '여', school: '헤라중학교', grade: '중1', enrollmentDate: '2024-01-15', status: StudentStatus.ENROLLED, currentClassId: 4, teacherId: 1, avgScore: 85, attendanceRate: 100, homeworkRate: 92, siblings: [], studentPhone: '010-4567-8901', parent1Phone: '010-4444-5555', sendSmsToBoth: false, tuitionPayer: '모' },
  { id: 5, attendanceId: '1027', name: '정시우', gender: '남', school: '세종초등학교', grade: '초5', enrollmentDate: '2023-05-02', status: StudentStatus.CONSULTING, currentClassId: null, teacherId: null, avgScore: 0, attendanceRate: 0, homeworkRate: 0, siblings: [], studentPhone: '010-5678-9012', parent1Phone: '010-5555-6666', sendSmsToBoth: false, tuitionPayer: '모' },
  { id: 6, attendanceId: '1028', name: '하윤서', gender: '여', school: '대한고등학교', grade: '고2', enrollmentDate: '2022-07-11', withdrawalDate: '2024-05-30', status: StudentStatus.WITHDRAWN, currentClassId: null, teacherId: 3, avgScore: 78, attendanceRate: 90, homeworkRate: 85, siblings: [], studentPhone: '010-6789-0123', parent1Phone: '010-6666-7777', sendSmsToBoth: false, tuitionPayer: '부' },
];

const initialClasses: Class[] = [
  { id: 1, name: '중2 심화 A반', teacherId: 1, grade: '중2', studentIds: [1], schedule: '월/수/금 16:00-18:00', room: '301호', capacity: 10 },
  { id: 2, name: '초6 영재반', teacherId: 2, grade: '초6', studentIds: [2], schedule: '화/목 15:00-17:00', room: '201호', capacity: 8 },
  { id: 3, name: '고1 최상위 S반', teacherId: 3, grade: '고1', studentIds: [3], schedule: '월/수/금 19:00-22:00', room: '502호', capacity: 12 },
  { id: 4, name: '중1 응용 B반', teacherId: 1, grade: '중1', studentIds: [4], schedule: '화/목 16:00-18:00', room: '302호', capacity: 10 },
];

const initialLessonRecords: LessonRecord[] = [
    { id: 1, date: '2024-07-22', studentId: 1, attendance: '출석', testScore: 95, homeworkCompleted: true, attitude: '매우 좋음', notes: '집중력이 높고 질문이 많음.'},
    { id: 2, date: '2024-07-22', studentId: 2, attendance: '출석', testScore: 100, homeworkCompleted: true, attitude: '매우 좋음', notes: '새로운 개념을 빠르게 이해함.'},
];

const initialMonthlyReports: MonthlyReport[] = [
    { id: 1, studentId: 1, period: '월간', sentDate: '2024-06-30', teacherId: 1, avgScore: 92, attendanceRate: 100, homeworkRate: 95, counselingSummary: '학습 태도 우수, 심화 문제 풀이량 늘리는 것 추천.', reviewText: '김민준 학생은 꾸준한 성실함으로 높은 성취도를 보이고 있습니다. 특히 어려운 문제에 대한 도전 정신이 돋보이며, 앞으로 심화 과정에서도 좋은 결과가 기대됩니다.'},
];

const initialTuitions: Tuition[] = [
    { id: 1, studentId: 1, course: '중등', plan: '주3회', baseFee: 450000, siblingDiscount: false, totalFee: 450000, cashReceiptPhone: '010-1111-2222', paymentMethod: '카드', paymentStatus: '결제완료' }
];

const initialCounselings: Counseling[] = [
    { id: 1, date: '2024-06-15', studentId: 3, parentName: '박도윤 학부모', teacherId: 3, content: '여름방학 특강 및 내신 대비 전략 상담', followUp: '특강 수강 결정, 주간 테스트 점수 공유 예정'}
];

const initialAcademyEvents: AcademyEvent[] = [
    { id: 1, title: '여름방학 특강 시작', type: '학사', startDate: '2024-07-22', endDate: '2024-08-16', relatedClassIds: [], notes: '전 학년 대상'},
    { id: 2, title: '전국 모의고사', type: '시험', startDate: '2024-09-05', endDate: '2024-09-05', relatedClassIds: [3], notes: '고1, 고2 대상'},
];

const initialMeetingNotes: MeetingNote[] = [
    { id: 1, title: '중등부 8월 교육과정 회의', date: '2024-07-20', attendeeIds: [1, 3], agenda: '2학기 내신 대비 교재 선정', content: '교재 후보 3종 비교 분석', decisions: 'A교재 기본, B교재 심화용으로 최종 선정', actionItems: [{ task: '교재 주문', 담당자Id: 1, dueDate: '2024-07-25'}] }
];

export const useMockData = () => {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [classes, setClasses] = useState<Class[]>(initialClasses);
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [lessonRecords, setLessonRecords] = useState<LessonRecord[]>(initialLessonRecords);
    const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>(initialMonthlyReports);
    const [tuitions, setTuitions] = useState<Tuition[]>(initialTuitions);
    const [counselings, setCounselings] = useState<Counseling[]>(initialCounselings);
    const [academyEvents, setAcademyEvents] = useState<AcademyEvent[]>(initialAcademyEvents);
    const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>(initialMeetingNotes);


    const dashboardData = {
        totalStudents: students.filter(s => s.status === StudentStatus.ENROLLED).length,
        consultingStudents: students.filter(s => s.status === StudentStatus.CONSULTING).length,
        attendanceToday: [
            { name: '출석', value: 68, fill: '#E5A823' },
            { name: '결석', value: 2, fill: '#6b7280' },
            { name: '지각', value: 3, fill: '#9ca3af' },
        ],
        scoreTrends: [
            { name: '3월', '평균 점수': 82 },
            { name: '4월', '평균 점수': 85 },
            { name: '5월', '평균 점수': 84 },
            { name: '6월', '평균 점수': 88 },
            { name: '7월', '평균 점수': 91 },
        ],
        schedule: academyEvents.slice(0, 3).map(e => ({ time: e.startDate, event: e.title })),
    };

    return { 
        students, setStudents, 
        classes, setClasses, 
        teachers, setTeachers, 
        lessonRecords, setLessonRecords,
        monthlyReports, setMonthlyReports,
        tuitions, setTuitions,
        counselings, setCounselings,
        academyEvents, setAcademyEvents,
        meetingNotes, setMeetingNotes,
        dashboardData 
    };
};