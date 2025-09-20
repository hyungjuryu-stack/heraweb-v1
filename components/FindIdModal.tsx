import React, { useState } from 'react';
import Card from './ui/Card';

interface FindIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindId: (name: string, phone: string) => Promise<string>;
}

const FindIdModal: React.FC<FindIdModalProps> = ({ isOpen, onClose, onFindId }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [foundId, setFoundId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFoundId(null);
        try {
            const id = await onFindId(name, phone);
            setFoundId(id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setPhone('');
        setError(null);
        setFoundId(null);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <Card title="아이디 찾기">
                    {!foundId ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-gray-400">
                                가입 시 등록한 이름과 연락처를 입력해주세요.
                            </p>
                            <div>
                                <label htmlFor="find-id-name" className="block text-sm font-medium text-gray-300">이름</label>
                                <input
                                    id="find-id-name"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                                />
                            </div>
                            <div>
                                <label htmlFor="find-id-phone" className="block text-sm font-medium text-gray-300">연락처</label>
                                <input
                                    id="find-id-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                    className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                                />
                            </div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={handleClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
                                <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold disabled:bg-gray-600">
                                    {isLoading ? '조회 중...' : '아이디 찾기'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-300">회원님의 아이디는 아래와 같습니다.</p>
                            <div className="bg-gray-800 p-3 rounded-md text-center">
                                <p className="text-lg font-mono tracking-widest text-[#E5A823]">{foundId}</p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button onClick={handleClose} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold">확인</button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default FindIdModal;
