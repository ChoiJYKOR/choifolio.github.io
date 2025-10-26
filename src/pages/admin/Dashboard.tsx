import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FaSignOutAlt } from 'react-icons/fa'

// 분리된 컴포넌트들 import
import DashboardHome from '@/components/admin/DashboardHome'
import BookManager from '@/components/admin/BookManager'
import VideoLearningManager from '@/components/admin/VideoLearningManager'
import VideoPlaylistManager from '@/components/admin/VideoPlaylistManager'
import ExperienceManager from '@/components/admin/ExperienceManager'
import ProjectManager from '@/components/admin/ProjectManager'
import MessageManager from '@/components/admin/MessageManager'
import SkillsManager from '@/components/admin/SkillsManager'
import CategoryManager from '@/components/admin/CategoryManager'
import NotificationDropdown from '@/components/common/NotificationDropdown'
import RightSidebar from '@/components/common/RightSidebar'
import SiteSettingsEditor from '@/admin/SiteSettingsEditor'
import ToastContainer from '@/components/common/Toast'
import useDataCounts from '@/hooks/useDataCounts'

// 새로운 리팩토링된 훅 import
import { useAdminSidebarState, AdminTab } from '@/hooks/useAdminSidebarState'
import { useToastHelpers } from '@/hooks/useToast'
import { useMessages } from '@/hooks/useMessageManagerData'

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, logout, isLoading } = useAuth()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Toast 시스템 추가
  const { toasts, hideToast } = useToastHelpers()
  
  // 새로운 리팩토링된 상태 관리 훅 사용
  const {
    activeTab,
    setActiveTab,
    activeSettingsSection,
    setActiveSettingsSection,
    bookFilters,
    experienceFilters,
    projectFilters,
  } = useAdminSidebarState()
  
  // 데이터 카운트 훅 사용
  const { counts, refreshCounts } = useDataCounts()
  
  // 🔔 메시지 데이터를 가져와서 알림으로 변환
  const { data: messages = [] } = useMessages()
  
  // 🔔 읽지 않은 메시지를 알림 형태로 변환
  const notifications = useMemo(() => {
    return messages
      .filter(msg => !msg.isRead)
      .map(msg => ({
        id: msg._id || '',
        message: `${msg.name}님으로부터 새로운 메시지: ${msg.subject}`,
        read: false,
        createdAt: msg.createdAt || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // 최신순 정렬
  }, [messages])

  // 🌟 URL state를 통해 전달된 탭과 수정 ID 처리
  useEffect(() => {
    const state = location.state as { tab?: AdminTab; editId?: string } | null
    if (state?.tab) {
      setActiveTab(state.tab)
    }
    // editId는 각 Manager 컴포넌트에서 처리
  }, [location.state, setActiveTab])

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated && !isLoading) {
    return <div>로그인이 필요합니다.</div>
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 탭별 컴포넌트 렌더링 함수
  const renderActiveTabContent = () => {
    // 🌟 location.state에서 editId 추출
    const state = location.state as { tab?: AdminTab; editId?: string } | null
    const editId = state?.editId
    
    switch (activeTab) {
      case 'books':
        return <BookManager 
          bookFilter={bookFilters.state.filter}
          bookSearchTerm={bookFilters.state.searchTerm}
          selectedBookCategory={bookFilters.state.selectedCategory}
          initialEditId={editId}  // 🌟 수정할 서적 ID 전달
        />
      case 'videoLearnings':
        return <VideoLearningManager initialEditId={editId} />  // 🌟 수정할 영상 ID 전달
      case 'videoPlaylists':
        return <VideoPlaylistManager />
      case 'experiences':
        return <ExperienceManager 
          experienceFilter={experienceFilters.state.filter}
          experienceSearchTerm={experienceFilters.state.searchTerm}
          selectedExperienceCompany={experienceFilters.state.selectedCompany}
          selectedExperienceYear={experienceFilters.state.selectedYear}
        />
      case 'projects':
        return <ProjectManager 
          projectFilter={projectFilters.state.filter}
          projectSearchTerm={projectFilters.state.searchTerm}
          selectedProjectCategory={projectFilters.state.selectedCategory}
        />
      case 'messages':
        return <MessageManager />
      case 'skills':
        return <SkillsManager />
      case 'categories':
        return <CategoryManager />
      default: // 'settings'
        // activeSettingsSection이 있으면 SiteSettingsEditor를, 없으면 DashboardHome을 표시
        return activeSettingsSection 
          ? <SiteSettingsEditor activeSection={activeSettingsSection} />
          : <DashboardHome counts={counts} />
    }
  }

  return (
    <>
      {/* Toast 알림 시스템 */}
      <ToastContainer toasts={toasts} onClose={hideToast} />
      
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <div className="flex">
        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              {/* 메인 콘텐츠 영역 */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    관리자 대시보드
                  </h1>
                  <div className="flex items-center gap-4">
                    {/* 알림 드롭다운 - 읽지 않은 메시지 표시 */}
                    <NotificationDropdown
                      notifications={notifications}
                      showNotifications={showNotifications}
                      onToggle={() => setShowNotifications(!showNotifications)}
                      onNotificationClick={() => {
                        setActiveTab('messages')
                        setShowNotifications(false)
                      }}
                    />
                    
                    {/* 로그아웃 버튼 */}
                    <button
                      onClick={logout}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <FaSignOutAlt />
                      로그아웃
                    </button>
                  </div>
                </div>

                {/* 탭 콘텐츠 */}
                {renderActiveTabContent()}
              </div>

              {/* 리팩토링된 RightSidebar 컴포넌트 사용 */}
              <RightSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeSettingsSection={activeSettingsSection}
                setActiveSettingsSection={setActiveSettingsSection}
                counts={counts}
                refreshCounts={refreshCounts}
                bookFilters={bookFilters}
                experienceFilters={experienceFilters}
                projectFilters={projectFilters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default AdminDashboard
