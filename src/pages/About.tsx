import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FaCoffee, FaCog, FaChartLine, FaRobot, FaPlus, FaGraduationCap, FaShieldAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/contexts/AuthContext'
import { experiencesAPI } from '@/services/api'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '@/utils/i18nUtils'

// TypeScript 인터페이스 정의 (API의 Experience 타입과 동일하게)
interface JourneyStep {
  _id?: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  title: string      // 직책
  company: string    // 회사
  period: string     // 기간
  skills: string[]   // 기술
  description: string
  order?: number
}

// 아이콘 매핑 (API에서 iconKey를 받을 경우 사용)
const iconMap: { [key: string]: React.ComponentType<{ className?: string; size?: number }> } = {
  coffee: FaCoffee,
  FaCoffee: FaCoffee,
  cog: FaCog,
  FaCog: FaCog,
  chart: FaChartLine,
  FaChartLine: FaChartLine,
  robot: FaRobot,
  FaRobot: FaRobot,
  graduation: FaGraduationCap,
  FaGraduationCap: FaGraduationCap,
  shield: FaShieldAlt,
  FaShieldAlt: FaShieldAlt,
}

// 유효한 아이콘 키 목록 (타입 안정성을 위해)
const validIconKeys = Object.keys(iconMap) as Array<keyof typeof iconMap>

// 안전한 아이콘 가져오기 함수
const getSafeIcon = (iconKey: string | undefined): React.ComponentType<{ className?: string; size?: number }> => {
  if (!iconKey || !validIconKeys.includes(iconKey as keyof typeof iconMap)) {
    console.warn(`Invalid icon key: ${iconKey}. Using default icon 'cog'.`)
    return iconMap['cog']!
  }
  return iconMap[iconKey as keyof typeof iconMap]!
}

// 기본 여정 데이터 (API 로드 실패 시 사용)
const defaultJourney: JourneyStep[] = [
    {
      icon: FaCoffee,
      company: '스타벅스',
      title: '바리스타',
      period: '2018 - 2023',
      skills: ['고객 서비스', '품질 관리', '효율성 개선'],
      description: '5년간 고객 서비스와 품질 관리 경험',
      order: 1,
    },
    {
      icon: FaCog,
      company: '자기개발',
      title: '공장자동화 학습',
      period: '2024 - 현재',
      skills: ['PLC', 'IoT', '자동화 시스템'],
      description: 'PLC, IoT, 자동화 시스템 학습',
      order: 2,
    },
    {
      icon: FaChartLine,
      company: '자기개발',
      title: '데이터 분석가',
      period: '2024 - 현재',
      skills: ['Python', '통계학', '데이터과학'],
      description: 'Python, 통계학, 데이터과학 전문화',
      order: 3,
    },
    {
      icon: FaRobot,
      company: '미래',
      title: '자동화 전문가',
      period: '2025 -',
      skills: ['스마트 팩토리', 'AI', 'Industry 4.0'],
      description: '스마트 팩토리의 미래 구현',
      order: 4,
    },
]

