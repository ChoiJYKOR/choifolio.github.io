import React from 'react'
import { FaPlus, FaEdit, FaTrash, FaBook } from 'react-icons/fa'
import { Chapter } from '../../types'

interface ChapterListProps {
  chapters: Chapter[]
  selectedChapter?: Chapter | null
  onSelectChapter: (chapter: Chapter) => void
  onAddChapter: () => void
  onEditChapter: (chapter: Chapter) => void
  onDeleteChapter: (chapter: Chapter) => void
  isDeleting?: boolean
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  selectedChapter,
  onSelectChapter,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  isDeleting = false
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📚 목차 관리
        </h3>
        <button
          onClick={onAddChapter}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          목차 추가
        </button>
      </div>

      {/* 목차 리스트 */}
      {chapters.length > 0 ? (
        <div className="space-y-3">
          {chapters
            .sort((a, b) => a.order - b.order)
            .map((chapter) => (
              <div key={chapter._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {chapter.order + 1}.
                    </span>
                    <button
                      onClick={() => onSelectChapter(chapter)}
                      className="text-left hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors flex-1"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {chapter.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        학습 내용 {chapter.learnings?.length || 0}개
                      </p>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditChapter(chapter)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => onDeleteChapter(chapter)}
                      disabled={isDeleting}
                      className={`p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FaBook className="mx-auto text-3xl mb-2" />
          <p>아직 목차가 없습니다.</p>
          <p className="text-sm">위의 "목차 추가" 버튼을 클릭하여 첫 번째 목차를 추가해보세요.</p>
        </div>
      )}
    </div>
  )
}

export default ChapterList
