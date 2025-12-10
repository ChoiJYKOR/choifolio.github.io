import React, { useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaGithub, FaExternalLinkAlt, FaPlay, FaImage, FaCode, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { renderLexicalData, isLexicalData } from '../utils/textUtils'
import { useProjectDetail } from '../hooks/useProjectDetail'

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  // Use custom hook for data fetching and i18n processing
  const { loading, error, localizedProject, linkedSkills } = useProjectDetail(id, currentLang)
  
  // UI state management
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Utility function for skill badge styling
  const getBadgeStyle = (colorCode: string) => {
    const bgColor = `${colorCode}26`
    const textColor = colorCode
    
    return {
      backgroundColor: bgColor,
      color: textColor,
    } as React.CSSProperties
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !localizedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{error || '프로젝트를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/projects', { state: location.state })}
            className="text-primary-600 hover:text-primary-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = ''
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || ''
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0` : ''
  }

  // 동영상 목록
  const regularVideos = localizedProject.videos || []

  return (
    <section className="section-padding bg-gray-50 dark:bg-dark-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/projects"
            state={location.state}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 dark:text-primary-400"
          >
            <FaArrowLeft /> 목록으로 돌아가기
          </Link>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* 🌟 Main Image - 왼쪽으로 이동 */}
            {localizedProject.image && (
              <div className="md:w-1/3">
                <img 
                  src={localizedProject.image}
                  alt={localizedProject.title}
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                  loading="eager"
                  decoding="async"
                  width="800"
                  height="600"
                />
              </div>
            )}

            {/* 🌟 텍스트 내용 - 오른쪽 */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4 flex-wrap">
                {/* 카테고리 배지 (복수 표시) */}
                {localizedProject.categoryIds && localizedProject.categoryIds.length > 0 ? (
                  (localizedProject.categoryIds as any[]).map((catIdOrObj: any) => {
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
                  localizedProject.category && (
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                      {localizedProject.category}
                    </span>
                  )
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  localizedProject.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : localizedProject.status === 'planning'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}>
                  {localizedProject.status === 'completed' ? '완료' : localizedProject.status === 'planning' ? '기획중' : '준비중'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {localizedProject.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {localizedProject.description}
              </p>
              
              {/* Technologies */}
              {localizedProject.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <FaCode /> 사용 기술
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {localizedProject.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 🌟 Linked Skills (스킬 배지) */}
              {linkedSkills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <FaCode /> 사용된 핵심 스킬
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {linkedSkills.map((skill) => {
                      // 🌟 동적 스타일 적용
                      const badgeStyle = skill.color ? getBadgeStyle(skill.color) : undefined

                      return (
                        <Link
                          key={skill._id}
                          to={`/projects?skillId=${skill._id}`}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium hover:ring-2 transition-all hover:opacity-80"
                          title={`${skill.name} 스킬이 사용된 모든 프로젝트 보기`}
                          style={{
                            ...badgeStyle,
                            '--tw-ring-color': skill.color || '#3B82F6',
                          } as React.CSSProperties}
                        >
                          <span className="font-semibold">{skill.name}</span>
                          <span 
                            className="text-xs font-semibold ml-1"
                            style={{ color: skill.color || '#3B82F6' }}
                          >
                            [{skill.levelText}]
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {localizedProject.githubLink && (
                  <a
                    href={localizedProject.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FaGithub /> GitHub
                  </a>
                )}
                {localizedProject.liveLink && (
                  <a
                    href={localizedProject.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <FaExternalLinkAlt /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 🌟 영상 섹션 - 가로 배치 */}
          {/* 🌟 일반 동영상 (가로형) - 전체 너비 */}
          {regularVideos.length > 0 && (
            <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8" data-video-section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaPlay /> 프로젝트 동영상
                </h3>
                {regularVideos.length > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentVideoIndex + 1} / {regularVideos.length}
                  </span>
                )}
              </div>
              
              <div className="relative">
                {/* 영상 컨테이너 */}
                <div className="relative group">
                  {(() => {
                    const video = regularVideos[currentVideoIndex]
                    if (!video) return null
                    
                    return (
                      <div>
                        {isYouTubeUrl(video) ? (
                          <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700">
                            <div className="aspect-video">
                              <iframe
                                src={getYouTubeEmbedUrl(video)}
                                title={`${localizedProject.title} 동영상 ${currentVideoIndex + 1}`}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              />
                            </div>
                            {/* YouTube 링크 */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <a
                                href={video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                              >
                                YouTube에서 보기
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700">
                            <div className="aspect-video">
                              <video
                                src={video}
                                controls
                                className="w-full h-full object-cover"
                                preload="metadata"
                              >
                                <source src={video} type="video/mp4" />
                                <source src={video} type="video/webm" />
                                <source src={video} type="video/ogg" />
                                브라우저가 비디오를 지원하지 않습니다.
                              </video>
                            </div>
                            {/* 직접 링크 */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <a
                                href={video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                              >
                                원본 보기
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {/* 🌟 영상 설명 (HTML 렌더링) */}
                        {localizedProject.videoDescriptions?.[currentVideoIndex] && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div 
                              className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: localizedProject.videoDescriptions[currentVideoIndex] }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  
                  {/* 🌟 좌우 화살표 (영상이 2개 이상일 때) */}
                  {regularVideos.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentVideoIndex((prev) => (prev === 0 ? regularVideos.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                        aria-label="이전 영상"
                      >
                        <FaChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setCurrentVideoIndex((prev) => (prev === regularVideos.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                        aria-label="다음 영상"
                      >
                        <FaChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
                
                {/* 🌟 인디케이터 (영상이 2개 이상일 때) */}
                {regularVideos.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {regularVideos.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentVideoIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentVideoIndex 
                            ? 'w-8 bg-blue-600 dark:bg-blue-400' 
                            : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                        aria-label={`${index + 1}번째 영상 보기`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🌟 프로젝트 이미지 섹션 - 프로젝트 동영상 아래 */}
          {localizedProject.images && localizedProject.images.length > 0 && (
            <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaImage /> 프로젝트 이미지
                </h3>
                {localizedProject.images.length > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentImageIndex + 1} / {localizedProject.images.length}
                  </span>
                )}
              </div>
              
              <div className="relative">
                {/* 이미지 컨테이너 */}
                <div className="relative group">
                  {(() => {
                    const image = localizedProject.images[currentImageIndex]
                    if (!image) return null
                    
                    return (
                      <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => setSelectedImage(image)}>
                        <div className="aspect-video">
                          <img
                            src={image}
                            alt={`${localizedProject.title} 이미지 ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                            width="1280"
                            height="720"
                          />
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* 🌟 좌우 화살표 (이미지가 2개 이상일 때) */}
                  {localizedProject.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? localizedProject.images!.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                        aria-label="이전 이미지"
                      >
                        <FaChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === localizedProject.images!.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                        aria-label="다음 이미지"
                      >
                        <FaChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
                
                {/* 🌟 이미지 설명 (비디오 설명과 동일한 스타일로 이미지 카드 아래에 표시) */}
                {localizedProject.imageDescriptions?.[currentImageIndex] && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      {(() => {
                        const description = localizedProject.imageDescriptions[currentImageIndex]
                        if (!description || (typeof description === 'string' && description.trim() === '')) {
                          return null
                        }
                        
                        // Lexical 데이터인지 확인
                        let parsedData: any
                        if (typeof description === 'string') {
                          try {
                            parsedData = JSON.parse(description)
                          } catch {
                            // JSON이 아니면 HTML로 처리
                            return <div dangerouslySetInnerHTML={{ __html: description }} />
                          }
                        } else {
                          parsedData = description
                        }
                        
                        if (isLexicalData(parsedData)) {
                          // Lexical 데이터인 경우
                          const html = renderLexicalData(parsedData)
                          if (!html || html.trim() === '') return null
                          return <div dangerouslySetInnerHTML={{ __html: html }} />
                        } else {
                          // 일반 HTML인 경우
                          const htmlContent = typeof description === 'string' ? description : JSON.stringify(description)
                          if (!htmlContent || htmlContent.trim() === '') return null
                          return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {/* 🌟 인디케이터 (이미지가 2개 이상일 때) */}
                {localizedProject.images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {localizedProject.images.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'w-8 bg-blue-600 dark:bg-blue-400' 
                            : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                        aria-label={`${index + 1}번째 이미지 보기`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 프로젝트 설명 - 전체 너비 */}
          {localizedProject.detailedDescription && (
            <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                상세 설명
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {(() => {
                  const description = localizedProject.detailedDescription
                  // Lexical 데이터인지 확인
                  let parsedData: any
                  if (typeof description === 'string') {
                    try {
                      parsedData = JSON.parse(description)
                    } catch {
                      // JSON 파싱 실패 시 마크다운으로 처리
                      return <ReactMarkdown>{description}</ReactMarkdown>
                    }
                  } else {
                    parsedData = description
                  }
                  
                  if (isLexicalData(parsedData)) {
                    // Lexical 데이터인 경우
                    const html = renderLexicalData(parsedData)
                    return <div dangerouslySetInnerHTML={{ __html: html }} />
                  } else {
                    // 마크다운인 경우
                    return <ReactMarkdown>{typeof description === 'string' ? description : JSON.stringify(description)}</ReactMarkdown>
                  }
                })()}
              </div>
            </div>
          )}

          {/* Features & Learnings - 가로 배치 */}
          {/* Features */}
          {localizedProject.features.length > 0 && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                주요 기능
              </h3>
              <ul className="space-y-3">
                {localizedProject.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center text-sm font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learnings */}
          {localizedProject.learnings.length > 0 && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                배운 점
              </h3>
              <ul className="space-y-3">
                {localizedProject.learnings.map((learning, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-2"></span>
                    <span className="text-gray-700 dark:text-gray-300">{learning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="확대 이미지"
            className="max-w-full max-h-full object-contain"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      )}
    </section>
  )
}

export default ProjectDetail
