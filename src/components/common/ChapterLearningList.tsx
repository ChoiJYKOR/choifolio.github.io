import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaBook } from 'react-icons/fa'
import { Chapter, Learning } from '../../types'
import { formatDate } from '../../utils/dateUtils'

interface ChapterLearningListProps {
  chapters: Chapter[]
  onAddChapter: () => void
  onEditChapter: (chapter: Chapter) => void
  onDeleteChapter: (chapter: Chapter) => void
  onAddLearning: (chapterId: string) => void
  onEditLearning: (learning: Learning, chapterId: string) => void
  onDeleteLearning: (learning: Learning, chapterId: string) => void
  isAuthenticated?: boolean
}

const ChapterLearningList: React.FC<ChapterLearningListProps> = ({
  chapters,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onAddLearning,
  onEditLearning,
  onDeleteLearning,
  isAuthenticated = true
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map(ch => ch._id)) // 기본적으로 모두 펼쳐진 상태
  )

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId)
      } else {
        newSet.add(chapterId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedChapters(new Set(chapters.map(ch => ch._id)))
  }

  const collapseAll = () => {
    setExpandedChapters(new Set())
  }

  return (
    <div className="space-y-4">
      {/* 🌟 헤더 */}
      <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            📚 목차별 학습 내용
          </h3>
          {chapters.length > 0 && (
            <div className="flex gap-2 text-sm">
              <button
                onClick={expandAll}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              >
                모두 펼치기
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={collapseAll}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              >
                모두 접기
              </button>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <button
            onClick={onAddChapter}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm shadow-md"
          >
            <FaPlus />
            목차 추가
          </button>
        )}
      </div>

      {/* 🌟 목차 리스트 (아코디언) */}
      {chapters.length > 0 ? (
        <div className="space-y-3">
          {chapters
            .sort((a, b) => a.order - b.order)
            .map((chapter) => {
              const isExpanded = expandedChapters.has(chapter._id)
              const learningCount = chapter.learnings?.length || 0

              return (
                <div 
                  key={chapter._id} 
                  className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* 🌟 목차 헤더 (클릭하여 펼치기/접기) */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700">
                    <div className="flex items-center justify-between p-4">
                      <button
                        onClick={() => toggleChapter(chapter._id)}
                        className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                      >
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <FaChevronDown className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                          ) : (
                            <FaChevronRight className="text-gray-400 w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                              Chapter {chapter.order + 1}
                            </span>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                              {chapter.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            📝 {learningCount}개의 학습 내용
                          </p>
                        </div>
                      </button>
                      
                      {isAuthenticated && (
                        <div className="flex gap-2 ml-3 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddLearning(chapter._id)
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="학습 내용 추가"
                          >
                            <FaPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditChapter(chapter)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="목차 수정"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`"${chapter.title}" 목차를 삭제하시겠습니까?\n관련 학습 내용 ${learningCount}개도 모두 삭제됩니다.`)) {
                                onDeleteChapter(chapter)
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="목차 삭제"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 🌟 목차별 학습 내용 (아코디언 콘텐츠) */}
                  {isExpanded && (
                    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                      {learningCount > 0 ? (
                        <div className="space-y-4">
                          {(chapter.learnings || [])
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((learning, idx) => (
                            <div 
                              key={learning._id} 
                              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="flex-shrink-0 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 px-2 py-1 rounded-full">
                                    #{idx + 1}
                                  </span>
                                  <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {learning.topic}
                                  </h5>
                                </div>
                                {isAuthenticated && (
                                  <div className="flex gap-1 flex-shrink-0 ml-2">
                                    <button
                                      onClick={() => onEditLearning(learning, chapter._id)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                      title="수정"
                                    >
                                      <FaEdit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`"${learning.topic}" 학습 내용을 삭제하시겠습니까?`)) {
                                          onDeleteLearning(learning, chapter._id)
                                        }
                                      }}
                                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                      title="삭제"
                                    >
                                      <FaTrash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {/* 🌟 ReactQuill로 작성된 HTML 콘텐츠 렌더링 */}
                              <div 
                                className="prose prose-sm max-w-none dark:prose-invert text-gray-700 dark:text-gray-300
                                  prose-headings:text-gray-900 dark:prose-headings:text-white
                                  prose-p:text-gray-700 dark:prose-p:text-gray-300
                                  prose-code:bg-gray-200 dark:prose-code:bg-gray-700 prose-code:text-red-600 dark:prose-code:text-red-400 prose-code:px-1 prose-code:rounded
                                  prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100
                                  prose-a:text-blue-600 dark:prose-a:text-blue-400"
                                dangerouslySetInnerHTML={{ __html: learning.content }}
                              />
                              
                              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>📅 작성일: {formatDate(learning.createdAt)}</span>
                                {learning.updatedAt && learning.updatedAt !== learning.createdAt && (
                                  <span>✏️ 수정일: {formatDate(learning.updatedAt)}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                          <FaBook className="mx-auto text-3xl mb-3 text-gray-400 opacity-50" />
                          <p className="text-gray-500 dark:text-gray-400 mb-3">
                            이 목차에 아직 학습 내용이 없습니다.
                          </p>
                          {isAuthenticated && (
                            <button
                              onClick={() => onAddLearning(chapter._id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                            >
                              <FaPlus />
                              첫 번째 학습 내용 추가하기
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FaBook className="mx-auto text-5xl mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 font-medium">
            아직 목차가 없습니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            먼저 목차를 추가하고, 각 목차에 학습 내용을 기록하세요.
          </p>
          {isAuthenticated && (
            <button
              onClick={onAddChapter}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 shadow-md"
            >
              <FaPlus />
              첫 번째 목차 추가하기
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ChapterLearningList
