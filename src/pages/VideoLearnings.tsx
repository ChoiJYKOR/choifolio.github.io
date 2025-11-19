import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FaVideo, FaPlus, FaStar, FaCalendar, FaCubes } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useVideoLearnings } from '@/hooks/useVideoLearnings'
import { useVideoPlaylists } from '@/hooks/useVideoPlaylists'
import { useCategories } from '@/hooks/useCategories'
import { formatDate } from '@/utils/dateUtils'
import { extractUniqueCategories, createCategoryDisplayNames } from '@/utils/categoryUtils'
import { extractYouTubeId, getYouTubeThumbnail } from '@/utils/videoUtils'
import ScrollToTopButton from '@/components/common/ScrollToTopButton'
import { useTranslation } from 'react-i18next'
import { getLocalizedCategoryName } from '@/utils/i18nUtils'

const VideoLearnings: React.FC = () => {
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  const { data: videoLearnings = [], isLoading: loading } = useVideoLearnings()
  const { data: playlists = [], isLoading: playlistsLoading } = useVideoPlaylists()
  const location = useLocation()
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // 🌟 location state에서 이전 탭과 스크롤 위치 복원
  const [activeTab, setActiveTab] = useState<'individual' | 'playlist'>(() => {
    return (location.state as any)?.previousTab || 'individual'
  })
  const [filter, setFilter] = useState('all')
  const { isAuthenticated } = useAuth()
  
  // 🌟 스크롤 위치 복원
  useEffect(() => {
    const scrollPosition = (location.state as any)?.scrollPosition
    if (scrollPosition) {
      window.scrollTo(0, scrollPosition)
      // state를 정리하여 뒤로가기 시 다시 복원되지 않도록
      window.history.replaceState({}, document.title)
    }
  }, [])
  
  // 🌟 카테고리 데이터 가져오기
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  // categories가 배열이 아닌 경우를 대비한 안전 처리
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  // 🌟 개별 영상 필터링 로직 (categoryIds 배열 기반)
  const filteredVideos = useMemo(() => {
    const safeVideos = videoLearnings || []
    if (filter === 'all') return safeVideos
    
    // categoryIds 배열에 선택된 카테고리 ID가 포함되어 있는지 확인
    return safeVideos.filter(video => {
      if (!video.categoryIds || video.categoryIds.length === 0) {
        // 호환성: categoryIds가 없으면 기존 category 문자열 사용
        return video.category?.toLowerCase() === filter
      }
      
      // categoryIds가 populate된 객체 배열인 경우와 ID 문자열 배열인 경우 모두 처리
      return (video.categoryIds as any[]).some((catIdOrObj: any) => {
        const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
        return catId === filter
      })
    })
  }, [videoLearnings, filter])

  // 🌟 재생 목록 필터링 로직 (개별 영상과 동일한 방식)
  const filteredPlaylists = useMemo(() => {
    const safePlaylists = playlists || []
    if (filter === 'all') return safePlaylists
    
    // categoryIds 배열에 선택된 카테고리 ID가 포함되어 있는지 확인
    return safePlaylists.filter(playlist => {
      if (!playlist.categoryIds || playlist.categoryIds.length === 0) {
        // 호환성: categoryIds가 없으면 기존 category 문자열 사용
        return playlist.category?.toLowerCase() === filter
      }
      
      // categoryIds가 populate된 객체 배열인 경우와 ID 문자열 배열인 경우 모두 처리
      return (playlist.categoryIds as any[]).some((catIdOrObj: any) => {
        const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
        return catId === filter
      })
    })
  }, [playlists, filter])

  const isPageLoading = settingsLoading || loading

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <section className="section-padding bg-white dark:bg-dark-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <FaVideo className="text-red-600" />
            {t('videoLearnings.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('videoLearnings.subtitle')}
          </p>
        </motion.div>

        {/* 🌟 탭 전환 UI */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'individual'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('videoLearnings.individual')}
          </button>
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'playlist'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('videoLearnings.playlist')}
          </button>
        </div>

        {/* 🌟 카테고리 필터 - 개별 영상 탭 */}
        {activeTab === 'individual' && (
          <div ref={ref} className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full transition-colors font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-gray-300 dark:hover:bg-dark-600'
            }`}
          >
            전체 ({videoLearnings.length})
          </button>
          {categories.map((category) => {
            // 해당 카테고리를 가진 영상 개수 계산
            const count = videoLearnings.filter(v => {
              if (!v.categoryIds || v.categoryIds.length === 0) {
                return v.category === category.name
              }
              return (v.categoryIds as any[]).some((catIdOrObj: any) => {
                const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
                return catId === category._id
              })
            }).length
            
            return (
              <button
                key={category._id}
                onClick={() => setFilter(category._id)}
                className={`px-6 py-2 rounded-full transition-colors font-medium whitespace-nowrap ${
                  filter === category._id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-gray-300 dark:hover:bg-dark-600'
                }`}
              >
                {getLocalizedCategoryName(currentLang, category)} ({count})
              </button>
            )
          })}
          </div>
        )}

        {/* 🌟 카테고리 필터 - 시리즈 영상 탭 */}
        {activeTab === 'playlist' && (
          <div ref={ref} className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full transition-colors font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-gray-300 dark:hover:bg-dark-600'
            }`}
          >
            전체 ({playlists.length})
          </button>
          {categories.map((category) => {
            // 해당 카테고리를 가진 시리즈 영상 개수 계산
            const count = playlists.filter(p => {
              if (!p.categoryIds || p.categoryIds.length === 0) {
                return p.category === category.name
              }
              return (p.categoryIds as any[]).some((catIdOrObj: any) => {
                const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
                return catId === category._id
              })
            }).length
            
            return (
              <button
                key={category._id}
                onClick={() => setFilter(category._id)}
                className={`px-6 py-2 rounded-full transition-colors font-medium whitespace-nowrap ${
                  filter === category._id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-gray-300 dark:hover:bg-dark-600'
                }`}
              >
                {getLocalizedCategoryName(currentLang, category)} ({count})
              </button>
            )
          })}
          </div>
        )}

        {/* 개별 영상 그리드 - individual 탭에서만 표시 */}
        {activeTab === 'individual' && (
          <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
            {filteredVideos.map((video) => {
            // 🌟 호환성: videoId가 없으면 videoUrl에서 추출
            const videoId = video.videoId || ((video as any).videoUrl ? extractYouTubeId((video as any).videoUrl) : null)
            const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId, 'hqdefault') : null

            return (
              <motion.div key={video._id} variants={itemVariants}>
                <Link
                  to={`/video-learnings/${video._id}`}
                  state={{ previousTab: activeTab, scrollPosition: window.scrollY }}
                  className="block bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 dark:border-dark-700"
                >
                  {/* 썸네일 */}
                  {thumbnailUrl ? (
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                      <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="640"
                        height="360"
                        onError={(e) => {
                          // maxresdefault 실패 시 hqdefault로 fallback
                          const target = e.target as HTMLImageElement
                          if (target.src.includes('maxresdefault')) {
                            target.src = target.src.replace('maxresdefault', 'hqdefault')
                          } else {
                            // 모든 썸네일 실패 시 빈 이미지로 처리
                            target.style.display = 'none'
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                      <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-white text-xs font-bold">
                        YouTube
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                      <FaVideo className="text-white text-6xl" />
                    </div>
                  )}

                  {/* 내용 */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {/* 카테고리 배지 (복수 표시) */}
                      <div className="flex flex-wrap gap-2">
                        {video.categoryIds && video.categoryIds.length > 0 ? (
                          (video.categoryIds as any[]).map((catIdOrObj: any) => {
                            const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
                            const categoryObj = typeof catIdOrObj === 'string' 
                              ? categories.find(c => c._id === catId)
                              : catIdOrObj
                            
                            return categoryObj ? (
                              <span 
                                key={catId}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                              >
                                {getLocalizedCategoryName(currentLang, categoryObj)}
                              </span>
                            ) : null
                          })
                        ) : (
                          // 호환성: categoryIds가 없으면 기존 category 표시
                          video.category && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                              {video.category}
                            </span>
                          )
                        )}
                      </div>
                      {video.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${
                                i < video.rating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {video.title}
                    </h3>

                    {video.purpose && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                        {video.purpose}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="text-xs" />
                        <span>{formatDate(video.watchDate)}</span>
                      </div>
                      {video.skillIds && video.skillIds.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FaCubes className="text-xs" />
                          <span>{video.skillIds.length}개 스킬</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
          </motion.div>
        )}

        {/* 시리즈 영상 탭 - playlist 탭에서만 표시 */}
        {activeTab === 'playlist' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPlaylists.map((playlist) => (
              <motion.div key={playlist._id} variants={itemVariants}>
                <Link
                  to={`/video-playlists/${playlist._id}`}
                  state={{ previousTab: activeTab, scrollPosition: window.scrollY }}
                  className="block bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 dark:border-dark-700"
                >
                  {/* 재생 목록 아이콘 */}
                  <div className="relative aspect-video bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <FaVideo className="text-white text-6xl" />
                    <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-white text-xs font-bold">
                      재생목록
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {/* 카테고리 배지 (복수 표시) */}
                      <div className="flex flex-wrap gap-2">
                        {playlist.categoryIds && playlist.categoryIds.length > 0 ? (
                          (playlist.categoryIds as any[]).map((catIdOrObj: any) => {
                            const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
                            const categoryObj = typeof catIdOrObj === 'string' 
                              ? categories.find(c => c._id === catId)
                              : catIdOrObj
                            
                            return categoryObj ? (
                              <span 
                                key={catId}
                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium"
                              >
                                {getLocalizedCategoryName(currentLang, categoryObj)}
                              </span>
                            ) : null
                          })
                        ) : (
                          // 호환성: categoryIds가 없으면 기존 category 표시
                          playlist.category && (
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                              {playlist.category}
                            </span>
                          )
                        )}
                      </div>
                      {playlist.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${
                                i < playlist.rating! ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {playlist.title}
                    </h3>

                    {playlist.purpose && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                        {playlist.purpose}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="text-xs" />
                        <span>{formatDate(playlist.watchDate)}</span>
                      </div>
                      {playlist.skillIds && playlist.skillIds.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FaCubes className="text-xs" />
                          <span>{playlist.skillIds.length}개 스킬</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 시리즈 영상 빈 상태 */}
        {activeTab === 'playlist' && filteredPlaylists.length === 0 && (
          <div className="card p-12 text-center">
            <FaVideo className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? '시리즈 영상이 없습니다' : '해당 카테고리에 시리즈 영상이 없습니다'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              여러 영상을 통한 체계적인 학습 과정을 추가해보세요
            </p>
          </div>
        )}

        {/* 빈 상태 - individual 탭에서만 */}
        {activeTab === 'individual' && filteredVideos.length === 0 && (
          <div className="card p-12 text-center">
            <FaVideo className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? '영상 학습 기록이 없습니다' : '해당 카테고리에 영상이 없습니다'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              유튜브 영상을 통한 학습 내용을 추가해보세요
            </p>
          </div>
        )}
      </div>
      
      {/* 🌟 스크롤 투 탑 버튼 */}
      <ScrollToTopButton />
    </section>
  )
}

export default VideoLearnings

