import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import LoginModal from './LoginModal'
import LoadScene from './LoadScene'

interface AppLayoutProps {
  darkMode: boolean
  toggleDarkMode: () => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  isFirstVisit: boolean
}

const AppLayout: React.FC<AppLayoutProps> = ({
  darkMode,
  toggleDarkMode,
  showLoginModal,
  setShowLoginModal,
  isFirstVisit
}) => {

  // 간단한 로딩 스피너 컴포넌트
  const SimpleLoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-cream-50 dark:bg-dark-900 transition-colors duration-300">
      {/* 고정된 왼쪽 사이드바 */}
      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        onLoginClick={() => setShowLoginModal(true)}
      />
      
      {/* 오른쪽 스크롤 가능한 콘텐츠 */}
      <main className="flex-1 ml-0 lg:ml-80 overflow-y-auto">
        <Suspense fallback={isFirstVisit ? <LoadScene /> : <SimpleLoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      
      {/* 로그인 모달 */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  )
}

export default AppLayout
