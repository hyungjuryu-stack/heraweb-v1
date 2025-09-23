import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import type { MonthlyReport, Student, Teacher, LessonRecord, Class } from '../types';
import ReportModal from '../components/ReportModal';
import ReportPreviewModal from '../components/ReportPreviewModal';
import { generateReportAsPdf } from '../services/pdfService';
import ReportPDF from '../components/ReportPDF';
import { PdfIcon } from '../components/Icons';
import BulkReportModal from '../components/BulkReportModal';

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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>({ key: 'sentDate', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(10);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfRenderData, setPdfRenderData] = useState<{ report: MonthlyReport; student: Student; teacherName: string | null; } | null>(null);


  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  const filteredAndSortedReports = useMemo(() => {
    let filteredReports = monthlyReports.filter(report => {
        const student = studentMap.get(report.studentId);
        const nameMatch = student && student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const reportDate = report.sentStatus === '발송완료' ? report.sentDate : report.period.split(' ')[0] + '-' + report.period.split(' ')[1].replace('월','');

        const startDateMatch = startDate ? reportDate >= startDate : true;
        const endDateMatch = endDate ? reportDate <= endDate : true;

        return nameMatch && startDateMatch && endDateMatch;
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
  }, [monthlyReports, sortConfig, searchTerm, startDate, endDate, studentMap, teacherMap]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, startDate, endDate, itemsPerPage]);
  
  const { currentTableData, totalPages } = useMemo(() => {
      const numItems = filteredAndSortedReports.length;
      if (itemsPerPage === 'ALL' || numItems === 0) {
          return { currentTableData: filteredAndSortedReports, totalPages: 1 };
      }
      
      const totalPagesCalc = Math.ceil(numItems / itemsPerPage);
      const validCurrentPage = Math.max(1, Math.min(currentPage, totalPagesCalc));

      const start = (validCurrentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      
      return { currentTableData: filteredAndSortedReports.slice(start, end), totalPages: totalPagesCalc };
  }, [filteredAndSortedReports, currentPage, itemsPerPage]);

  const paginationNumbers = useMemo(() => {
    if (totalPages <= 1) {
        return [];
    }
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        let startPage: number;
        let endPage: number;

        if (currentPage <= 3) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (currentPage + 2 >= totalPages) {
            startPage = totalPages - maxVisiblePages + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
    }
    return pageNumbers;
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
        const numSelected = selectedIds.length;
        const numItems = filteredAndSortedReports.length;
        headerCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
    }
  }, [selectedIds, filteredAndSortedReports]);

  useEffect(() => {
    if (pdfRenderData && pdfRef.current) {
        const generate = async () => {
            const studentName = pdfRenderData.student.name;
            const period = pdfRenderData.report.period.replace(/ /g, '_');
            const filename = `${studentName}_${period}_리포트.pdf`;
            
            try {
                await generateReportAsPdf(pdfRef.current, filename);
            } catch (error) {
                console.error(error);
                alert('PDF 생성에 실패했습니다.');
            } finally {
                setPdfLoadingId(null);
                setPdfRenderData(null);
            }
        };
        
        const timer = setTimeout(() => {
           generate();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [pdfRenderData]);

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
  
  const handleBulkReportsCreated = (newReports: MonthlyReport[]) => {
    setMonthlyReports(prevReports => {
        const existingReportIds = new Set(prevReports.map(r => r.id));
        const uniqueNewReports = newReports.filter(r => !existingReportIds.has(r.id));
        return [...prevReports, ...uniqueNewReports];
    });
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

  const handleDownloadPdf = (report: MonthlyReport) => {
    const student = studentMap.get(report.studentId);
    if (!student) {
        console.error("Student not found for report");
        return;
    }
    setPdfLoadingId(report.id);
    const teacherName = teacherMap.get(report.teacherId) || null;
    setPdfRenderData({ report, student, teacherName });
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
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsBulkModalOpen(true)} 
                className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
            >
              월별 리포트 일괄 생성
            </button>
            <button 
                onClick={handleAddNewReport} 
                className="bg-[#E5A823] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              신규 리포트 작성
            </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
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
               <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-[#E5A823] focus:border-[#E5A823] text-sm"
                  />
              </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
               <span className="text-white font-medium text-sm mr-2">{`${selectedIds.length} / ${filteredAndSortedReports.length}개 선택됨`}</span>
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
              {currentTableData.map((report) => {
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
                      <button
                          onClick={() => handleDownloadPdf(report)}
                          disabled={pdfLoadingId === report.id}
                          className="text-gray-300 hover:text-white disabled:text-gray-500 disabled:cursor-wait inline-flex items-center gap-1"
                          aria-label="PDF 다운로드"
                      >
                          <PdfIcon className="w-4 h-4" />
                          {pdfLoadingId === report.id ? '생성중...' : 'PDF'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
         <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="itemsPerPageSelect" className="text-gray-400">페이지당 표시 개수:</label>
            <select
              id="itemsPerPageSelect"
              value={itemsPerPage}
              onChange={e => setItemsPerPage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded-md py-1 pl-2 pr-8 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
              aria-label="페이지당 표시 개수"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="ALL">All</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
              aria-label="첫 페이지로 이동"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
              aria-label="이전 페이지로 이동"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {paginationNumbers.map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors w-9 ${
                  currentPage === pageNumber
                    ? 'bg-[#E5A823] text-gray-900'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
              aria-label="다음 페이지로 이동"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white transition-colors"
              aria-label="마지막 페이지로 이동"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-sm text-gray-400 w-40 text-right">
            총 {filteredAndSortedReports.length}개 중 {`페이지 ${totalPages > 0 ? currentPage : 0} / ${totalPages}`}
          </div>
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

      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
        {pdfRenderData && (
          <div ref={pdfRef}>
              <ReportPDF {...pdfRenderData} />
          </div>
        )}
      </div>

      <BulkReportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onGenerate={handleBulkReportsCreated}
        students={students}
        lessonRecords={lessonRecords}
        monthlyReports={monthlyReports}
        teachers={teachers}
      />
    </div>
  );
};

export default Reports;