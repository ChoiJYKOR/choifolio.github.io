import React, { useState, useEffect } from 'react'
import { SkillCategory, SkillCategoryFormData } from '../../types'
import LanguageTabs, { AdminLanguage } from '../common/LanguageTabs'

interface SkillCategoryFormProps {
  initialData?: SkillCategory | null
  onSave: (data: SkillCategoryFormData) => void
  onCancel: () => void
  isSaving?: boolean
}

const SkillCategoryForm: React.FC<SkillCategoryFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isSaving = false
}) => {
  const [currentLang, setCurrentLang] = useState<AdminLanguage>('ko')
  const [formData, setFormData] = useState<SkillCategoryFormData>({
    title: '',
    titleEn: '',
    titleJa: '',
    description: '',
    descriptionEn: '',
    descriptionJa: '',
    color: '#3B82F6',
    order: 0
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        titleEn: initialData.titleEn || '',
        titleJa: initialData.titleJa || '',
        description: initialData.description || '',
        descriptionEn: initialData.descriptionEn || '',
        descriptionJa: initialData.descriptionJa || '',
        color: initialData.color,
        order: initialData.order
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📋 폼 제출:', formData)
    onSave(formData)
  }

  const handleChange = (field: keyof SkillCategoryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? '카테고리 수정' : '새 카테고리 추가'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Language Tabs */}
        <LanguageTabs activeLanguage={currentLang} onChange={setCurrentLang} />

        {/* Title Field (Multilingual) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            제목 {currentLang === 'ko' && <span className="text-red-500">*</span>}
            <span className="text-xs text-gray-500 ml-2">
              ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
            </span>
          </label>
          {currentLang === 'ko' && (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="예: 프로그래밍 언어"
              required
            />
          )}
          {currentLang === 'en' && (
            <input
              type="text"
              value={formData.titleEn || ''}
              onChange={(e) => handleChange('titleEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Programming Languages"
            />
          )}
          {currentLang === 'ja' && (
            <input
              type="text"
              value={formData.titleJa || ''}
              onChange={(e) => handleChange('titleJa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例: プログラミング言語"
            />
          )}
        </div>
        
        {/* Description Field (Multilingual) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            설명
            <span className="text-xs text-gray-500 ml-2">
              ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
            </span>
          </label>
          {currentLang === 'ko' && (
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="카테고리에 대한 설명을 입력하세요"
            />
          )}
          {currentLang === 'en' && (
            <textarea
              value={formData.descriptionEn || ''}
              onChange={(e) => handleChange('descriptionEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Enter description for this category"
            />
          )}
          {currentLang === 'ja' && (
            <textarea
              value={formData.descriptionJa || ''}
              onChange={(e) => handleChange('descriptionJa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="このカテゴリの説明を入力してください"
            />
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">색상</label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">순서 (고급 옵션)</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="0"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 카테고리 목록에서 드래그하여 순서를 변경할 수 있습니다
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
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

export default SkillCategoryForm
