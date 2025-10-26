import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  element: React.ComponentType
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element: Component }) => {
  const { isAuthenticated, isLoading } = useAuth()

  // 로딩 중일 때는 로딩 스피너 표시
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '4px solid #3b82f6',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{
          marginLeft: '12px',
          color: '#6b7280',
          fontSize: '16px'
        }}>인증 확인 중...</span>
      </div>
    )
  }

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // 인증된 경우 해당 컴포넌트 렌더링
  return <Component />
}

export default ProtectedRoute
