import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaList, FaStar, FaVideo, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { VideoPlaylist, VideoPlaylistFormData, PlaylistVideoFormData } from '../../types'
import { useVideoPlaylistManagerData, usePlaylistVideos, useCreatePlaylistVideo, useUpdatePlaylistVideo, useDeletePlaylistVideo } from '../../hooks/useVideoPlaylists'
import { useCRUDManager } from '../../hooks/useCRUDManager'
import { useToastHelpers } from '../../hooks/useToast'
import VideoPlaylistForm from '../forms/VideoPlaylistForm'
import PlaylistVideoForm from '../forms/PlaylistVideoForm'
import { formatDate } from '../../utils/dateUtils'
import { extractYouTubeId } from '../../utils/videoUtils'

const VideoPlaylistManager: React.FC = () => {
  const { success, error } = useToastHelpers()
  const { 
    playlists, 
    isLoading, 
    createPlaylist, 
    updatePlaylist, 
    deletePlaylist 
  } = useVideoPlaylistManagerData()

  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [showBulkAddForm, setShowBulkAddForm] = useState(false)
  const [bulkVideoUrls, setBulkVideoUrls] = useState('')

  const { data: playlistVideos = [] } = usePlaylistVideos(expandedPlaylistId || undefined)
  const createVideoMutation = useCreatePlaylistVideo()
  const updateVideoMutation = useUpdatePlaylistVideo()
  const deleteVideoMutation = useDeletePlaylistVideo()

  const [playlistState, playlistActions] = useCRUDManager<VideoPlaylist>({
    onSave: async (data: VideoPlaylistFormData, editingItem) => {
      if (editingItem) {
        const result = await updatePlaylist(editingItem._id, data)
        if (result.success) {
          success('재생 목록 수정 완료', '재생 목록이 성공적으로 수정되었습니다.')
        }
      } else {
        const result = await createPlaylist(data)
        if (result.success) {
          success('재생 목록 추가 완료', '새로운 재생 목록이 추가되었습니다.')
        }
      }
    },
    onDelete: async (playlist: VideoPlaylist) => {
      await deletePlaylist(playlist._id)
      success('재생 목록 삭제 완료', `${playlist.title}이(가) 삭제되었습니다.`)
    },
    onError: (err) => {
      error('작업 실패', err.message || '알 수 없는 오류가 발생했습니다.')
    }
  })

  // 영상 저장 핸들러
  const handleSaveVideo = async (data: PlaylistVideoFormData) => {
    try {
      if (editingVideo) {
        await updateVideoMutation.mutateAsync({ id: editingVideo._id, data })
        success('영상 수정 완료', '영상 학습 기록이 수정되었습니다.')
      } else {
        await createVideoMutation.mutateAsync(data)
        success('영상 추가 완료', '새로운 영상 학습 기록이 추가되었습니다.')
      }
      setShowVideoForm(false)
      setEditingVideo(null)
    } catch (err) {
      error('영상 저장 실패', '영상 저장 중 오류가 발생했습니다.')
    }
  }

  // 영상 삭제 핸들러
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('이 영상 학습 기록을 삭제하시겠습니까?')) return
    try {
      await deleteVideoMutation.mutateAsync(videoId)
      success('영상 삭제 완료', '영상 학습 기록이 삭제되었습니다.')
    } catch (err) {
      error('영상 삭제 실패', '영상 삭제 중 오류가 발생했습니다.')
    }
  }

  // 영상 URL 일괄 추가 핸들러
  const handleBulkAddVideos = async () => {
    if (!bulkVideoUrls.trim() || !expandedPlaylistId) {
      alert('영상 URL을 입력해주세요')
      return
    }

    const urls = bulkVideoUrls.split('\n').map(url => url.trim()).filter((url): url is string => Boolean(url))
    
    if (urls.length === 0) {
      alert('유효한 URL이 없습니다')
      return
    }

    try {
      let successCount = 0
      
      for (const url of urls) {
        if (!url) continue
        
        const videoId = extractYouTubeId(url)
        
        if (!videoId) {
          console.warn(`유효하지 않은 URL: ${url}`)
          continue
        }

        const videoData: PlaylistVideoFormData = {
          playlistId: expandedPlaylistId!,
          videoId: videoId,
          title: `영상 ${playlistVideos.length + successCount + 1}`,
          keyTakeaways: '',
          order: playlistVideos.length + successCount,
        }

        await createVideoMutation.mutateAsync(videoData)
        successCount++
      }

      setBulkVideoUrls('')
      setShowBulkAddForm(false)
      success('일괄 추가 완료', `${successCount}개의 영상이 추가되었습니다. 각 영상의 제목과 핵심 배움을 수정해주세요.`)
    } catch (err) {
      error('일괄 추가 실패', '영상 추가 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaList className="text-red-600" />
          재생 목록 관리
        </h2>
        <button
          onClick={playlistActions.handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <FaPlus />
          재생 목록 추가
        </button>
      </div>

      {/* 재생 목록 폼 */}
      {playlistState.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {playlistState.editingItem ? '재생 목록 수정' : '재생 목록 추가'}
              </h2>
              {playlistState.editingItem ? (
                <VideoPlaylistForm
                  data={playlistState.editingItem}
                  onSave={playlistActions.handleSave}
                  onCancel={playlistActions.handleCancel}
                  isSaving={playlistState.isSaving}
                />
              ) : (
                <VideoPlaylistForm
                  onSave={playlistActions.handleSave}
                  onCancel={playlistActions.handleCancel}
                  isSaving={playlistState.isSaving}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 영상 폼 모달 */}
      {showVideoForm && expandedPlaylistId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingVideo ? '영상 학습 기록 수정' : '영상 학습 기록 추가'}
              </h2>
              <PlaylistVideoForm
                playlistId={expandedPlaylistId}
                data={editingVideo}
                onSave={handleSaveVideo}
                onCancel={() => {
                  setShowVideoForm(false)
                  setEditingVideo(null)
                }}
                isSaving={createVideoMutation.isPending || updateVideoMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* 재생 목록 목록 */}
      <div className="grid gap-4">
        {playlists.map((playlist) => {
          const isExpanded = expandedPlaylistId === playlist._id
          const currentVideos = isExpanded ? playlistVideos : []
          
          return (
            <div
              key={playlist._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* 재생 목록 헤더 */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {playlist.title}
                      </h3>
                      <button
                        onClick={() => setExpandedPlaylistId(isExpanded ? null : playlist._id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title={isExpanded ? '영상 목록 접기' : '영상 목록 펼치기'}
                      >
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {/* 🌟 다중 카테고리 표시 */}
                      {playlist.categoryIds && playlist.categoryIds.length > 0 ? (
                        (playlist.categoryIds as any[]).map((catIdOrObj: any) => {
                          const catName = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?.name
                          return catName ? (
                            <span 
                              key={typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                            >
                              {catName}
                            </span>
                          ) : null
                        })
                      ) : (
                        // 호환성: categoryIds가 없으면 기존 category 표시
                        playlist.category && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {playlist.category}
                          </span>
                        )
                      )}
                      {playlist.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${
                                i < playlist.rating! ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span>시청일: {formatDate(playlist.watchDate)}</span>
                    </div>
                    {playlist.purpose && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{playlist.purpose}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => playlistActions.handleEdit(playlist)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors"
                      title="재생 목록 수정"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => playlistActions.handleDelete(playlist)}
                      disabled={playlistState.isDeleting}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="재생 목록 삭제"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>

              {/* 영상 관리 섹션 - 펼쳐진 경우에만 표시 */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaVideo /> 영상 관리 ({currentVideos.length}개)
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBulkAddForm(!showBulkAddForm)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <FaList /> 영상 일괄 추가
                      </button>
                      <button
                        onClick={() => {
                          setEditingVideo(null)
                          setShowVideoForm(true)
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FaPlus /> 영상 추가
                      </button>
                    </div>
                  </div>

                  {/* 영상 URL 일괄 추가 폼 */}
                  {showBulkAddForm && (
                    <div className="mb-4 p-4 border-2 border-green-500 rounded-lg bg-white dark:bg-gray-800">
                      <h5 className="font-bold text-gray-900 dark:text-white mb-2">
                        📝 영상 URL 일괄 추가
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        재생 목록의 각 영상 URL을 한 줄에 하나씩 입력하세요. 위에서부터 순서대로 추가됩니다.
                      </p>
                      <textarea
                        value={bulkVideoUrls}
                        onChange={(e) => setBulkVideoUrls(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm mb-3"
                        rows={6}
                        placeholder="https://www.youtube.com/watch?v=VIDEO_ID_1&#10;https://www.youtube.com/watch?v=VIDEO_ID_2&#10;https://www.youtube.com/watch?v=VIDEO_ID_3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleBulkAddVideos}
                          disabled={createVideoMutation.isPending}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {createVideoMutation.isPending ? '추가 중...' : '일괄 추가'}
                        </button>
                        <button
                          onClick={() => {
                            setShowBulkAddForm(false)
                            setBulkVideoUrls('')
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 영상 목록 */}
                  {currentVideos.length > 0 ? (
                    <div className="space-y-2">
                      {currentVideos.map((video, index) => (
                        <div
                          key={video._id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                  #{index + 1}
                                </span>
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  {video.title}
                                </h5>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {video.videoId}
                              </p>
                              {video.keyTakeaways && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                  {video.keyTakeaways}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingVideo(video)
                                  setShowVideoForm(true)
                                }}
                                className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded transition-colors"
                                title="영상 수정"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video._id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                                title="영상 삭제"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
                      <FaVideo className="text-4xl mx-auto mb-2 opacity-30" />
                      <p className="text-sm">이 재생 목록에 등록된 영상이 없습니다</p>
                      <p className="text-xs mt-1">위의 "영상 일괄 추가" 버튼을 사용하세요</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {playlists.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FaList className="text-6xl mx-auto mb-4 opacity-30" />
            <p>아직 등록된 재생 목록이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPlaylistManager

