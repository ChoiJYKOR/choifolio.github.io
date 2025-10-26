import React from 'react'
import { FaBook, FaBriefcase, FaProjectDiagram, FaSync, FaCalendarAlt } from 'react-icons/fa'

interface DataCounts {
  books: number
  experiences: number
  projects: number
  messages: number
  skills: number
}

interface DashboardHomeProps {
  counts: DataCounts
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ counts }) => {
  // 사이트 활동 통계를 위한 가상 데이터 (실제로는 API에서 가져와야 함)
  const siteActivityStats = {
    recentUpdates: [
      { type: 'book', typeName: '책', title: '최신 도서 추가', updatedAt: new Date() },
      { type: 'project', typeName: '프로젝트', title: '새 프로젝트 완료', updatedAt: new Date() },
      { type: 'experience', typeName: '경력', title: '경력 정보 업데이트', updatedAt: new Date() }
    ],
    weeklyStats: {
      booksAdded: 2,
      projectsCompleted: 1,
      experiencesUpdated: 3
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">관리자 설정</h2>
      
      {/* 콘텐츠 통계 카드 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📊 콘텐츠 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">등록된 책</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{counts.books}</p>
                <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">권</p>
              </div>
              <FaBook className="text-orange-500 text-3xl" />
            </div>
          </button>

          <button className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">등록된 경력</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{counts.experiences}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">개</p>
              </div>
              <FaBriefcase className="text-blue-500 text-3xl" />
            </div>
          </button>

          <button className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">등록된 프로젝트</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{counts.projects}</p>
                <p className="text-xs text-green-500 dark:text-green-400 mt-1">개</p>
              </div>
              <FaProjectDiagram className="text-green-500 text-3xl" />
            </div>
          </button>
        </div>
      </div>

      {/* 사이트 활동 통계 카드 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📊 사이트 활동
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 업데이트된 콘텐츠 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <FaSync className="text-purple-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">최근 업데이트</h3>
            </div>
            <div className="space-y-3">
              {siteActivityStats.recentUpdates.length > 0 ? (
                siteActivityStats.recentUpdates.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.typeName}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {item.updatedAt.toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">최근 업데이트된 콘텐츠가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 주간 통계 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <FaCalendarAlt className="text-indigo-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">이번 주 활동</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaBook className="text-orange-500" />
                  <span className="text-sm text-gray-900 dark:text-white">새로 추가된 책</span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {siteActivityStats.weeklyStats.booksAdded}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaProjectDiagram className="text-green-500" />
                  <span className="text-sm text-gray-900 dark:text-white">완료된 프로젝트</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {siteActivityStats.weeklyStats.projectsCompleted}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaBriefcase className="text-blue-500" />
                  <span className="text-sm text-gray-900 dark:text-white">업데이트된 경력</span>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {siteActivityStats.weeklyStats.experiencesUpdated}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default DashboardHome