const About: React.FC = () => {
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings()
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  const [journey, setJourney] = useState<JourneyStep[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // 여정 데이터 로딩 (useCallback으로 메모이제이션)
  const fetchJourneyData = useCallback(async () => {
    try {
      setDataLoading(true)
      const response = await experiencesAPI.getAll()
      
      if (response.data?.data && response.data.data.length > 0) {
        // API 데이터를 JourneyStep 형식으로 변환
        const mappedJourney: JourneyStep[] = response.data.data
          .map((item: any) => ({
            _id: item._id,
            icon: getSafeIcon(item.iconKey), // 안전한 아이콘 가져오기
            company: item.company || '회사명 없음',
            title: item.title,
            period: item.period,
            skills: item.skills || [],
            description: item.description,
            order: item.order || 0,
          }))
          .sort((a: JourneyStep, b: JourneyStep) => (a.order || 0) - (b.order || 0))
        
        setJourney(mappedJourney)
      } else {
        // API 데이터가 없으면 기본 데이터 사용
        setJourney(defaultJourney)
      }
    } catch (error) {
      console.error('Failed to fetch journey data:', error)
      // 오류 발생 시 기본 데이터 사용
      setJourney(defaultJourney)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJourneyData()
  }, [fetchJourneyData])

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

  // 로딩 상태
  if (settingsLoading || dataLoading) {
    return (
      <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
        <div className="max-w-7xl mx-auto flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* 1. 제목 및 부제목 */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-6">
              {getLocalizedField(currentLang, siteSettings?.aboutTitle, siteSettings?.aboutTitleEn, siteSettings?.aboutTitleJa) || '저의 여정'}
            </h2>
            {(siteSettings?.aboutSubtitle || !settingsLoading) && (
              <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto mb-8">
                {getLocalizedField(currentLang, siteSettings?.aboutSubtitle, siteSettings?.aboutSubtitleEn, siteSettings?.aboutSubtitleJa) || '커피 한 잔에서 시작된 공장자동화 전문가로의 여정'}
              </p>
            )}
          </motion.div>

          {/* 2. 소개 편집 버튼 (인증된 경우) */}
          {isAuthenticated && (
            <motion.div variants={itemVariants} className="mb-8 flex justify-end">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-600 shadow-medium hover:shadow-glow"
              >
                <FaPlus /> 소개 편집
              </Link>
            </motion.div>
          )}

          {/* 3. 소개 내용 */}
          <motion.div variants={itemVariants} className="card p-10 mb-12">
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">
              {getLocalizedField(currentLang, siteSettings?.aboutCardTitle, siteSettings?.aboutCardTitleEn, siteSettings?.aboutCardTitleJa) || '바리스타에서 자동화 전문가로'}
            </h3>
            <div className="space-y-6 text-dark-600 dark:text-dark-300 leading-relaxed">
              <p className="whitespace-pre-line">
                {getLocalizedField(currentLang, siteSettings?.aboutDescription1, siteSettings?.aboutDescription1En, siteSettings?.aboutDescription1Ja) || '스타벅스에서 5년간 바리스타로 일하며 고객 서비스, 품질 관리, 효율성 개선에 대한 깊은 이해를 얻었습니다.'}
              </p>
              <p className="whitespace-pre-line">
                {getLocalizedField(currentLang, siteSettings?.aboutDescription2, siteSettings?.aboutDescription2En, siteSettings?.aboutDescription2Ja) || '현재는 PLC 프로그래밍, 통계학, 데이터과학 등 다양한 기술을 학습하며 스마트 팩토리의 미래를 준비하고 있습니다.'}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {(siteSettings?.mainSkills || ['PLC 프로그래밍', '데이터 분석', 'Python', '협동로봇', 'IoT']).map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 4. 성장 여정 */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-8 text-center">
              {getLocalizedField(currentLang, siteSettings?.aboutJourneyTitle, siteSettings?.aboutJourneyTitleEn, siteSettings?.aboutJourneyTitleJa) || '성장 여정'}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {journey.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <motion.div
                    key={step._id || index}
                    variants={itemVariants}
                    className="card p-6 hover:shadow-xl transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl shrink-0">
                        <IconComponent className="text-primary-600 dark:text-primary-400" size={24} />
                      </div>
                      <div className="flex-1">
                        {/* 🌟 회사명 */}
                        <p className="text-xs text-dark-500 dark:text-dark-400 font-medium mb-1">
                          {step.company}
                        </p>
                        {/* 🌟 직책 */}
                        <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-1">
                          {step.title}
                        </h4>
                        {/* 🌟 기간 */}
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">
                          {step.period}
                        </p>
                        {/* 🌟 기술 태그 (간략하게) */}
                        {step.skills && step.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {step.skills.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-secondary-100 dark:bg-secondary-900/50 text-secondary-700 dark:text-secondary-300 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {step.skills.length > 4 && (
                              <span className="px-2 py-0.5 text-dark-500 dark:text-dark-400 text-xs">
                                +{step.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
