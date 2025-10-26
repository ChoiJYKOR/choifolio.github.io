import React from 'react'
import { FaPlus, FaEdit, FaTrash, FaBook } from 'react-icons/fa'
import { Learning } from '../../types'

interface LearningListProps {
  learnings: Learning[]
  title: string
  onAddLearning: () => void
  onEditLearning: (learning: Learning) => void
  onDeleteLearning: (learning: Learning) => void
  isDeleting?: boolean
}

const LearningList: React.FC<LearningListProps> = ({
  learnings,
  title,
  onAddLearning,
  onEditLearning,
  onDeleteLearning,
  isDeleting = false
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title} ({learnings.length}개)
        </h3>
        <button
          onClick={onAddLearning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          학습 내용 추가
        </button>
      </div>

      {/* 학습 내용 리스트 */}
      {learnings.length > 0 ? (
        <div className="space-y-4">
          {learnings.map((learning) => (
            <div key={learning._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {learning.topic}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditLearning(learning)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => onDeleteLearning(learning)}
                    disabled={isDeleting}
                    className={`p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors ${
                      isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
              <div 
                className="text-gray-700 dark:text-gray-300 text-sm prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: learning.content }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FaBook className="mx-auto text-3xl mb-2" />
          <p>아직 학습 내용이 없습니다.</p>
          <p className="text-sm">위의 "학습 내용 추가" 버튼을 클릭하여 첫 번째 학습 내용을 추가해보세요.</p>
        </div>
      )}
    </div>
  )
}

export default LearningList
