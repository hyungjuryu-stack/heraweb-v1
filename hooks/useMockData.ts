
import { useState } from 'react';
import { StudentStatus } from '../types';
import type { Student, Class, Teacher, LessonRecord, MonthlyReport, Tuition, Counseling, AcademyEvent, MeetingNote, Position, HomeworkGrade } from '../types';

// --- 데이터 생성 헬퍼 함수 ---

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
const GIVEN_NAMES_MALE = ['민준', '서준', '도윤', '예준', '시우', '하준', '지호', '주원', '지훈', '준서', '건우', '현우', '우진', '선우', '유준'];
const GIVEN_NAMES_FEMALE = ['서아', '하윤', '지안', '서윤', '하은', '지우', '아윤', '서연', '수아', '시아', '민서', '아린', '예린', '채원', '다은'];
const SCHOOLS = ['헤라중학교', '가온중학교', '대한고등학교', '세종고등학교', '미래중학교', '으뜸초등학교', '새솔초등학교'];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const createInitialData = () => {
    const simToday = new Date(2025, 8, 15); // 시뮬레이션 기준일: 2025년 9월 15일

    // 1. 강사 데이터 (5명)
    const teachers: Teacher[] = [
      { id: 1, name: '김원장', position: '원장', role: 'admin', hireDate: '2024-03-01', phone: '010-1111-1111', email: 'kim@hera.math', resignationDate: '' },
      { id: 2, name: '이선생', position: '강사', role: 'teacher', hireDate: '2024-09-01', phone: '010-2222-2222', email: 'lee@hera.math', resignationDate: '' },
      { id: 3, name: '박선생', position: '강사', role: 'teacher', hireDate: '2024-10-15', phone: '010-3333-3333', email: 'park@hera.math', resignationDate: '' },
      { id: 4, name: '정선생', position: '강사', role: 'teacher', hireDate: '2025-02-01', phone: '010-5555-5555', email: 'jung@hera.math', resignationDate: '' },
      { id: 5, name: '최직원', position: '직원', role: 'operator', hireDate: '2025-01-01', phone: '010-4444-4444', email: 'choi@hera.math', resignationDate: '' },
    ];

    // 2. 학생 데이터 생성 (200명)
    const students: Student[] = Array.from({ length: 200 }, (_, i) => {
        const id = i + 1;
        const gender = Math.random() > 0.5 ? '남' : '여';
        const name = getRandom(SURNAMES) + (gender === '남' ? getRandom(GIVEN_NAMES_MALE) : getRandom(GIVEN_NAMES_FEMALE));
        const gradeNum = getRandomInt(1, 6);
        let grade = '';
        if (gradeNum <= 3) grade = `고${gradeNum}`;
        else grade = `중${gradeNum-3}`;

        let status: StudentStatus;
        if (i < 80) { // 퇴원생 80명
            status = StudentStatus.WITHDRAWN;
        } else if (i < 86) { // 상담/대기 6명
            status = StudentStatus.CONSULTING;
        } else { // 재원생 114명
            status = StudentStatus.ENROLLED;
        }
        
        const enrollmentDate = getRandomDate(new Date(2025, 0, 1), simToday);
        const enrollmentDateObj = new Date(enrollmentDate);
        // 퇴원일은 등록일로부터 최소 30일 이후
        const withdrawalDate = status === StudentStatus.WITHDRAWN ? getRandomDate(new Date(enrollmentDateObj.getTime() + 86400000 * 30), simToday) : undefined;

        return {
            id,
            attendanceId: (1000 + id).toString(),
            name: `${name}`,
            gender,
            school: getRandom(SCHOOLS),
            grade,
            enrollmentDate,
            withdrawalDate,
            status,
            siblings: [],
            studentPhone: `010-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
            motherName: `${name} 모`,
            motherPhone: `010-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
            fatherName: '',
            fatherPhone: '',
            sendSmsToBoth: Math.random() > 0.8,
            tuitionPayer: '모',
            regularClassId: null,
            advancedClassId: null,
            teacherId: null,
            avgScore: getRandomInt(75, 100),
            attendanceRate: getRandomInt(90, 100),
            homeworkRate: getRandomInt(85, 100),
            diagnosticTestScore: Math.random() > 0.3 
                ? getRandomInt(70, 95).toString() 
                : `${getRandomInt(17, 24)}/25`,
            diagnosticTestNotes: '기본 개념 이해도 양호. 응용 문제 풀이 연습 필요.',
        };
    });

    // 3. 반 데이터 생성
    const classNames = [
        '월목1A', '월목1B', '월목1C', 
        '월목2A', '월목2B', '월목2C', 
        '월목3A', '월목3B', '월목3C',
        '화금1A', '화금1B', '화금1C', '화금1D',
        '화금2A', '화금2B', '화금2C', '화금2D',
        '화금3A', '화금3B', '화금3C',
        '수A', '수B', '수C', '수D',
        '고등월목', '고등수토', '고등목토', '고등토', '고등토일'
    ];
    
    const classes: Class[] = classNames.map((name, index) => {
        const teacherId = teachers[index % teachers.length].id;
        let grade: string[] = [];
        let schedule = '';
        const gradeNum = name.match(/\d/);
        
        if (name.startsWith('월목')) {
            grade = gradeNum ? [`중${gradeNum[0]}`] : [];
            if(name.includes('1')) schedule = '월/목 14:30-16:30';
            else if(name.includes('2')) schedule = '월/목 16:40-18:40';
            else if(name.includes('3')) schedule = '월/목 19:30-21:30';
        } else if (name.startsWith('화금')) {
            grade = gradeNum ? [`중${gradeNum[0]}`] : [];
            if(name.includes('1')) schedule = '화/금 14:30-16:30';
            else if(name.includes('2')) schedule = '화/금 16:40-18:40';
            else if(name.includes('3')) schedule = '화/금 19:30-21:30';
        } else if (name.startsWith('수')) {
            grade = ['중1', '중2', '중3'];
            schedule = '수 13:30-18:30';
        } else if (name.startsWith('고등')) {
            grade = ['고1', '고2', '고3'];
            switch(name) {
                case '고등월목': schedule = '월/목 19:00-22:00'; break;
                case '고등수토': schedule = '수 19:00-22:00, 토 13:00-16:00'; break;
                case '고등목토': schedule = '목 19:00-22:00, 토 17:00-20:00'; break;
                case '고등토': schedule = '토 09:00-12:00'; break;
                case '고등토일': schedule = '토 14:00-17:00, 일 14:00-17:00'; break;
            }
        }
        const capacity = name.startsWith('수') ? 13 : 6;
        return { id: index + 1, name, teacherId, grade, studentIds: [], schedule, room: `${getRandomInt(2, 5)}0${getRandomInt(1, 4)}호`, capacity };
    });

    // 4. 모든 학생을 반에 배정
    const regularClasses = classes.filter(c => c.name.startsWith('월목') || c.name.startsWith('화금') || c.name.startsWith('고등'));
    const advancedClasses = classes.filter(c => c.name.startsWith('수'));

    students.forEach(student => {
        // Assign to regular class
        const appropriateRegularClasses = regularClasses.filter(c => c.grade.includes(student.grade) && c.studentIds.length < c.capacity);
        if (appropriateRegularClasses.length > 0) {
            const selectedClass = getRandom(appropriateRegularClasses);
            selectedClass.studentIds.push(student.id);
            student.regularClassId = selectedClass.id;
            student.teacherId = selectedClass.teacherId; // Main teacher from regular class
        }

        // Assign to advanced class (about 40% chance for middle schoolers)
        if (student.grade.startsWith('중') && Math.random() > 0.6) {
            const appropriateAdvancedClasses = advancedClasses.filter(c => c.grade.includes(student.grade) && c.studentIds.length < c.capacity);
            if (appropriateAdvancedClasses.length > 0) {
                const selectedClass = getRandom(appropriateAdvancedClasses);
                if (!selectedClass.studentIds.includes(student.id)) {
                    selectedClass.studentIds.push(student.id);
                }
                student.advancedClassId = selectedClass.id;
            }
        }
    });

    // 4.1 수요일 자율반 학생 개별 시간 설정
    const wednesdayClassA = classes.find(c => c.name === '수A');
    if (wednesdayClassA && wednesdayClassA.studentIds.length > 2) {
        wednesdayClassA.studentSchedules = [
            { studentId: wednesdayClassA.studentIds[0], startTime: '13:30', endTime: '15:30' },
            { studentId: wednesdayClassA.studentIds[1], startTime: '15:00', endTime: '17:00' },
        ];
    }


    // 5. 수업 기록 생성 (2025년 1월 1일 ~ 현재)
    const lessonRecords: LessonRecord[] = [];
    let lessonRecordId = 1;
    const scheduleMap: { [key: string]: number } = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0 };
    const homeworkGrades: HomeworkGrade[] = ['A', 'A', 'A', 'B', 'B', 'C', 'D', 'F']; // Skew towards better grades
    const textbooks = ['쎈', 'RPM', '개념원리', '블랙라벨', '일품'];

    const createScore = (): string | null => {
        if (Math.random() < 0.3) return null; // 30% chance of no test for a given slot
        if (Math.random() < 0.5) {
            return getRandomInt(60, 100).toString(); // e.g., '85'
        } else {
            const total = getRandom([10, 15, 20, 25]);
            const correct = getRandomInt(Math.floor(total * 0.6), total);
            return `${correct}/${total}`; // e.g., '17/20'
        }
    };

    students.filter(s => s.regularClassId || s.advancedClassId).forEach(student => {
        const studentClasses = [
            classes.find(c => c.id === student.regularClassId),
            classes.find(c => c.id === student.advancedClassId)
        ].filter(Boolean) as Class[];

        studentClasses.forEach(studentClass => {
            if (!studentClass) return;
            const classDays = studentClass.schedule.split(', ')[0].split(' ')[0].split('/').map(day => scheduleMap[day]);
            for (let d = new Date(2025, 0, 1); d <= simToday; d.setDate(d.getDate() + 1)) {
                 // 학생의 등록일 이전이거나, 퇴원일 이후인 경우 기록을 생성하지 않음
                if (d < new Date(student.enrollmentDate) || (student.withdrawalDate && d > new Date(student.withdrawalDate))) {
                    continue;
                }

                if (classDays.includes(d.getDay())) {
                     const attendanceRoll = Math.random();
                     let attendance: LessonRecord['attendance'] = '출석';
                     if (attendanceRoll > 0.95) attendance = '결석';
                     else if (attendanceRoll > 0.9) attendance = '지각';
                     lessonRecords.push({ 
                        id: lessonRecordId++, 
                        date: new Date(d).toISOString().split('T')[0], 
                        studentId: student.id, 
                        attendance, 
                        testScore1: createScore(),
                        testScore2: createScore(),
                        testScore3: createScore(),
                        homework: getRandom(homeworkGrades), 
                        attitude: getRandom(['매우 좋음', '보통', '안좋음']), 
                        notes: Math.random() > 0.8 ? '수업 집중도 매우 좋음' : '',
                        requested_test: Math.random() > 0.9 ? '오답노트 확인 필수' : '',
                        main_textbook: `${getRandom(textbooks)} ${getRandomInt(50,150)}p`,
                        supplementary_textbook: Math.random() > 0.6 ? `${getRandom(textbooks)} ${getRandomInt(20,80)}p` : '',
                        reinforcement_textbook: Math.random() > 0.4 ? `${getRandom(textbooks)} ${getRandomInt(10,40)}p` : '',
                     });
                }
            }
        });
    });

    // Manually populate all of September 2025 for '월목1A' to ensure testability.
    const demoClass = classes.find(c => c.name === '월목1A');
    if (demoClass) {
        const demoClassStudents = demoClass.studentIds;
        const demoClassDays = demoClass.schedule.split(', ')[0].split(' ')[0].split('/').map(day => scheduleMap[day]);
        const year = 2025;
        const month = 8; // September

        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            if (demoClassDays.includes(date.getDay())) {
                const dateString = date.toISOString().split('T')[0];
                demoClassStudents.forEach((studentId, studentIndex) => {
                    const recordExists = lessonRecords.some(r => r.studentId === studentId && r.date === dateString);
                    if (!recordExists) {
                        // Special cases for testing notification buttons
                        if (dateString === '2025-09-15' && studentIndex === 0) {
                            // First student is absent to trigger notification
                             lessonRecords.push({
                                id: lessonRecordId++,
                                date: dateString,
                                studentId: studentId,
                                attendance: '결석',
                                testScore1: '80', testScore2: null, testScore3: null,
                                homework: 'A',
                                attitude: '보통',
                                notes: '결석',
                                requested_test: '',
                                main_textbook: `${getRandom(textbooks)} 110p`, supplementary_textbook: '', reinforcement_textbook: '',
                            });
                        } else if (dateString === '2025-09-18') {
                            // All students have perfect records, should not trigger notification
                             lessonRecords.push({
                                id: lessonRecordId++,
                                date: dateString,
                                studentId: studentId,
                                attendance: '출석',
                                testScore1: createScore(), testScore2: createScore(), testScore3: createScore(),
                                homework: 'A',
                                attitude: '매우 좋음',
                                notes: '수업 태도 우수',
                                requested_test: '',
                                main_textbook: `${getRandom(textbooks)} 115p`, supplementary_textbook: '', reinforcement_textbook: '',
                            });
                        } else {
                            // Default random record generation
                            const attendanceRoll = Math.random();
                            let attendance: LessonRecord['attendance'] = '출석';
                            if (attendanceRoll > 0.95) attendance = '결석';
                            else if (attendanceRoll > 0.9) attendance = '지각';
                            lessonRecords.push({
                                id: lessonRecordId++,
                                date: dateString,
                                studentId: studentId,
                                attendance,
                                testScore1: createScore(),
                                testScore2: createScore(),
                                testScore3: createScore(),
                                homework: getRandom(homeworkGrades),
                                attitude: getRandom(['매우 좋음', '보통', '안좋음']),
                                notes: Math.random() > 0.8 ? '추가 학습 필요' : '개념 이해 완료',
                                requested_test: Math.random() > 0.9 ? '오답노트 확인 필수' : '',
                                main_textbook: `${getRandom(textbooks)} ${getRandomInt(50,150)}p`,
                                supplementary_textbook: Math.random() > 0.6 ? `${getRandom(textbooks)} ${getRandomInt(20,80)}p` : '',
                                reinforcement_textbook: Math.random() > 0.4 ? `${getRandom(textbooks)} ${getRandomInt(10,40)}p` : '',
                            });
                        }
                    }
                });
            }
            date.setDate(date.getDate() + 1);
        }
    }
    
    // 6. 월간 리포트 생성
    const monthlyReports: MonthlyReport[] = [];
    let reportId = 1;
    const lastMonth = new Date(simToday.getFullYear(), simToday.getMonth() - 1, 1);
    const endOfLastMonth = new Date(simToday.getFullYear(), simToday.getMonth(), 0);
    const reportPeriod = `${lastMonth.getFullYear()}년 ${lastMonth.getMonth() + 1}월`;

    students.filter(s => s.status === StudentStatus.ENROLLED && s.teacherId).forEach(student => {
        monthlyReports.push({ id: reportId++, studentId: student.id, period: reportPeriod, attendanceRate: student.attendanceRate, avgScore: student.avgScore, homeworkRate: student.homeworkRate, counselingSummary: '특별한 상담 내역 없음.', sentDate: endOfLastMonth.toISOString().split('T')[0], teacherId: student.teacherId as number, reviewText: `${student.name} 학생은 지난 한 달간 꾸준한 학습 태도를 보여주었습니다. 특히 ${getRandom(['연산', '도형', '함수'])} 파트에서 강점을 보이고 있으며, 오답 노트 정리를 통해 약점을 보완해나가고 있습니다.`, sentStatus: Math.random() > 0.3 ? '발송완료' : '미발송' });
    });

    // 7. 상담 기록 생성
    const COUNSELING_TOPICS = ['2학기 내신 대비 학습 전략 상담', '수학 학습에 대한 흥미 저하 문제 논의', '심화 문제 풀이 능력 향상 방안 상담', '겨울방학 특강 프로그램 문의', '오답 노트 작성 및 활용법 지도', '진로 및 입시 관련 상담', '최근 테스트 결과 분석 및 피드백', '교우 관계 및 학교 생활 관련 상담'];
    const counselings: Counseling[] = [];
    let counselingId = 1;
    students.filter(s => s.status === StudentStatus.ENROLLED || s.status === StudentStatus.WITHDRAWN).slice(0, 70).forEach(student => {
        if (student.teacherId) {
            counselings.push({
                id: counselingId++,
                date: getRandomDate(new Date(student.enrollmentDate), student.withdrawalDate ? new Date(student.withdrawalDate) : simToday),
                studentId: student.id,
                parentName: student.motherName,
                teacherId: student.teacherId,
                content: getRandom(COUNSELING_TOPICS),
                followUp: '주간 테스트 결과 확인 후 추가 피드백 예정.'
            });
        }
    });

    // 8. 기타 데이터
    const tuitions: Tuition[] = students.filter(s => s.status === StudentStatus.ENROLLED).slice(0, 20).map((s, i) => ({ id: i + 1, studentId: s.id, course: s.grade.startsWith('고') ? '고등' : '중등', plan: '주3회', baseFee: 450000, siblingDiscount: false, totalFee: 450000, cashReceiptPhone: s.motherPhone, paymentMethod: '카드', paymentStatus: i % 5 === 0 ? '미결제' : '결제완료' }));
    const academyEvents: AcademyEvent[] = [
        { id: 1, title: '여름방학 특강 시작', type: '학사', startDate: '2025-07-21', endDate: '2025-08-15', relatedClassIds: [], notes: '전 학년 대상'},
        { id: 2, title: '전국 모의고사', type: '시험', startDate: '2025-09-04', endDate: '2025-09-04', relatedClassIds: classes.filter(c => c.name.startsWith('고등')).map(c => c.id), notes: '고등부 대상'},
    ];
    const meetingNotes: MeetingNote[] = [
        { id: 1, title: '2학기 교육과정 회의', date: '2025-07-20', attendeeIds: [1, 2, 3, 4], agenda: '2학기 내신 대비 교재 선정', content: '교재 후보 3종 비교 분석', decisions: 'A교재 기본, B교재 심화용으로 최종 선정', actionItems: [{ task: '교재 주문', 담당자Id: 1, dueDate: '2025-07-25'}] }
    ];

    return { initialTeachers: teachers, initialStudents: students, initialClasses: classes, initialLessonRecords: lessonRecords, initialMonthlyReports: monthlyReports, initialTuitions: tuitions, initialCounselings: counselings, initialAcademyEvents: academyEvents, initialMeetingNotes: meetingNotes };
}

const {
    initialTeachers,
    initialStudents,
    initialClasses,
    initialLessonRecords,
    initialMonthlyReports,
    initialTuitions,
    initialCounselings,
    initialAcademyEvents,
    initialMeetingNotes
} = createInitialData();


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
        consultingStudents: students.filter(s => s.status === StudentStatus.CONSULTING || s.status === StudentStatus.WAITING).length,
        attendanceToday: [
            { name: '출석', value: 68, fill: '#E5A823' },
            { name: '결석', value: 2, fill: '#6b7280' },
            { name: '지각', value: 3, fill: '#9ca3af' },
        ],
        scoreTrends: [
            { name: '1월', '평균 점수': 82 },
            { name: '2월', '평균 점수': 85 },
            { name: '3월', '평균 점수': 84 },
            { name: '4월', '평균 점수': 88 },
            { name: '5월', '평균 점수': 91 },
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
