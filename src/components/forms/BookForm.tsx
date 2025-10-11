import React, { useState } from 'react'
import { FaSave, FaStar, FaTimes } from 'react-icons/fa'
import { Book, BookFormData, Skill, SkillCategory } from '../../types'
import { useSkills } from '../../hooks/useSkills'
import { useCategories } from '../../hooks/useCategories'

// 폼 컴포넌트의 Props 타입 정의
interface FormProps {
  data: Book | null
  onSave: (data: BookFormData) => Promise<void>
  onCancel: () => void
  isSaving?: boolean
  availableCategories?: string[] // 동적 카테고리 목록
}

const BookForm: React.FC<FormProps> = ({ 
  data, 
  onSave, 
  onCancel, 
  isSaving = false, 
  availableCategories = ['PLC', '데이터분석', '로봇공학', 'IoT', '기타'] 
}) => {
  // 🌟 스킬 목록 가져오기
  const { skillCategories, loading: skillsLoading } = useSkills()
  
  // 🌟 카테고리 데이터 가져오기
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  
  // readDate 초기값 수정
  const initialReadDate = data?.readDate && !isNaN(new Date(data.readDate).getTime())
    ? new Date(data.readDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  // 🌟 categoryIds 초기값 처리
  const initialCategoryIds = data?.categoryIds 
    ? (data.categoryIds as any[]).map((catIdOrObj: any) => 
        typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj._id
      ).filter(Boolean) as string[]
    : []

  // 🌟 skillIds 초기값 처리 (객체 또는 문자열 모두 처리)
  const initialSkillIds = data?.skillIds 
    ? (data.skillIds as any[]).map((skillIdOrObj: any) => 
        typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj._id
      ).filter(Boolean) as string[]
    : []

  const [formData, setFormData] = useState<BookFormData>(
    data
      ? { 
          title: data.title,
          author: data.author,
          category: data.category,
          categoryIds: initialCategoryIds,
          coverImage: data.coverImage || '',
          readDate: initialReadDate as string,
          rating: data.rating,
          skillIds: initialSkillIds  // 🌟 스킬 ID 문자열 배열로 초기화
        } 
      : {
          title: '',
          author: '',
          category: availableCategories[0] || 'PLC', // 동적 카테고리 첫 번째 항목 사용
          categoryIds: [],
          coverImage: '',
          readDate: initialReadDate as string, // initialReadDate를 사용
          rating: 5,
          skillIds: []  // 🌟 스킬 ID 초기값
        }
  )
  
  
  // 🌟 카테고리 선택/해제 핸들러 (체크박스용)
  const handleCategoryToggle = (categoryId: string) => {
    const currentCategoryIds = formData.categoryIds || []
    const isSelected = currentCategoryIds.includes(categoryId)
    
    const newCategoryIds = isSelected
      ? currentCategoryIds.filter((id: string) => id !== categoryId)
      : [...currentCategoryIds, categoryId]
    
    setFormData({ 
      ...formData, 
      categoryIds: newCategoryIds 
    })
  }

  // 🌟 스킬 선택/해제 핸들러 (체크박스용)
  const handleSkillToggle = (skillId: string) => {
    const currentSkillIds = formData.skillIds || []
    const isSelected = currentSkillIds.includes(skillId)
    
    const newSkillIds = isSelected
      ? currentSkillIds.filter((id: string) => id !== skillId)
      : [...currentSkillIds, skillId]
    
    setFormData({ 
      ...formData, 
      skillIds: newSkillIds 
    })
  }
  
  // 🌟 스킬 카테고리 전체 선택/해제 핸들러
  const handleSkillCategoryToggle = (category: SkillCategory) => {
    const categorySkillIds = (category.skills || []).map(skill => skill._id!).filter(Boolean)
    const currentSkillIds = formData.skillIds || []
    
    const allSelected = categorySkillIds.every((id: string) => currentSkillIds.includes(id))
    
    let newSkillIds: string[]
    if (allSelected) {
      newSkillIds = currentSkillIds.filter((id: string) => !categorySkillIds.includes(id))
    } else {
      const uniqueIds = new Set([...currentSkillIds, ...categorySkillIds])
      newSkillIds = Array.from(uniqueIds)
    }
    
    setFormData({ 
      ...formData, 
      skillIds: newSkillIds 
    })
  }

  // 필수 필드 검증
  const isFormValid = formData.title.trim() !== '' && 
                     formData.author.trim() !== '' && 
                     formData.category.trim() !== ''

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      alert('필수 필드(제목, 저자, 카테고리)를 모두 입력해주세요.')
      return
    }
    
    console.log('📚 서적 저장 시작:', formData)
    console.log('🔗 선택된 스킬 IDs:', formData.skillIds)
    
    // 🌟 skillIds와 categoryIds를 문자열 배열로 확실하게 변환 + 중복 제거
    const skillIds = Array.from(new Set(
      (formData.skillIds || []).map((skillIdOrObj: any) => 
        typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj?._id
      ).filter(Boolean)
    ))
    
    const categoryIds = Array.from(new Set(
      (formData.categoryIds || []).map((catIdOrObj: any) => 
        typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
      ).filter(Boolean)
    ))
    
    const { title, author, category, coverImage, readDate, rating } = formData
    
    const saveData = { 
      title, 
      author, 
      category, 
      coverImage: coverImage || '', 
      readDate, 
      rating,
      skillIds,  // 🌟 변환된 skillIds
      categoryIds  // 🌟 변환된 categoryIds
    }
    
    console.log('📤 최종 전송 데이터:', saveData)
    onSave(saveData)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {data ? '서적 수정' : '서적 추가'}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제목
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
            저자
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            카테고리 선택 📂 (다중 선택 가능)
          </label>

          {/* 선택된 카테고리 태그 표시 */}
          {formData.categoryIds && formData.categoryIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              {formData.categoryIds.map((catId) => {
                const category = categories.find(c => c._id === catId)
                return category ? (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                  >
                    {category.name}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(catId)}
                      className="hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ) : null
              })}
            </div>
          )}

          {/* 카테고리 체크박스 목록 */}
          {categoriesLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">카테고리 로딩 중...</p>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => {
                const isSelected = (formData.categoryIds || []).includes(category._id)
                return (
                  <label
                    key={category._id}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category._id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              등록된 카테고리가 없습니다. 관리자 메뉴의 "카테고리 관리"에서 추가하세요.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            평점
          </label>
          <div className="flex items-center gap-2">
            {/* 시각적 별 선택 */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`text-2xl transition-colors ${
                    star <= formData.rating 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            {/* 숫자 입력 (보조) */}
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={formData.rating}
              onChange={(e) => {
                const value = e.target.value
                // 입력값이 비어있거나, 유효한 숫자가 아니면 이전 값 유지
                const newRating = value === '' ? 0 : parseFloat(value)
                setFormData({ 
                  ...formData, 
                  rating: isNaN(newRating) ? formData.rating : Math.max(1, Math.min(5, newRating))
                })
              }}
              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            읽은 날짜
          </label>
          <input
            type="date"
            value={formData.readDate}
            onChange={(e) => setFormData({ ...formData, readDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            표지 이미지 URL
          </label>
          <input
            type="text"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://..."
          />
        </div>
        
        {/* 🌟 서적에서 다루는 핵심 스킬 선택 - 체크박스 UI */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              이 서적에서 다루는 핵심 스킬 🔗
            </label>
            {formData.skillIds && formData.skillIds.length > 0 && (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                ✓ {formData.skillIds.length}개 선택됨
              </span>
            )}
          </div>
          
          {skillsLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
              스킬 목록을 불러오는 중입니다...
            </div>
          ) : skillCategories.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border border-gray-300 dark:border-gray-600 rounded-lg">
              등록된 스킬이 없습니다. 먼저 스킬을 추가해주세요.
            </div>
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 max-h-[400px] overflow-y-auto">
              {skillCategories.map((category: SkillCategory) => {
                const categorySkillIds = (category.skills || []).map(skill => skill._id!).filter(Boolean)
                const currentSkillIds = formData.skillIds || []
                
                const selectedCount = categorySkillIds.filter(id => currentSkillIds.includes(id)).length
                const allSelected = categorySkillIds.length > 0 && selectedCount === categorySkillIds.length
                const someSelected = selectedCount > 0 && selectedCount < categorySkillIds.length
                
                return (
                  <div key={category._id} className="mb-4 last:mb-0">
                    {/* 카테고리 헤더 (전체 선택/해제) */}
                    <div 
                      className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                      onClick={() => handleSkillCategoryToggle(category)}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={el => {
                          if (el) {
                            el.indeterminate = someSelected
                          }
                        }}
                        onChange={() => handleSkillCategoryToggle(category)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label 
                        className="font-semibold text-gray-900 dark:text-white flex-1 cursor-pointer"
                        style={{ color: category.color || '#3B82F6' }}
                      >
                        {category.title}
                        {selectedCount > 0 && (
                          <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                            ({selectedCount}/{categorySkillIds.length})
                          </span>
                        )}
                      </label>
                    </div>
                    
                    {/* 스킬 목록 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-6">
                      {(category.skills || []).map((skill: Skill) => {
                        const currentSkillIds = formData.skillIds || []
                        const isSelected = currentSkillIds.includes(skill._id!)
                        
                        return (
                          <label
                            key={skill._id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSkillToggle(skill._id!)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className={`text-sm ${isSelected ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                              {skill.name}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 이 서적에서 주요하게 다루는 스킬을 선택하세요. 개별 학습 내용에서도 추가로 스킬을 연결할 수 있습니다.
          </p>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving || !isFormValid}
          className={`flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors ${
            isSaving || !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              저장 중...
            </>
          ) : (
            <>
              <FaSave /> 저장
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}

export default BookForm
