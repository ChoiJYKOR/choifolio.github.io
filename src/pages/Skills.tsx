import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/contexts/AuthContext'
import { useSkills } from '@/hooks/useSkills'
import { useProjects } from '@/hooks/useProjects'
import { useBooks } from '@/hooks/useBooks'
import { useVideoLearnings } from '@/hooks/useVideoLearnings'
import { useExperiences } from '@/hooks/useExperiences'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { FaChartLine, FaPlus, FaProjectDiagram, FaBook, FaVideo, FaBriefcase } from 'react-icons/fa'
import DynamicIcon from '@/components/common/DynamicIcon'
import { useTranslation } from 'react-i18next'
import { getLocalizedField, getLocalizedSkillName, getLocalizedSkillCategoryTitle } from '@/utils/i18nUtils'

// =================================================================
// 📌 1. 숙련도 레벨 매핑 (0-100% -> 명칭)
// =================================================================
interface Proficiency {
  name: string
  color: string // Tailwind CSS 클래스 (배지 배경)
}

const getProficiency = (level: number): Proficiency => {
  if (level >= 90) return { name: 'Expert', color: 'bg-red-500' }
  if (level >= 70) return { name: 'Proficient', color: 'bg-green-500' }
  if (level >= 50) return { name: 'Familiar', color: 'bg-yellow-500' }
  return { name: 'Basic', color: 'bg-gray-400' }
}
// =================================================================

const Skills: React.FC = () => {
  const { settings: siteSettings } = useSiteSettings()
  const { isAuthenticated } = useAuth()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  const { skillCategories, loading: isLoading, error } = useSkills()
  
  // 🌟 프로젝트, 서적, 영상, 경력 데이터 가져오기 (스킬 연결 정보 표시용)
  const { projects } = useProjects()
  const { data: books = [] } = useBooks()
  const { data: videoLearnings = [] } = useVideoLearnings()
  const { experiences } = useExperiences()
  
  // 🌟 각 스킬별 연결 개수를 계산 (useMemo로 최적화)
  const skillConnectionCounts = useMemo(() => {
    const counts = new Map<string, { projects: number; learnings: number; videos: number; experiences: number }>()
    
    // 1. 프로젝트에서 스킬 연결 카운트
    projects.forEach(project => {
      ;(project.skillIds || []).forEach((skillIdOrObj: any) => {
        // 🌟 skillId가 객체로 populate된 경우 _id 추출, 문자열이면 그대로 사용
        const skillId = typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj?._id
        if (skillId) {
          const current = counts.get(skillId) || { projects: 0, learnings: 0, videos: 0, experiences: 0 }
          counts.set(skillId, { ...current, projects: current.projects + 1 })
        }
      })
    })
    
    // 2. 서적 자체의 skillIds에서 스킬 연결 카운트
    books.forEach((book: any) => {
      ;(book.skillIds || []).forEach((skillIdOrObj: any) => {
        // 🌟 skillId가 객체로 populate된 경우 _id 추출, 문자열이면 그대로 사용
        const skillId = typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj?._id
        if (skillId) {
          const current = counts.get(skillId) || { projects: 0, learnings: 0, videos: 0, experiences: 0 }
          counts.set(skillId, { ...current, learnings: current.learnings + 1 })
        }
      })
    })
    
    // 3. 서적의 학습 내용에서 스킬 연결 카운트
    books.forEach((book: any) => {
      (book.learnings || []).forEach((learning: any) => {
        ;(learning.skillIds || []).forEach((skillIdOrObj: any) => {
          // 🌟 skillId가 객체로 populate된 경우 _id 추출, 문자열이면 그대로 사용
          const skillId = typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj?._id
          if (skillId) {
            const current = counts.get(skillId) || { projects: 0, learnings: 0, videos: 0, experiences: 0 }
            counts.set(skillId, { ...current, learnings: current.learnings + 1 })
          }
        })
      })
    })
    
    // 4. 영상 학습에서 스킬 연결 카운트
    videoLearnings.forEach((video: any) => {
      ;(video.skillIds || []).forEach((skillIdOrObj: any) => {
        // 🌟 skillId가 객체로 populate된 경우 _id 추출, 문자열이면 그대로 사용
        const skillId = typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj._id
        if (skillId) {
          const current = counts.get(skillId) || { projects: 0, learnings: 0, videos: 0, experiences: 0 }
          counts.set(skillId, { ...current, videos: current.videos + 1 })
        }
      })
    })
    
    // 5. 경력에서 스킬 연결 카운트
    experiences.forEach((experience: any) => {
      ;(experience.skillIds || []).forEach((skillIdOrObj: any) => {
        // 🌟 skillId가 객체로 populate된 경우 _id 추출, 문자열이면 그대로 사용
        const skillId = typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj?._id
        if (skillId) {
          const current = counts.get(skillId) || { projects: 0, learnings: 0, videos: 0, experiences: 0 }
          counts.set(skillId, { ...current, experiences: current.experiences + 1 })
        }
      })
    })
    
    return counts
  }, [projects, books, videoLearnings, experiences])
  
  // useInView Hook을 사용하여 ref와 inView 상태를 가져옵니다
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1, // 뷰포트의 10%가 보이면 애니메이션 시작
  })

  // 컨테이너: 자식 요소 순차 등장
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3, // 전체 컨테이너 등장 후 스킬 카테고리가 딜레이 후 시작
      },
    },
  }

  // 카테고리 박스: 위에서 아래로 등장
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }
  
  // 스킬 아이템: 스케일 변형으로 더 역동적으로
  const skillItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
      }
    }
  }

  return (
    // 배경색/패딩 클래스명 통일 및 가독성 향상
    <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* 전체 컨테이너에 애니메이션 ref와 variants 적용 */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants} // 컨테이너 variants 적용
        >
          {/* 1. 섹션 제목/부제목 */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-dark-900 dark:text-white mb-4">
              {getLocalizedField(currentLang, siteSettings?.skillsTitle, siteSettings?.skillsTitleEn, siteSettings?.skillsTitleJa) || '기술 스택 🛠️'}
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto mb-8">
              {getLocalizedField(currentLang, siteSettings?.skillsSubtitle, siteSettings?.skillsSubtitleEn, siteSettings?.skillsSubtitleJa) || '공장자동화 및 데이터 분석 분야에서 쌓아온 실질적인 기술 역량입니다.'}
            </p>
          </motion.div>

          {/* 2. 기술 편집 버튼 (인증된 경우) */}
          {isAuthenticated && (
            <motion.div variants={itemVariants} className="mb-8 flex justify-end">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-600 shadow-medium hover:shadow-glow"
              >
                <FaPlus /> 기술 편집
              </Link>
            </motion.div>
          )}

          {/* 3. 로딩 상태 */}
          {isLoading && (
            <motion.div variants={itemVariants} className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">스킬 데이터를 불러오는 중...</p>
            </motion.div>
          )}

          {/* 4. 에러 상태 */}
          {error && (
            <motion.div variants={itemVariants} className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                다시 시도
              </button>
            </motion.div>
          )}

          {/* 5. 스킬 카테고리 그리드 - 🌟 아이콘 배지 그리드로 변경 */}
          {!isLoading && !error && (
            <div className="grid lg:grid-cols-3 gap-8">
              {skillCategories.map((category) => {
                // 🌟 카테고리별 동적 색상 (category.color 사용)
                const categoryColor = category.color || '#3B82F6' // 기본값: 파란색
                const categoryBgColor = `${categoryColor}15` // 8% 투명도 (배경용)

                return (
                  <motion.div
                    key={category._id}
                    variants={itemVariants}
                    className="p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                    style={{
                      backgroundColor: categoryBgColor,
                      borderLeft: `4px solid ${categoryColor}`, // 왼쪽 강조 보더
                    }}
                  >
                    {/* 🌟 카테고리 제목 - 동적 색상 적용 */}
                    <h3 
                      className="text-2xl font-bold mb-6 border-b pb-3"
                      style={{ 
                        color: categoryColor,
                        borderColor: `${categoryColor}40` // 25% 투명도
                      }}
                    >
                      {getLocalizedSkillCategoryTitle(currentLang, category)}
                    </h3>
                    {/* 🎯 변경: 스킬 리스트를 아이콘 배지 그리드로 변경 */}
                    <motion.div 
                      className="flex flex-wrap gap-3" // flex-wrap을 사용하여 유연한 그리드 구현
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                      variants={{
                        visible: { transition: { staggerChildren: 0.07 } } // 더 빠르게 순차 등장
                      }}
                    >
                      {category.skills?.map((skill) => {
                        const proficiency = getProficiency(skill.level)
                        
                        // 🌟 스킬 연결 정보 가져오기
                        const connectionInfo = skillConnectionCounts.get(skill._id!) || { projects: 0, learnings: 0, videos: 0, experiences: 0 }
                        const hasConnections = connectionInfo.projects > 0 || connectionInfo.learnings > 0 || connectionInfo.videos > 0 || connectionInfo.experiences > 0
                        
                        // 🌟 스킬별 동적 배경 및 텍스트 색상 (skill.color 사용)
                        const skillColor = skill.color || '#3B82F6' // 기본값: 파란색
                        const bgColor = `${skillColor}26` // 15% 투명도 (26은 16진수로 약 15%)

                        // 🌟 스킬 배지 UI 컴포넌트
                        const SkillBadge = (
                          <motion.div 
                            variants={skillItemVariants}
                            data-tooltip-id={`skill-tooltip-${skill._id}`}
                            className="flex items-center gap-2 p-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.05] hover:shadow-md text-white"
                            style={{
                              backgroundColor: bgColor,
                              cursor: 'default', // 💡 [수정] 클릭 기능 비활성화로 항상 default
                              // cursor: connectionInfo.projects > 0 ? 'pointer' : 'default',
                            }}
                          >
                            {/* 아이콘 - DynamicIcon 사용 */}
                            <div className="text-white">
                              <DynamicIcon iconName={skill.icon} size={18} />
                            </div>
                            
                            {/* 스킬 이름 */}
                            <span className="text-sm text-white">
                              {getLocalizedSkillName(currentLang, skill)}
                              {/* 💡 연결 개수 표시 */}
                              {hasConnections && (
                                <span className="text-xs font-semibold ml-1 opacity-70">
                                  ({connectionInfo.projects + connectionInfo.learnings})
                                </span>
                              )}
                            </span>
                            
                            {/* 숙련도 배지 */}
                            <span 
                              className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${proficiency.color} shrink-0`}
                            >
                              {proficiency.name}
                            </span>
                            
                            {/* 🌟 리치 툴팁 (HTML 컨텐츠) */}
                            <Tooltip 
                              id={`skill-tooltip-${skill._id}`}
                              place="top"
                              className="max-w-md z-50"
                              style={{ 
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                fontSize: '0.875rem',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                              }}
                            >
                              <div className="space-y-2">
                                {/* 스킬 이름 + 레벨 */}
                                <div className="font-bold text-base border-b border-gray-600 pb-2">
                                  {skill.name} <span className="text-xs opacity-75">({proficiency.name})</span>
                                </div>
                                
                                {/* 스킬 설명 */}
                                {skill.description && (
                                  <div className="text-sm opacity-90 py-1">
                                    {skill.description}
                                  </div>
                                )}
                                
                                {/* 연결된 프로젝트 + 학습 내용 정보 */}
                                {hasConnections && (
                                  <div className="mt-3 pt-2 border-t border-gray-600 space-y-2">
                                    {connectionInfo.projects > 0 && (
                                      <div className="flex items-center gap-2 text-blue-300 text-xs">
                                        <FaProjectDiagram className="text-sm" />
                                        <span className="font-semibold">
                                          연결된 프로젝트: {connectionInfo.projects}개
                                        </span>
                                      </div>
                                    )}
                                    {connectionInfo.learnings > 0 && (
                                      <div className="flex items-center gap-2 text-green-300 text-xs">
                                        <FaBook className="text-sm" />
                                        <span className="font-semibold">
                                          서적 학습: {connectionInfo.learnings}개
                                        </span>
                                      </div>
                                    )}
                                    {connectionInfo.videos > 0 && (
                                      <div className="flex items-center gap-2 text-red-300 text-xs">
                                        <FaVideo className="text-sm" />
                                        <span className="font-semibold">
                                          영상 학습: {connectionInfo.videos}개
                                        </span>
                                      </div>
                                    )}
                                    {connectionInfo.experiences > 0 && (
                                      <div className="flex items-center gap-2 text-purple-300 text-xs">
                                        <FaBriefcase className="text-sm" />
                                        <span className="font-semibold">
                                          경력: {connectionInfo.experiences}개
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* 연결 정보 없음 */}
                                {!hasConnections && (
                                  <div className="text-xs opacity-60 italic mt-2 pt-2 border-t border-gray-600">
                                    아직 프로젝트, 서적, 영상, 경력에 연결되지 않은 스킬입니다
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          </motion.div>
                        )

                        // 🌟 Link로 감싸서 Projects 페이지로 이동 (프로젝트 연결이 있는 경우)
                        // 💡 [주석 처리] 나중에 프로젝트가 많아지면 활성화 예정
                        // return connectionInfo.projects > 0 ? (
                        //   <Link 
                        //     key={skill._id}
                        //     to={`/projects?skillId=${skill._id}`}
                        //     className="block"
                        //     style={{ width: 'fit-content' }}
                        //   >
                        //     {SkillBadge}
                        //   </Link>
                        // ) : (
                        //   <div key={skill._id} style={{ width: 'fit-content' }}>
                        //     {SkillBadge}
                        //   </div>
                        // )
                        
                        // 🔹 임시: 모든 스킬을 클릭 불가능한 div로 표시
                        return (
                          <div key={skill._id} style={{ width: 'fit-content' }}>
                            {SkillBadge}
                          </div>
                        )
                      })}
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* 6. Learning Goals - 🌟 사이트 설정에서 가져옴 */}
          {siteSettings?.learningGoalsTitle && (
            <motion.div
              variants={itemVariants}
              className="p-8 mt-12 bg-primary-600 dark:bg-primary-800 text-white rounded-2xl shadow-xl mx-auto max-w-4xl"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-secondary-300">
                <FaChartLine size={24} /> {getLocalizedField(currentLang, siteSettings.learningGoalsTitle, siteSettings.learningGoalsTitleEn, siteSettings.learningGoalsTitleJa)}
              </h3>
              <p className="text-white/90 mb-6 text-lg">
                {getLocalizedField(currentLang, siteSettings.learningGoalsDescription, siteSettings.learningGoalsDescriptionEn, siteSettings.learningGoalsDescriptionJa)}
              </p>
              <div className="flex flex-wrap gap-3">
                {(siteSettings.learningGoalsList || []).map((tech: string) => (
                  <span
                    key={tech}
                    className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-semibold transition-transform hover:scale-105"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
