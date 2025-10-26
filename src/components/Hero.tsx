import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FaDownload, FaArrowRight, FaCoffee, FaCog, FaCode } from 'react-icons/fa'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '../utils/i18nUtils'

const Hero: React.FC = () => {
  const { settings, loading } = useSiteSettings()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'

  // 패럴랙스 효과를 위한 스크롤 훅
  const { scrollYProgress } = useScroll()
  
  // 스크롤 위치에 따라 요소의 Y축 위치를 변환
  const yTop = useTransform(scrollYProgress, [0, 1], [0, 100])
  const yBottom = useTransform(scrollYProgress, [0, 1], [0, -100])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <section id="home" className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-dark-900">
        <div className="w-12 h-12 border-4 border-coffee-600 border-t-transparent rounded-full animate-spin"></div>
      </section>
    )
  }

  const stats = [
    { 
      number: settings?.stat1Number || '5+', 
      label: getLocalizedField(currentLang, settings?.stat1Label, settings?.stat1LabelEn, settings?.stat1LabelJa) || '년 경력', 
      icon: FaCoffee 
    },
    { 
      number: settings?.stat2Number || '3+', 
      label: getLocalizedField(currentLang, settings?.stat2Label, settings?.stat2LabelEn, settings?.stat2LabelJa) || '완료 프로젝트', 
      icon: FaCode 
    },
    { 
      number: settings?.stat3Number || '10+', 
      label: getLocalizedField(currentLang, settings?.stat3Label, settings?.stat3LabelEn, settings?.stat3LabelJa) || '기술 스택', 
      icon: FaCog 
    },
  ]

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-dark-900 relative overflow-hidden">
      {/* Background decoration (패럴랙스 적용) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 윗부분 장식: 스크롤 시 아래로 이동 */}
        <motion.div 
          style={{ y: yTop }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-coffee-200 dark:bg-coffee-900 rounded-full opacity-20 blur-3xl"
        ></motion.div>
        {/* 아랫부분 장식: 스크롤 시 위로 이동 */}
        <motion.div 
          style={{ y: yBottom }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-caramel-200 dark:bg-caramel-900 rounded-full opacity-20 blur-3xl"
        ></motion.div>
      </div>

      <div className="section-padding w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <span className="inline-block px-4 py-2 bg-coffee-100 dark:bg-coffee-900 text-coffee-700 dark:text-coffee-300 rounded-full text-sm font-medium mb-6">
              {getLocalizedField(currentLang, settings?.heroTag, settings?.heroTagEn, settings?.heroTagJa) || '🎯 취업 준비 중'}
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-dark-900 dark:text-cream-100 mb-8 leading-tight"
          >
            {getLocalizedField(currentLang, settings?.heroTitle, settings?.heroTitleEn, settings?.heroTitleJa) || '공장자동화 전문가'}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-dark-600 dark:text-dark-300 mb-12 leading-relaxed max-w-3xl whitespace-pre-line"
          >
            {getLocalizedField(currentLang, settings?.heroSubtitle, settings?.heroSubtitleEn, settings?.heroSubtitleJa) || 'PLC 프로그래밍부터 데이터 분석까지, 스마트 팩토리의 미래를 만들어갑니다.'}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <motion.a 
              href="/projects"
              aria-label={t('hero.viewProjects')}
              variants={itemVariants}
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 group"
            >
              {t('hero.viewProjects')}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a 
              href={settings?.heroCtaLink2 || '/resume.pdf'}
              download={settings?.heroCtaLink2 ? true : false}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('hero.contactMe')}
              variants={itemVariants}
              className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              <FaDownload />
              {t('hero.contactMe')}
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-cream-200 dark:border-dark-700"
                whileHover={{ y: -5 }}
                role="status"
                aria-label={`${stat.label} 통계: ${stat.number}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-coffee-100 dark:bg-coffee-900 rounded-xl">
                    <stat.icon className="text-coffee-600 dark:text-coffee-400" size={24} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-coffee-600 dark:text-coffee-400">
                      {stat.number}
                    </div>
                    <div className="text-sm text-dark-600 dark:text-dark-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero