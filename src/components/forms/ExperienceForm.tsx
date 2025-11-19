import React, { useState, useEffect } from 'react'
import { 
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaBriefcase, 
  FaCoffee, 
  FaGraduationCap, 
  FaChartLine, 
  FaCode, 
  FaCog, 
  FaRobot,
  FaCar,           // 🚗 자동차
  FaShieldAlt,     // 🛡️ 군인
  FaLaptopCode,    // 💻 프로그래밍
  FaBars           // 🌟 드래그 핸들 아이콘
} from 'react-icons/fa'
import { Experience, ExperienceFormData, ExperienceDetail } from '../../types'
import RichTextEditor from '../RichTextEditor'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import LanguageTabs, { AdminLanguage } from '../common/LanguageTabs'
import { useTranslation } from 'react-i18next'

// 🌟 아이콘 옵션 정의
const iconOptions = [
  { key: 'FaBriefcase', icon: FaBriefcase, label: '💼 일반 업무' },
  { key: 'FaCoffee', icon: FaCoffee, label: '☕ 서비스/카페' },
  { key: 'FaGraduationCap', icon: FaGraduationCap, label: '🎓 교육/학습' },
  { key: 'FaChartLine', icon: FaChartLine, label: '📈 성장/분석' },
  { key: 'FaLaptopCode', icon: FaLaptopCode, label: '💻 프로그래밍' },
  { key: 'FaCode', icon: FaCode, label: '⌨️ 개발/코딩' },
  { key: 'FaCog', icon: FaCog, label: '⚙️ 기술/엔지니어링' },
  { key: 'FaRobot', icon: FaRobot, label: '🤖 자동화/AI' },
  { key: 'FaCar', icon: FaCar, label: '🚗 자동차/운전' },
  { key: 'FaShieldAlt', icon: FaShieldAlt, label: '🛡️ 군대/보안' },
]

// 🌟 Sortable 카테고리 아이템 컴포넌트
interface SortableCategoryItemProps {
  detail: ExperienceDetail
  index: number
  editingCategoryIndex: number | null
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}

