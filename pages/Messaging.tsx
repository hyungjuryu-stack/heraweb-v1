import React, { useState, useMemo, useRef, useEffect } from 'react';
import Card from '../components/ui/Card';
import type { Student, Class } from '../types';
import { KakaoTalkIcon } from '../components/Icons';
import StudentSearchModal from '../components/StudentSearchModal';
import CustomSmsModal, { type SavedMessage } from '../components/CustomSmsModal';

interface MessagingProps {
  students: Student[];
  classes: Class[];
}

type Recipient = {
    id: string; 
    studentId?: number;
    name: string;
    phone: string;
    type: '학생' | '모' | '부' | '비회원';
};

type RecipientStatus = 'success_kakao' | 'success_sms' | 'failed';

type HistoryItem = {
    id: number;
    timestamp: string;
    message: string;
    recipients: (Recipient & { status: RecipientStatus })[];
    finalStatus: 'success' | 'partial_fail' | 'failed';
};


const specialChars = [
  '•', '#', '&', '*', '@', '●', '★', '☆', '○', '◎', '◇', '◆', '□', '■',
  '△', '▲', '▽', '▼', '→', '←', '↑', '↓', '↔', '〓', '◁', '◀', '▷', '▶',
  '♤', '♠', '♡', '♥', '♧', '♣', '⊙', '◈', '▣', '◐', '◑', '▒', '▤', '▥',
  '▨', '▧', '▦', '▩', 'ⓒ', '㈜', '™'
];

const MessagePreviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    message: string;
    recipients: Recipient[];
}> = ({ isOpen, onClose, message, recipients }) => {
    if (!isOpen) return null;

    const sampleRecipientName = recipients.length > 0 ? recipients[0].name.replace(' 어머님', '').replace(' 아버님', '') : '김민준';
    const previewMessage = message.replace(/#\{원생명\}/g, sampleRecipientName);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-900 border-4 border-gray-700 rounded-3xl p-2 shadow-2xl">
                    <div className="bg-gray-800 rounded-2xl p-4 min-h-[400px]">
                        <p className="text-sm text-gray-400 text-center mb-4">오늘 오후 2:30</p>
                        <div className="bg-gray-700 p-3 rounded-lg max-w-xs">
                            <p className="text-white text-sm whitespace-pre-wrap">{previewMessage}</p>
                        </div>
                    </div>
                     <div className="mt-4 flex justify-center">
                        <button onClick={onClose} className="py-2 px-6 rounded-lg bg-[#E5A823] text-gray-900 font-bold">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SmsSenderViewProps {
    students: Student[];
    classes: Class[];
    selectedRecipients: Recipient[];
    setSelectedRecipients: React.Dispatch<React.SetStateAction<Recipient[]>>;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    onSend: (recipients: Recipient[], message: string) => void;
    sendStatus: 'idle' | 'sending' | 'success' | 'failed';
    sendError: string | null;
}

const SmsSenderView: React.FC<SmsSenderViewProps> = ({ students, classes, selectedRecipients, setSelectedRecipients, message, setMessage, onSend, sendStatus, sendError }) => {
    
    const [isStudentSearchModalOpen, setIsStudentSearchModalOpen] = useState(false);
    const [directInput, setDirectInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [byteCount, setByteCount] = useState(0);
    const [recipientTypeFilters, setRecipientTypeFilters] = useState({
        '모': true,
        '부': false,
        '학생': false,
        '비회원': false
    });

    const [attachments, setAttachments] = useState<(File | null)[]>([null, null, null]);
    const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
    const [isCustomSmsModalOpen, setIsCustomSmsModalOpen] = useState(false);
    const [customSmsModalMode, setCustomSmsModalMode] = useState<'save' | 'load'>('load');

    const [checkedRecipientIds, setCheckedRecipientIds] = useState(new Set<string>());
    const recipientHeaderCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const calculateBytes = (str: string) => {
            let count = 0;
            for (let i = 0; i < str.length; i++) {
                const charCode = str.charCodeAt(i);
                if (charCode <= 127) {
                    count += 1;
                } else {
                    count += 2;
                }
            }
            return count;
        };
        setByteCount(calculateBytes(message));
    }, [message]);

    const tableRecipients = useMemo(() => {
        return selectedRecipients.sort((a,b) => a.name.localeCompare(b.name));
    }, [selectedRecipients]);

    useEffect(() => {
        if (recipientHeaderCheckboxRef.current) {
            const numSelected = checkedRecipientIds.size;
            const numItems = tableRecipients.length;
            recipientHeaderCheckboxRef.current.checked = numSelected === numItems && numItems > 0;
            recipientHeaderCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numItems;
        }
    }, [checkedRecipientIds, tableRecipients]);


    const handleFilterChange = (type: keyof typeof recipientTypeFilters, checked: boolean) => {
        setRecipientTypeFilters(prev => ({ ...prev, [type]: checked }));
        if (!checked) {
            const typeMap: Record<keyof typeof recipientTypeFilters, Recipient['type'] | null> = {
                '모': '모',
                '부': '부',
                '학생': '학생',
                '비회원': '비회원'
            };
            const typeToRemove = typeMap[type];
            if(typeToRemove) {
                 setSelectedRecipients(prev => prev.filter(r => r.type !== typeToRemove));
            }
        }
    };

    const handleAddStudents = (newStudents: Student[]) => {
        const newRecipients: Recipient[] = [];
        newStudents.forEach(student => {
            if (recipientTypeFilters['모'] && student.motherPhone) {
                newRecipients.push({ id: `m-${student.id}`, studentId: student.id, name: `${student.name} 어머님`, type: '모', phone: student.motherPhone.replace(/-/g, '') });
            }
            if (recipientTypeFilters['부'] && student.fatherPhone) {
                newRecipients.push({ id: `f-${student.id}`, studentId: student.id, name: `${student.name} 아버님`, type: '부', phone: student.fatherPhone.replace(/-/g, '') });
            }
            if (recipientTypeFilters['학생'] && student.studentPhone) {
                newRecipients.push({ id: `s-${student.id}`, studentId: student.id, name: student.name, type: '학생', phone: student.studentPhone.replace(/-/g, '') });
            }
        });

        setSelectedRecipients(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const uniqueNewRecipients = newRecipients.filter(r => !existingIds.has(r.id));
            return [...prev, ...uniqueNewRecipients];
        });
    };
    
    const handleAddDirect = () => {
        const phone = directInput.replace(/-/g, '').trim();
        if (/^\d{10,11}$/.test(phone)) {
            const newRecipient: Recipient = { id: `d-${phone}`, phone, name: '직접입력', type: '비회원' };
            if (!selectedRecipients.some(r => r.id === newRecipient.id)) {
                setSelectedRecipients(prev => [...prev, newRecipient]);
            }
            setDirectInput('');
        } else {
            alert('올바른 휴대폰 번호를 입력해주세요.');
        }
    };

    const handleInsertText = (text: string) => {
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            setMessage(prev => prev.substring(0, start) + text + prev.substring(end));
            textareaRef.current.focus();
            setTimeout(() => textareaRef.current?.setSelectionRange(start + text.length, start + text.length), 0);
        }
    };

    const handleSelectAllRecipients = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setCheckedRecipientIds(new Set(tableRecipients.map(r => r.id)));
        } else {
            setCheckedRecipientIds(new Set());
        }
    };

    const handleSelectRecipient = (id: string) => {
        setCheckedRecipientIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDeleteSelectedRecipients = () => {
        setSelectedRecipients(prev => prev.filter(r => !checkedRecipientIds.has(r.id)));
        setCheckedRecipientIds(new Set());
    };

    // Attachment Handlers
    const triggerFileInput = (index: number) => fileInputRefs[index].current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            setAttachments(prev => {
                const newAttachments = [...prev];
                newAttachments[index] = e.target.files![0];
                return newAttachments;
            });
        }
    };
    const handleDeleteAttachment = (index: number) => {
        setAttachments(prev => {
            const newAttachments = [...prev];
            newAttachments[index] = null;
            return newAttachments;
        });
    };

    // Save/Load Message Handlers
    const handleOpenCustomSmsModal = (mode: 'save' | 'load') => {
        setCustomSmsModalMode(mode);
        setIsCustomSmsModalOpen(true);
    };
    const handleSaveMessage = (title: string) => {
        if (savedMessages.some(m => m.title === title)) {
            alert('이미 존재하는 제목입니다.');
            return;
        }
        setSavedMessages(prev => [...prev, { title, content: message }]);
        setIsCustomSmsModalOpen(false);
    };
    const handleLoadMessage = (content: string) => {
        setMessage(content);
        setIsCustomSmsModalOpen(false);
    };
    const handleDeleteMessage = (title: string) => {
        setSavedMessages(prev => prev.filter(m => m.title !== title));
    };
    
    // Clear/Reset Handlers
    const handleClearMessage = () => setMessage(''); // 초기화
    const handleResetAll = () => { // 새로쓰기
        setMessage('');
        setSelectedRecipients([]);
        setAttachments([null, null, null]);
        setDirectInput('');
    };


    return (
        <>
            <div className="grid grid-cols-12 gap-4 h-full">
                <div className="col-span-12 md:col-span-4 h-full">
                    <Card className="h-full flex flex-col">
                        <div className="flex justify-between items-center border-b border-gray-700/50 pb-3 mb-3">
                            <h3 className="text-base font-bold text-[#E5A823]">발송대상</h3>
                            <span className="text-sm font-medium text-gray-300">받는 사람: 총 {selectedRecipients.length}명</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <input value={directInput} onChange={e => setDirectInput(e.target.value)} type="text" placeholder="휴대폰(-없이) 입력" className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-1.5 text-white text-sm disabled:bg-gray-800 disabled:cursor-not-allowed" disabled={!recipientTypeFilters['비회원']} />
                            <button onClick={handleAddDirect} className="bg-[#4A5568] text-white font-bold py-1.5 px-4 rounded-lg hover:bg-gray-600 text-sm disabled:bg-gray-700 disabled:cursor-not-allowed" disabled={!recipientTypeFilters['비회원']}>추가</button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <button className="flex-1 bg-gray-700 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-gray-600 text-sm">엑셀양식다운로드</button>
                            <button className="flex-1 bg-gray-700 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-gray-600 text-sm">엑셀업로드</button>
                            <button onClick={() => setIsStudentSearchModalOpen(true)} className="flex-1 bg-gray-700 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-gray-600 text-sm">원생검색</button>
                            <button className="flex-1 bg-gray-700 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-gray-600 text-sm">주소록</button>
                        </div>
                        <div className="flex items-center justify-between gap-2 p-2 bg-gray-800/50 rounded-lg my-2 text-sm">
                            <button onClick={handleDeleteSelectedRecipients} className="text-white hover:text-red-400 disabled:text-gray-600" disabled={checkedRecipientIds.size === 0}>선택삭제</button>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">대상일괄선택:</span>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={recipientTypeFilters['부']} onChange={e => handleFilterChange('부', e.target.checked)} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded"/> 부</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={recipientTypeFilters['모']} onChange={e => handleFilterChange('모', e.target.checked)} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded"/> 모</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={recipientTypeFilters['학생']} onChange={e => handleFilterChange('학생', e.target.checked)} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded"/> 원생</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={recipientTypeFilters['비회원']} onChange={e => handleFilterChange('비회원', e.target.checked)} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded"/> 비회원</label>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto border-t border-b border-gray-700">
                            <table className="min-w-full text-sm">
                                <thead className="sticky top-0 bg-[#1A3A32]">
                                    <tr className="border-b border-gray-600">
                                        <th className="p-1 w-8"><input ref={recipientHeaderCheckboxRef} onChange={handleSelectAllRecipients} type="checkbox" className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded"/></th>
                                        <th className="p-1 text-left">이름</th>
                                        <th className="p-1 text-center">구분</th>
                                        <th className="p-1 text-left">휴대폰</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {tableRecipients.map((r) => (
                                        <tr key={r.id}>
                                            <td className="p-1"><input type="checkbox" checked={checkedRecipientIds.has(r.id)} onChange={() => handleSelectRecipient(r.id)} className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded"/></td>
                                            <td className="p-1">{r.name}</td>
                                            <td className="p-1 text-center">{r.type}</td>
                                            <td className="p-1">{r.phone}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-5 h-full">
                    <Card className="h-full flex flex-col">
                        <h3 className="text-base font-bold text-[#E5A823] border-b border-gray-700/50 pb-3 mb-3">문자</h3>
                        <div className="flex-grow flex flex-col space-y-3">
                            <div className="flex items-center gap-2">
                                <label htmlFor="sender-id" className="text-sm font-medium text-gray-300 whitespace-nowrap">발신번호</label>
                                <select id="sender-id" className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-1.5 text-white text-sm">
                                    <option>053-746-0916</option>
                                </select>
                            </div>
                            <textarea ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)} className="flex-grow w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white resize-none" />
                            <div className="text-right text-xs text-gray-400">바이트수 : {byteCount} byte</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleOpenCustomSmsModal('load')} className="bg-[#4A5568] text-white py-1.5 px-3 rounded-lg text-sm">문자조회</button>
                                <button onClick={() => handleOpenCustomSmsModal('save')} className="bg-[#4A5568] text-white py-1.5 px-3 rounded-lg text-sm">문자저장</button>
                                <button onClick={handleClearMessage} className="bg-gray-200 text-black py-1.5 px-3 rounded-lg text-sm">초기화</button>
                            </div>
                            <div className="space-y-1 text-sm">
                                {attachments.map((file, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input type="text" value={file?.name || ''} placeholder="사진.jpg" readOnly className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-1 text-gray-400 text-xs"/>
                                        <input type="file" accept="image/*" ref={fileInputRefs[i]} onChange={(e) => handleFileChange(e, i)} className="hidden" />
                                        <button onClick={() => triggerFileInput(i)} className="bg-[#4A5568] text-white text-xs py-1 px-2 rounded-lg">추가</button>
                                        <button onClick={() => handleDeleteAttachment(i)} className="bg-gray-200 text-black text-xs py-1 px-2 rounded-lg">삭제</button>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-700 pt-3">
                                <p className="text-sm font-semibold mb-2">발송일시</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="sendTime" defaultChecked className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600"/> 즉시발송</label>
                                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="sendTime" className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600"/> 예약발송</label>
                                    <input type="date" className="bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-xs"/>
                                    <input type="time" className="bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-xs"/>
                                </div>
                            </div>
                        </div>

                        {sendStatus === 'failed' && sendError && (
                            <div className="mt-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-sm">
                                <p className="font-bold text-red-300">메시지 발송 실패</p>
                                <p className="text-red-400 mt-2 whitespace-pre-wrap">{sendError}</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-700 mt-4">
                            <button onClick={() => setIsPreviewModalOpen(true)} className="bg-gray-200 text-black py-2 px-4 rounded-lg text-sm font-bold">미리보기</button>
                            <button onClick={handleResetAll} className="bg-gray-200 text-black py-2 px-4 rounded-lg text-sm font-bold">새로쓰기</button>
                            <button onClick={() => onSend(selectedRecipients, message)} disabled={sendStatus === 'sending' || selectedRecipients.length === 0 || !message.trim()} className="bg-[#4A5568] text-white py-2 px-4 rounded-lg text-sm font-bold disabled:bg-gray-700 disabled:cursor-not-allowed">보내기</button>
                        </div>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-3 h-full">
                    <Card className="h-full">
                        <h3 className="text-base font-bold text-[#E5A823] border-b border-gray-700/50 pb-3 mb-3">설정</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2">치환어</h4>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleInsertText('#{원생명}')} className="text-xs bg-gray-700 text-white font-medium py-1 px-2 rounded-md hover:bg-gray-600">#&#123;원생명&#125;</button>
                                    <button onClick={() => handleInsertText('#{학원명}')} className="text-xs bg-gray-700 text-white font-medium py-1 px-2 rounded-md hover:bg-gray-600">#&#123;학원명&#125;</button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2">광고문자</h4>
                                <p className="text-xs text-gray-400 mb-2">* 광고 및 스팸메시지에 대한 책임은 학원에 있으며...</p>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded"/> 080수신거부</label>
                                <button className="mt-2 w-full bg-[#4A5568] text-white py-1.5 px-3 rounded-lg text-sm">수신거부관리</button>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2">특수문자</h4>
                                <div className="grid grid-cols-8 gap-1 p-2 bg-gray-800/50 rounded-lg">
                                    {specialChars.map(char => (
                                        <button key={char} onClick={() => handleInsertText(char)} className="text-center rounded hover:bg-gray-600 aspect-square">{char}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
             <StudentSearchModal
                isOpen={isStudentSearchModalOpen}
                onClose={() => setIsStudentSearchModalOpen(false)}
                onAddStudents={handleAddStudents}
                allStudents={students}
                classes={classes}
            />
            <MessagePreviewModal 
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                message={message}
                recipients={selectedRecipients}
            />
             <CustomSmsModal
                isOpen={isCustomSmsModalOpen}
                onClose={() => setIsCustomSmsModalOpen(false)}
                onSave={handleSaveMessage}
                onLoad={handleLoadMessage}
                onDelete={handleDeleteMessage}
                savedMessages={savedMessages}
                mode={customSmsModalMode}
            />
        </>
    );
};

const MessageHistoryView: React.FC<{
    messageHistory: HistoryItem[];
    onResendFailed: (item: HistoryItem) => void;
}> = ({ messageHistory, onResendFailed }) => {
    const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

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
    
    if (messageHistory.length === 0) {
        return <Card><p className="text-center text-gray-400">발송 이력이 없습니다.</p></Card>;
    }
    
    return (
        <div className="space-y-4">
            {messageHistory.map(item => {
                const failedRecipients = item.recipients.filter(r => r.status === 'failed');
                const failedCount = failedRecipients.length;
                const isExpanded = expandedHistoryId === item.id;
                let statusText;
                if (item.finalStatus === 'success') {
                    statusText = '전송 성공';
                } else {
                    statusText = `${failedCount}건 실패`;
                }
                const summaryText = `${item.recipients.length}명 (${statusText})`;
                
                let failedSummary = null;
                if (failedCount > 0) {
                    const failedNamesSummary = failedRecipients.slice(0, 3).map(r => `${r.name}(${r.type})`).join(', ');
                    failedSummary = (
                        <p className="text-xs text-yellow-400 mt-1 truncate" title={`실패: ${failedRecipients.map(r => `${r.name}(${r.type})`).join(', ')}`}>
                            실패: {failedNamesSummary}{failedCount > 3 ? '...' : ''}
                        </p>
                    );
                }

                return (
                    <Card key={item.id}>
                        <div 
                            className="flex justify-between items-start cursor-pointer"
                            onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                        >
                            <div className="flex-grow min-w-0 pr-4">
                                <p className="text-sm text-gray-400">{item.timestamp}</p>
                                <p className="text-gray-200 mt-2 truncate" title={item.message}>"{item.message.substring(0, 50)}..."</p>
                            </div>
                            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    item.finalStatus === 'success' ? 'bg-green-500/20 text-green-300' : 
                                    item.finalStatus === 'partial_fail' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                                }`}>{summaryText}</span>
                                {failedSummary}
                                <span className="text-xs text-gray-500 mt-1">{isExpanded ? '▲ 접기' : '▼ 펼치기'}</span>
                            </div>
                        </div>
                        {isExpanded && (
                            <div className="mt-4 pt-3 border-t border-gray-700/50">
                                <h5 className="font-bold text-gray-300 mb-2">전체 메시지 내용:</h5>
                                <div className="bg-gray-800/50 p-2 rounded-md mb-4">
                                    <p className="text-gray-300 whitespace-pre-wrap text-sm">{item.message}</p>
                                </div>
                                <h5 className="font-bold text-gray-300 mb-2">수신자별 발송 현황:</h5>
                                <ul className="space-y-1 max-h-40 overflow-y-auto bg-gray-800/50 p-2 rounded-md">
                                    {item.recipients.map(recipient => (
                                        <li key={recipient.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-300">{recipient.name} ({recipient.type}) - {recipient.phone}</span>
                                            {getStatusBadge(recipient.status)}
                                        </li>
                                    ))}
                                </ul>
                                {(item.finalStatus === 'partial_fail' || item.finalStatus === 'failed') && (
                                   <div className="mt-3 text-right">
                                       <button onClick={() => onResendFailed(item)} className="text-sm bg-red-600 text-white font-bold py-1 px-3 rounded-md hover:bg-red-500">실패 건 재발송</button>
                                   </div>
                                )}
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};


const Messaging: React.FC<MessagingProps> = ({ students, classes }) => {
    const [activeTab, setActiveTab] = useState('sms');
    const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
    const [message, setMessage] = useState('');
    const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');
    const [sendError, setSendError] = useState<string | null>(null);
    const [messageHistory, setMessageHistory] = useState<HistoryItem[]>([]);
    const [balance, setBalance] = useState<number | null>(null);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            setIsBalanceLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                const fakeApiResponse = { balance: 19912 }; 
                setBalance(fakeApiResponse.balance);
            } catch (error) {
                console.error("Failed to fetch message balance:", error);
                setBalance(null);
            } finally {
                setIsBalanceLoading(false);
            }
        };

        fetchBalance();
    }, []);

    const handleSend = async (recipients: Recipient[], message: string) => {
        if (!message.trim() || recipients.length === 0) return;
        setSendStatus('sending');
        setSendError(null);
        
        const uniqueRecipients = Array.from(new Map(recipients.map(r => [r.phone, r])).values());
        
        const webhookUrl = process.env.N8N_WEBHOOK_URL || "https://primary-production-5ba3f.up.railway.app/webhook/6079cd66-0623-44d2-b1fd-e9319d6ad9f4";
        const apiKey = process.env.N8N_API_KEY || "hera-math-secret-key-1234";

        if (!webhookUrl || !apiKey) {
            const errorMessage = "N8N Webhook URL 또는 API Key가 설정되지 않았습니다.";
            console.error(errorMessage);
            setSendError(errorMessage + " Railway와 같은 배포 환경의 Variables 탭에서 환경 변수를 설정해주세요.");
            setSendStatus('failed');
            return;
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ message, recipients: uniqueRecipients }),
            });

            if (!response.ok) {
                let errorText;
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || errorData.error || `서버 응답 오류 (HTTP ${response.status})`;
                } catch {
                    errorText = `서버 응답 오류 (HTTP ${response.status}): ${response.statusText}`;
                }
                throw new Error(errorText);
            }
            
            const sentResults = uniqueRecipients.map(r => {
                const rand = Math.random();
                let status: RecipientStatus = 'failed';
                if (rand < 0.7) status = 'success_kakao';
                else if (rand < 0.95) status = 'success_sms';
                return { ...r, status };
            });

            const failedCount = sentResults.filter(r => r.status === 'failed').length;
            let finalStatus: HistoryItem['finalStatus'] = 'success';
            if (failedCount > 0) {
                finalStatus = failedCount === sentResults.length ? 'failed' : 'partial_fail';
            }

            const newHistoryItem: HistoryItem = {
                id: Date.now(),
                timestamp: new Date().toLocaleString('ko-KR'),
                message,
                recipients: sentResults,
                finalStatus,
            };

            setMessageHistory(prev => [newHistoryItem, ...prev]);
            setSendStatus('success');

            setTimeout(() => {
                setMessage('');
                setSelectedRecipients([]);
                setSendStatus('idle');
            }, 2000);
            
        } catch (error: any) {
            console.error("메시지 발송 오류:", error);
            
            let detailedErrorMessage = `오류 메시지: ${error.message || '알 수 없는 오류가 발생했습니다.'}`;

            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                detailedErrorMessage = '네트워크 요청에 실패했습니다. 이는 보통 다음과 같은 이유로 발생합니다:\n\n' +
                                     '1. 인터넷 연결이 불안정하거나 끊겼을 경우\n' +
                                     '2. 메시지 발송 서버(N8N)가 응답하지 않는 경우 (서버 다운 또는 재시작 중)\n' +
                                     '3. 웹훅(Webhook) URL 또는 API Key 설정이 잘못된 경우\n' +
                                     '4. CORS(Cross-Origin Resource Sharing) 정책 문제: 발송 서버(N8N)에서 이 웹앱의 요청을 허용하도록 설정이 필요할 수 있습니다.\n\n' +
                                     '인터넷 연결과 서버 상태를 확인 후 다시 시도해주세요.';
            } else if (error.name) {
                detailedErrorMessage += `\n오류 타입: ${error.name}`;
            }

            setSendError(detailedErrorMessage);
            setSendStatus('failed');
        }
    };

    const handleResendFailed = (historyItem: HistoryItem) => {
        const failedRecipients = historyItem.recipients.filter(r => r.status === 'failed');
        setSelectedRecipients(failedRecipients);
        setMessage(historyItem.message);
        setActiveTab('sms');
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex border-b border-gray-700">
                    <button onClick={() => setActiveTab('sms')} className={`px-4 py-2 text-base font-semibold ${activeTab === 'sms' ? 'text-[#E5A823] border-b-2 border-[#E5A823]' : 'text-gray-400'}`}>SMS 발송</button>
                    <button onClick={() => setActiveTab('excel')} className={`px-4 py-2 text-base font-semibold ${activeTab === 'excel' ? 'text-[#E5A823] border-b-2 border-[#E5A823]' : 'text-gray-400'}`}>엑셀기반 SMS 발송</button>
                    <button onClick={() => setActiveTab('result')} className={`px-4 py-2 text-base font-semibold ${activeTab === 'result' ? 'text-[#E5A823] border-b-2 border-[#E5A823]' : 'text-gray-400'}`}>메시지 발송결과</button>
                </div>
                 <div className="flex items-center gap-4">
                    <p className="text-sm text-white">문자충전잔액: 
                        {isBalanceLoading ? (
                            <span className="font-bold text-gray-400 animate-pulse">조회 중...</span>
                        ) : balance !== null ? (
                            <span className="font-bold text-[#E5A823]">{balance.toLocaleString()}원</span>
                        ) : (
                            <span className="font-bold text-red-400">조회 실패</span>
                        )}
                    </p>
                    <a 
                        href="https://solapi.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-[#4A5568] text-white font-bold py-1.5 px-4 rounded-lg hover:bg-gray-600 text-sm no-underline"
                    >
                        문자충전하기
                    </a>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {activeTab === 'sms' && (
                    <SmsSenderView 
                        students={students} 
                        classes={classes} 
                        selectedRecipients={selectedRecipients} 
                        setSelectedRecipients={setSelectedRecipients}
                        message={message}
                        setMessage={setMessage}
                        onSend={handleSend}
                        sendStatus={sendStatus}
                        sendError={sendError}
                    />
                )}
                 {activeTab === 'excel' && (
                    <Card><p className="text-center text-gray-400">엑셀 기반 발송 기능은 준비 중입니다.</p></Card>
                )}
                {activeTab === 'result' && (
                    <MessageHistoryView messageHistory={messageHistory} onResendFailed={handleResendFailed} />
                )}
            </div>
        </div>
    );
};

export default Messaging;