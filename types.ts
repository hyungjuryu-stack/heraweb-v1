export enum StudentStatus {
  ENROLLED = '재원',
  CONSULTING = '상담',
  WAITING = '대기',
  WITHDRAWN = '퇴원',
}

export interface Student {
  id: number;
  attendanceId: string;
  name: string;
  gender: '남' | '여';
  school: string;
  grade: string;
  enrollmentDate: string;
  withdrawalDate?: string;
  status: StudentStatus;
  siblings: number[]; // Array of student IDs
  studentPhone: string;
  motherName: string;
  motherPhone: string;
  fatherName: string;
  fatherPhone: string;
  sendSmsToBoth: boolean;
  tuitionPayer: '모' | '부';
  regularClassId: number | null;
  advancedClassId: number | null;
  teacherId: number | null;
  avgScore: number;
  attendanceRate: number;
  homeworkRate: number;
  diagnosticTestScore: string | null;
  diagnosticTestNotes: string;
}

export interface Class {
  id: number;
  name: string;
  teacherId: number;
  grade: string[];
  studentIds: number[];
  schedule: string;
  room: string;
  capacity: number;
  studentSchedules?: { studentId: number; startTime: string; endTime: string; }[];
}

export type Position = '원장' | '강사' | '직원';

export interface Teacher {
  id: number;
  name: string;
  position: Position;
  role: 'admin' | 'operator' | 'teacher';
  hireDate: string;
  phone: string;
  email: string;
  resignationDate: string;
}

export type HomeworkGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface LessonRecord {
  id: number;
  date: string;
  studentId: number;
  attendance: '출석' | '지각' | '결석';
  testScore1: string | null;
  testScore2: string | null;
  testScore3: string | null;
  homework: HomeworkGrade;
  attitude: '매우 좋음' | '보통' | '안좋음';
  notes: string;
  requested_test: string;
  main_textbook: string;
  supplementary_textbook: string;
  reinforcement_textbook: string;
}

export interface MonthlyReport {
  id: number;
  studentId: number;
  period: string;
  attendanceRate: number;
  avgScore: number;
  homeworkRate: number;
  attitudeRate: number;
  counselingSummary: string;
  sentDate: string;
  teacherId: number;
  reviewText: string;
  sentStatus: '발송완료' | '미발송';
}

export interface Tuition {
  id: number;
  studentId: number;
  course: string;
  plan: string;
  baseFee: number;
  siblingDiscount: boolean;
  totalFee: number;
  cashReceiptPhone: string;
  paymentMethod: '카드' | '현금' | '이체';
  paymentStatus: '결제완료' | '미결제';
}

export interface Counseling {
  id: number;
  date: string;
  studentId: number;
  parentName: string;
  teacherId: number;
  content: string;
  followUp: string;
}

export interface AcademyEvent {
    id: number;
    title: string;
    type: '학사' | '시험' | '행사' | '방학';
    startDate: string;
    endDate: string;
    relatedClassIds: number[];
    notes: string;
}

export interface MeetingNote {
    id: number;
    title: string;
    date: string;
    attendeeIds: number[];
    agenda: string;
    content: string;
    decisions: string;
    actionItems: { task: string; 담당자Id: number; dueDate: string }[];
}

export interface GeneratedTest {
  title: string;
  questions: {
    question: string;
    options?: string[];
    answer: string;
    type: 'multiple-choice' | 'short-answer';
  }[];
}

export interface TrendAnalysis {
  overallTrend: string;
  keyStrengths: string;
  areasForGrowth: string;
  recommendations: string[];
}

export type Page = 
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'teachers'
  | 'lesson-records'
  | 'class-attendance'
  | 'reports'
  | 'tuition'
  | 'counseling'
  | 'schedule'
  | 'meeting-notes'
  | 'test-generator'
  | 'mypage';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'teacher';
  mustChangePassword?: boolean;
}