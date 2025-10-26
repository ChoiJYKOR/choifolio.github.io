import React, { useState, useMemo } from 'react'
import { FaSave } from 'react-icons/fa'
import { PlaylistVideo, PlaylistVideoFormData } from '../../types'
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/videoUtils'

interface FormProps {
  playlistId: string
  data?: PlaylistVideo
  onSave: (data: PlaylistVideoFormData) => void
  onCancel: () => void
  isSaving?: boolean
}

const PlaylistVideoForm: React.FC<FormProps> = ({ 
  playlistId,
  data, 
  onSave, 
  onCancel, 
  isSaving = false 
}) => {
  // 🌟 영상 URL 입력 (videoId 자동 추출)
  const [videoUrlInput, setVideoUrlInput] = useState<string>(() => {
    if (data?.videoId) return `https://www.youtube.com/watch?v=${data.videoId}`
    return ''
  })

  const [formData, setFormData] = useState<Omit<PlaylistVideoFormData, 'playlistId' | 'videoId'>>(
    data
      ? { 
          title: data.title,
          keyTakeaways: data.keyTakeaways || '',
          order: data.order || 0,
        } 
      : {
          title: '',
          keyTakeaways: '',
          order: 0,
        }
  )

  const videoId = useMemo(() => extractYouTubeId(videoUrlInput), [videoUrlInput])
  const thumbnailUrl = useMemo(() => videoId ? getYouTubeThumbnail(videoId) : null, [videoId])
  const isValidUrl = useMemo(() => videoId !== null, [videoId])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !videoUrlInput.trim()) {
      alert('필수 필드(제목, 영상 URL)를 모두 입력해주세요.')
      return
    }

    if (!isValidUrl || !videoId) {
      alert('❌ 올바른 유튜브 영상 URL을 입력해주세요.')
      return
    }
    
    onSave({ 
      playlistId,
      videoId: videoId!,
      title: formData.title,
      keyTakeaways: formData.keyTakeaways || '',
      order: formData.order || 0,
    })
  }

  const isFormValid = formData.title.trim() && videoUrlInput.trim() && isValidUrl

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
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
                className="w-full max-w-xs rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            영상 제목 <span className="text-red-500">*</span>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            핵심 배움 (마크다운 지원)
          </label>
          <textarea
            value={formData.keyTakeaways}
            onChange={(e) => setFormData({ ...formData, keyTakeaways: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical font-mono text-sm"
            rows={6}
            placeholder="예시:&#10;- [2:30] React Query의 staleTime 이해&#10;- [5:15] 캐시 무효화 전략&#10;- [8:45] Optimistic Updates"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            타임스탬프 형식: [MM:SS] 또는 [H:MM:SS]
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSaving || !isFormValid}
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

export default PlaylistVideoForm

