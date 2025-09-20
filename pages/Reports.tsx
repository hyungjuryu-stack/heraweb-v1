
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { MonthlyReport, Student, Teacher, LessonRecord, Class } from '../types';
import ReportModal from '../components/ReportModal';
import ReportPreviewModal from '../components/ReportPreviewModal';

const SentStatusBadge: React.FC<{ status: MonthlyReport['sentStatus'] }> = ({ status }) => {
    const colorMap = {
        '발송완료': 'bg-green-500/20 text-green-300',
        '미발송': 'bg-gray-500/20 text-gray-400',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
}

interface ReportsPageProps {
  monthlyReports: MonthlyReport[];
  setMonthlyReports: React.Dispatch<React.SetStateAction<MonthlyReport[]>>;
  students: Student[];
  teachers: Teacher[];
  lessonRecords: LessonRecord[];
  classes: Class[];
}

const Reports: React.FC<ReportsPageProps> = ({ monthlyReports, setMonthlyReports, students, teachers, lessonRecords, classes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'sentDate', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  const filteredAndSortedReports = useMemo(() => {
    let filteredReports = monthlyReports.filter(report => {
        const student = studentMap.get(report.studentId);
        return student && student.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (sortConfig !== null) {
      filteredReports.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'studentId') {
            valA = studentMap.get(a.studentId)?.name || '';
            valB = studentMap.get(b.studentId)?.name || '';
        } else if (sortConfig.key === 'teacherId') {
            valA = teacherMap.get(a.teacherId) || '';
            valB = teacherMap.get(b.teacherId) || '';
        } else {
            valA = a[sortConfig.key as keyof MonthlyReport];
            valB = b[sortConfig.key as keyof MonthlyReport];
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredReports;
  }, [monthlyReports, sortConfig, searchTerm, studentMap, teacherMap]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
        const numSelected = selectedIds.length;
        const numItems = filteredAndSortedReports.length;
        headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
    }
  }, [selectedIds, filteredAndSortedReports]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const handleAddNewReport = () => {
    setSelectedReport(null);
    setIsModalOpen(true);
  };

  const handleEditReport = (report: MonthlyReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleSaveReport = (reportData: Omit<MonthlyReport, 'id' | 'sentStatus'> & { id?: number }) => {
    if (reportData.id) {
        setMonthlyReports(prev => prev.map(r => r.id === reportData.id ? { ...r, ...reportData } as MonthlyReport : r));
    } else {
        const newReport: MonthlyReport = { ...reportData, id: Date.now(), sentStatus: '미발송' };
        setMonthlyReports(prev => [...prev, newReport]);
    }
    handleCloseModal();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(filteredAndSortedReports.map(r => r.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleSelectItem = (id: number) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`${selectedIds.length}개의 리포트를 정말로 삭제하시겠습니까?`)) {
        setMonthlyReports(prev => prev.filter(r => !selectedIds.includes(r.id)));
        setSelectedIds([]);
    }
  };

  const handleOpenPreview = (report: MonthlyReport) => {
      setSelectedReport(report);
      setIsPreviewOpen(true);
  };
  
  const handleConfirmSend = () => {
      if (selectedReport) {
          setMonthlyReports(prev => prev.map(r => r.id === selectedReport.id ? {...r, sentStatus: '발송완료', sentDate: new Date().toISOString().split('T')[0]} : r));
      }
  };

  const headers = [
      { key: 'studentId', label: '학생' },
      { key: 'period', label: '리포트 기간' },
      { key: 'teacherId', label: '담당교사' },
      { key: 'sentStatus', label: '발송상태' },
      { key: 'sentDate', label: '발송일' },
      { key: 'avgScore', label: '평균점수' },
      { key: 'attendanceRate', label: '출석률' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">리포트 관리</h1>
        <button onClick={handleAddNewReport} className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors">
          신규 리포트 작성
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center min-h-[72px]">
          <div className="flex items-center gap-4">
              <span className="text-white font-medium">{selectedIds.length}개 선택됨</span>
              <div className="relative">
                  <input
                      type="text"
                      placeholder="학생 이름 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                  </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <button disabled={selectedIds.length === 0} className="bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed text-sm" onClick={handleDeleteSelected}>
                  선택 항목 삭제
              </button>
          </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input id="checkbox-all" type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                    <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                  </div>
                </th>
                {headers.map(({ key, label }) => (
                  <th key={key} scope="col" onClick={() => requestSort(key)} className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                    {label}
                    <span className="ml-1">{getSortIndicator(key)}</span>
                  </th>
                ))}
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-gray-700/50">
              {filteredAndSortedReports.map((report) => {
                const student = studentMap.get(report.studentId);
                return (
                  <tr key={report.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input id={`checkbox-${report.id}`} type="checkbox" checked={selectedIds.includes(report.id)} onChange={() => handleSelectItem(report.id)} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600 focus:ring-2" />
                        <label htmlFor={`checkbox-${report.id}`} className="sr-only">checkbox</label>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{student?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{teacherMap.get(report.teacherId) || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><SentStatusBadge status={report.sentStatus} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.sentStatus === '발송완료' ? report.sentDate : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.avgScore}점</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.attendanceRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleEditReport(report)} className="text-yellow-400 hover:text-yellow-300">수정</button>
                      <button onClick={() => handleOpenPreview(report)} className="text-blue-400 hover:text-blue-300">발송</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveReport}
        report={selectedReport}
        students={students}
        teachers={teachers}
        lessonRecords={lessonRecords}
      />
      
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirmSend={handleConfirmSend}
        report={selectedReport}
        student={selectedReport ? studentMap.get(selectedReport.studentId) || null : null}
        teacherName={selectedReport ? teacherMap.get(selectedReport.teacherId) : null}
      />
    </div>
  );
};

export default Reports;
