import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FaLaptopCode, FaPlus } from 'react-icons/fa'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import { useCategories } from '@/hooks/useCategories'
import ProjectCard from '@/components/ProjectCard'
import { useTranslation } from 'react-i18next'
import { getLocalizedField, getLocalizedCategoryName } from '@/utils/i18nUtils'

const Projects: React.FC = () => {
  const { settings: siteSettings } = useSiteSettings()
  const { isAuthenticated } = useAuth()
  const { projects, loading, error } = useProjects()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  // 🌟 카테고리 데이터 가져오기
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  // categories가 배열이 아닌 경우를 대비한 안전 처리
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  const [filter, setFilter] = useState('all')
  
  // 🌟 URL 쿼리 파라미터에서 skillId 읽기
  const [searchParams, setSearchParams] = useSearchParams()
  const skillIdFromUrl = searchParams.get('skillId')
  
  // 🌟 스크롤 위치 복원
  useEffect(() => {
    const scrollPosition = (location.state as any)?.scrollPosition
    if (scrollPosition) {
      window.scrollTo(0, scrollPosition)
      // state를 정리하여 뒤로가기 시 다시 복원되지 않도록
      window.history.replaceState({}, document.title)
    }
  }, [])
  
  // 🌟 skillIdFromUrl이 변경될 때마다 카테고리 필터를 'all'로 초기화
  useEffect(() => {
    if (skillIdFromUrl) {
      setFilter('all')
    }
  }, [skillIdFromUrl])

  // useInView 훅 선언
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // 🌟 프로젝트 필터링 로직 확장 (categoryIds 배열 + 스킬 ID)
  const filteredProjects = projects.filter(project => {
    // 1. 카테고리 필터 검사 (categoryIds 배열 기반)
    let categoryMatch = filter === 'all'
    if (!categoryMatch) {
      if (!project.categoryIds || project.categoryIds.length === 0) {
        // 호환성: categoryIds가 없으면 기존 category 문자열 사용
        categoryMatch = project.category === filter
      } else {
        // categoryIds 배열에 선택된 카테고리 ID가 포함되어 있는지 확인
        categoryMatch = (project.categoryIds as any[]).some((catIdOrObj: any) => {
          const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
          return catId === filter
        })
      }
    }
    
    // 2. 스킬 ID 필터 검사
    const skillMatch = !skillIdFromUrl || (project.skillIds && project.skillIds.includes(skillIdFromUrl))
    
    return categoryMatch && skillMatch
  })
  
  // 🌟 카테고리 필터 버튼 핸들러 수정
  const handleCategoryFilter = (categoryId: string) => {
    setFilter(categoryId)
    // 카테고리 버튼을 누르면 URL의 skillId 파라미터는 제거
    setSearchParams(searchParams => {
      searchParams.delete('skillId')
      return searchParams
    }, { replace: true })
  }

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-caramel-100 text-caramel-800 dark:bg-caramel-900 dark:text-caramel-200'
      case 'planning':
        return 'bg-coffee-100 text-coffee-800 dark:bg-coffee-900 dark:text-coffee-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-cream-100 text-dark-800 dark:bg-dark-700 dark:text-dark-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return t('projects.status.preparing')
      case 'planning':
        return t('projects.status.planning')
      case 'completed':
        return t('projects.status.completed')
      default:
        return t('projects.status.all')
    }
  }

  return (
    <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* 1. 제목 및 부제목 */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-6">
              {getLocalizedField(currentLang, siteSettings?.projectsTitle, siteSettings?.projectsTitleEn, siteSettings?.projectsTitleJa) || t('projects.title')}
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto mb-8">
              {/* 🌟 skillId 필터 활성화 시 부제목 변경 */}
              {skillIdFromUrl 
                ? t('projects.subtitle')
                : getLocalizedField(currentLang, siteSettings?.projectsSubtitle, siteSettings?.projectsSubtitleEn, siteSettings?.projectsSubtitleJa) || t('projects.subtitle')
              }
            </p>
          </motion.div>

          {/* 2. 프로젝트 추가 버튼 (인증된 경우) */}
          {isAuthenticated && (
            <motion.div variants={itemVariants} className="mb-8 flex justify-end">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-600 shadow-medium hover:shadow-glow"
              >
                <FaPlus /> {t('common.create')}
              </Link>
            </motion.div>
          )}

          {/* 3. 카테고리 필터 */}
          <motion.div variants={itemVariants} className="flex justify-center flex-wrap gap-3 mb-12">
            {/* 🌟 skillIdFromUrl이 있을 경우 초기화 버튼 표시 */}
            {skillIdFromUrl && (
              <motion.button
                onClick={() => setSearchParams({}, { replace: true })}
                whileTap={{ scale: 0.95 }}
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className="px-6 py-2 rounded-xl font-medium bg-red-500 text-white shadow-lg shadow-red-500/50 transition-all duration-200 hover:bg-red-600"
              >
                ❌ 스킬 필터 초기화
              </motion.button>
            )}

            {/* 전체 버튼 */}
            <motion.button
              key="all"
              onClick={() => handleCategoryFilter('all')}
              whileTap={{ scale: 0.95 }}
              layout
              transition={{ type: 'spring', stiffness: 700, damping: 30 }}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                !skillIdFromUrl && filter === 'all'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                  : 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-700 border border-secondary-200 dark:border-dark-700'
              }`}
            >
              전체
            </motion.button>
            
            {/* 카테고리 버튼들 */}
            {categories.map((category) => (
              <motion.button
                key={category._id}
                onClick={() => handleCategoryFilter(category._id)}
                whileTap={{ scale: 0.95 }}
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  // 🌟 skillIdFromUrl이 없을 때만 category filter의 활성화 상태 표시
                  !skillIdFromUrl && filter === category._id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                    : 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-700 border border-secondary-200 dark:border-dark-700'
                }`}
              >
                {getLocalizedCategoryName(currentLang, category)}
              </motion.button>
            ))}
          </motion.div>

          {/* 4. 프로젝트 그리드 */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            layout
          >
            <AnimatePresence>
              {loading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:col-span-2 lg:col-span-3 text-center p-12 bg-white dark:bg-dark-800 rounded-2xl shadow-inner border border-secondary-200 dark:border-dark-700"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-xl font-semibold text-dark-800 dark:text-cream-100">
                    프로젝트를 불러오는 중...
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:col-span-2 lg:col-span-3 text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-inner border border-red-200 dark:border-red-800"
                >
                  <p className="text-xl font-semibold text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </motion.div>
              )}

              {!loading && !error && filteredProjects.length === 0 && (
                <motion.div 
                  key="no-projects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:col-span-2 lg:col-span-3 text-center p-12 bg-white dark:bg-dark-800 rounded-2xl shadow-inner border border-secondary-200 dark:border-dark-700"
                >
                  <FaLaptopCode className="text-primary-600 dark:text-primary-400 text-4xl mx-auto mb-4" />
                  <p className="text-xl font-semibold text-dark-800 dark:text-cream-100">
                    {filter === 'all' ? '등록된 프로젝트가 없습니다.' : '선택하신 카테고리의 프로젝트가 아직 없습니다.'}
                  </p>
                  <p className="text-dark-500 dark:text-dark-400 mt-2">
                    {filter === 'all' ? '관리자 대시보드에서 첫 번째 프로젝트를 추가해보세요!' : '다른 필터를 선택하거나, 곧 업데이트될 프로젝트를 기대해 주세요!'}
                  </p>
                </motion.div>
              )}
            
              {!loading && !error && filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  itemVariants={itemVariants}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* 🌟 프로젝트 업데이트 카드 - 사이트 설정에서 관리 */}
          {siteSettings?.projectsUpdateTitle && (
            <motion.div
              variants={itemVariants}
              className="card p-10 mt-12 bg-primary-600 text-white rounded-2xl shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-4">{siteSettings.projectsUpdateTitle}</h3>
              <p className="text-secondary-100 mb-6 text-lg">
                {siteSettings.projectsUpdateDescription || '현재 학습 중인 기술들을 활용한 실제 프로젝트들을 곧 업로드할 예정입니다.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {(siteSettings.projectsUpdateTechList || ['PLC 프로그래밍', '데이터 분석', 'IoT 시스템', '협동로봇']).map((tech: string) => (
                  <span
                    key={tech}
                    className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium"
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

export default Projects