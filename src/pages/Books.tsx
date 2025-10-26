import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FaBook, FaPlus, FaStar, FaCalendar } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useBooks } from '@/hooks/useBooks'
import { useCategories } from '@/hooks/useCategories'
import { formatDate } from '@/utils/dateUtils'
import BookCoverImage from '@/components/BookCoverImage'
import ScrollToTopButton from '@/components/common/ScrollToTopButton'
import { useTranslation } from 'react-i18next'
import { getLocalizedField, getLocalizedCategoryName } from '@/utils/i18nUtils'

const Books: React.FC = () => {
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  // 🌟 React Query useBooks 훅의 반환값 구조 수정
  const { data: books = [], isLoading: loading } = useBooks()
  // 🌟 카테고리 데이터 가져오기
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const location = useLocation()
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
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

  // =================================================================
  // 🔍 필터링 로직 (categoryIds 배열 기반)
  // =================================================================
  
  const filteredBooks = useMemo(() => {
    const safeBooks = books || []
    if (filter === 'all') return safeBooks
    
    // categoryIds 배열에 선택된 카테고리 ID가 포함되어 있는지 확인
    return safeBooks.filter(book => {
      if (!book.categoryIds || book.categoryIds.length === 0) {
        // 호환성: categoryIds가 없으면 기존 category 문자열 사용
        return book.category?.toLowerCase() === filter
      }
      
      // categoryIds가 populate된 객체 배열인 경우와 ID 문자열 배열인 경우 모두 처리
      return (book.categoryIds as any[]).some((catIdOrObj: any) => {
        const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
        return catId === filter
      })
    })
  }, [books, filter])

  // 로딩 상태 통합: 설정 데이터와 책 데이터 중 하나라도 로딩 중이면 로딩 표시
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
              {getLocalizedField(currentLang, siteSettings?.booksTitle, siteSettings?.booksTitleEn, siteSettings?.booksTitleJa) || '기술 서적 & 학습 노트'}
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto mb-8">
              {getLocalizedField(currentLang, siteSettings?.booksSubtitle, siteSettings?.booksSubtitleEn, siteSettings?.booksSubtitleJa) || '읽은 기술 서적과 그로부터 배운 지식을 공유합니다'}
            </p>
          </motion.div>

          {/* 2. 서적 추가 버튼 (인증된 경우) */}
          {isAuthenticated && (
            <motion.div variants={itemVariants} className="mb-8 flex justify-end">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-600 shadow-medium hover:shadow-glow"
              >
                <FaPlus /> 서적 추가
              </Link>
            </motion.div>
          )}

          {/* 3. 카테고리 필터 (categoryIds 배열 기반) */}
          <motion.div variants={itemVariants} className="flex justify-center flex-wrap gap-3 mb-12">
            {/* '전체' 버튼 */}
            <button
              key="all"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-600 border ${
                filter === 'all'
                  ? 'bg-primary-500 text-white border-primary-500 dark:bg-primary-600 dark:border-primary-600 shadow-glow'
                  : 'bg-white text-dark-700 border-secondary-300 hover:bg-secondary-50 dark:bg-dark-700 dark:text-dark-300 dark:border-dark-600 dark:hover:bg-dark-600'
              }`}
            >
              전체
            </button>
            {/* 카테고리 버튼 렌더링 */}
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setFilter(category._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-600 border ${
                  filter === category._id
                    ? 'bg-primary-500 text-white border-primary-500 dark:bg-primary-600 dark:border-primary-600 shadow-glow'
                    : 'bg-white text-dark-700 border-secondary-300 hover:bg-secondary-50 dark:bg-dark-700 dark:text-dark-300 dark:border-dark-600 dark:hover:bg-dark-600'
                }`}
              >
                {getLocalizedCategoryName(currentLang, category)}
              </button>
            ))}
          </motion.div>

          {/* 4. 로딩, 결과 없음, 또는 책 목록 */}
          {isPageLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-dark-500 dark:text-dark-400">데이터를 불러오는 중...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <FaBook className="text-6xl text-dark-400 mx-auto mb-4" />
              <p className="text-xl text-dark-600 dark:text-dark-400">
                {filter === 'all' ? '전체' : (() => {
                  const cat = categories.find(c => c._id === filter)
                  return cat ? getLocalizedCategoryName(currentLang, cat) : '선택한'
                })()} 카테고리의 등록된 서적이 없습니다.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredBooks.map((book) => (
                <motion.div
                  key={book._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="card hover-lift"
                >
                  <Link
                    to={`/books/${book._id}`}
                    state={{ scrollPosition: window.scrollY }}
                    className="block overflow-hidden h-full group"
                  >
                    {/* 개선된 이미지 컴포넌트 사용 */}
                    <BookCoverImage
                      src={book.coverImage || ''}
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-600"
                    />
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {/* 카테고리 배지 (복수 표시) */}
                        <div className="flex flex-wrap gap-2">
                          {book.categoryIds && book.categoryIds.length > 0 ? (
                            (book.categoryIds as any[]).map((catIdOrObj: any) => {
                              const catId = typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj?._id
                              const categoryObj = typeof catIdOrObj === 'string' 
                                ? categories.find(c => c._id === catId)
                                : catIdOrObj
                              
                              return categoryObj ? (
                                <span 
                                  key={catId}
                                  className="px-3 py-1 bg-primary-100 dark:bg-primary-800/50 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                                >
                                  {getLocalizedCategoryName(currentLang, categoryObj)}
                                </span>
                              ) : null
                            })
                          ) : (
                            // 호환성: categoryIds가 없으면 기존 category 표시
                            book.category && (
                              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-800/50 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                                {book.category}
                              </span>
                            )
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500" />
                          <span className="text-dark-700 dark:text-dark-300 font-medium">
                            {book.rating}/5
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-600">
                        {getLocalizedField(currentLang, book.title, book.titleEn, book.titleJa)}
                      </h3>
                      <p className="text-dark-600 dark:text-dark-400 mb-4">
                        {getLocalizedField(currentLang, book.author, book.authorEn, book.authorJa)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-dark-500 dark:text-dark-500 pt-2 border-t border-secondary-200 dark:border-dark-600">
                        <div className="flex items-center gap-2">
                          <FaCalendar />
                          <span>{formatDate(book.readDate)}</span>
                        </div>
                        <span 
                          className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-600 font-medium"
                        >
                          {(() => {
                            // 목차가 있는 경우: 목차별 학습 내용 합계
                            if (book.chapters && book.chapters.length > 0) {
                              const totalChapterLearnings = book.chapters.reduce((sum, chapter) => 
                                sum + (chapter.learnings?.length || 0), 0
                              )
                              return `${book.chapters.length}개 목차, ${totalChapterLearnings}개 학습 내용`
                            }
                            // 기존 학습 내용이 있는 경우
                            else if (book.learnings && book.learnings.length > 0) {
                              return `${book.learnings.length}개의 학습 내용`
                            }
                            // 학습 내용이 없는 경우
                            else {
                              return '학습 내용 없음'
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* 🌟 스크롤 투 탑 버튼 */}
      <ScrollToTopButton />
    </section>
  )
}

export default Books


