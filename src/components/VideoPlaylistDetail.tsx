import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaList, FaStar, FaCalendar, FaEdit, FaTrash, FaCubes, FaBullseye, FaRocket, FaChevronDown, FaChevronUp, FaSave, FaTimes } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/dateUtils'
import { useVideoPlaylist, useDeleteVideoPlaylist, usePlaylistVideos, useUpdatePlaylistVideo } from '../hooks/useVideoPlaylists'
import { useSkills } from '../hooks/useSkills'
import ReactMarkdown from 'react-markdown'
import { renderTextWithTimestamps, renderHtmlWithTimestamps } from '../utils/videoUtils'
import { renderEditorJSData, isLexicalData, renderLexicalData } from '../utils/textUtils'
import LexicalEditor from './lexical/LexicalEditor'
import { useToastHelpers } from '../hooks/useToast'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '@/utils/i18nUtils'
import { SerializedEditorState } from 'lexical'

// 유튜브 IFrame Player API 타입 정의
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const VideoPlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  const { data: playlist, isLoading: loading } = useVideoPlaylist(id)
  const { data: playlistVideos = [] } = usePlaylistVideos(id)
  const deleteMutation = useDeleteVideoPlaylist()
  const updateVideoMutation = useUpdatePlaylistVideo()
  const { skillCategories } = useSkills()
  const { success, error } = useToastHelpers()

  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null)
  const [activeVideoTab, setActiveVideoTab] = useState<string | null>(null)
  const [showVideoTabs, setShowVideoTabs] = useState(true)
  
  // 🌟 핵심 배움 편집 상태
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<SerializedEditorState>({ root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } })
  
  // keyTakeaways 문자열을 SerializedEditorState로 변환
  // ⚠️ 주의: 편집 모드에서는 Lexical 형식만 사용하므로, Editor.js 데이터는 빈 상태로 시작
  const parseKeyTakeaways = (value: string | undefined): SerializedEditorState => {
    const emptyState = { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    
    if (!value || typeof value !== 'string') {
      return emptyState
    }
    
    // JSON 형식인지 먼저 확인 (시작이 '{' 또는 '['로 시작하는지)
    const trimmed = value.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      // JSON이 아닌 일반 문자열인 경우 빈 에디터 상태 반환
      return emptyState
    }
    
    try {
      const parsed = JSON.parse(value)
      
      // Lexical 형식인지 확인 (root.type === 'root'인지 확인)
      if (parsed && parsed.root && parsed.root.type === 'root') {
        return parsed
      }
      
      // Editor.js 데이터인 경우 빈 상태 반환
      // (읽기 모드에서는 renderEditorJSData로 렌더링되지만, 편집 모드에서는 Lexical만 사용)
      if (parsed && parsed.blocks) {
        console.warn('Editor.js 데이터 감지 - 편집 모드에서는 빈 상태로 시작합니다.')
        return emptyState
      }
      
      return emptyState
    } catch (e) {
      // JSON 파싱 실패 시 빈 에디터 상태 반환
      console.warn('parseKeyTakeaways JSON 파싱 실패:', e, value)
      return emptyState
    }
  }


  // 첫 번째 영상을 기본 활성 영상으로 설정
  useEffect(() => {
    if (playlistVideos.length > 0 && !activeVideoId) {
      setActiveVideoId(playlistVideos[0].videoId)
    }
  }, [playlistVideos, activeVideoId])

  // 유튜브 IFrame API 초기화
  useEffect(() => {
    if (!playlist?.playlistId) return
    
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
    
    const initializePlayer = () => {
      if (window.YT && window.YT.Player && playerContainerRef.current) {
        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          playerVars: {
            listType: 'playlist',
            list: playlist.playlistId,
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
            modestbranding: 1,
            fs: 1,
            cc_load_policy: 0,
            iv_load_policy: 3,
            showinfo: 0,
          },
          events: {
            onReady: () => {
              setIsPlayerReady(true)
            },
          },
        })
      }
    }
    
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer
    }
    
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy()
      }
    }
  }, [playlist?.playlistId])

  // 첫 번째 영상을 기본 활성 탭으로 설정
  useEffect(() => {
    if (playlistVideos.length > 0 && !activeVideoTab) {
      setActiveVideoTab(playlistVideos[0]._id)
    }
  }, [playlistVideos, activeVideoTab])

  // 연결된 스킬
  const linkedSkills = useMemo(() => {
    if (!playlist?.skillIds || !skillCategories) return []
    const allSkills = skillCategories.flatMap(cat => cat.skills || [])
    return allSkills.filter(skill => skill._id && playlist.skillIds?.includes(skill._id))
  }, [playlist, skillCategories])

  // 활성 영상
  const activeVideo = useMemo(() => 
    playlistVideos.find(v => v._id === activeVideoTab),
    [playlistVideos, activeVideoTab]
  )

  // 탭 클릭 시 영상 전환
  const handleVideoTabClick = (video: any, index: number) => {
    setActiveVideoTab(video._id)
    handleTimestampClick(video.videoId, 0)
  }

  // 타임스탬프 클릭 핸들러 (영상 전환 + 시간 이동 + 자동 재생)
  const handleTimestampClick = (targetVideoId: string, seconds: number) => {
    if (!isPlayerReady || !playerRef.current) {
      return
    }

    try {
      const videoIndex = playlistVideos.findIndex(v => v.videoId === targetVideoId)
      
      if (videoIndex === -1) {
        return
      }

      // 영상 전환
      playerRef.current.playVideoAt(videoIndex)
      setActiveVideoId(targetVideoId)
      
      // 시간 이동 + 자동 재생
      setTimeout(() => {
        playerRef.current.seekTo(seconds, true)
        playerRef.current.playVideo()
      }, 1000)
      
    } catch (error) {
      console.error('타임스탬프 이동 실패:', error)
    }
  }


  // 재생 목록 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm('이 재생 목록을 삭제하시겠습니까?')) return

    try {
      await deleteMutation.mutateAsync(id!)
      navigate('/video-learnings')
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  // 🌟 핵심 배움 편집 시작
  const handleStartEdit = (video: any) => {
    setEditingVideoId(video._id)
    const parsed = parseKeyTakeaways(video.keyTakeaways)
    console.log('📥 편집 모드 진입 - 원본 데이터:', video.keyTakeaways)
    console.log('📥 편집 모드 진입 - 파싱된 데이터:', parsed)
    // parsed가 빈 상태인지 확인 (children이 비어있으면 빈 상태)
    const isEmpty = !parsed.root.children || parsed.root.children.length === 0
    if (isEmpty && video.keyTakeaways) {
      console.warn('⚠️ 기존 데이터가 있지만 Lexical 형식이 아닙니다. 빈 상태로 시작합니다.')
    }
    setEditingContent(parsed)
  }

  // 🌟 핵심 배움 편집 취소
  const handleCancelEdit = () => {
    setEditingVideoId(null)
    setEditingContent({ root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } })
  }

  // 🌟 핵심 배움 저장
  const handleSaveEdit = async () => {
    if (!editingVideoId || !activeVideo) return
    
    // editingContent가 null이거나 빈 상태인지 확인
    if (!editingContent) {
      error('저장 실패', '편집 내용이 없습니다.')
      return
    }
    
    // 빈 상태인지 확인 (children이 없거나 모두 비어있음)
    const isEmpty = !editingContent.root?.children || 
                    editingContent.root.children.length === 0 ||
                    (editingContent.root.children.length === 1 && 
                     editingContent.root.children[0]?.type === 'paragraph' &&
                     (!editingContent.root.children[0].children || 
                      editingContent.root.children[0].children.length === 0))
    
    if (isEmpty) {
      const confirmDelete = confirm('내용이 비어있습니다. 기존 핵심 배움을 삭제하시겠습니까?')
      if (!confirmDelete) {
        return
      }
    }

    try {
      await updateVideoMutation.mutateAsync({
        id: editingVideoId,
        data: {
          playlistId: id!,
          videoId: activeVideo.videoId,
          title: activeVideo.title,
          keyTakeaways: isEmpty ? '' : JSON.stringify(editingContent),
          order: activeVideo.order || 0,
        }
      })
      success('저장 완료', '핵심 배움이 저장되었습니다.')
      setEditingVideoId(null)
      setEditingContent({ root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } })
    } catch (err) {
      error('저장 실패', '핵심 배움 저장 중 오류가 발생했습니다.')
      console.error('핵심 배움 저장 실패:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaList className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">재생 목록을 찾을 수 없습니다</p>
          <Link 
            to="/video-learnings" 
            state={location.state}
            className="text-primary-600 hover:text-primary-700 mt-4 inline-block"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-white dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/video-learnings"
            state={location.state}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <FaArrowLeft /> 목록으로 돌아가기
          </Link>
        </motion.div>

        {/* 2단 레이아웃 컨테이너 */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* ========== 왼쪽 영역: 플레이어 + 기본 정보 ========== */}
          <div className="w-full lg:w-7/12 lg:sticky lg:top-8 self-start">
            
            {/* 유튜브 재생 목록 플레이어 */}
            {playlist.playlistId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-black relative">
                  <div 
                    ref={playerContainerRef}
                    className="w-full h-full"
                  />
                  {!isPlayerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 기본 정보 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-4">
                {/* 카테고리 배지 (복수 표시) */}
                <div className="flex flex-wrap gap-2">
                  {playlist.categoryIds && playlist.categoryIds.length > 0 ? (
                    (playlist.categoryIds as any[]).map((catIdOrObj: any) => {
                      const catName = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?.name
                      return catName ? (
                        <span 
                          key={typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                        >
                          {catName}
                        </span>
                      ) : null
                    })
                  ) : (
                    // 호환성: categoryIds가 없으면 기존 category 표시
                    playlist.category && (
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                        {playlist.category}
                      </span>
                    )
                  )}
                </div>
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Link
                      to={`/admin`}
                      state={{ tab: 'videoPlaylists', editId: playlist._id }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                      aria-label="재생 목록 수정"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="재생 목록 삭제"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {playlist.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {playlist.rating && (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar 
                        key={i} 
                        className={`text-sm ${i < playlist.rating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} 
                      />
                    ))}
                    <span className="font-medium">{playlist.rating}/5</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaCalendar />
                  <span>{formatDate(playlist.watchDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaList />
                  <span>{playlistVideos.length}개 영상</span>
                </div>
              </div>
            </motion.div>

            {/* 시청 목적 */}
            {playlist.purpose && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6 mb-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaBullseye className="text-blue-600" /> 시청 목적
                </h3>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm">
                  <ReactMarkdown>{playlist.purpose}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* 통합 적용 계획 */}
            {playlist.application && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-600"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaRocket className="text-purple-600" /> 통합 적용 계획
                </h3>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm">
                  <ReactMarkdown>{playlist.application}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>

          {/* ========== 오른쪽 영역: 학습 기록 ========== */}
          <div className="w-full lg:w-5/12 space-y-6">

            {/* 연결된 스킬 */}
            {linkedSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6 mb-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaCubes className="text-primary-600" /> 학습한 기술
                </h3>
                <div className="flex flex-wrap gap-2">
                  {linkedSkills.map(skill => (
                    <div
                      key={skill._id}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: `${skill.color}26`,
                        color: skill.color,
                      }}
                    >
                      {skill.name}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 영상별 학습 기록 - 탭 형태 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowVideoTabs(!showVideoTabs)}
              className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {showVideoTabs ? <FaChevronUp /> : <FaChevronDown />}
              📹 영상별 학습 기록 ({playlistVideos.length}개)
            </button>
          </div>
          
          {/* 영상 탭 버튼들 - 토글 가능 */}
          {showVideoTabs && playlistVideos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {playlistVideos.map((video, index) => (
                <button
                  key={video._id}
                  onClick={() => handleVideoTabClick(video, index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeVideoTab === video._id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  #{index + 1} {video.title}
                </button>
              ))}
            </div>
          )}

          {/* 활성 영상의 학습 기록 */}
          {playlistVideos.length > 0 && activeVideo ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* 영상 헤더 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                  {activeVideo.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      유튜브 영상 ID: {activeVideo.videoId}
                    </p>
                    {activeVideo.createdAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        기록 날짜: {formatDate(activeVideo.createdAt)}
                      </p>
                    )}
                  </div>
                  {/* 🌟 편집 버튼 - 인증된 사용자에게만 표시 */}
                  {isAuthenticated && editingVideoId !== activeVideo._id && (
                    <button
                      onClick={() => handleStartEdit(activeVideo)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="핵심 배움 편집"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {/* 핵심 배움 - 읽기 모드 */}
              {editingVideoId !== activeVideo._id && (
                <>
                  {activeVideo.keyTakeaways ? (
                    <div className="p-4 bg-white dark:bg-gray-900">
                      <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        🎯 핵심 배움
                      </h5>
                      <div 
                        className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: activeVideo.keyTakeaways 
                            ? (() => {
                                if (!activeVideo.keyTakeaways || typeof activeVideo.keyTakeaways !== 'string') {
                                  return ''
                                }
                                
                                // JSON 형식인지 먼저 확인 (시작이 '{' 또는 '['로 시작하는지)
                                const trimmed = activeVideo.keyTakeaways.trim()
                                if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                                  // JSON이 아닌 일반 문자열인 경우 그대로 반환
                                  return activeVideo.keyTakeaways
                                }
                                
                                try {
                                  const parsed = JSON.parse(activeVideo.keyTakeaways)
                                  if (isLexicalData(parsed)) {
                                    return renderLexicalData(activeVideo.keyTakeaways)
                                  }
                                  // Editor.js 형식인지 확인
                                  if (parsed && parsed.blocks) {
                                    return renderEditorJSData(activeVideo.keyTakeaways)
                                  }
                                  // 파싱은 성공했지만 예상한 형식이 아닌 경우 원본 문자열 반환
                                  return activeVideo.keyTakeaways
                                } catch (e) {
                                  // JSON 파싱 실패 시 원본 문자열 반환
                                  console.warn('keyTakeaways JSON 파싱 실패:', e, activeVideo.keyTakeaways)
                                  return activeVideo.keyTakeaways
                                }
                              })()
                            : ''
                        }}
                        onClick={(e) => {
                          // 타임스탬프 버튼 클릭 처리
                          const target = e.target as HTMLElement
                          if (target.tagName === 'BUTTON' && target.dataset.timestamp) {
                            const seconds = parseInt(target.dataset.timestamp, 10)
                            handleTimestampClick(activeVideo.videoId, seconds)
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-white dark:bg-gray-900 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">이 영상의 핵심 배움이 아직 기록되지 않았습니다</p>
                      {isAuthenticated && (
                        <p className="text-xs mt-2">위의 연필 버튼을 클릭하여 학습 기록을 추가하세요</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* 🌟 핵심 배움 - 편집 모드 */}
              {editingVideoId === activeVideo._id && (
                <div className="p-4 bg-white dark:bg-gray-900">
                  <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    ✏️ 핵심 배움 편집
                  </h5>
                  <LexicalEditor
                    value={editingContent || { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }}
                    onChange={setEditingContent}
                    placeholder="영상을 보면서 핵심 배움을 작성하세요. 다양한 서식을 적용할 수 있습니다."
                    className="min-h-[250px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={updateVideoMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      <FaSave />
                      {updateVideoMutation.isPending ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateVideoMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      <FaTimes />
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : playlistVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-4">아직 등록된 영상 학습 기록이 없습니다</p>
              {isAuthenticated && (
                <p className="text-sm">관리자 페이지의 재생 목록 수정에서 영상을 추가해주세요</p>
              )}
            </div>
          ) : null}
            </motion.div>
          </div>
          {/* 오른쪽 영역 끝 */}
          
        </div>
        {/* 2단 레이아웃 컨테이너 끝 */}
      </div>
    </section>
  )
}

export default VideoPlaylistDetail

