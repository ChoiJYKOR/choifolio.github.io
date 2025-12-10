import React, { useState, useMemo, useEffect } from 'react'
import { FaSave, FaStar, FaTimes } from 'react-icons/fa'
import { VideoLearning, VideoLearningFormData, Skill, SkillCategory } from '../../types'
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/videoUtils'
import { useSkills } from '../../hooks/useSkills'
import { useCategories } from '../../hooks/useCategories'
import LexicalEditor from '../lexical/LexicalEditor'
import { SerializedEditorState } from 'lexical'

interface FormProps {
  data?: VideoLearning
  onSave: (data: VideoLearningFormData) => void
  onCancel: () => void
  isSaving?: boolean
  availableCategories?: string[]
}

const VideoLearningForm: React.FC<FormProps> = ({ 
  data, 
  onSave, 
  onCancel, 
  isSaving = false, 
  availableCategories = ['PLC', '데이터분석', '로봇공학', 'IoT', '기타'] 
}) => {
  // 🌟 스킬 데이터 가져오기
  const { skillCategories, loading: skillsLoading } = useSkills()
  
  // 🌟 카테고리 데이터 가져오기
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  // categories가 배열이 아닌 경우를 대비한 안전 처리
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  // watchDate 초기값 수정
  const initialWatchDate = data?.watchDate && !isNaN(new Date(data.watchDate).getTime())
    ? new Date(data.watchDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  // 🌟 폼 상태 관리 (내부에서는 videoUrl로 관리, 저장 시 videoId로 변환)
  const [videoUrlInput, setVideoUrlInput] = useState<string>(() => {
    // videoId가 있으면 URL로 변환, videoUrl이 있으면 그대로 사용 (호환성)
    if (data?.videoId) return `https://www.youtube.com/watch?v=${data.videoId}`
    if ((data as any)?.videoUrl) return (data as any).videoUrl
    return ''
  })

  // 🌟 skillIds 초기값 처리 (populate된 객체 배열에서 _id만 추출)
  const initialSkillIds = data?.skillIds 
    ? (data.skillIds as any[]).map((skillIdOrObj: any) => 
        typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj._id
      ).filter(Boolean) as string[]
    : []

  // 🌟 categoryIds 초기값 처리
  const initialCategoryIds = data?.categoryIds 
    ? (data.categoryIds as any[]).map((catIdOrObj: any) => 
        typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj._id
      ).filter(Boolean) as string[]
    : []

  console.log('🎬 VideoLearningForm 초기화:', {
    hasData: !!data,
    rawSkillIds: data?.skillIds,
    extractedSkillIds: initialSkillIds,
    rawCategoryIds: data?.categoryIds,
    extractedCategoryIds: initialCategoryIds,
  })

  // keyTakeaways를 SerializedEditorState 형식으로 관리
  const parseKeyTakeaways = (value: string | undefined): SerializedEditorState => {
    if (!value) return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    try {
      const parsed = JSON.parse(value)
      if (parsed && parsed.root) return parsed
      // 레거시 형식도 처리
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    } catch {
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    }
  }

  // purpose와 application을 SerializedEditorState 형식으로 관리
  const parseLexicalField = (value: string | undefined): SerializedEditorState | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null
    }
    try {
      const parsed = JSON.parse(value)
      if (parsed && parsed.root && parsed.root.type === 'root') {
        return parsed
      }
      // Lexical 형식이 아니면 null 반환 (빈 상태로 처리)
      return null
    } catch {
      // JSON 파싱 실패 시 null 반환
      return null
    }
  }

  const [formData, setFormData] = useState<Omit<VideoLearningFormData, 'videoId' | 'keyTakeaways' | 'purpose' | 'application'> & { 
    keyTakeaways: SerializedEditorState
    purpose: SerializedEditorState | null
    application: SerializedEditorState | null
  }>(
    data
      ? { 
          title: data.title,
          category: data.category,
          categoryIds: initialCategoryIds,
          watchDate: initialWatchDate as string,
          rating: data.rating || 3,
          purpose: parseLexicalField(data.purpose),
          keyTakeaways: parseKeyTakeaways(data.keyTakeaways),
          application: parseLexicalField(data.application),
          skillIds: initialSkillIds,
          order: data.order || 0,
        } 
      : {
          title: '',
          category: availableCategories[0] || 'PLC',
          categoryIds: [],
          watchDate: initialWatchDate as string,
          rating: 3,
          purpose: null,
          keyTakeaways: { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } },
          application: null,
          skillIds: [],
          order: 0,
        }
  )

  // 🌟 유튜브 영상 ID 추출 (실시간) + 디버깅 로그
  const videoId = useMemo(() => {
    const id = extractYouTubeId(videoUrlInput)
    console.log('🎬 VideoForm: URL 파싱 결과 -', { inputUrl: videoUrlInput, extractedId: id })
    return id
  }, [videoUrlInput])
  
  const thumbnailUrl = useMemo(() => videoId ? getYouTubeThumbnail(videoId) : null, [videoId])
  const isValidUrl = useMemo(() => videoId !== null, [videoId])

  // 🌟 data가 변경될 때 formData 업데이트
  useEffect(() => {
    if (data) {
      console.log('📝 VideoLearningForm: data 로드됨', {
        title: data.title,
        keyTakeaways: data.keyTakeaways,
        purpose: data.purpose,
        application: data.application,
      })
      
      const updatedSkillIds = data.skillIds 
        ? (data.skillIds as any[]).map((skillIdOrObj: any) => 
            typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj._id
          ).filter(Boolean) as string[]
        : []
      
      const updatedCategoryIds = data.categoryIds 
        ? (data.categoryIds as any[]).map((catIdOrObj: any) => 
            typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj._id
          ).filter(Boolean) as string[]
        : []

      const updatedWatchDate = data.watchDate && !isNaN(new Date(data.watchDate).getTime())
        ? new Date(data.watchDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      const parsedPurpose = parseLexicalField(data.purpose)
      const parsedKeyTakeaways = parseKeyTakeaways(data.keyTakeaways)
      const parsedApplication = parseLexicalField(data.application)
      
      console.log('📝 파싱된 데이터:', {
        purpose: parsedPurpose,
        keyTakeaways: parsedKeyTakeaways,
        application: parsedApplication,
      })

      setFormData({
        title: data.title,
        category: data.category,
        categoryIds: updatedCategoryIds,
        watchDate: updatedWatchDate as string,
        rating: data.rating || 3,
        purpose: parsedPurpose,
        keyTakeaways: parsedKeyTakeaways,
        application: parsedApplication,
        skillIds: updatedSkillIds,
        order: data.order || 0,
      })

      // videoUrl도 업데이트
      if (data.videoId) {
        setVideoUrlInput(`https://www.youtube.com/watch?v=${data.videoId}`)
      } else if ((data as any)?.videoUrl) {
        setVideoUrlInput((data as any).videoUrl)
      }
    }
  }, [data])

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
    const categorySkillIds = (category.skills || []).map((skill: Skill) => skill._id!).filter(Boolean)
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
    
    setFormData({ 
      ...formData, 
      skillIds: newSkillIds 
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !videoUrlInput.trim()) {
      alert('필수 필드(제목, 영상 URL)를 모두 입력해주세요.')
      return
    }

    if (!isValidUrl || !videoId) {
      alert('❌ 올바른 유튜브 URL을 입력해주세요.')
      return
    }

    console.log('📹 영상 학습 저장 시작:', formData)
    console.log('🎬 추출된 영상 ID:', videoId)
    console.log('🔗 선택된 스킬 IDs:', formData.skillIds)
    
    const { title, category, watchDate, rating, purpose, keyTakeaways, application, skillIds, order } = formData
    
    // 🌟 videoId로 변환하여 저장
    onSave({ 
      title, 
      videoId: videoId!,  // 추출된 영상 ID
      category, 
      watchDate, 
      ...(rating !== undefined && { rating }),
      ...(purpose && { purpose: typeof purpose === 'string' ? purpose : JSON.stringify(purpose) }),
      ...(keyTakeaways && { keyTakeaways: JSON.stringify(keyTakeaways) }),
      ...(application && { application: typeof application === 'string' ? application : JSON.stringify(application) }),
      skillIds: skillIds || [],
      order: order || 0,
    })
  }

  // 폼 유효성 검사
  const isFormValid = formData.title.trim() && videoUrlInput.trim() && isValidUrl

  // 🌟 별점 렌더링 (클릭 가능)
  const renderRatingStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      return (
        <button
          key={i}
          type="button"
          onClick={() => setFormData({ ...formData, rating: starValue })}
          className={`text-3xl transition-colors ${
            starValue <= (formData.rating || 0)
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
          }`}
        >
          <FaStar />
        </button>
      )
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="영상 제목을 입력하세요"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            영상 URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              videoUrlInput && !isValidUrl
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          {videoUrlInput && !isValidUrl && (
            <p className="text-red-500 text-sm mt-1">올바른 유튜브 URL을 입력해주세요</p>
          )}
          {videoId && (
            <p className="text-green-600 text-sm mt-1">✅ 영상 ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{videoId}</code></p>
          )}
          {/* 🌟 썸네일 미리보기 */}
          {thumbnailUrl && isValidUrl && (
            <div className="mt-3">
              <img 
                src={thumbnailUrl} 
                alt="영상 썸네일" 
                className="w-full max-w-md rounded-lg shadow-md"
                onError={(e) => {
                  // maxresdefault가 없으면 hqdefault로 폴백
                  const target = e.target as HTMLImageElement
                  if (target.src.includes('maxresdefault')) {
                    target.src = getYouTubeThumbnail(videoId!, 'hqdefault')
                  }
                }}
              />
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ 유효한 유튜브 URL</p>
            </div>
          )}
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
            시청 날짜
          </label>
          <input
            type="date"
            value={formData.watchDate}
            onChange={(e) => setFormData({ ...formData, watchDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            이해도 평점
          </label>
          <div className="flex items-center gap-2">
            {renderRatingStars()}
            <span className="ml-3 text-gray-600 dark:text-gray-400">{formData.rating}/5</span>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            시청 목적
          </label>
          <LexicalEditor
            value={formData.purpose}
            onChange={(value) => setFormData({ ...formData, purpose: value })}
            placeholder="이 영상을 왜 시청했는지, 어떤 문제를 해결하기 위해서인지 작성하세요..."
            className="min-h-[200px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            핵심 배움
          </label>
          <LexicalEditor
            value={formData.keyTakeaways}
            onChange={(value) => setFormData({ ...formData, keyTakeaways: value })}
            placeholder="영상에서 얻은 핵심 지식 3-5가지를 정리하세요..."
            className="min-h-[300px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            텍스트, 이미지, 리스트로 정리할 수 있습니다
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            적용 계획
          </label>
          <LexicalEditor
            value={formData.application}
            onChange={(value) => setFormData({ ...formData, application: value })}
            placeholder="이 지식을 어떻게 활용할 계획인지, 또는 이미 적용한 경험을 작성하세요..."
            className="min-h-[250px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            텍스트, 이미지, 리스트 등 다양한 형식으로 작성할 수 있습니다
          </p>
        </div>
      </div>

      {/* 🌟 스킬 연결 (체크박스 UI) */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          관련 기술 연동 🔗
        </label>
        {skillsLoading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
            스킬 목록을 불러오는 중입니다...
          </div>
        ) : (
          <>
            {/* 선택된 스킬 개수 표시 */}
            {(formData.skillIds || []).length > 0 && (
              <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  ✓ {(formData.skillIds || []).length}개 선택됨
                </span>
              </div>
            )}
            
            {/* 카테고리별 스킬 체크박스 */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
              {skillCategories.map((category) => {
                const categorySkills = category.skills || []
                const categorySkillIds = categorySkills.map((s: Skill) => s._id!).filter(Boolean)
                const selectedInCategory = categorySkillIds.filter((id: string) => 
                  (formData.skillIds || []).includes(id)
                )
                const allSelected = categorySkillIds.length > 0 && selectedInCategory.length === categorySkillIds.length
                const someSelected = selectedInCategory.length > 0 && !allSelected

                return (
                  <div key={category._id} className="mb-4 last:mb-0">
                    {/* 카테고리 헤더 */}
                    <div 
                      onClick={() => handleSkillCategoryToggle(category)}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someSelected
                        }}
                        onChange={() => {}}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <label 
                        className="font-bold text-base cursor-pointer flex-1"
                        style={{ color: category.color || '#3B82F6' }}
                      >
                        {category.title} ({selectedInCategory.length}/{categorySkills.length})
                      </label>
                    </div>

                    {/* 개별 스킬 체크박스 */}
                    <div className="ml-8 space-y-2">
                      {categorySkills.map((skill: Skill) => {
                        const isSelected = (formData.skillIds || []).includes(skill._id!)
                        return (
                          <div
                            key={skill._id}
                            onClick={() => handleSkillToggle(skill._id!)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-100 dark:bg-blue-900/30 font-medium'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <label 
                              className="cursor-pointer flex-1 text-sm"
                              style={{ color: isSelected ? skill.color : undefined }}
                            >
                              {skill.name}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 순서 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          순서 (낮을수록 먼저 표시)
        </label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          min="0"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSaving || !isFormValid || !isValidUrl}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <FaSave /> {isSaving ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          취소
        </button>
      </div>
    </form>
  )
}

export default VideoLearningForm

