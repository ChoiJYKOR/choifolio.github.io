import React, { useState } from 'react'
import { FaSave } from 'react-icons/fa'
import { Category, CategoryFormData } from '../../types'
import LanguageTabs, { AdminLanguage } from '../common/LanguageTabs'

interface FormProps {
  data?: Category
  onSave: (data: CategoryFormData) => void
  onCancel: () => void
  isSaving?: boolean
}

const CategoryForm: React.FC<FormProps> = ({ 
  data, 
  onSave, 
  onCancel, 
  isSaving = false 
}) => {
  const [currentLang, setCurrentLang] = useState<AdminLanguage>('ko')
  const [formData, setFormData] = useState<CategoryFormData>(
    data
      ? { 
          name: data.name,
          nameEn: data.nameEn,
          nameJa: data.nameJa,
          order: data.order || 0,
        } 
      : {
          name: '',
          nameEn: '',
          nameJa: '',
          order: 0,
        }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('카테고리 이름을 입력해주세요')
      return
    }

    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Language Tabs */}
      <LanguageTabs activeLanguage={currentLang} onChange={setCurrentLang} />

      {/* Name Field (Multilingual) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          카테고리 이름 {currentLang === 'ko' && <span className="text-red-500">*</span>}
          <span className="text-xs text-gray-500 ml-2">
            ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
          </span>
        </label>
        {currentLang === 'ko' && (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="예: PLC, 웹개발, AI/ML"
            required
          />
        )}
        {currentLang === 'en' && (
          <input
            type="text"
            value={formData.nameEn || ''}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., PLC, Web Development, AI/ML"
          />
        )}
        {currentLang === 'ja' && (
          <input
            type="text"
            value={formData.nameJa || ''}
            onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="例: PLC, ウェブ開発, AI/ML"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          순서 (고급 옵션)
        </label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          min="0"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          💡 카테고리 목록에서 드래그 앤 드롭으로 순서를 변경할 수 있습니다
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving || !formData.name.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <FaSave />
          {isSaving ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          취소
        </button>
      </div>
    </form>
  )
}

export default CategoryForm
