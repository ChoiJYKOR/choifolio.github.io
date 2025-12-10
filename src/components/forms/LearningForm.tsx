import React, { useState, useEffect } from 'react'
import { FaSave, FaTimes } from 'react-icons/fa'
import LexicalEditor from '../lexical/LexicalEditor'
import { SerializedEditorState } from 'lexical'
import { Learning } from '../../types'

// 마크다운 문법 변환 함수 (향후 사용을 위해 유지)
// const convertMarkdownToHtml = (text: string): string => {
//   return text
//     .replace(/^### (.*$)/gim, '<h3>$1</h3>')
//     .replace(/^## (.*$)/gim, '<h2>$1</h2>')
//     .replace(/^# (.*$)/gim, '<h1>$1</h1>')
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     .replace(/\*(.*?)\*/g, '<em>$1</em>')
//     .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
//     .replace(/`([^`]+)`/g, '<code>$1</code>')
//     .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
//     .replace(/\n/g, '<br>')
// }

interface LearningFormProps {
  learning?: Learning | null
  onSave: (data: { topic: string; content: string }) => Promise<void>
  onCancel: () => void
}

const LearningForm: React.FC<LearningFormProps> = ({
  learning,
  onSave,
  onCancel
}) => {
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState<SerializedEditorState | string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Lexical 데이터 파싱 함수
  const parseContent = (value: string | undefined): SerializedEditorState | null => {
    if (!value) return null
    try {
      const parsed = JSON.parse(value)
      if (parsed && parsed.root) return parsed
      // 레거시 HTML 형식인 경우 빈 Lexical 상태로 초기화
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    } catch {
      // JSON이 아닌 경우 (레거시 HTML 등) 빈 상태로 초기화
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    }
  }

  useEffect(() => {
    if (learning) {
      setTopic(learning.topic)
      setContent(parseContent(learning.content))
    } else {
      setTopic('')
      setContent(null)
    }
  }, [learning])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      alert('학습 주제를 입력해주세요.')
      return
    }

    // Lexical 데이터 검증
    if (!content || (typeof content === 'object' && (!content.root || !content.root.children || content.root.children.length === 0))) {
      alert('학습 내용을 입력해주세요.')
      return
    }

    try {
      setIsSaving(true)
      // Lexical 데이터를 JSON 문자열로 변환하여 저장
      const contentString = typeof content === 'string' ? content : JSON.stringify(content)
      await onSave({ topic: topic.trim(), content: contentString })
    } catch (error) {
      console.error('학습 내용 저장 실패:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {learning ? '학습 내용 수정' : '학습 내용 추가'}
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
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            학습 주제
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="학습 주제를 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            학습 내용
            <span className="text-xs text-gray-500 ml-2">
              (Lexical 에디터: 텍스트, 이미지, 리스트 등 다양한 형식 지원)
            </span>
          </label>
          <LexicalEditor
            value={content}
            onChange={(value) => setContent(value)}
            placeholder="학습 내용을 입력하세요. 텍스트, 이미지, 리스트 등 다양한 형식을 사용할 수 있습니다."
            className="min-h-[300px]"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving || !topic.trim() || !content || (typeof content === 'object' && (!content.root || !content.root.children || content.root.children.length === 0))}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FaSave />
            {isSaving ? '저장 중...' : (learning ? '수정' : '추가')}
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

export default LearningForm
