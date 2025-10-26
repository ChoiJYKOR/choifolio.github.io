import React, { useState, useEffect } from 'react'
import { FaSave, FaTimes } from 'react-icons/fa'
import { Chapter } from '../../types'

interface ChapterFormProps {
  chapter?: Chapter | null
  onSave: (data: { title: string; order: number }) => Promise<void>
  onCancel: () => void
  maxOrder?: number
}

const ChapterForm: React.FC<ChapterFormProps> = ({
  chapter,
  onSave,
  onCancel,
  maxOrder = 0
}) => {
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title)
      setOrder(chapter.order)
    } else {
      setTitle('')
      setOrder(maxOrder)
    }
  }, [chapter, maxOrder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('목차 제목을 입력해주세요.')
      return
    }

    try {
      setIsSaving(true)
      await onSave({ title: title.trim(), order })
    } catch (error) {
      console.error('목차 저장 실패:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {chapter ? '목차 수정' : '목차 추가'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FaTimes className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            목차 제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="목차 제목을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            순서
          </label>
          <input
            type="number"
            id="order"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving || !title.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaSave />
            {isSaving ? '저장 중...' : (chapter ? '수정' : '추가')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChapterForm
