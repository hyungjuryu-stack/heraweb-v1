
import { useState } from 'react';
import { StudentStatus } from '../types';
import type { Student, Class, Teacher, LessonRecord, MonthlyReport, Tuition, Counseling, AcademyEvent, MeetingNote, Position, HomeworkGrade } from '../types';

// --- 데이터 생성 헬퍼 함수 ---

const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
const GIVEN_NAMES_MALE = ['민준', '서준', '도윤', '예준', '시우', '하준', '지호', '주원', '지훈', '준서', '건우', '현우', '우진', '선우', '유준'];
const GIVEN_NAMES_FEMALE = ['서아', '하윤', '지안', '서윤', '하은', '지우', '아윤', '서연', '수아', '시아', '민서', '아린', '예린', '채원', '다은'];
const SCHOOLS = ['헤라중학교', '가온중학교', '대한고등학교', '세종고등학교', '미래중학교', '으뜸초등학교', '새솔초등학교'];
const FEMALE_SURNAMES = ['송', '유', '전', '문', '손', '양', '배', '백', '허', '남'];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

// 학생 유형(Archetype) 정의
enum Archetype {
    DILIGENT, // 성실형
    AVERAGE,  // 보통
    STRUGGLING, // 노력필요형
    FLUCTUATING, // 기복형
    POTENTIAL, // 잠재력형
}

const getArchetype = (): Archetype => {
    const rand = Math.random();
    if (rand < 0.3) return Archetype.AVERAGE;      // 30%
    if (rand < 0.55) return Archetype.DILIGENT;     // 25%
    if (rand < 0.75) return Archetype.STRUGGLING;   // 20%
    if (rand < 0.9) return Archetype.FLUCTUATING;  // 15%
    return Archetype.POTENTIAL;                    // 5%
};

const createInitialData = () => {
    // --- 시뮬레이션 설정 ---
    const SIM_END_DATE = new Date(2025, 8, 15); // 기준일: 2025년 9월 15일
    const SIM_START_DATE = new Date(2024, 8, 1); // 1년 전: 2024년 9월 1일
    const CURRENT_MONTH_START = new Date(SIM_END_DATE.getFullYear(), SIM_END_DATE.getMonth(), 1);

    const TOTAL_STUDENTS_POOL = 200;
    const FINAL_ENROLLED_COUNT = 130;
    const NEW_STUDENTS_THIS_MONTH_COUNT = 5;
    const WITHDRAWN_COUNT = TOTAL_STUDENTS_POOL - FINAL_ENROLLED_COUNT;
    const CONTINUING_ENROLLED_COUNT = FINAL_ENROLLED_COUNT - NEW_STUDENTS_THIS_MONTH_COUNT;

    // 1. 강사 데이터 (5명)
    const teachers: Teacher[] = [
      { id: 1, name: '김원장', position: '원장', role: 'admin', hireDate: '2024-03-01', phone: '010-1111-1111', email: 'kim@hera.math', resignationDate: '' },
      { id: 2, name: '이선생', position: '강사', role: 'teacher', hireDate: '2024-09-01', phone: '010-2222-2222', email: 'lee@hera.math', resignationDate: '' },
      { id: 3, name: '박선생', position: '강사', role: 'teacher', hireDate: '2024-10-15', phone: '010-3333-3333', email: 'park@hera.math', resignationDate: '' },
      { id: 4, name: '정선생', position: '강사', role: 'teacher', hireDate: '2025-02-01', phone: '010-5555-5555', email: 'jung@hera.math', resignationDate: '' },
      { id: 5, name: '최직원', position: '직원', role: 'operator', hireDate: '2025-01-01', phone: '010-4444-4444', email: 'choi@hera.math', resignationDate: '' },
    ];

    // 2. 학생 데이터 생성
    const students: Student[] = [];

    // 2.1 당월 신규 학생 (5명)
    for (let i = 0; i < NEW_STUDENTS_THIS_MONTH_COUNT; i++) {
        students.push({
            enrollmentDate: getRandomDate(CURRENT_MONTH_START, SIM_END_DATE),
            status: StudentStatus.ENROLLED,
            withdrawalDate: undefined,
        } as Student);
    }
    
    // 2.2 기존 재원생 (125명)
    for (let i = 0; i < CONTINUING_ENROLLED_COUNT; i++) {
        students.push({
            enrollmentDate: getRandomDate(SIM_START_DATE, CURRENT_MONTH_START),
            status: StudentStatus.ENROLLED,
            withdrawalDate: undefined,
        } as Student);
    }
    
    // 2.3 퇴원생 (70명)
    for (let i = 0; i < WITHDRAWN_COUNT; i++) {
        const enrollmentDate = getRandomDate(SIM_START_DATE, new Date(SIM_END_DATE.getTime() - 60 * 86400000)); // 최소 60일 재원 보장
        const withdrawalDate = getRandomDate(new Date(new Date(enrollmentDate).getTime() + 60 * 86400000), SIM_END_DATE);
        students.push({
            enrollmentDate,
            status: StudentStatus.WITHDRAWN,
            withdrawalDate,
        } as Student);
    }

    // 2.4 나머지 학생 정보 채우기
    students.forEach((student, i) => {
        const id = i + 1;
        const gender = Math.random() > 0.5 ? '남' : '여';
        const studentSurname = getRandom(SURNAMES);
        const name = studentSurname + (gender === '남' ? getRandom(GIVEN_NAMES_MALE) : getRandom(GIVEN_NAMES_FEMALE));
        const gradeNum = getRandomInt(1, 6);
        let grade = '';
        if (gradeNum <= 3) grade = `고${gradeNum}`;
        else grade = `중${gradeNum-3}`;
        const archetype = getArchetype();

        let avgScore, attendanceRate, homeworkRate, diagnosticTestNotes;
        switch (archetype) {
            case Archetype.DILIGENT:
                avgScore = getRandomInt(90, 100); attendanceRate = getRandomInt(98, 100); homeworkRate = getRandomInt(95, 100);
                diagnosticTestNotes = "개념 이해도가 매우 높고, 풀이 과정이 논리적임. 심화 문제 해결 능력도 뛰어남.";
                break;
            case Archetype.STRUGGLING:
                avgScore = getRandomInt(60, 75); attendanceRate = getRandomInt(85, 95); homeworkRate = getRandomInt(70, 85);
                diagnosticTestNotes = "기본 연산에서 실수가 잦고, 특정 단원의 개념 이해에 어려움을 보임. 꾸준한 복습 필요.";
                break;
            case Archetype.FLUCTUATING:
                avgScore = getRandomInt(75, 95); attendanceRate = getRandomInt(90, 100); homeworkRate = getRandomInt(80, 95);
                diagnosticTestNotes = "문제 난이도나 컨디션에 따라 성적 편차가 있음. 서술형 문제 대비가 필요해 보임.";
                break;
            case Archetype.POTENTIAL:
                avgScore = getRandomInt(80, 95); attendanceRate = getRandomInt(88, 98); homeworkRate = getRandomInt(75, 90);
                diagnosticTestNotes = "이해력은 좋으나 과제 완성도가 다소 아쉬움. 학습 태도를 개선하면 상위권 도약 가능.";
                break;
            default: // AVERAGE
                avgScore = getRandomInt(80, 92); attendanceRate = getRandomInt(95, 100); homeworkRate = getRandomInt(90, 100);
                diagnosticTestNotes = "기본 개념 이해도 양호. 응용 문제 풀이 연습을 통해 성적 향상 기대.";
                break;
        }

        Object.assign(student, {
            id,
            attendanceId: student.status === StudentStatus.ENROLLED ? (1000 + id).toString() : '',
            name: `${name}`,
            gender,
            school: getRandom(SCHOOLS),
            grade,
            siblings: [],
            studentPhone: `010-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
            motherName: `${getRandom(FEMALE_SURNAMES)}${getRandom(GIVEN_NAMES_FEMALE)}`,
            motherPhone: `010-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
            fatherName: Math.random() > 0.3 ? `${studentSurname}${getRandom(GIVEN_NAMES_MALE)}` : '',
            fatherPhone: Math.random() > 0.3 ? `010-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}` : '',
            sendSmsToBoth: Math.random() > 0.8,
            tuitionPayer: '모',
            regularClassId: null,
            advancedClassId: null,
            teacherId: null,
            avgScore, attendanceRate, homeworkRate, diagnosticTestNotes,
            diagnosticTestScore: Math.random() > 0.3 ? getRandomInt(70, 95).toString() : `${getRandomInt(17, 24)}/25`,
            trendAnalysis: undefined,
            lessonSummaries: [],
        });
    });

    // 2.5 형제 관계 생성
    const enrolledStudents = students.filter(s => s.status === StudentStatus.ENROLLED);
    for (let i = 0; i < 15; i++) { // 15쌍의 형제 생성
        const s1 = getRandom(enrolledStudents);
        const potentialSiblings = enrolledStudents.filter(s2 => s2.id !== s1.id && s1.siblings.length === 0 && s2.siblings.length === 0);
        if (potentialSiblings.length > 0) {
            const s2 = getRandom(potentialSiblings);
            s1.siblings.push(s2.id);
            s2.siblings.push(s1.id);
            // 부모 정보 통일
            s2.motherName = s1.motherName;
            s2.motherPhone = s1.motherPhone;
            s2.fatherName = s1.fatherName;
            s2.fatherPhone = s1.fatherPhone;
        }
    }

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

    // 4. 재원생을 반에 배정
    const regularClasses = classes.filter(c => c.name.startsWith('월목') || c.name.startsWith('화금') || c.name.startsWith('고등'));
    const advancedClasses = classes.filter(c => c.name.startsWith('수'));

    students.filter(s => s.status === StudentStatus.ENROLLED).forEach(student => {
        const appropriateRegularClasses = regularClasses.filter(c => c.grade.includes(student.grade) && c.studentIds.length < c.capacity);
        if (appropriateRegularClasses.length > 0) {
            const selectedClass = getRandom(appropriateRegularClasses);
            selectedClass.studentIds.push(student.id);
            student.regularClassId = selectedClass.id;
            student.teacherId = selectedClass.teacherId;
        }

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

    // 5. 수업 기록 생성 (재원 기간 동안만)
    const lessonRecords: LessonRecord[] = [];
    let lessonRecordId = 1;
    const scheduleMap: { [key: string]: number } = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0 };
    const homeworkGrades: HomeworkGrade[] = ['A', 'A', 'A', 'B', 'B', 'C', 'D', 'F'];
    const textbooks = ['쎈', 'RPM', '개념원리', '블랙라벨', '일품'];
    const positiveNotes = ['수업 집중도 매우 좋음', '질문 내용이 좋음', '오답노트 정리 우수'];
    const negativeNotes = ['수업 중 집중력 저하', '풀이 과정 생략하는 경향', '개념 이해 부족'];

    const createScore = (): string | null => {
        if (Math.random() < 0.3) return null;
        if (Math.random() < 0.5) return getRandomInt(60, 100).toString();
        else {
            const total = getRandom([10, 15, 20, 25]);
            const correct = getRandomInt(Math.floor(total * 0.6), total);
            return `${correct}/${total}`;
        }
    };
    
    students.forEach(student => {
        const studentClasses = [
            classes.find(c => c.id === student.regularClassId),
            classes.find(c => c.id === student.advancedClassId)
        ].filter(Boolean) as Class[];
        
        if (studentClasses.length === 0) return;

        const activeStartDate = new Date(student.enrollmentDate);
        const activeEndDate = student.withdrawalDate ? new Date(student.withdrawalDate) : SIM_END_DATE;

        studentClasses.forEach(studentClass => {
            const classDays = studentClass.schedule.split(', ')[0].split(' ')[0].split('/').map(day => scheduleMap[day]);
            for (let d = new Date(activeStartDate); d <= activeEndDate; d.setDate(d.getDate() + 1)) {
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
                        attitude: getRandom(homeworkGrades), 
                        selfDirectedLearning: getRandom(homeworkGrades),
                        notes: Math.random() > 0.8 ? (Math.random() > 0.5 ? getRandom(positiveNotes) : getRandom(negativeNotes)) : '',
                        requested_test: Math.random() > 0.9 ? '오답노트 확인 필수' : '',
                        main_textbook: `${getRandom(textbooks)} ${getRandomInt(50,150)}p`,
                        supplementary_textbook: Math.random() > 0.6 ? `${getRandom(textbooks)} ${getRandomInt(20,80)}p` : '',
                        reinforcement_textbook: Math.random() > 0.4 ? `${getRandom(textbooks)} ${getRandomInt(10,40)}p` : '',
                     });
                }
            }
        });
    });

    // 6. 수강료 기록 생성 (최근 3개월)
    const tuitions: Tuition[] = [];
    const MIDDLE_SCHOOL_FEE = 450000;
    const HIGH_SCHOOL_FEE = 550000;
    const BASE_SESSIONS = 8;
    const SIBLING_DISCOUNT_RATE = 0.1;
    const enrolledStudentIds = new Set(students.filter(s => s.status === StudentStatus.ENROLLED).map(s => s.id));

    students.forEach(student => {
        const studentEnrollmentDate = new Date(student.enrollmentDate);

        for (let i = 0; i < 3; i++) {
            const d = new Date(SIM_END_DATE);
            d.setMonth(d.getMonth() - i);
            const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            
            if (firstDayOfMonth < studentEnrollmentDate) continue;
            if(student.withdrawalDate && new Date(student.withdrawalDate) < firstDayOfMonth) continue;

            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const startDate = firstDayOfMonth.toISOString().split('T')[0];
            const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];

            const hasEnrolledSibling = student.siblings.some(siblingId => enrolledStudentIds.has(siblingId));
            const shouldApplyDiscount = hasEnrolledSibling && student.id > (student.siblings[0] || 0);
            const siblingDiscountRate = shouldApplyDiscount ? SIBLING_DISCOUNT_RATE : 0;
            
            const baseFee = student.grade.startsWith('고') ? HIGH_SCHOOL_FEE : MIDDLE_SCHOOL_FEE;
            const perSessionFee = baseFee / BASE_SESSIONS;
            const subtotal = baseFee;
            const otherDiscount = Math.random() > 0.95 ? 10000 : 0;
            const siblingDiscountAmount = Math.round(subtotal * siblingDiscountRate);
            const finalFee = subtotal - siblingDiscountAmount - otherDiscount;

            tuitions.push({
                id: `${student.id}-${monthStr}`,
                studentId: student.id,
                month: monthStr,
                calculationPeriodStart: startDate,
                calculationPeriodEnd: endDate,
                baseFee,
                baseSessions: BASE_SESSIONS,
                perSessionFee: Math.round(perSessionFee),
                scheduledSessions: BASE_SESSIONS,
                siblingDiscountRate,
                siblingDiscountAmount,
                otherDiscount,
                finalFee: Math.round(finalFee),
                paymentStatus: Math.random() > 0.2 ? '결제완료' : '미결제',
                notes: otherDiscount > 0 ? '이벤트 할인' : (shouldApplyDiscount ? '형제 할인 적용' : ''),
            });
        }
    });
    const initialTuitions = tuitions;

    // 7. 월간 리포트 생성 (재원 기간 내 매월)
    const monthlyReports: MonthlyReport[] = [];
    let reportId = 1;
    students.forEach(student => {
        const start = new Date(student.enrollmentDate);
        const end = student.withdrawalDate ? new Date(student.withdrawalDate) : SIM_END_DATE;

        for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d.setMonth(d.getMonth() + 1)) {
             monthlyReports.push({ 
                id: reportId++, 
                studentId: student.id, 
                period: `${d.getFullYear()}년 ${d.getMonth() + 1}월`, 
                attendanceRate: student.attendanceRate, 
                avgScore: student.avgScore, 
                homeworkRate: student.homeworkRate, 
                attitudeRate: getRandomInt(85, 100), 
                selfDirectedLearningRate: getRandomInt(70, 100),
                counselingSummary: '특별한 상담 내역 없음.', 
                sentDate: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0], 
                teacherId: student.teacherId as number, 
                reviewText: `${student.name} 학생은 지난 한 달간 꾸준한 학습 태도를 보여주었습니다.`, 
                sentStatus: Math.random() > 0.3 ? '발송완료' : '미발송' 
            });
        }
    });

    // 8. 상담 기록 생성
    const COUNSELING_TOPICS = ['2학기 내신 대비 학습 전략 상담', '수학 학습에 대한 흥미 저하 문제 논의', '심화 문제 풀이 능력 향상 방안 상담', '오답 노트 작성법 지도', '방학 특강 수강 문의'];
    const COUNSELING_TYPES = ['정기상담', '학습상담', '진로상담', '내신대비', '신규상담'];
    const counselings: Counseling[] = [];
    let counselingId = 1;
    students.forEach(student => {
        // Randomly assign counseling records to about 50% of students
        if (student.teacherId && Math.random() > 0.5) {
            // Generate 1 to 3 counseling records per student
            for (let i = 0; i < getRandomInt(1, 3); i++) {
                counselings.push({
                    id: counselingId++,
                    date: getRandomDate(new Date(student.enrollmentDate), student.withdrawalDate ? new Date(student.withdrawalDate) : SIM_END_DATE),
                    studentId: student.id,
                    parentName: student.motherName,
                    teacherId: student.teacherId,
                    content: getRandom(COUNSELING_TOPICS),
                    followUp: '주간 테스트 결과 확인 후 추가 피드백 예정.',
                    type: getRandom(COUNSELING_TYPES),
                });
            }
        }
    });

    // 9. 기타 데이터
    const academyEvents: AcademyEvent[] = [
        { id: 1, title: '여름방학 특강 시작', type: '학사', startDate: '2025-07-21', endDate: '2025-08-15', relatedClassIds: [], notes: '전 학년 대상'},
        { id: 2, title: '전국 모의고사', type: '시험', startDate: '2025-09-04', endDate: '2025-09-04', relatedClassIds: classes.filter(c => c.name.startsWith('고등')).map(c => c.id), notes: '고등부 대상'},
    ];
    const meetingNotes: MeetingNote[] = [
        { id: 1, title: '2학기 교육과정 회의', date: '2025-07-20', attendeeIds: [1, 2, 3, 4], agenda: '2학기 내신 대비 교재 선정', content: '교재 후보 3종 비교 분석', decisions: 'A교재 기본, B교재 심화용으로 최종 선정', actionItems: [{ task: '교재 주문', 담당자Id: 1, dueDate: '2025-07-25'}] }
    ];

    return { initialTeachers: teachers, initialStudents: students, initialClasses: classes, initialLessonRecords: lessonRecords, initialMonthlyReports: monthlyReports, initialTuitions: initialTuitions, initialCounselings: counselings, initialAcademyEvents: academyEvents, initialMeetingNotes: meetingNotes };
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

    const today = new Date(2025, 8, 15);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const newStudentsThisMonth = students.filter(s => {
        const enrollmentDate = new Date(s.enrollmentDate);
        return enrollmentDate >= startOfMonth && enrollmentDate <= today;
    }).length;

    const withdrawnStudentsThisMonth = students.filter(s => {
        if (!s.withdrawalDate) return false;
        const withdrawalDate = new Date(s.withdrawalDate);
        return withdrawalDate >= startOfMonth && withdrawalDate <= today;
    }).length;

    const dashboardData = {
        totalStudents: students.filter(s => s.status === StudentStatus.ENROLLED).length,
        consultingStudents: students.filter(s => s.status === StudentStatus.CONSULTING || s.status === StudentStatus.WAITING).length,
        newStudentsThisMonth,
        withdrawnStudentsThisMonth,
        attendanceToday: [
            { name: '출석', value: 68, fill: '#E5A823' },
            { name: '결석', value: 2, fill: '#6b7280' },
            { name: '지각', value: 3, fill: '#9ca3af' },
        ],
        scoreTrends: [
            { name: '4월', '평균 점수': 82 },
            { name: '5월', '평균 점수': 85 },
            { name: '6월', '평균 점수': 84 },
            { name: '7월', '평균 점수': 88 },
            { name: '8월', '평균 점수': 91 },
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
