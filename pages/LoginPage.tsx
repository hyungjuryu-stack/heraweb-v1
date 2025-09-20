import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Logo from '../components/Logo';
import FindIdModal from '../components/FindIdModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';

interface LoginPageProps {
    auth: ReturnType<typeof useAuth>;
}

const LoginPage: React.FC<LoginPageProps> = ({ auth }) => {
    const { login, findId, issueTempPassword, loading, error, clearError } = auth;
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isFindIdModalOpen, setIsFindIdModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(id, password);
        } catch (err) {
            console.error(err);
        }
    };
    
    const isLocked = !!error?.includes('초과했습니다');

    return (
        <div className="min-h-screen bg-[#0d211c] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Logo />
                <Card className="mt-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-300">아이디</label>
                            <input
                                id="id"
                                type="text"
                                value={id}
                                onChange={e => {
                                    setId(e.target.value);
                                    if(error) clearError();
                                }}
                                required
                                disabled={isLocked}
                                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-300">비밀번호</label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    disabled={isLocked}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 pr-10 text-white focus:ring-[#E5A823] focus:border-[#E5A823] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || isLocked}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#E5A823] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {loading ? '로그인 중...' : '로그인'}
                            </button>
                        </div>

                        <div className="text-sm text-center">
                            <button type="button" onClick={() => setIsFindIdModalOpen(true)} className="font-medium text-yellow-500 hover:text-yellow-400">아이디 찾기</button>
                            <span className="text-gray-500 mx-2">|</span>
                            <button type="button" onClick={() => setIsForgotPasswordModalOpen(true)} className="font-medium text-yellow-500 hover:text-yellow-400">비밀번호 찾기</button>
                        </div>
                    </form>
                </Card>
            </div>

            <FindIdModal 
                isOpen={isFindIdModalOpen}
                onClose={() => setIsFindIdModalOpen(false)}
                onFindId={findId}
            />

            <ForgotPasswordModal 
                isOpen={isForgotPasswordModalOpen}
                onClose={() => setIsForgotPasswordModalOpen(false)}
                onIssuePassword={issueTempPassword}
            />
        </div>
    );
};

export default LoginPage;