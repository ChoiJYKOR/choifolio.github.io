import React, { useState } from 'react'
import { ProjectFilterGroup } from '../../hooks/useAdminSidebarState'

interface ProjectFilterMenuProps {
  filterGroup: ProjectFilterGroup
  count: number
}

const ProjectFilterMenu: React.FC<ProjectFilterMenuProps> = ({ filterGroup, count }) => {
  const { state, actions, data } = filterGroup
  
  // 로컬 UI 상태: 검색창 표시 여부
  const [showProjectSearch, setShowProjectSearch] = useState(false)

  // 모든 필터 초기화 함수
  const resetAllFilters = () => {
    actions.setFilter('all')
    actions.setSearchTerm('')
    actions.setSelectedCategory('')
    setShowProjectSearch(false)
  }

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        프로젝트 관리
      </h4>
      <div className="space-y-1">
        {/* 모든 프로젝트 버튼 */}
        <button
          onClick={() => {
            actions.setFilter('all')
            actions.setSearchTerm('')
            setShowProjectSearch(false)
            actions.setSelectedCategory('')
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            state.filter === 'all' && !state.searchTerm && !state.selectedCategory
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          📁 모든 프로젝트 ({count})
        </button>

        {/* 카테고리별 보기 버튼 */}
        <button
          onClick={() => {
            actions.setFilter('category')
            actions.setSearchTerm('')
            setShowProjectSearch(false)
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            state.filter === 'category'
              ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🏷️ 카테고리별 보기
        </button>

        {/* 카테고리 드롭다운 */}
        {state.filter === 'category' && (
          <div className="ml-4 mb-2">
            <select
              value={state.selectedCategory}
              onChange={(e) => actions.setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">카테고리 선택</option>
              {Array.isArray(data.categories) && data.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 주요 프로젝트 버튼 */}
        <button
          onClick={() => {
            actions.setFilter('featured')
            actions.setSearchTerm('')
            setShowProjectSearch(false)
            actions.setSelectedCategory('')
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            state.filter === 'featured'
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🌟 주요 프로젝트
        </button>

        {/* 검색 버튼 */}
        <button
          onClick={() => setShowProjectSearch(!showProjectSearch)}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            showProjectSearch
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🔍 프로젝트 검색
        </button>

        {/* 검색 입력창 */}
        {showProjectSearch && (
          <div className="ml-4 mb-2">
            <input
              type="text"
              placeholder="제목, 설명, 기술스택 검색..."
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        )}

        {/* 필터 초기화 버튼 */}
        {(state.filter !== 'all' || state.searchTerm || state.selectedCategory) && (
          <button
            onClick={resetAllFilters}
            className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🔄 필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}

export default ProjectFilterMenu
