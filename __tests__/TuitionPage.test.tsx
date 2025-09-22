import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TuitionPage from '../pages/Tuition';
import { Tuition, Student, Class, StudentStatus } from '../types';

// Mock data
const mockStudents: Student[] = [
  {
    id: 'student1',
    name: '김철수',
    grade: '중1',
    phone: '010-1234-5678',
    motherPhone: '010-9876-5432',
    fatherPhone: '010-1111-2222',
    tuitionPayer: '모',
    enrollmentDate: '2024-01-01',
    status: StudentStatus.ENROLLED,
    notes: '',
  },
  {
    id: 'student2',
    name: '이영희',
    grade: '중2',
    phone: '010-2345-6789',
    motherPhone: '010-8765-4321',
    fatherPhone: '010-3333-4444',
    tuitionPayer: '모',
    enrollmentDate: '2024-01-01',
    status: StudentStatus.ENROLLED,
    notes: '',
  },
];

const mockClasses: Class[] = [];

const mockTuitions: Tuition[] = [
  {
    id: 'student1-2024-09',
    studentId: 'student1',
    month: '2024-09',
    calculationPeriodStart: '2024-09-01',
    calculationPeriodEnd: '2024-09-30',
    baseFee: 450000,
    baseSessions: 8,
    perSessionFee: 56250,
    scheduledSessions: 8,
    siblingDiscountRate: 0,
    siblingDiscountAmount: 0,
    otherDiscount: 0,
    finalFee: 450000,
    paymentStatus: '미결제',
    notes: '',
  },
  {
    id: 'student2-2024-09',
    studentId: 'student2',
    month: '2024-09',
    calculationPeriodStart: '2024-09-01',
    calculationPeriodEnd: '2024-09-30',
    baseFee: 450000,
    baseSessions: 8,
    perSessionFee: 56250,
    scheduledSessions: 8,
    siblingDiscountRate: 0,
    siblingDiscountAmount: 0,
    otherDiscount: 0,
    finalFee: 450000,
    paymentStatus: '미결제',
    notes: '',
  },
];

// Mock window.confirm and alert
const mockConfirm = jest.fn();
const mockAlert = jest.fn();
Object.defineProperty(window, 'confirm', { value: mockConfirm });
Object.defineProperty(window, 'alert', { value: mockAlert });

describe('TuitionPage 삭제 기능 테스트', () => {
  let mockSetTuitions: jest.Mock;

  beforeEach(() => {
    mockSetTuitions = jest.fn();
    mockConfirm.mockClear();
    mockAlert.mockClear();
  });

  const renderTuitionPage = (tuitions = mockTuitions) => {
    return render(
      <TuitionPage
        tuitions={tuitions}
        setTuitions={mockSetTuitions}
        students={mockStudents}
        classes={mockClasses}
      />
    );
  };

  test('삭제 버튼이 아무것도 선택되지 않았을 때 비활성화되어야 함', () => {
    renderTuitionPage();
    
    const deleteButton = screen.getByRole('button', { name: /선택 삭제/i });
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveClass('cursor-not-allowed');
  });

  test('항목을 선택하면 삭제 버튼이 활성화되어야 함', async () => {
    const user = userEvent.setup();
    renderTuitionPage();

    // 첫 번째 체크박스 선택
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // 0번은 헤더 체크박스

    const deleteButton = screen.getByRole('button', { name: /1개 삭제/i });
    expect(deleteButton).not.toBeDisabled();
    expect(deleteButton).not.toHaveClass('cursor-not-allowed');
  });

  test('선택한 항목이 없을 때 삭제 버튼 클릭 시 경고 메시지가 표시되어야 함', async () => {
    const user = userEvent.setup();
    renderTuitionPage();

    const deleteButton = screen.getByRole('button', { name: /선택 삭제/i });
    
    // 비활성화된 버튼을 강제로 클릭하려고 시도
    fireEvent.click(deleteButton);
    
    expect(mockAlert).toHaveBeenCalledWith('삭제할 항목을 선택해주세요.');
  });

  test('삭제 확인 대화상자에서 취소하면 삭제되지 않아야 함', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false); // 사용자가 취소를 선택
    
    renderTuitionPage();

    // 첫 번째 항목 선택
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    // 삭제 버튼 클릭
    const deleteButton = screen.getByRole('button', { name: /1개 삭제/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockSetTuitions).not.toHaveBeenCalled();
  });

  test('삭제 확인 후 성공적으로 삭제되어야 함', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true); // 사용자가 확인을 선택
    
    renderTuitionPage();

    // 첫 번째 항목 선택
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    // 삭제 버튼 클릭
    const deleteButton = screen.getByRole('button', { name: /1개 삭제/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('선택된 1개의 수강료 내역을 정말로 삭제하시겠습니까?')
    );
    expect(mockSetTuitions).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledWith('1개의 수강료 내역이 성공적으로 삭제되었습니다.');
  });

  test('여러 항목 선택 후 삭제할 때 올바른 확인 메시지가 표시되어야 함', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);
    
    renderTuitionPage();

    // 모든 항목 선택 (헤더 체크박스 클릭)
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(headerCheckbox);

    // 삭제 버튼 클릭
    const deleteButton = screen.getByRole('button', { name: /2개 삭제/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('선택된 2개의 수강료 내역을 정말로 삭제하시겠습니까?')
    );
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('김철수, 이영희')
    );
  });

  test('선택된 항목 개수가 UI에 올바르게 표시되어야 함', async () => {
    const user = userEvent.setup();
    renderTuitionPage();

    // 초기 상태 확인
    expect(screen.getByText('선택된 항목 없음')).toBeInTheDocument();

    // 첫 번째 항목 선택
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    expect(screen.getByText('1명 선택됨')).toBeInTheDocument();

    // 두 번째 항목도 선택
    await user.click(checkboxes[2]);

    expect(screen.getByText('2명 선택됨')).toBeInTheDocument();
  });
});