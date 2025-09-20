import React, { useState } from 'react';
import Card from './ui/Card';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssuePassword: (id: string) => Promise<string>;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onIssuePassword }) => {
    const [id, setId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setTempPassword(null);
        try {
            const newPassword = await onIssuePassword(id);
            setTempPassword(newPassword);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setId('');
        setError(null);
        setTempPassword(null);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose} role="dialog" aria-modal="true">
            <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <Card title="비밀번호 찾기">
                    {!tempPassword ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-gray-400">
                                아이디를 입력하시면 임시 비밀번호를 발급해드립니다.
                            </p>
                            <div>
                                <label htmlFor="forgot-id" className="block text-sm font-medium text-gray-300">아이디</label>
                                <input
                                    id="forgot-id"
                                    type="text"
                                    value={id}
                                    onChange={e => setId(e.target.value)}
                                    required
                                    className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                                />
                            </div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={handleClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">취소</button>
                                <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold disabled:bg-gray-600">
                                    {isLoading ? '발급 중...' : '임시 비밀번호 발급'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-300">임시 비밀번호가 발급되었습니다.</p>
                            <div className="bg-gray-800 p-3 rounded-md text-center">
                                <p className="text-lg font-mono tracking-widest text-[#E5A823]">{tempPassword}</p>
                            </div>
                            <p className="text-sm text-gray-400">이 비밀번호로 로그인한 후, 즉시 비밀번호를 변경해주세요.</p>
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

export default ForgotPasswordModal;
