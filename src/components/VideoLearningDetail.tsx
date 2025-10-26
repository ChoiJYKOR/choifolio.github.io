import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaVideo, FaStar, FaCalendar, FaEdit, FaTrash, FaCubes, FaBullseye, FaLightbulb, FaRocket, FaSave, FaTimes } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/dateUtils'
import { useVideoLearning, useDeleteVideoLearning, useUpdateVideoLearning } from '../hooks/useVideoLearnings'
import { useSkills } from '../hooks/useSkills'
import { extractYouTubeId, parseTimestamps, renderHtmlWithTimestamps } from '../utils/videoUtils'
import { renderEditorJSData, isLexicalData, renderLexicalData } from '../utils/textUtils'
import ReactMarkdown from 'react-markdown'
import LexicalEditor from './lexical/LexicalEditor'
import { useToastHelpers } from '../hooks/useToast'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '@/utils/i18nUtils'
import { SerializedEditorState } from 'lexical'

// 🌟 유튜브 IFrame Player API 타입 정의
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const VideoLearningDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  const { data: video, isLoading: loading, isError, error } = useVideoLearning(id)
  const deleteMutation = useDeleteVideoLearning()
  const updateMutation = useUpdateVideoLearning()
  const { skillCategories } = useSkills()
  const { success, error: toastError } = useToastHelpers()

  // 🌟 유튜브 플레이어 ref 및 상태
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  
  // 🌟 핵심 배움 편집 상태
  const [isEditingKeyTakeaways, setIsEditingKeyTakeaways] = useState(false)
  const [editingContent, setEditingContent] = useState<SerializedEditorState | null>(null)
  
  // keyTakeaways 문자열을 SerializedEditorState로 변환
  const parseKeyTakeaways = (value: string | undefined): SerializedEditorState => {
    if (!value) return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    try {
      const parsed = JSON.parse(value)
      if (parsed && parsed.root) return parsed
      // 레거시 Editor.js 데이터도 호환성 위해 처리
      if (parsed && parsed.blocks) {
        // Editor.js 데이터는 그대로 반환 (읽기 모드에서 renderEditorJSData 사용)
        return parsed as any
      }
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    } catch {
      return { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
    }
  }
  
  const videoId = useMemo(() => {
    if (video?.videoId) return video.videoId
    // 호환성: videoUrl이 있으면 ID 추출
    if ((video as any)?.videoUrl) return extractYouTubeId((video as any).videoUrl)
    return null
  }, [video])
  
  // 🌟 유튜브 IFrame API 스크립트 로드 및 플레이어 초기화
  useEffect(() => {
    if (!videoId) return
    
    // YouTube IFrame API 스크립트 로드
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
    
    // API 준비 완료 후 플레이어 초기화
    const initializePlayer = () => {
      if (window.YT && window.YT.Player && playerContainerRef.current) {
        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          videoId: videoId,
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,  // 🌟 관련 영상 추천 비활성화 (전문성 유지)
            modestbranding: 1,  // 🌟 유튜브 로고 최소화 & '동영상 더보기' 툴팁 제거
            fs: 1,  // 전체 화면 버튼 표시
            cc_load_policy: 0,  // 자막 자동 로드 비활성화
            iv_load_policy: 3,  // 🌟 영상 주석(annotations) 비활성화
            showinfo: 0,  // 🌟 영상 정보 표시 최소화 (구버전 지원)
            controls: 1,  // 컨트롤러 표시
          },
          events: {
            onReady: () => {
              console.log('✅ 유튜브 플레이어 준비 완료')
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
    
    // cleanup
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  // 🌟 연결된 스킬 필터링
  const linkedSkills = useMemo(() => {
    if (!video?.skillIds || !skillCategories) return []
    const allSkills = skillCategories.flatMap(cat => cat.skills || [])
    return allSkills.filter(skill => skill._id && video.skillIds?.includes(skill._id))
  }, [video, skillCategories])

  // 🌟 타임스탬프 클릭 핸들러 (유튜브 API 사용)
  const handleTimestampClick = (seconds: number) => {
    console.log(`⏰ 타임스탬프 클릭: ${seconds}초로 이동 + 자동 재생`)
    
    if (!playerRef.current || !isPlayerReady) {
      console.warn('⚠️ 플레이어가 아직 준비되지 않았습니다')
      return
    }
    
    try {
      // 1. 해당 시간으로 이동 (allowSeekAhead: true)
      playerRef.current.seekTo(seconds, true)
      
      // 2. 즉시 재생 시작
      playerRef.current.playVideo()
      
      console.log(`✅ ${seconds}초로 이동 후 재생 시작`)
    } catch (error) {
      console.error('플레이어 제어 오류:', error)
    }
  }

  // 🌟 타임스탬프가 포함된 텍스트 렌더링
  const renderTextWithTimestamps = (text: string) => {
    if (!text) return null
    
    const timestamps = parseTimestamps(text)
    if (timestamps.length === 0) {
      return <ReactMarkdown>{text}</ReactMarkdown>
    }

    const result: (string | JSX.Element)[] = []
    let lastIndex = 0

    timestamps.forEach((ts, idx) => {
      // 타임스탬프 이전 텍스트
      if (ts.position > lastIndex) {
        const beforeText = text.substring(lastIndex, ts.position)
        result.push(
          <span key={`text-${idx}`}>
            <ReactMarkdown>{beforeText}</ReactMarkdown>
          </span>
        )
      }

      // 타임스탬프 버튼
      result.push(
        <button
          key={`ts-${idx}`}
          onClick={() => handleTimestampClick(ts.seconds)}
          className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-xs font-bold transition-colors mx-1"
          title={`영상 ${ts.text} 위치로 이동`}
        >
          {ts.text}
        </button>
      )

      lastIndex = ts.position + ts.text.length
    })

    // 마지막 텍스트
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex)
      result.push(
        <span key="text-last">
          <ReactMarkdown>{afterText}</ReactMarkdown>
        </span>
      )
    }

    return <div className="space-y-2">{result}</div>
  }

  // 삭제 핸들러
  const handleDeleteVideo = async () => {
    if (!confirm('이 영상 학습 기록을 삭제하시겠습니까?')) return

    try {
      await deleteMutation.mutateAsync(id!)
      navigate('/video-learnings')
    } catch (error) {
      console.error('Failed to delete video learning:', error)
    }
  }

  // 🌟 핵심 배움 편집 시작
  const handleStartEdit = () => {
    setIsEditingKeyTakeaways(true)
    const parsed = parseKeyTakeaways(video?.keyTakeaways)
    console.log('📥 편집 모드 진입 - 로드된 데이터:', parsed)
    setEditingContent(parsed)
  }

  // 🌟 핵심 배움 편집 취소
  const handleCancelEdit = () => {
    setIsEditingKeyTakeaways(false)
    setEditingContent(null)
  }

  // 🌟 핵심 배움 저장
  const handleSaveEdit = async () => {
    if (!video || !id) return

    try {
      // 🌟 skillIds와 categoryIds를 문자열 배열로 확실하게 변환
      const skillIds = (video.skillIds || []).map((skillIdOrObj: any) => 
        typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj?._id
      ).filter(Boolean)
      
      const categoryIds = (video.categoryIds || []).map((catIdOrObj: any) => 
        typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
      ).filter(Boolean)

      // VideoLearningFormData 타입에 맞게 필요한 필드만 전달
      const updateData = {
        title: video.title,
        videoId: video.videoId,
        category: video.category,
        categoryIds: categoryIds,
        watchDate: video.watchDate,
        purpose: video.purpose,
        keyTakeaways: JSON.stringify(editingContent),
        application: video.application,
        skillIds: skillIds,
        rating: video.rating,
        order: video.order,
      }
      
      console.log('📤 전송 데이터:', updateData)
      
      await updateMutation.mutateAsync({
        id,
        data: updateData
      })
      success('저장 완료', '핵심 배움이 저장되었습니다.')
      setIsEditingKeyTakeaways(false)
      setEditingContent(null)
    } catch (err: any) {
      console.error('핵심 배움 저장 실패:', err)
      console.error('📋 서버 응답 상세:', err.response?.data)
      toastError('저장 실패', err.response?.data?.message || '핵심 배움 저장 중 오류가 발생했습니다.')
    }
  }
  
  const isDeleting = deleteMutation.isPending

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaVideo className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">영상 학습 기록을 찾을 수 없습니다</p>
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
            
            {/* 유튜브 플레이어 */}
            {videoId && (
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

            {/* 핵심 배움 */}
            {(video.keyTakeaways || isAuthenticated) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-600 mb-6"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaLightbulb className="text-yellow-500" /> 핵심 배움
                    </h3>
                    {/* 🌟 편집 버튼 - 인증된 사용자에게만 표시 */}
                    {isAuthenticated && !isEditingKeyTakeaways && (
                      <button
                        onClick={handleStartEdit}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="핵심 배움 편집"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                    )}
                  </div>
                  {video.createdAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      기록 날짜: {formatDate(video.createdAt)}
                    </p>
                  )}
                </div>

                {/* 읽기 모드 */}
                {!isEditingKeyTakeaways && (
                  <>
                    {video.keyTakeaways ? (
                      <>
                        <div 
                          className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                          dangerouslySetInnerHTML={{ 
                            __html: video.keyTakeaways 
                              ? (isLexicalData(JSON.parse(video.keyTakeaways)) 
                                  ? renderLexicalData(video.keyTakeaways)
                                  : renderEditorJSData(video.keyTakeaways))
                              : ''
                          }}
                          onClick={(e) => {
                            // 타임스탬프 버튼 클릭 처리
                            const target = e.target as HTMLElement
                            if (target.tagName === 'BUTTON' && target.dataset.timestamp) {
                              const seconds = parseInt(target.dataset.timestamp, 10)
                              handleTimestampClick(seconds)
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">이 영상의 핵심 배움이 아직 기록되지 않았습니다</p>
                        {isAuthenticated && (
                          <p className="text-xs mt-2">위의 연필 버튼을 클릭하여 학습 기록을 추가하세요</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 🌟 편집 모드 */}
                {isEditingKeyTakeaways && editingContent && (
                  <div>
                    <LexicalEditor
                      value={editingContent}
                      onChange={setEditingContent}
                      placeholder="영상을 보면서 핵심 배움을 작성하세요. 다양한 서식을 적용할 수 있습니다."
                      className="min-h-[250px]"
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        <FaSave />
                        {updateMutation.isPending ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        <FaTimes />
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ========== 오른쪽 영역: 학습 기록 ========== */}
          <div className="w-full lg:w-5/12 space-y-6">

            {/* 영상 정보 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                {/* 카테고리 배지 (복수 표시) */}
                <div className="flex flex-wrap gap-2">
                  {video.categoryIds && video.categoryIds.length > 0 ? (
                    (video.categoryIds as any[]).map((catIdOrObj: any) => {
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
                    video.category && (
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                        {video.category}
                      </span>
                    )
                  )}
                </div>
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Link
                      to={`/admin`}
                      state={{ tab: 'videoLearnings', editId: video._id }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                      aria-label="영상 수정"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={handleDeleteVideo}
                      disabled={isDeleting}
                      className={`p-2 rounded-lg text-red-600 dark:text-red-400 transition-colors ${
                        isDeleting 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label="영상 삭제"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {video.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {video.rating && (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar 
                        key={i} 
                        className={`text-sm ${i < video.rating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} 
                      />
                    ))}
                    <span className="font-medium">{video.rating}/5</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaCalendar />
                  <span>{formatDate(video.watchDate)}</span>
                </div>
              </div>
            </motion.div>

            {/* 연결된 스킬 */}
            {linkedSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
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

            {/* 시청 목적 */}
            {video.purpose && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6 mb-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaBullseye className="text-blue-600" /> 시청 목적
                </h3>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm">
                  <ReactMarkdown>{video.purpose}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* 통합 적용 계획 */}
            {video.application && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-600"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaRocket className="text-purple-600" /> 적용 계획
                </h3>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm">
                  <ReactMarkdown>{video.application}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
          {/* 오른쪽 영역 끝 */}
          
        </div>
        {/* 2단 레이아웃 컨테이너 끝 */}
      </div>
    </section>
  )
}

export default VideoLearningDetail

