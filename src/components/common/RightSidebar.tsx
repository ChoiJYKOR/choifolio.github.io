import React from 'react'
import { AdminTab, BookFilterGroup, ExperienceFilterGroup, ProjectFilterGroup } from '../../hooks/useAdminSidebarState'

// 분리된 컴포넌트들 import
import BookFilterMenu from './BookFilterMenu'
import ExperienceFilterMenu from './ExperienceFilterMenu'
import ProjectFilterMenu from './ProjectFilterMenu'
import SettingsMenu from './SettingsMenu'

interface DataCounts {
  books: number
  videoLearnings: number
  videoPlaylists: number
  experiences: number
  projects: number
  messages: number
  skills: number
  categories: number
}

interface RightSidebarProps {
  // 탭 관련 props (핵심만)
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void
  activeSettingsSection: string | null
  setActiveSettingsSection: (section: string | null) => void
  
  // 데이터 카운트
  counts: DataCounts
  refreshCounts: () => void
  
  // 필터 그룹들 (각각 하나의 객체로 전달)
  bookFilters: BookFilterGroup
  experienceFilters: ExperienceFilterGroup
  projectFilters: ProjectFilterGroup
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  activeSettingsSection,
  setActiveSettingsSection, 
  counts,
  refreshCounts,
  bookFilters,
  experienceFilters,
  projectFilters,
}) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
      <div className="sticky top-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          빠른 메뉴
        </h3>

        {/* 관리자 대시보드 홈 버튼 */}
        <div className="mb-8">
          <button
            onClick={() => {
              setActiveTab('settings')
              setActiveSettingsSection(null)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'settings' && activeSettingsSection === null
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">🏠</span>
            관리자 대시보드
          </button>
        </div>

        {/* 관리 버튼들 */}
        <div className="space-y-2 mb-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'books'
                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>📚 서적 관리</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.books}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSettingsSection(null)
              setActiveTab('videoLearnings')
            }}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'videoLearnings'
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>📹 개별 영상</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.videoLearnings || 0}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSettingsSection(null)
              setActiveTab('videoPlaylists')
            }}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'videoPlaylists'
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>📺 시리즈 영상</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.videoPlaylists || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('experiences')}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'experiences'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>💼 경력 관리</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.experiences}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'projects'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>🚀 프로젝트 관리</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.projects}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'messages'
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>💬 메시지 관리</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.messages}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'skills'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>⚡ 기술 관리</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.skills}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSettingsSection(null)
              setActiveTab('categories')
            }}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'categories'
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>📂 카테고리 관리</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
              {counts.categories || 0}
            </span>
          </button>
        </div>

        {/* 세부 메뉴 - 분리된 컴포넌트들로 대체 */}
        {activeTab === 'books' && (
          <BookFilterMenu 
            filterGroup={bookFilters} 
            count={counts.books} 
          />
        )}

        {activeTab === 'experiences' && (
          <ExperienceFilterMenu 
            filterGroup={experienceFilters} 
            count={counts.experiences} 
          />
        )}

        {activeTab === 'projects' && (
          <ProjectFilterMenu 
            filterGroup={projectFilters} 
            count={counts.projects} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsMenu 
            activeSettingsSection={activeSettingsSection}
            setActiveSettingsSection={setActiveSettingsSection}
          />
        )}

        {/* 공통 도구 */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <button
              onClick={refreshCounts}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>🔄</span>
              데이터 새로고침
            </button>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar