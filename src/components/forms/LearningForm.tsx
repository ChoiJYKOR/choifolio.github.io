import React, { useState, useEffect } from 'react'
import { FaSave, FaTimes } from 'react-icons/fa'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
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
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Quill 에디터 설정
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ]
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'color', 'background',
    'link', 'image'
  ]

  useEffect(() => {
    if (learning) {
      setTopic(learning.topic)
      setContent(learning.content)
    } else {
      setTopic('')
      setContent('')
    }
  }, [learning])

  // HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      alert('학습 주제를 입력해주세요.')
      return
    }

    // HTML 태그를 제거한 순수 텍스트로 검증
    const plainTextContent = stripHtml(content).trim()
    if (!plainTextContent) {
      alert('학습 내용을 입력해주세요.')
      return
    }

    try {
      setIsSaving(true)
      await onSave({ topic: topic.trim(), content: content.trim() })
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
              (마크다운 문법 지원: **굵게**, *기울임*, # 제목, - 목록)
            </span>
          </label>
          <div className="rich-text-editor-container">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={(value) => {
                console.log('ReactQuill onChange:', value)
                setContent(value)
              }}
              placeholder="학습 내용을 입력하세요. 마크다운 문법을 사용할 수 있습니다."
              modules={quillModules}
              formats={quillFormats}
              className="rich-text-editor"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving || !topic.trim() || !stripHtml(content).trim()}
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
