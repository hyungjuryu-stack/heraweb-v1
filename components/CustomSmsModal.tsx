import React, { useState } from 'react';
import Card from './ui/Card';

export type SavedMessage = {
    title: string;
    content: string;
};

interface CustomSmsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string) => void;
    onLoad: (content: string) => void;
    onDelete: (title: string) => void;
    savedMessages: SavedMessage[];
    mode: 'save' | 'load';
}

const CustomSmsModal: React.FC<CustomSmsModalProps> = ({ isOpen, onClose, onSave, onLoad, onDelete, savedMessages, mode }) => {
    const [title, setTitle] = useState('');

    const handleSave = () => {
        if (title.trim()) {
            onSave(title.trim());
            setTitle('');
        } else {
            alert('제목을 입력해주세요.');
        }
    };
    
    const handleLoad = (content: string) => {
        onLoad(content);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <Card title={mode === 'save' ? '문자 저장' : '저장된 문자 불러오기'}>
                    {mode === 'save' ? (
                        <div className="space-y-4">
                            <label htmlFor="msg-title" className="block text-sm font-medium text-gray-300">저장할 제목</label>
                            <input
                                id="msg-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                                placeholder="예: 방학 특강 안내"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium">취소</button>
                                <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-[#E5A823] text-gray-900 font-bold">저장</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {savedMessages.length > 0 ? (
                                <ul className="max-h-80 overflow-y-auto space-y-2">
                                    {savedMessages.map(msg => (
                                        <li key={msg.title} className="group flex items-center justify-between p-2 bg-gray-800/50 rounded-md hover:bg-gray-700/50">
                                            <button onClick={() => handleLoad(msg.content)} className="text-left flex-grow">
                                                <p className="font-semibold text-white">{msg.title}</p>
                                                <p className="text-xs text-gray-400 truncate">{msg.content}</p>
                                            </button>
                                            <button onClick={() => onDelete(msg.title)} className="ml-4 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 text-xs font-bold transition-opacity">삭제</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-400 py-4">저장된 문자가 없습니다.</p>
                            )}
                             <div className="flex justify-end pt-4 border-t border-gray-700/50 mt-4">
                                <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium">닫기</button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default CustomSmsModal;
