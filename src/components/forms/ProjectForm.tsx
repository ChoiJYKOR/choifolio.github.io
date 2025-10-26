import React from 'react'
import { FaSave, FaPlus, FaTrash, FaVideo, FaTimes } from 'react-icons/fa'
import { Project, ProjectFormData, Skill, SkillCategory } from '../../types'
import RichTextEditor from '../RichTextEditor'
import { useSkills } from '../../hooks/useSkills'
import { useCategories } from '../../hooks/useCategories'
import LanguageTabs from '../common/LanguageTabs'
import { useProjectForm } from '../../hooks/useProjectForm'

// 폼 컴포넌트의 Props 타입 정의
interface FormProps {
  data: Project | null
  onSave: (data: ProjectFormData) => Promise<void>
  onCancel: () => void
  isSaving?: boolean
}

const ProjectForm: React.FC<FormProps> = ({ data, onSave, onCancel, isSaving = false }) => {
  // Use custom hook for form logic
  const {
    formData,
    videoItems,
    currentLang,
    setCurrentLang,
    setFormData,
    handleVideoUrlChange,
    handleVideoDescriptionChange,
    handleAddVideo,
    handleRemoveVideo,
    prepareDataForSubmit
  } = useProjectForm(data)
  
  // 🌟 모든 스킬 목록을 가져옵니다
  const { skillCategories, loading: skillsLoading } = useSkills()
  
  // 🌟 카테고리 데이터 가져오기
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

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
      ? currentSkillIds.filter((id: string) => id !== skillId) // 선택 해제
      : [...currentSkillIds, skillId] // 선택 추가
    
    console.log('🔧 스킬 변경:', { skillId, isSelected: !isSelected, newSkillIds })
    setFormData({ 
      ...formData, 
      skillIds: newSkillIds 
    })
  }
  
  // 🌟 스킬 카테고리 전체 선택/해제 핸들러
  const handleSkillCategoryToggle = (category: SkillCategory) => {
    const categorySkillIds = (category.skills || []).map(skill => skill._id!).filter(Boolean)
    const currentSkillIds = formData.skillIds || []
    
    // 카테고리의 모든 스킬이 선택되어 있는지 확인
    const allSelected = categorySkillIds.every((id: string) => currentSkillIds.includes(id))
    
    let newSkillIds: string[]
    if (allSelected) {
      // 모두 선택되어 있으면 전체 해제
      newSkillIds = currentSkillIds.filter((id: string) => !categorySkillIds.includes(id))
    } else {
      // 일부만 선택되어 있거나 없으면 전체 선택
      const uniqueIds = new Set([...currentSkillIds, ...categorySkillIds])
      newSkillIds = Array.from(uniqueIds)
    }
    
    console.log('📁 카테고리 전체 변경:', { category: category.title, allSelected: !allSelected, newSkillIds })
    setFormData({ 
      ...formData, 
      skillIds: newSkillIds 
    })
  }

  const handleSaveClick = () => {
    try {
      console.log('💾 저장 시작 - videoItems:', videoItems)
      console.log('🔗 선택된 스킬 IDs:', formData.skillIds)
      
      // Use hook's prepare function to process all data
      const processedData = prepareDataForSubmit()
      
      console.log('✅ 최종 processedData:', processedData)
      console.log('✅ 최종 skillIds:', processedData.skillIds)
      onSave(processedData)
    } catch (error: any) {
      console.error('❌ 저장 중 오류 발생:', error)
      alert(error.message || '저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {data ? '프로젝트 수정' : '프로젝트 추가'}
      </h3>
      
      {/* Language Tabs */}
      <LanguageTabs activeLanguage={currentLang} onChange={setCurrentLang} />

      <div className="grid md:grid-cols-2 gap-4">
        {/* Title Field (Multilingual) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제목 {currentLang === 'ko' && <span className="text-red-500">*</span>}
            <span className="text-xs text-gray-500 ml-2">
              ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
            </span>
          </label>
          {currentLang === 'ko' && (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="프로젝트 제목"
              required
            />
          )}
          {currentLang === 'en' && (
            <input
              type="text"
              value={formData.titleEn || ''}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Project Title"
            />
          )}
          {currentLang === 'ja' && (
            <input
              type="text"
              value={formData.titleJa || ''}
              onChange={(e) => setFormData({ ...formData, titleJa: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="プロジェクトタイトル"
            />
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            카테고리 선택 📂 (다중 선택 가능)
          </label>

          {/* 선택된 카테고리 태그 표시 */}
          {formData.categoryIds && formData.categoryIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              {formData.categoryIds.map((catId: string) => {
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
            상태
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'preparing' | 'planning' | 'completed' })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="preparing">준비 중</option>
            <option value="planning">계획 중</option>
            <option value="completed">완료</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="text"
            value={formData.githubLink || ''}
            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Live URL
          </label>
          <input
            type="text"
            value={formData.liveLink || ''}
            onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            이미지 URL
          </label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            순서
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* 🌟 개선: 사용된 스킬 - 체크박스 UI */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              사용된 스킬 (프로젝트 연동) 🔗
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
                const selectedCount = categorySkillIds.filter(id => (formData.skillIds || []).includes(id)).length
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
                        const isSelected = (formData.skillIds || []).includes(skill._id!)
                        
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
            💡 체크박스를 클릭하여 프로젝트에서 사용한 스킬을 선택하세요. 카테고리 제목을 클릭하면 전체 선택/해제할 수 있습니다.
          </p>
        </div>
      </div>
      {/* Description Field (Multilingual) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          설명 (리치텍스트 에디터)
          <span className="text-xs text-gray-500 ml-2">
            ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
          </span>
        </label>
        {currentLang === 'ko' && (
          <RichTextEditor
            value={formData.description || ''}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="프로젝트에 대한 간단한 설명을 작성하세요."
            rows={4}
            className="min-h-[150px]"
          />
        )}
        {currentLang === 'en' && (
          <RichTextEditor
            value={formData.descriptionEn || ''}
            onChange={(value) => setFormData({ ...formData, descriptionEn: value })}
            placeholder="Write a brief description of the project."
            rows={4}
            className="min-h-[150px]"
          />
        )}
        {currentLang === 'ja' && (
          <RichTextEditor
            value={formData.descriptionJa || ''}
            onChange={(value) => setFormData({ ...formData, descriptionJa: value })}
            placeholder="プロジェクトの簡単な説明を書いてください。"
            rows={4}
            className="min-h-[150px]"
          />
        )}
      </div>
      {/* Technologies Field (Multilingual) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          기술 스택 (쉼표 또는 줄바꿈으로 구분)
          <span className="text-xs text-gray-500 ml-2">
            ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
          </span>
        </label>
        {currentLang === 'ko' && (
          <textarea
            value={typeof formData.technologies === 'string' ? formData.technologies : (Array.isArray(formData.technologies) ? formData.technologies.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="PLC, Python, Arduino"
          />
        )}
        {currentLang === 'en' && (
          <textarea
            value={typeof formData.technologiesEn === 'string' ? formData.technologiesEn : (Array.isArray(formData.technologiesEn) ? formData.technologiesEn.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, technologiesEn: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="PLC, Python, Arduino"
          />
        )}
        {currentLang === 'ja' && (
          <textarea
            value={typeof formData.technologiesJa === 'string' ? formData.technologiesJa : (Array.isArray(formData.technologiesJa) ? formData.technologiesJa.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, technologiesJa: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="PLC, Python, Arduino"
          />
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          추가 이미지 URLs (줄바꿈으로 구분)
        </label>
        <textarea
          value={typeof formData.images === 'string' ? formData.images : (Array.isArray(formData.images) ? formData.images.join('\n') : '')}
          onChange={(e) => {
            const value = e.target.value
            setFormData({
              ...formData,
              images: value, // 원본 텍스트를 그대로 저장
            })
          }}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
          placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
        />
      </div>

      {/* 🌟 영상 관리 섹션 (개선된 UI) */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaVideo className="text-blue-600 dark:text-blue-400" />
            동영상 관리
          </label>
          <button
            type="button"
            onClick={handleAddVideo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FaPlus /> 영상 추가
          </button>
        </div>

        {videoItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaVideo className="text-4xl mx-auto mb-2 opacity-50" />
            <p>아직 추가된 영상이 없습니다.</p>
            <p className="text-sm mt-1">위의 "영상 추가" 버튼을 클릭하여 영상을 추가하세요.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {videoItems.map((item, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 space-y-4">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    영상 {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                  >
                    <FaTrash /> 삭제
                  </button>
                </div>

                {/* 영상 URL 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    영상 URL *
                  </label>
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=... 또는 https://youtube.com/shorts/..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* 영상 설명 (RichTextEditor - 다국어) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      영상 설명 (리치텍스트)
                      <span className="text-xs text-gray-500 ml-2">
                        ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
                      </span>
                    </label>
                    <span className={`text-xs ${
                      (currentLang === 'ko' ? item.description.length : currentLang === 'en' ? item.descriptionEn.length : item.descriptionJa.length) > 5000 
                        ? 'text-red-600 dark:text-red-400 font-bold' 
                        : (currentLang === 'ko' ? item.description.length : currentLang === 'en' ? item.descriptionEn.length : item.descriptionJa.length) > 4000
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {currentLang === 'ko' ? item.description.length : currentLang === 'en' ? item.descriptionEn.length : item.descriptionJa.length} / 5000자
                    </span>
                  </div>
                  
                  {currentLang === 'ko' && (
                    <RichTextEditor
                      value={item.description}
                      onChange={(value) => handleVideoDescriptionChange(index, value, 'ko')}
                      placeholder="이 영상에 대한 상세한 설명을 작성하세요. 굵게, 기울임, 리스트 등 다양한 서식을 사용할 수 있습니다."
                      rows={4}
                      className="min-h-[150px]"
                    />
                  )}
                  
                  {currentLang === 'en' && (
                    <RichTextEditor
                      value={item.descriptionEn}
                      onChange={(value) => handleVideoDescriptionChange(index, value, 'en')}
                      placeholder="Write a detailed description of this video. You can use bold, italic, lists, and other formatting."
                      rows={4}
                      className="min-h-[150px]"
                    />
                  )}
                  
                  {currentLang === 'ja' && (
                    <RichTextEditor
                      value={item.descriptionJa}
                      onChange={(value) => handleVideoDescriptionChange(index, value, 'ja')}
                      placeholder="この動画の詳細な説明を書いてください。太字、斜体、リストなどの書式を使用できます。"
                      rows={4}
                      className="min-h-[150px]"
                    />
                  )}
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 이 설명은 프로젝트 상세 페이지에서 영상 하단에 표시됩니다.
                    </p>
                    {(currentLang === 'ko' ? item.description.length : currentLang === 'en' ? item.descriptionEn.length : item.descriptionJa.length) > 4000 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        ⚠️ 글자 수가 많습니다. 간결하게 작성해주세요.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Description Field (Multilingual) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          상세 설명 (리치텍스트 에디터)
          <span className="text-xs text-gray-500 ml-2">
            ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
          </span>
        </label>
        {currentLang === 'ko' && (
          <RichTextEditor
            value={formData.detailedDescription || ''}
            onChange={(value) => setFormData({ ...formData, detailedDescription: value })}
            placeholder="프로젝트의 상세한 설명을 작성해주세요."
            rows={6}
            className="min-h-[200px]"
          />
        )}
        {currentLang === 'en' && (
          <RichTextEditor
            value={formData.detailedDescriptionEn || ''}
            onChange={(value) => setFormData({ ...formData, detailedDescriptionEn: value })}
            placeholder="Write a detailed description of the project."
            rows={6}
            className="min-h-[200px]"
          />
        )}
        {currentLang === 'ja' && (
          <RichTextEditor
            value={formData.detailedDescriptionJa || ''}
            onChange={(value) => setFormData({ ...formData, detailedDescriptionJa: value })}
            placeholder="プロジェクトの詳細な説明を書いてください。"
            rows={6}
            className="min-h-[200px]"
          />
        )}
      </div>

      {/* Features Field (Multilingual) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          주요 기능 (줄바꿈으로 구분)
          <span className="text-xs text-gray-500 ml-2">
            ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
          </span>
        </label>
        {currentLang === 'ko' && (
          <textarea
            value={typeof formData.features === 'string' ? formData.features : (Array.isArray(formData.features) ? formData.features.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="실시간 모니터링&#10;데이터 수집 및 분석&#10;알림 시스템"
          />
        )}
        {currentLang === 'en' && (
          <textarea
            value={typeof formData.featuresEn === 'string' ? formData.featuresEn : (Array.isArray(formData.featuresEn) ? formData.featuresEn.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, featuresEn: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="Real-time monitoring&#10;Data collection and analysis&#10;Alert system"
          />
        )}
        {currentLang === 'ja' && (
          <textarea
            value={typeof formData.featuresJa === 'string' ? formData.featuresJa : (Array.isArray(formData.featuresJa) ? formData.featuresJa.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, featuresJa: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="リアルタイム監視&#10;データ収集と分析&#10;通知システム"
          />
        )}
      </div>

      {/* Learnings Field (Multilingual) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          학습 내용 (줄바꿈으로 구분)
          <span className="text-xs text-gray-500 ml-2">
            ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
          </span>
        </label>
        {currentLang === 'ko' && (
          <textarea
            value={typeof formData.learnings === 'string' ? formData.learnings : (Array.isArray(formData.learnings) ? formData.learnings.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="PLC 프로그래밍 기법&#10;실시간 데이터 처리&#10;웹 기반 대시보드 구축"
          />
        )}
        {currentLang === 'en' && (
          <textarea
            value={typeof formData.learningsEn === 'string' ? formData.learningsEn : (Array.isArray(formData.learningsEn) ? formData.learningsEn.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, learningsEn: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="PLC programming techniques&#10;Real-time data processing&#10;Web-based dashboard development"
          />
        )}
        {currentLang === 'ja' && (
          <textarea
            value={typeof formData.learningsJa === 'string' ? formData.learningsJa : (Array.isArray(formData.learningsJa) ? formData.learningsJa.join('\n') : '')}
            onChange={(e) => setFormData({ ...formData, learningsJa: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            placeholder="PLCプログラミング技術&#10;リアルタイムデータ処理&#10;Webベースダッシュボード開発"
          />
        )}
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className={`flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
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
    </div>
  )
}

export default ProjectForm
