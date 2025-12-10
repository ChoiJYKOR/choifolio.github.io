import React, { useState, useMemo } from 'react'
import { FaSave, FaStar, FaTimes } from 'react-icons/fa'
import { VideoPlaylist, VideoPlaylistFormData } from '../../types'
import { formatCategoryDisplayName } from '../../utils/categoryUtils'
import { extractYouTubePlaylistId, getYouTubePlaylistThumbnail } from '../../utils/videoUtils'
import { useSkills } from '../../hooks/useSkills'
import { useCategories } from '../../hooks/useCategories'
import LexicalEditor from '../lexical/LexicalEditor'
import { SerializedEditorState } from 'lexical'

interface FormProps {
  data?: VideoPlaylist
  onSave: (data: VideoPlaylistFormData) => void
  onCancel: () => void
  isSaving?: boolean
  availableCategories?: string[]
}

const VideoPlaylistForm: React.FC<FormProps> = ({ 
  data, 
  onSave, 
  onCancel, 
  isSaving = false, 
  availableCategories = ['PLC', '데이터분석', '로봇공학', 'IoT', '기타'] 
}) => {
  const { skillCategories, loading: skillsLoading } = useSkills()
  
  // 🌟 카테고리 데이터 가져오기
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  // categories가 배열이 아닌 경우를 대비한 안전 처리
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  const initialWatchDate = data?.watchDate && !isNaN(new Date(data.watchDate).getTime())
    ? new Date(data.watchDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const [playlistUrlInput, setPlaylistUrlInput] = useState<string>(() => {
    if (data?.playlistId) return `https://www.youtube.com/playlist?list=${data.playlistId}`
    return ''
  })

  // 🌟 categoryIds 초기값 처리
  const initialCategoryIds = data?.categoryIds 
    ? (data.categoryIds as any[]).map((catIdOrObj: any) => 
        typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj._id
      ).filter(Boolean) as string[]
    : []

  // keyTakeaways를 SerializedEditorState 형식으로 관리
  const parseKeyTakeaways = (value: string | undefined): SerializedEditorState => {
    if (!value) return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    try {
      const parsed = JSON.parse(value)
      if (parsed && parsed.root) return parsed
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    } catch {
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    }
  }

  // purpose와 application을 SerializedEditorState 형식으로 관리
  const parseLexicalField = (value: string | undefined): SerializedEditorState | null => {
    if (!value) return null
    try {
      const parsed = JSON.parse(value)
      if (parsed && parsed.root) return parsed
      return null
    } catch {
      return null
    }
  }

  const [formData, setFormData] = useState<Omit<VideoPlaylistFormData, 'playlistId' | 'keyTakeaways' | 'purpose' | 'application'> & { 
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
          skillIds: (data.skillIds || []).map((skillIdOrObj: any) => 
            typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj._id
          ).filter(Boolean) as string[],
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

  const playlistId = useMemo(() => {
    const id = extractYouTubePlaylistId(playlistUrlInput)
    console.log('🎬 PlaylistForm: URL 파싱 결과 -', { inputUrl: playlistUrlInput, extractedId: id })
    return id
  }, [playlistUrlInput])
  
  const thumbnailUrl = useMemo(() => playlistId ? getYouTubePlaylistThumbnail(playlistId) : null, [playlistId])
  const isValidUrl = useMemo(() => playlistId !== null, [playlistId])

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !playlistUrlInput.trim()) {
      alert('필수 필드(제목, 재생 목록 URL)를 모두 입력해주세요.')
      return
    }

    if (!isValidUrl || !playlistId) {
      alert('❌ 올바른 유튜브 재생 목록 URL을 입력해주세요.')
      return
    }
    
    const { title, category, categoryIds, watchDate, rating, purpose, keyTakeaways, application, skillIds, order } = formData
    
    const saveData = { 
      title, 
      playlistId: playlistId!,
      category, 
      categoryIds: categoryIds || [],  // 🌟 다중 카테고리 추가
      watchDate, 
      ...(rating !== undefined && { rating }),
      ...(purpose && { purpose: typeof purpose === 'string' ? purpose : JSON.stringify(purpose) }),
      ...(keyTakeaways && { keyTakeaways: JSON.stringify(keyTakeaways) }),
      ...(application && { application: typeof application === 'string' ? application : JSON.stringify(application) }),
      skillIds: skillIds || [],
      order: order || 0,
    }
    
    console.log('📝 VideoPlaylistForm: 저장 데이터 전송', saveData)
    onSave(saveData as VideoPlaylistFormData)
  }

  const isFormValid = formData.title.trim() && playlistUrlInput.trim() && isValidUrl

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
            placeholder="재생 목록 제목을 입력하세요"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            재생 목록 URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={playlistUrlInput}
            onChange={(e) => setPlaylistUrlInput(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              playlistUrlInput && !isValidUrl
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="https://www.youtube.com/playlist?list=..."
            required
          />
          {playlistUrlInput && !isValidUrl && (
            <p className="text-red-500 text-sm mt-1">올바른 유튜브 재생 목록 URL을 입력해주세요</p>
          )}
          {playlistId && (
            <p className="text-green-600 text-sm mt-1">✅ 재생 목록 ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{playlistId}</code></p>
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
            평점
          </label>
          <div className="flex items-center gap-2">
            {renderRatingStars()}
            <span className="ml-3 text-gray-600 dark:text-gray-400">{formData.rating}/5</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            시청 목적
          </label>
          <LexicalEditor
            value={formData.purpose}
            onChange={(value) => setFormData({ ...formData, purpose: value })}
            placeholder="이 재생 목록을 왜 시청했는지 작성하세요..."
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
            placeholder="이 재생 목록에서 얻은 핵심 지식을 정리하세요..."
            className="min-h-[300px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            텍스트, 이미지, 리스트로 정리할 수 있습니다
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            통합 적용 계획
          </label>
          <LexicalEditor
            value={formData.application}
            onChange={(value) => setFormData({ ...formData, application: value })}
            placeholder="이 지식을 어떻게 활용할 계획인지 작성하세요..."
            className="min-h-[250px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            텍스트, 이미지, 리스트 등 다양한 형식으로 작성할 수 있습니다
          </p>
        </div>
      </div>

      {/* 스킬 연결 (VideoLearningForm과 동일한 UI) */}
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
            {(formData.skillIds || []).length > 0 && (
              <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  ✓ {(formData.skillIds || []).length}개 선택됨
                </span>
              </div>
            )}
            
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-[300px] overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
              {skillCategories.map((category) => (
                <div key={category._id} className="mb-3 last:mb-0">
                  <label 
                    className="font-bold text-sm block mb-2"
                    style={{ color: category.color || '#3B82F6' }}
                  >
                    {category.title}
                  </label>
                  <div className="ml-4 space-y-1">
                    {(category.skills || []).map((skill) => {
                      const isSelected = (formData.skillIds || []).includes(skill._id!)
                      return (
                        <div
                          key={skill._id}
                          onClick={() => handleSkillToggle(skill._id!)}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-100 dark:bg-blue-900/30 font-medium'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{skill.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

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

export default VideoPlaylistForm

