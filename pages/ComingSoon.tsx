import React from 'react';
import Card from '../components/ui/Card';
import type { Page } from '../types';

interface ComingSoonProps {
    pageName: Page;
}

const pageNameMap: Record<string, string> = {
    'dashboard': '대시보드',
    'students': '학생 관리',
    'classes': '반/수업 관리',
    'lesson-records': '수업 기록',
    'reports': '리포트',
    'tuition': '수강료 관리',
    'counseling': '상담 기록',
    'schedule': '연간 일정',
    'meeting-notes': '회의록',
    'test-generator': '시험지 생성기'
};

const ComingSoon: React.FC<ComingSoonProps> = ({ pageName }) => {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="text-center w-full max-w-md">
                <h1 className="text-2xl font-bold text-[#E5A823] mb-2">{pageNameMap[pageName] || '페이지'}</h1>
                <p className="text-gray-300 text-lg">해당 페이지는 현재 준비 중입니다.</p>
                <p className="text-gray-400 mt-4">곧 멋진 기능으로 찾아뵙겠습니다!</p>
            </Card>
        </div>
    );
};

export default ComingSoon;