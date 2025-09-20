import React, { useState } from 'react';
import Card from '../components/ui/Card';
import type { User } from '../types';

interface MyPageProps {
  user: User;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const MyPage: React.FC<MyPageProps> = ({ user, onChangePassword }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*?_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('비밀번호는 8자 이상이며, 영문, 숫자, 특수기호를 모두 포함해야 합니다.');
            return;
        }


        setIsLoading(true);
        try {
            await onChangePassword(currentPassword, newPassword);
            setSuccess('비밀번호가 성공적으로 변경되었습니다.');
            // Clear fields on success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">내 정보 / 비밀번호 변경</h1>
            
            {user.mustChangePassword && (
                 <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 p-4 rounded-lg mb-6">
                    <h3 className="font-bold">보안 안내</h3>
                    <p>임시 비밀번호로 로그인하셨습니다. 계속하려면 새 비밀번호를 설정해야 합니다.</p>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <Card title="비밀번호 변경">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword"className="block text-sm font-medium text-gray-300">
                                {user.mustChangePassword ? '임시 비밀번호' : '현재 비밀번호'}
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                            />
                        </div>
                         <div>
                            <label htmlFor="newPassword"className="block text-sm font-medium text-gray-300">새 비밀번호</label>
                            <input
                                id="newPassword"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                                aria-describedby="password-criteria"
                            />
                            <ul id="password-criteria" className="mt-2 text-xs text-gray-400 list-disc list-inside space-y-1">
                                <li>최소 8자 이상 입력</li>
                                <li>영문, 숫자, 특수기호(!@#$%^&*?_)를 모두 포함</li>
                            </ul>
                        </div>
                         <div>
                            <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-300">새 비밀번호 확인</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        {success && <p className="text-sm text-green-400">{success}</p>}
                        
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#E5A823] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-500"
                            >
                                {isLoading ? '변경 중...' : '비밀번호 변경'}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default MyPage;