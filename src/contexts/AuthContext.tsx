import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api';

interface User {
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // token 상태 제거: HttpOnly 쿠키 사용 가정
  const [isLoading, setIsLoading] = useState(false); // 초기 로딩 상태를 false로 설정

  // useEffect에서 사용자 정보를 로드 (토큰이 쿠키에 있을 경우)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // verify API가 HttpOnly 쿠키를 사용하여 인증하고 사용자 정보를 반환한다고 가정
        const response = await authAPI.verify();
        setUser(response.data.user);
      } catch (error) {
        // 토큰이 없거나 유효하지 않으면 user를 null로 설정
        setUser(null);
      }
    };
    
    // 앱 로드 시 verify API를 호출하여 기존 세션 확인
    loadUser();
  }, []); // 앱 로드 시 한 번만 실행

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      // 로그인 API 호출: 서버는 성공 시 HttpOnly 쿠키에 토큰을 설정하고 사용자 정보를 반환
      const response = await authAPI.login(username, password);
      setUser(response.data.user);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      // setUser(null); // 로그인 실패 시 user 초기화
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }, []);

  const logout = useCallback(async () => {
    // 로그아웃 API 호출: 서버는 쿠키를 제거
    try {
      await authAPI.logout(); 
    } catch (error) {
      // 서버 측 로그아웃 실패 시에도 클라이언트 상태는 초기화
      console.error('서버 로그아웃 오류:', error);
    }
    setUser(null);
  }, []);

  // Context value를 useMemo로 메모이제이션하여 불필요한 리렌더링 방지
  const value = useMemo(() => ({
    user,
    login,
    logout,
    // isAuthenticated는 user 객체의 유무로 판단
    isAuthenticated: !!user,
    isLoading,
  }), [user, login, logout, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


