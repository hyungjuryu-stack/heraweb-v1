import { useState } from 'react';
import type { User } from '../types';

// Mock user database
// IDs match teacher IDs from useMockData
const users = [
    { id: 'admin-1', password: 'password', teacherId: 1, name: '김원장', role: 'admin' as const },
    { id: 'op-5', password: 'password', teacherId: 5, name: '최직원', role: 'operator' as const },
    { id: 'teacher-2', password: 'password', teacherId: 2, name: '이선생', role: 'teacher' as const },
    { id: 'teacher-3', password: 'password', teacherId: 3, name: '박선생', role: 'teacher' as const },
    { id: 'teacher-4', password: 'password', teacherId: 4, name: '정선생', role: 'teacher' as const },
    { id: 'temp-teacher-3', password: 'temp_password', teacherId: 3, name: '박선생', role: 'teacher' as const },
];

let userPasswords = new Map(users.map(u => [u.id, u.password]));
const MAX_ATTEMPTS = 5;

export const useAuth = () => {
    const [user, setUser] = useState<User | null>({
        id: 'admin-1',
        teacherId: 1,
        name: '김원장',
        role: 'admin',
        mustChangePassword: false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loginAttempts, setLoginAttempts] = useState(new Map<string, number>());

    const clearError = () => setError(null);

    const login = async (id: string, password: string): Promise<void> => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        const currentAttempts = loginAttempts.get(id) || 0;
        if (currentAttempts >= MAX_ATTEMPTS) {
            setLoading(false);
            const lockError = '로그인 시도 횟수를 초과했습니다. 관리자에게 문의하세요.';
            setError(lockError);
            throw new Error(lockError);
        }
        
        const foundUser = users.find(u => u.id === id);
        const storedPassword = userPasswords.get(id);

        if (foundUser && storedPassword === password) {
            const userState: User = {
                id: foundUser.id,
                teacherId: foundUser.teacherId,
                name: foundUser.name,
                role: foundUser.role,
                mustChangePassword: password.startsWith('temp_'),
            };
            setUser(userState);
            loginAttempts.delete(id);
            setLoginAttempts(new Map(loginAttempts));
        } else {
            const newAttempts = currentAttempts + 1;
            loginAttempts.set(id, newAttempts);
            setLoginAttempts(new Map(loginAttempts));
            
            let attemptError: string;
            if (newAttempts >= MAX_ATTEMPTS) {
                attemptError = '로그인 시도 횟수를 초과했습니다. 관리자에게 문의하세요.';
            } else {
                attemptError = `아이디 또는 비밀번호가 일치하지 않습니다. (${newAttempts}/${MAX_ATTEMPTS})`;
            }
            
            setError(attemptError);
            setLoading(false);
            throw new Error(attemptError);
        }
        setLoading(false);
    };

    const logout = () => {
        setUser(null);
    };

    const findId = async (name: string, phone: string): Promise<string> => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));
        // This is a mock implementation. In a real app, you'd check against a DB.
        const foundUser = users.find(u => u.name === name); // Simplified check
        setLoading(false);
        if (foundUser) {
            return foundUser.id;
        } else {
            setError('해당 정보와 일치하는 사용자를 찾을 수 없습니다.');
            throw new Error('해당 정보와 일치하는 사용자를 찾을 수 없습니다.');
        }
    };
    
    const issueTempPassword = async (id: string): Promise<string> => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundUser = users.find(u => u.id === id);
        if (foundUser) {
            const tempPassword = `temp_${Math.random().toString(36).slice(-8)}`;
            userPasswords.set(id, tempPassword);
            setLoading(false);
            return tempPassword;
        } else {
             setLoading(false);
             setError('존재하지 않는 아이디입니다.');
             throw new Error('존재하지 않는 아이디입니다.');
        }
    };
    
    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        if (!user) {
            throw new Error('로그인 상태가 아닙니다.');
        }
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));

        const storedPassword = userPasswords.get(user.id);
        if (storedPassword === currentPassword) {
            userPasswords.set(user.id, newPassword);
            setUser(prevUser => prevUser ? { ...prevUser, mustChangePassword: false } : null);
        } else {
            setError('현재 비밀번호가 일치하지 않습니다.');
            throw new Error('현재 비밀번호가 일치하지 않습니다.');
        }
        setLoading(false);
    };

    return { user, loading, error, login, logout, findId, issueTempPassword, changePassword, clearError };
};