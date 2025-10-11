import React, { useState, useMemo, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaVideo, FaStar } from 'react-icons/fa'
import { VideoLearning, VideoLearningFormData } from '../../types'
import { useVideoLearningManagerData } from '../../hooks/useVideoLearnings'
import { useCRUDManager } from '../../hooks/useCRUDManager'
import { useToastHelpers } from '../../hooks/useToast'
import VideoLearningForm from '../forms/VideoLearningForm'
import { formatDate } from '../../utils/dateUtils'
import { extractUniqueCategories } from '../../utils/categoryUtils'
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/videoUtils'

interface VideoLearningManagerProps {
  initialEditId?: string  // 🌟 URL state로 전달된 수정 대상 ID
}

const VideoLearningManager: React.FC<VideoLearningManagerProps> = ({ initialEditId }) => {
  const { success, error } = useToastHelpers()
  const { 
    videoLearnings, 
    isLoading, 
    createVideoLearning, 
    updateVideoLearning, 
    deleteVideoLearning 
  } = useVideoLearningManagerData()

  // 영상 학습 CRUD 관리
  const [videoState, videoActions] = useCRUDManager<VideoLearning>({
    onSave: async (data: VideoLearningFormData, editingItem) => {
      console.log('📹 VideoLearningManager - 저장 시작:', data)
      console.log('🔗 skillIds:', data.skillIds)
      
      if (editingItem) {
        console.log('✏️ 영상 학습 수정 모드:', editingItem._id)
        const result = await updateVideoLearning(editingItem._id, data)
        console.log('✅ 수정 결과:', result)
        if (result.success) {
          success('영상 학습 수정 완료', '영상 학습 정보가 성공적으로 수정되었습니다.')
        }
      } else {
        console.log('➕ 영상 학습 생성 모드')
        const result = await createVideoLearning(data)
        console.log('✅ 생성 결과:', result)
        if (result.success) {
          success('영상 학습 추가 완료', '새로운 영상 학습이 성공적으로 추가되었습니다.')
        }
      }
    },
    onDelete: async (video: VideoLearning) => {
      await deleteVideoLearning(video._id)
      success('영상 학습 삭제 완료', `${video.title}이(가) 삭제되었습니다.`)
    },
    onError: (err) => {
      error('작업 실패', err.message || '알 수 없는 오류가 발생했습니다.')
    }
  })

  // 카테고리 필터
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [hasAutoOpened, setHasAutoOpened] = useState(false)  // 🌟 자동 열림 추적
  
  // 동적 카테고리 추출
  const availableCategories = useMemo(() => 
    extractUniqueCategories(videoLearnings), 
    [videoLearnings]
  )

  // 필터링된 영상 목록
  const filteredVideos = useMemo(() => {
    if (categoryFilter === 'all') return videoLearnings
    return videoLearnings.filter(video => video.category === categoryFilter)
  }, [videoLearnings, categoryFilter])

  // 🌟 initialEditId가 전달되면 자동으로 해당 영상 수정 모드로 전환 (한 번만)
  useEffect(() => {
    if (initialEditId && videoLearnings.length > 0 && !hasAutoOpened) {
      const videoToEdit = videoLearnings.find(video => video._id === initialEditId)
      if (videoToEdit) {
        console.log('🎯 자동 수정 모드 활성화:', videoToEdit.title)
        videoActions.handleEdit(videoToEdit)
        setHasAutoOpened(true)  // 🌟 한 번만 실행되도록 표시
      }
    }
  }, [initialEditId, videoLearnings, hasAutoOpened, videoActions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaVideo className="text-red-600" /> 영상 학습 관리
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            유튜브 영상을 통한 학습 기록을 관리합니다
          </p>
        </div>
        {!videoState.showForm && (
          <button
            onClick={videoActions.handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <FaPlus /> 새 영상 추가
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      {!videoState.showForm && availableCategories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              categoryFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            전체 ({videoLearnings.length})
          </button>
          {availableCategories.map((cat) => {
            const count = videoLearnings.filter(v => v.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  categoryFilter === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* 폼 */}
      {videoState.showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {videoState.editingItem ? '영상 학습 수정' : '새 영상 학습 추가'}
          </h3>
          <VideoLearningForm
            data={videoState.editingItem || undefined}
            onSave={videoActions.handleSave}
            onCancel={videoActions.handleCancelEdit}
            isSaving={videoState.isSaving}
            availableCategories={availableCategories}
          />
        </div>
      )}

      {/* 영상 목록 */}
      {!videoState.showForm && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const videoId = extractYouTubeId(video.videoUrl)
            const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId, 'hqdefault') : null

            return (
              <div
                key={video._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* 썸네일 */}
                {thumbnailUrl && (
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs font-medium">
                      YouTube
                    </div>
                  </div>
                )}

                {/* 내용 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                      {video.category}
                    </span>
                    {video.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <FaStar
                            key={i}
                            className={`text-xs ${
                              i < video.rating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title}
                  </h4>

                  {video.purpose && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {video.purpose}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>{formatDate(video.watchDate)}</span>
                    {video.skillIds && video.skillIds.length > 0 && (
                      <>
                        <span>•</span>
                        <span>스킬 {video.skillIds.length}개</span>
                      </>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => videoActions.handleEdit(video)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <FaEdit /> 수정
                    </button>
                    <button
                      onClick={() => videoActions.handleDelete(video)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <FaTrash /> 삭제
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 빈 상태 */}
      {!videoState.showForm && filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <FaVideo className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {categoryFilter === 'all' 
              ? '아직 등록된 영상 학습이 없습니다' 
              : `${categoryFilter} 카테고리에 영상 학습이 없습니다`}
          </p>
          <button
            onClick={videoActions.handleAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <FaPlus /> 첫 영상 추가하기
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoLearningManager

