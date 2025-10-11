import React, { useState } from 'react'
import { ExperienceFilterGroup } from '../../hooks/useAdminSidebarState'

interface ExperienceFilterMenuProps {
  filterGroup: ExperienceFilterGroup
  count: number
}

const ExperienceFilterMenu: React.FC<ExperienceFilterMenuProps> = ({ filterGroup, count }) => {
  const { state, actions, data } = filterGroup
  
  // 로컬 UI 상태: 검색창 표시 여부
  const [showExperienceSearch, setShowExperienceSearch] = useState(false)

  // 모든 필터 초기화 함수
  const resetAllFilters = () => {
    actions.setFilter('all')
    actions.setSearchTerm('')
    actions.setSelectedCompany('')
    actions.setSelectedYear('')
    setShowExperienceSearch(false)
  }

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        경력 관리
      </h4>
      <div className="space-y-1">
        {/* 모든 경력 버튼 */}
        <button
          onClick={() => {
            actions.setFilter('all')
            actions.setSearchTerm('')
            setShowExperienceSearch(false)
            actions.setSelectedCompany('')
            actions.setSelectedYear('')
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            state.filter === 'all' && !state.searchTerm && !state.selectedCompany && !state.selectedYear
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          💼 모든 경력 ({count})
        </button>

        {/* 회사별 보기 버튼 */}
        <button
          onClick={() => {
            actions.setFilter('company')
            actions.setSearchTerm('')
            setShowExperienceSearch(false)
            actions.setSelectedYear('')
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            state.filter === 'company'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🏢 회사별 보기
        </button>

        {/* 회사 드롭다운 */}
        {state.filter === 'company' && (
          <div className="ml-4 mb-2">
            <select
              value={state.selectedCompany}
              onChange={(e) => actions.setSelectedCompany(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">회사 선택</option>
              {data.companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 연도별 보기 버튼 */}
        <button
          onClick={() => {
            actions.setFilter('year')
            actions.setSearchTerm('')
            setShowExperienceSearch(false)
            actions.setSelectedCompany('')
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            state.filter === 'year'
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          📅 연도별 보기
        </button>

        {/* 연도 드롭다운 */}
        {state.filter === 'year' && (
          <div className="ml-4 mb-2">
            <select
              value={state.selectedYear}
              onChange={(e) => actions.setSelectedYear(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">연도 선택</option>
              {data.years.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 검색 버튼 */}
        <button
          onClick={() => setShowExperienceSearch(!showExperienceSearch)}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            showExperienceSearch
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🔍 경력 검색
        </button>

        {/* 검색 입력창 */}
        {showExperienceSearch && (
          <div className="ml-4 mb-2">
            <input
              type="text"
              placeholder="제목, 회사, 설명 검색..."
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        )}

        {/* 필터 초기화 버튼 */}
        {(state.filter !== 'all' || state.searchTerm || state.selectedCompany || state.selectedYear) && (
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

export default ExperienceFilterMenu
