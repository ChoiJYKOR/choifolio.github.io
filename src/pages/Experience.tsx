import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FaPlus } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useExperiences } from '@/hooks/useExperiences'
import { useAuth } from '@/contexts/AuthContext'
import ExperienceItem from '@/components/ExperienceItem'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '@/utils/i18nUtils'

const Experience: React.FC = () => {
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings()
  const { experiences, loading: experiencesLoading, error } = useExperiences()
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const loading = settingsLoading || experiencesLoading;

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

  // 에러 상태 처리
  if (error) {
    return (
      <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
        <div className="max-w-7xl mx-auto text-center">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              데이터 로딩 오류
            </h2>
            <p className="text-dark-600 dark:text-dark-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </section>
    )
  }

  // 로딩 상태 처리
  if (loading) {
    return (
      <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
        <div className="max-w-7xl mx-auto text-center">
          <div className="card p-8">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl text-dark-600 dark:text-dark-300">경험 데이터를 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* 1. 제목 및 부제목 */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-6">
              {getLocalizedField(currentLang, siteSettings?.experienceTitle, siteSettings?.experienceTitleEn, siteSettings?.experienceTitleJa) || '경력 & 학습'}
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto mb-8">
              {getLocalizedField(currentLang, siteSettings?.experienceSubtitle, siteSettings?.experienceSubtitleEn, siteSettings?.experienceSubtitleJa) || '바리스타에서 자동화 전문가로의 성장 여정'}
            </p>
          </motion.div>

          {/* 2. 경력 추가 버튼 (인증된 경우) */}
          {isAuthenticated && (
            <motion.div variants={itemVariants} className="mb-8 flex justify-end">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-600 shadow-medium hover:shadow-glow"
              >
                <FaPlus /> 경력 추가
              </Link>
            </motion.div>
          )}

          {/* 3. 타임라인 형식의 경력 목록 */}
          <div className="relative max-w-4xl mx-auto">
            {experiences.length === 0 ? (
              <motion.div variants={itemVariants} className="card p-8 text-center">
                <p className="text-xl text-dark-600 dark:text-dark-300">
                  아직 등록된 경력이 없습니다.
                </p>
              </motion.div>
            ) : (
              <div>
                {experiences.map((exp, index) => (
                  <ExperienceItem 
                    key={exp._id}
                    exp={exp} 
                    variants={itemVariants}
                    isLast={index === experiences.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Experience