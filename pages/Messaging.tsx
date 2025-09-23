import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Student, Class } from '../types';
import { KakaoTalkIcon } from '../components/Icons';

interface MessagingProps {
  students: Student[];
  classes: Class[];
}

type MessageType = 'kakao' | 'sms';
type SendStatus = 'idle' | 'sending' | 'success' | 'partial_fail' | 'failed';

type Recipient = {
    id: string; // unique identifier: e.g., `s${studentId}`, `m${studentId}`, `f${studentId}`, `d${phone}`
    studentId?: number;
    name: string;
    phone: string;
    type: '학생' | '모' | '부' | '직접';
};

type RecipientStatus = 'success_kakao' | 'success_sms' | 'failed';

type HistoryItem = {
    id: number;
    timestamp: string;
    message: string;
    recipients: (Recipient & { status: RecipientStatus })[];
    finalStatus: 'success' | 'partial_fail' | 'failed';
};

const Messaging: React.FC<MessagingProps> = ({ students, classes }) => {
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [sendProgress, setSendProgress] = useState({ total: 0, kakaoSuccess: 0, smsSuccess: 0, failed: 0, statusText: '' });

  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClassId, setFilterClassId] = useState('all');
  
  const [directInputName, setDirectInputName] = useState('');
  const [directInputPhone, setDirectInputPhone] = useState('');

  const [messageHistory, setMessageHistory] = useState<HistoryItem[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const gradeOptions = useMemo(() => ['all', ...Array.from(new Set(students.map(s => s.grade))).sort()], [students]);
  const classOptions = useMemo(() => [
    { id: 'all', name: '전체 반' },
    ...classes.map(c => ({ id: String(c.id), name: c.name })).sort((a,b) => a.name.localeCompare(b.name))
  ], [classes]);
  
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => filterGrade === 'all' || s.grade === filterGrade)
      .filter(s => filterClassId === 'all' || s.regularClassId === Number(filterClassId) || s.advancedClassId === Number(filterClassId))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, filterGrade, filterClassId]);

  const uniqueRecipients = useMemo(() => {
      return Array.from(new Map(selectedRecipients.map(item => [item.phone, item])).values());
  }, [selectedRecipients]);

  const handleRecipientToggle = (student: Student, type: '학생' | '모' | '부') => {
      let phone = '';
      let name = '';
      let id = '';

      switch(type) {
          case '학생': phone = student.studentPhone; name = student.name; id = `s${student.id}`; break;
          case '모': phone = student.motherPhone; name = student.motherName; id = `m${student.id}`; break;
          case '부': phone = student.fatherPhone; name = student.fatherName; id = `f${student.id}`; break;
      }
      
      if (!phone) return;

      const newRecipient: Recipient = { id, studentId: student.id, name, phone, type };

      setSelectedRecipients(prev => {
          const isSelected = prev.some(r => r.id === id);
          if (isSelected) {
              return prev.filter(r => r.id !== id);
          } else {
              return [...prev, newRecipient];
          }
      });
  };

  const handleAddDirectRecipient = () => {
    const phone = directInputPhone.trim();
    if (!phone) return;
    const newRecipient: Recipient = {
        id: `d${phone}`,
        name: directInputName.trim() || '직접입력',
        phone,
        type: '직접'
    };
    if (!selectedRecipients.some(r => r.id === newRecipient.id)) {
        setSelectedRecipients(prev => [...prev, newRecipient]);
    }
    setDirectInputName('');
    setDirectInputPhone('');
  };
  
  const handleSelectAllFiltered = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          const allRecipients: Recipient[] = [];
          filteredStudents.forEach(s => {
              if (s.motherPhone) allRecipients.push({ id: `m${s.id}`, studentId: s.id, name: s.motherName, phone: s.motherPhone, type: '모' });
              if (s.fatherPhone) allRecipients.push({ id: `f${s.id}`, studentId: s.id, name: s.fatherName, phone: s.fatherPhone, type: '부' });
              if (s.studentPhone) allRecipients.push({ id: `s${s.id}`, studentId: s.id, name: s.name, phone: s.studentPhone, type: '학생' });
          });
          setSelectedRecipients(Array.from(new Map(allRecipients.map(r => [r.id, r])).values()));
      } else {
          setSelectedRecipients([]);
      }
  };


  const handleInsertPlaceholder = (placeholder: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setMessage(prev => prev.substring(0, start) + placeholder + prev.substring(end));
      textareaRef.current.focus();
      setTimeout(() => textareaRef.current?.setSelectionRange(start + placeholder.length, start + placeholder.length), 0);
    }
  };
  
  const handleSend = async () => {
    if (!message.trim() || uniqueRecipients.length === 0) return;
    setSendStatus('sending');
    const total = uniqueRecipients.length;
    setSendProgress({ total, kakaoSuccess: 0, smsSuccess: 0, failed: 0, statusText: '카카오톡 발송 시작...' });
    
    let kakaoFailedRecipients: Recipient[] = [];
    const sentResults: (Recipient & { status: RecipientStatus })[] = [];

    // Step 1: Send KakaoTalk
    for (const recipient of uniqueRecipients) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call latency
        if (Math.random() > 0.3) { // 70% success rate for Kakao
            setSendProgress(prev => ({...prev, kakaoSuccess: prev.kakaoSuccess + 1, statusText: `${recipient.name}님에게 카카오톡 발송 성공`}));
            sentResults.push({ ...recipient, status: 'success_kakao' });
        } else {
            kakaoFailedRecipients.push(recipient);
            setSendProgress(prev => ({...prev, statusText: `${recipient.name}님 카카오톡 발송 실패, SMS 재시도 예정`}));
        }
    }

    // Step 2: Retry with SMS for failed ones
    if (kakaoFailedRecipients.length > 0) {
        setSendProgress(prev => ({ ...prev, statusText: `${kakaoFailedRecipients.length}건 SMS로 재발송...` }));
        for (const recipient of kakaoFailedRecipients) {
            await new Promise(resolve => setTimeout(resolve, 100));
             if (Math.random() > 0.1) { // 90% success rate for SMS
                setSendProgress(prev => ({...prev, smsSuccess: prev.smsSuccess + 1, statusText: `${recipient.name}님에게 SMS 발송 성공`}));
                sentResults.push({ ...recipient, status: 'success_sms' });
            } else {
                setSendProgress(prev => ({...prev, failed: prev.failed + 1, statusText: `${recipient.name}님 SMS 발송 실패`}));
                sentResults.push({ ...recipient, status: 'failed' });
            }
        }
    }
    
    // Step 3: Finalize
    const finalFailedCount = sentResults.filter(r => r.status === 'failed').length;
    let finalStatus: HistoryItem['finalStatus'] = 'success';
    if(finalFailedCount > 0) {
        finalStatus = finalFailedCount === total ? 'failed' : 'partial_fail';
    }
    
    const newHistoryItem: HistoryItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('ko-KR'),
        message,
        recipients: sentResults,
        finalStatus,
    };
    setMessageHistory(prev => [newHistoryItem, ...prev]);
    
    const successCount = sentResults.filter(r => r.status.startsWith('success')).length;
    setSendProgress(prev => ({ ...prev, statusText: `발송 완료! (성공 ${successCount}, 실패 ${finalFailedCount})` }));
    setSendStatus(finalStatus === 'success' ? 'success' : 'failed'); // Simplified to success/failed for UI feedback

    setTimeout(() => {
        setSendStatus('idle');
        setMessage('');
        setSelectedRecipients([]);
    }, 3000);
  };

  const handleResendFailed = (historyItem: HistoryItem) => {
      const failedRecipients = historyItem.recipients.filter(r => r.status === 'failed');
      setSelectedRecipients(failedRecipients);
      setMessage(historyItem.message);
  };
  
  const previewMessage = useMemo(() => {
      if(uniqueRecipients.length === 0) return "학생을 선택하면 미리보기가 표시됩니다.";
      const sampleRecipient = uniqueRecipients[0];
      const sampleStudent = students.find(s => s.id === sampleRecipient.studentId);
      
      return message
          .replace(/{학생이름}/g, sampleStudent?.name || sampleRecipient.name)
          .replace(/{학부모이름}/g, sampleStudent?.motherName || sampleRecipient.name);
  }, [message, uniqueRecipients, students]);

  const getStatusBadge = (status: RecipientStatus) => {
    switch(status) {
        case 'success_kakao':
            return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#FEE500]/30 text-[#FEE500]">카카오톡 성공</span>;
        case 'success_sms':
            return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-300">문자 성공</span>;
        case 'failed':
            return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-300">발송 실패</span>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">문자 발송</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[75vh]">
        {/* Left Column: Recipient Selection */}
        <div className="flex flex-col h-full">
          <Card title="발송 대상 선택" className="flex-grow flex flex-col">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <select onChange={e => setFilterGrade(e.target.value)} value={filterGrade} className="bg-gray-800 border border-gray-600 rounded-md p-2 text-white text-sm focus:ring-[#E5A823] focus:border-[#E5A823] w-full sm:w-auto">
                {gradeOptions.map(g => <option key={g} value={g}>{g === 'all' ? '전체 학년' : g}</option>)}
              </select>
              <select onChange={e => setFilterClassId(e.target.value)} value={filterClassId} className="bg-gray-800 border border-gray-600 rounded-md p-2 text-white text-sm focus:ring-[#E5A823] focus:border-[#E5A823] w-full sm:w-auto">
                {classOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
             <div className="p-2 bg-gray-900/50 rounded-lg mb-4 flex items-center gap-2">
                <input type="text" value={directInputName} onChange={e => setDirectInputName(e.target.value)} placeholder="이름 (선택)" className="bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-xs w-24"/>
                <input type="tel" value={directInputPhone} onChange={e => setDirectInputPhone(e.target.value)} placeholder="직접 연락처 입력" className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-xs"/>
                <button onClick={handleAddDirectRecipient} className="bg-gray-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-gray-500 text-xs">추가</button>
            </div>
            <div className="flex-grow overflow-y-auto border-t border-b border-gray-700">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-[#1A3A32]">
                  <tr className="border-b border-gray-600">
                    <th className="p-2 w-10"><input type="checkbox" onChange={handleSelectAllFiltered} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600" /></th>
                    <th className="p-2 text-left text-xs font-bold text-gray-300">학생</th>
                    <th className="p-2 text-center text-xs font-bold text-gray-300">발송 대상</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-800/40">
                      <td></td>
                      <td className="p-2 text-sm">
                        <div className="font-semibold text-white">{student.name}</div>
                        <div className="text-xs text-gray-400">{student.grade} / {student.school}</div>
                      </td>
                      <td className="p-2 text-xs text-gray-400">
                        <div className="flex justify-center items-center gap-3">
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" disabled={!student.studentPhone} checked={selectedRecipients.some(r => r.id === `s${student.id}`)} onChange={() => handleRecipientToggle(student, '학생')} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600" /> 학생</label>
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" disabled={!student.motherPhone} checked={selectedRecipients.some(r => r.id === `m${student.id}`)} onChange={() => handleRecipientToggle(student, '모')} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600" /> 모</label>
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" disabled={!student.fatherPhone} checked={selectedRecipients.some(r => r.id === `f${student.id}`)} onChange={() => handleRecipientToggle(student, '부')} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-600" /> 부</label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-2 text-sm text-gray-400">{filteredStudents.length}명 중 {uniqueRecipients.length}명에게 발송</div>
          </Card>
        </div>

        {/* Right Column: Composer & History */}
        <div className="flex flex-col h-full gap-6">
          <Card title="메시지 작성" className="flex flex-col">
            <div className="flex-grow flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={() => handleInsertPlaceholder('{학생이름}')} className="text-xs bg-gray-600 text-white font-medium py-1 px-2 rounded-md hover:bg-gray-500">+ 학생이름</button>
                <button onClick={() => handleInsertPlaceholder('{학부모이름}')} className="text-xs bg-gray-600 text-white font-medium py-1 px-2 rounded-md hover:bg-gray-500">+ 학부모이름</button>
              </div>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="전송할 메시지를 입력하세요..."
                className="w-full flex-grow bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823] resize-none h-32"
              />
              <div className="bg-gray-900/50 p-3 rounded-lg flex-shrink-0">
                  <h4 className="text-sm font-bold text-[#E5A823] mb-2">미리보기</h4>
                  <p className="text-xs text-gray-400 whitespace-pre-wrap">{previewMessage}</p>
              </div>
            </div>
             <p className="text-xs text-gray-500 text-center mt-2">카카오톡으로 발송되며, 실패 시 일반 문자로 자동 전환됩니다.</p>
            {sendStatus !== 'idle' && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm text-center font-semibold text-yellow-400">{sendProgress.statusText}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(sendProgress.kakaoSuccess + sendProgress.smsSuccess) / sendProgress.total * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400 text-center">성공 {sendProgress.kakaoSuccess + sendProgress.smsSuccess} / 실패 {sendProgress.failed} / 전체 {sendProgress.total}</div>
                </div>
            )}
            <div className="mt-4 flex justify-end items-center">
              <button
                onClick={handleSend}
                disabled={!message.trim() || uniqueRecipients.length === 0 || sendStatus !== 'idle'}
                className="py-2 px-4 rounded-lg bg-yellow-500 text-black font-bold flex items-center gap-2 hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <KakaoTalkIcon className="w-5 h-5" /> {uniqueRecipients.length}명에게 발송하기
              </button>
            </div>
          </Card>
          <Card title="발송 이력" className="flex-grow flex flex-col">
              <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                  {messageHistory.length === 0 && <p className="text-sm text-gray-500 text-center py-4">발송 이력이 없습니다.</p>}
                  {messageHistory.map(item => {
                      const failedCount = item.recipients.filter(r => r.status === 'failed').length;
                      const isExpanded = expandedHistoryId === item.id;
                      return (
                        <div key={item.id} className="bg-gray-800/50 p-3 rounded-lg text-sm">
                            <div 
                                className="flex justify-between items-start cursor-pointer"
                                onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                            >
                                <div>
                                    <p className="text-xs text-gray-400">{item.timestamp}</p>
                                    <p className="text-gray-200 mt-2 truncate" title={item.message}>"{item.message.substring(0, 30)}..."</p>
                                </div>
                                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        item.finalStatus === 'success' ? 'bg-green-500/20 text-green-300' : 
                                        item.finalStatus === 'partial_fail' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                                    }`}>{item.recipients.length}명 ({item.finalStatus === 'success' ? '성공' : `${failedCount}건 실패`})</span>
                                    <span className="text-xs text-gray-500">{isExpanded ? '▲ 접기' : '▼ 펼치기'}</span>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="mt-4 pt-3 border-t border-gray-700/50">
                                    <h5 className="font-bold text-gray-300 mb-2">전체 메시지 내용:</h5>
                                    <div className="bg-gray-900/50 p-2 rounded-md mb-4">
                                        <p className="text-gray-300 whitespace-pre-wrap text-xs">{item.message}</p>
                                    </div>
                                    <h5 className="font-bold text-gray-300 mb-2">수신자별 발송 현황:</h5>
                                    <ul className="space-y-1 max-h-40 overflow-y-auto bg-gray-900/50 p-2 rounded-md">
                                        {item.recipients.map(recipient => (
                                            <li key={recipient.id} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-300">{recipient.name} ({recipient.type})</span>
                                                {getStatusBadge(recipient.status)}
                                            </li>
                                        ))}
                                    </ul>
                                    {(item.finalStatus === 'partial_fail' || item.finalStatus === 'failed') && (
                                       <div className="mt-3 text-right">
                                           <button onClick={() => handleResendFailed(item)} className="text-xs bg-red-600 text-white font-bold py-1 px-2 rounded-md hover:bg-red-500">실패 건 재발송</button>
                                       </div>
                                    )}
                                </div>
                            )}
                        </div>
                      );
                  })}
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
