
export type Page = 
  'dashboard' | 
  'students' | 
  'classes' | 
  'lesson-records' | 
  'reports' | 
  'tuition' | 
  'counseling' | 
  'schedule' | 
  'meeting-notes' | 
  'test-generator';

export enum StudentStatus {
  CONSULTING = '상담',
  WAITING = '대기',
  ENROLLED = '재원',
  WITHDRAWN = '퇴원'
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
  siblings: number[];
  studentPhone: string;
  parent1Phone: string;
  parent2Phone?: string;
  sendSmsToBoth: boolean;
  tuitionPayer: '모' | '부';
  currentClassId: number | null;
  teacherId: number | null;
  // For display/mock purposes, in a real app these would be calculated
  avgScore: number;
  attendanceRate: number;
  homeworkRate: number;
}

export interface Class {
  id: number;
  name: string;
  teacherId: number;
  grade: string;
  studentIds: number[];
  schedule: string;
  room: string;
  capacity: number;
}

export interface Teacher {
  id: number;
  name: string;
}

export interface LessonRecord {
  id: number;
  date: string;
  studentId: number;
  attendance: '출석' | '지각' | '결석';
  testScore: number | null;
  homeworkCompleted: boolean;
  attitude: '매우 좋음' | '보통' | '부족';
  notes: string;
}

export interface MonthlyReport {
  id: number;
  studentId: number;
  period: '주간' | '월간';
  attendanceRate: number;
  avgScore: number;
  homeworkRate: number;
  counselingSummary: string;
  sentDate: string;
  teacherId: number;
  reviewText: string;
}

export interface Tuition {
  id: number;
  studentId: number;
  course: '초등' | '중등' | '고등';
  plan: string;
  baseFee: number;
  siblingDiscount: boolean;
  totalFee: number;
  cashReceiptPhone: string;
  paymentMethod: '현금' | '카드';
  paymentStatus: '미결제' | '결제완료';
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
    actionItems: { task: string, 담당자Id: number, dueDate: string }[];
}


export interface GeneratedQuestion {
  question: string;
  options?: string[];
  answer: string;
  type: 'multiple-choice' | 'short-answer';
}

export interface GeneratedTest {
  title: string;
  questions: GeneratedQuestion[];
}