const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({ 
  detail, 
  index, 
  editingCategoryIndex,
  onEdit,
  onRemove
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* 🌟 드래그 핸들 */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            title="드래그하여 순서 변경"
          >
            <FaBars />
          </div>
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <h5 className="font-bold text-gray-900 dark:text-white">{detail.category}</h5>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({detail.items.length}개 항목)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(index)}
            disabled={editingCategoryIndex !== null}
            className={`px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${
              editingCategoryIndex !== null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={editingCategoryIndex !== null}
            className={`p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors ${
              editingCategoryIndex !== null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="카테고리 삭제"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      </div>
      <ul className="text-sm text-gray-700 dark:text-gray-300 pl-4">
        {detail.items.slice(0, 3).map((item, i) => (
          <li key={i} className="list-disc">{item}</li>
        ))}
        {detail.items.length > 3 && (
          <li className="text-gray-500 dark:text-gray-400 italic">
            외 {detail.items.length - 3}개 항목...
          </li>
        )}
      </ul>
    </div>
  )
}

// 폼 컴포넌트의 Props 타입 정의
interface FormProps {
  data: Experience | null
  onSave: (data: ExperienceFormData) => Promise<void>
  onCancel: () => void
  isSaving?: boolean
}

const ExperienceForm: React.FC<FormProps> = ({ data, onSave, onCancel, isSaving = false }) => {
  const [currentLang, setCurrentLang] = useState<AdminLanguage>('ko')
  const { t, i18n } = useTranslation()
  const adminLang = i18n.language as 'ko' | 'en' | 'ja'
  
  // 초기 formData 설정 함수 (iconKey 포함, details에 order 호환성 처리)
  const getInitialFormData = (): ExperienceFormData => {
    if (data) {
      return {
        ...data,
        iconKey: data.iconKey || 'FaBriefcase',
        // 🌟 기존 데이터 호환성: details에 order가 없으면 인덱스를 기본값으로 설정
        details: (data.details || []).map((detail, index) => ({
          ...detail,
          order: detail.order ?? index
        })),
        skills: data.skills || [],
        skillsEn: data.skillsEn || [],
        skillsJa: data.skillsJa || []
      }
    }
    return {
      period: '',
      title: '',
      company: '',
      description: '',
      details: [],
      skills: [],
      skillsEn: [],
      skillsJa: [],
      order: 0,
      iconKey: 'FaBriefcase'
    }
  }
  
  const [formData, setFormData] = useState<ExperienceFormData>(getInitialFormData())
  
  // 기술 입력을 위한 별도 상태 (입력 중에는 문자열로 유지)
  const [skillsInput, setSkillsInput] = useState<string>(
    Array.isArray(formData.skills) ? formData.skills.join(', ') : ''
  )
  
  // 🌟 data prop 변경 시 formData 자동 업데이트
  useEffect(() => {
    const newFormData = getInitialFormData()
    setFormData(newFormData)
    // skillsInput도 함께 업데이트
    const skills = data?.skills || []
    setSkillsInput(Array.isArray(skills) ? skills.join(', ') : '')
  }, [data?._id]) // _id가 변경되면 새로운 경력 데이터로 간주
  
  // 🌟 카테고리별 상세 내용 관리 상태
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [categoryFormData, setCategoryFormData] = useState<{ 
    category: string
    categoryEn: string
    categoryJa: string
    content: string
    contentEn: string
    contentJa: string
  }>({
    category: '',
    categoryEn: '',
    categoryJa: '',
    content: '',
    contentEn: '',
    contentJa: ''
  })
  
  // 🌟 카테고리별 상세 내용 관리 함수들
  const addDetailCategory = () => {
    setEditingCategoryIndex((formData.details || []).length)
    setCategoryFormData({ 
      category: '', 
      categoryEn: '', 
      categoryJa: '', 
      content: '', 
      contentEn: '', 
      contentJa: '' 
    })
  }
  
  const editDetailCategory = (index: number) => {
    const detail = (formData.details || [])[index]
    if (detail) {
      setEditingCategoryIndex(index)
      setCategoryFormData({
        category: detail.category,
        categoryEn: detail.categoryEn || '',
        categoryJa: detail.categoryJa || '',
        content: detail.items.join('\n'),
        contentEn: detail.itemsEn?.join('\n') || '',
        contentJa: detail.itemsJa?.join('\n') || ''
      })
    }
  }
  
  const saveDetailCategory = () => {
    if (!categoryFormData.category.trim() || !categoryFormData.content.trim()) {
      alert('카테고리 이름과 내용을 모두 입력해주세요.')
      return
    }
    
    const items = categoryFormData.content.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    const itemsEn = categoryFormData.contentEn.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    const itemsJa = categoryFormData.contentJa.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    
    const newDetail: ExperienceDetail = {
      category: categoryFormData.category.trim(),
      categoryEn: categoryFormData.categoryEn.trim() || undefined,
      categoryJa: categoryFormData.categoryJa.trim() || undefined,
      items,
      itemsEn: itemsEn.length > 0 ? itemsEn : undefined,
      itemsJa: itemsJa.length > 0 ? itemsJa : undefined
    }
    
    const newDetails = [...(formData.details || [])]
    if (editingCategoryIndex !== null) {
      newDetails[editingCategoryIndex] = newDetail
    }
    
    setFormData({ ...formData, details: newDetails })
    setEditingCategoryIndex(null)
    setCategoryFormData({ 
      category: '', 
      categoryEn: '', 
      categoryJa: '', 
      content: '', 
      contentEn: '', 
      contentJa: '' 
    })
  }
  
  const cancelDetailCategory = () => {
    setEditingCategoryIndex(null)
    setCategoryFormData({ 
      category: '', 
      categoryEn: '', 
      categoryJa: '', 
      content: '', 
      contentEn: '', 
      contentJa: '' 
    })
  }
  
  const removeDetailCategory = (index: number) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) return
    const newDetails = [...(formData.details || [])]
    newDetails.splice(index, 1)
    setFormData({ ...formData, details: newDetails })
  }
  
  // 🌟 드래그 앤 드롭 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const oldIndex = (formData.details || []).findIndex((_, i) => i === active.id)
    const newIndex = (formData.details || []).findIndex((_, i) => i === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return
    
    // 배열 순서 변경
    const newDetails = [...(formData.details || [])]
    const [movedItem] = newDetails.splice(oldIndex, 1)
    
    if (!movedItem) return  // 안전성 체크
    
    newDetails.splice(newIndex, 0, movedItem)
    
    // 🌟 순서 변경 후 각 항목에 새로운 order 값 할당
    const reorderedDetails = newDetails.map((detail, index) => ({
      ...detail,
      order: index
    }))
    
    setFormData({ ...formData, details: reorderedDetails })
  }

  // 필수 필드 검증
  const isFormValid = formData.title.trim() !== '' && 
                     formData.company.trim() !== '' && 
                     formData.period.trim() !== ''

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      alert('필수 필드(기간, 직책, 회사/기관)를 모두 입력해주세요.')
      return
    }
    
    // 제출 시 최신 기술 배열을 포함하여 저장 (호환성 유지)
    const skillsArray = skillsInput.split(',').map((s) => s.trim()).filter(s => s.length > 0)
    
    // 🌟 details 배열의 각 항목에 order 값 할당 (현재 배열 순서 기준)
    const orderedDetails = (formData.details || []).map((detail, index) => ({
      ...detail,
      order: detail.order ?? index  // 기존 order가 있으면 유지, 없으면 인덱스 사용
    }))
    
    const finalFormData = { 
      ...formData, 
      skills: skillsArray,  // 🔄 호환성 유지
      details: orderedDetails
    }
    
    onSave(finalFormData)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {data ? '경력 수정' : '경력 추가'}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            기간
          </label>
          <input
            type="text"
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="2018 - 2023"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            직책
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            회사/기관
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            순서
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              setFormData({ ...formData, order: isNaN(value) ? 0 : value })
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="0"
            placeholder="표시 순서 (숫자가 작을수록 먼저 표시)"
          />
        </div>
        {/* 🌟 아이콘 선택 필드 (신규) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            아이콘
          </label>
          <select
            value={formData.iconKey || 'FaBriefcase'}
            onChange={(e) => setFormData({ ...formData, iconKey: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {iconOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          {/* 미리보기 */}
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>미리보기:</span>
            {React.createElement(
              iconOptions.find(opt => opt.key === (formData.iconKey || 'FaBriefcase'))?.icon || FaBriefcase,
              { className: 'text-xl' }
            )}
          </div>
        </div>
      </div>
      {/* 🌟 카테고리별 상세 내용 입력 (신규) */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-bold text-gray-900 dark:text-white">
              📋 카테고리별 상세 내용
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              근무경험, 교육, 근무매장 등 카테고리별로 구체적인 내용을 정리하세요
            </p>
          </div>
          <button
            type="button"
            onClick={addDetailCategory}
            disabled={editingCategoryIndex !== null}
            className={`px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm ${
              editingCategoryIndex !== null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaPlus className="text-xs" />
            카테고리 추가
          </button>
        </div>
        
        {/* 저장된 카테고리 목록 - 🌟 드래그 앤 드롭 적용 */}
        {formData.details && formData.details.length > 0 && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={formData.details.map((_, i) => i)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 mb-4">
                {formData.details.map((detail, index) => (
                  <SortableCategoryItem
                    key={index}
                    detail={detail}
                    index={index}
                    editingCategoryIndex={editingCategoryIndex}
                    onEdit={editDetailCategory}
                    onRemove={removeDetailCategory}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        {/* 카테고리 추가/수정 폼 */}
        {editingCategoryIndex !== null && (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-2 border-blue-400 dark:border-blue-600 shadow-lg">
            <h5 className="font-bold text-gray-900 dark:text-white mb-4">
              {editingCategoryIndex < (formData.details || []).length ? '카테고리 수정' : '카테고리 추가'}
            </h5>
            
            {/* Language Tabs for Detail Category */}
            <div className="mb-4">
              <LanguageTabs activeLanguage={currentLang} onChange={setCurrentLang} />
            </div>
            
            <div className="space-y-4">
              {/* Category Name (Multilingual) */}
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
                    value={categoryFormData.category}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, category: e.target.value })}
                    placeholder="예: 근무경험, 교육, 근무매장"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  />
                )}
                {currentLang === 'en' && (
                  <input
                    type="text"
                    value={categoryFormData.categoryEn}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, categoryEn: e.target.value })}
                    placeholder="e.g., Work Experience, Education, Store"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  />
                )}
                {currentLang === 'ja' && (
                  <input
                    type="text"
                    value={categoryFormData.categoryJa}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, categoryJa: e.target.value })}
                    placeholder="例: 職務経験、教育、店舗"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  />
                )}
              </div>
              
              {/* Category Content (Multilingual) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  카테고리 내용 {currentLang === 'ko' && <span className="text-red-500">*</span>}
                  <span className="text-xs text-gray-500 ml-2">
                    ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
                  </span>
                </label>
                {currentLang === 'ko' && (
                  <>
                    <RichTextEditor
                      value={categoryFormData.content}
                      onChange={(value) => setCategoryFormData({ ...categoryFormData, content: value })}
                      placeholder="항목들을 한 줄씩 입력하세요&#10;예:&#10;매장인원 관리&#10;신규파트너 교육&#10;라떼아트 교육"
                      rows={8}
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      💡 한 줄에 하나씩 항목을 입력하세요 (Enter로 구분)
                    </p>
                  </>
                )}
                {currentLang === 'en' && (
                  <>
                    <RichTextEditor
                      value={categoryFormData.contentEn}
                      onChange={(value) => setCategoryFormData({ ...categoryFormData, contentEn: value })}
                      placeholder="Enter items one per line&#10;e.g.&#10;Store Staff Management&#10;New Partner Training&#10;Latte Art Education"
                      rows={8}
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      💡 Enter one item per line (separated by Enter)
                    </p>
                  </>
                )}
                {currentLang === 'ja' && (
                  <>
                    <RichTextEditor
                      value={categoryFormData.contentJa}
                      onChange={(value) => setCategoryFormData({ ...categoryFormData, contentJa: value })}
                      placeholder="1行に1項目を入力してください&#10;例:&#10;店舗スタッフ管理&#10;新規パートナー教育&#10;ラテアート教育"
                      rows={8}
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      💡 1行に1項目を入力してください (Enterで区切る)
                    </p>
                  </>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveDetailCategory}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaSave />
                  저장
                </button>
                <button
                  type="button"
                  onClick={cancelDetailCategory}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 빈 상태 */}
        {(!formData.details || formData.details.length === 0) && editingCategoryIndex === null && (
          <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              아직 카테고리가 없습니다
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              상단의 "카테고리 추가" 버튼을 눌러 시작하세요
            </p>
          </div>
        )}
      </div>
      
      {/* 기술 입력 필드 (다국어 지원) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('admin.experience.skillsInput')}
        </label>
        <input
          type="text"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          onBlur={() => {
            // 포커스를 잃을 때 배열로 변환하여 formData에 저장
            const skillsArray = skillsInput.split(',').map((s) => s.trim()).filter(s => s.length > 0)
            setFormData({ ...formData, skills: skillsArray })
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder={adminLang === 'ko' ? 'PLC 프로그래밍, Python, 데이터 분석' : adminLang === 'en' ? 'PLC Programming, Python, Data Analysis' : 'PLCプログラミング、Python、データ分析'}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('admin.experience.skillsInputHint')}
        </p>
      </div>
      {/* 🌟 최종 저장 안내 (카테고리 입력 중일 때) */}
      {editingCategoryIndex !== null && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
            ⚠️ 카테고리 입력 중입니다. 위의 "저장" 버튼을 먼저 눌러 카테고리를 저장하세요.
          </p>
        </div>
      )}
      
      {/* 🌟 저장된 카테고리 요약 */}
      {formData.details && formData.details.length > 0 && editingCategoryIndex === null && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-300 dark:border-green-700">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-2">
            ✅ {formData.details.length}개의 카테고리가 준비되었습니다
          </p>
          <p className="text-xs text-green-700 dark:text-green-400">
            아래 "저장" 버튼을 눌러 경력 데이터를 최종 저장하세요
          </p>
        </div>
      )}
      
      <div className="flex gap-3 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
        <button
          type="submit"
          disabled={isSaving || !isFormValid || editingCategoryIndex !== null}
          className={`flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors text-lg ${
            isSaving || !isFormValid || editingCategoryIndex !== null ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'
          }`}
          title={editingCategoryIndex !== null ? '카테고리 입력을 먼저 완료하세요' : ''}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              저장 중...
            </>
          ) : (
            <>
              <FaSave className="text-xl" /> 최종 저장
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={`flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 rounded-lg transition-colors ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          취소
        </button>
      </div>
    </form>
  )
}

export default ExperienceForm
