import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaBook, FaStar, FaCalendar, FaEdit, FaTrash, FaPlus, FaChevronRight, FaCubes } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/dateUtils'
import { Chapter, Skill } from '../types'
import { useBook, useDeleteBook } from '../hooks/useBooks'
import { useLearningManager } from '../hooks/useLearningManager'
// 목차 관리 관련 import 제거됨 - 중복 출력 문제 해결
import LearningItem from './common/LearningItem'
import { useQuery } from '@tanstack/react-query'
import { chaptersAPI } from '../services/api'
import { useSkills } from '../hooks/useSkills'
import RichTextEditor from './RichTextEditor'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '@/utils/i18nUtils'

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  // 🌟 React Query로 서적 데이터 조회
  const { data: book, isLoading: loading, isError, error } = useBook(id)
  
  // 🌟 React Query로 목차 데이터 조회
  const { data: bookChapters = [] } = useQuery<Chapter[], Error>({
    queryKey: ['chapters', id],
    queryFn: async () => {
      if (!id) return []
      const response = await chaptersAPI.getByBook(id)
      return response.data?.data || response.data || []
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  // 🌟 스킬 목록 가져오기
  const { skillCategories } = useSkills()
  
  // 🌟 React Query로 서적 삭제
  const deleteMutation = useDeleteBook()
  
  const bookApiError = isError ? (error?.message || '서적 정보를 불러오는 데 실패했습니다.') : null

  // 목차 관리 관련 상태 제거됨 - 중복 출력 문제 해결

  // 💡 커스텀 훅 사용: 학습 내용 상태와 핸들러를 가져옵니다.
  const {
    editingLearningId,
    currentFormData,
    setCurrentFormData,
    showAddForm,
    isSaving,
    learningApiError,
    handleToggleAddForm,
    handleAddLearning,
    handleDeleteLearning,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleSkillLinkChange,  // 🌟 스킬 연결 핸들러 추가
  } = useLearningManager(id!)
  
  // 🌟 확장 상태 관리 (아코디언 UI)
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null)
  
  // 챕터 확장/축소 토글 함수
  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId(prevId => (prevId === chapterId ? null : chapterId))
  }

  // =================================================================
  // 📚 스킬 데이터 처리 로직 (useMemo로 최적화)
  // =================================================================

  // 🌟 전체 책에 연결된 스킬 목록 필터링 및 가공
  const linkedBookSkills = useMemo<Array<Skill & { levelText: string }>>(() => {
    if (!bookChapters || !skillCategories) return []

    const allSkills = skillCategories.flatMap(category => category.skills || [])
    
    // 1. 모든 챕터의 모든 학습 내용에서 고유한 skillIds를 추출
    const uniqueSkillIds = new Set<string>()
    bookChapters.forEach(chapter => {
      (chapter.learnings || []).forEach(learning => {
        // 학습 내용에 skillIds 필드가 있다고 가정
        (learning.skillIds || []).forEach((skillId: string) => {
          uniqueSkillIds.add(skillId)
        })
      })
    })
    
    if (uniqueSkillIds.size === 0) return []

    // 2. Skills.tsx의 레벨 텍스트 로직 재사용
    const getLevelText = (level: number) => {
      if (level >= 90) return 'Expert'
      if (level >= 70) return 'Proficient'
      if (level >= 50) return 'Competent'
      return 'Basic'
    }

    // 3. 필터링 및 가공
    return allSkills
      .filter(skill => skill._id && uniqueSkillIds.has(skill._id))
      .map(skill => ({
        ...skill,
        levelText: getLevelText(skill.level || 0),
      }))
  }, [bookChapters, skillCategories])

  // 🌟 개별 학습 내용에서 스킬 ID를 객체로 변환하기 위한 Map
  const allSkillsMap = useMemo(() => {
    const map = new Map<string, Skill & { levelText: string }>()
    linkedBookSkills.forEach(skill => skill._id && map.set(skill._id, skill))
    return map
  }, [linkedBookSkills])

  // 🌟 색상을 동적으로 적용하는 스타일 생성 함수 (배지용)
  const getBadgeStyle = (colorCode: string) => {
    // 배경색에 15%의 투명도를 적용하여 은은하게 표시
    const bgColor = `${colorCode}26`
    const textColor = colorCode
    
    return {
      backgroundColor: bgColor,
      color: textColor,
    } as React.CSSProperties
  }

  // =================================================================
  // 📚 서적 삭제 핸들러
  // =================================================================

  // 🌟 React Query Mutation을 사용한 서적 삭제
  const handleDeleteBook = async () => {
    if (!confirm('이 서적을 삭제하시겠습니까? 관련 학습 내용도 모두 사라집니다.')) return

    try {
      await deleteMutation.mutateAsync(id!)
      navigate('/books')
    } catch (error) {
      console.error('Failed to delete book:', error)
    }
  }
  
  const isDeleting = deleteMutation.isPending

  // 목차 관리 핸들러들 제거됨 - 중복 출력 문제 해결

  // 💡 기존의 학습 내용 핸들러들은 useLearningManager 훅으로 이동하여 삭제됨

  // 학습 내용 정렬 (useMemo 사용으로 성능 최적화)
  const sortedLearnings = useMemo(() => {
    if (!book?.learnings) return []
    
    return [...book.learnings].sort((a, b) => {
      // 최신순(내림차순) 정렬
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [book?.learnings])

  // =================================================================
  // ⚙️ 렌더링 및 로딩/에러 처리
  // =================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">서적을 찾을 수 없습니다</p>
          <Link 
            to="/books" 
            state={location.state}
            className="text-primary-600 hover:text-primary-700 mt-4 inline-block"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 별점 렌더링 함수
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        className={i < rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'} 
      />
    ))
  }

  return (
    <section className="section-padding bg-white dark:bg-dark-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* 에러 메시지: bookApiError와 learningApiError를 모두 표시 */}
        {(bookApiError || learningApiError) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-dark-800 dark:text-red-400" 
            role="alert"
          >
            {bookApiError || learningApiError}
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/books"
            state={location.state}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <FaArrowLeft /> 목록으로 돌아가기
          </Link>
        </motion.div>

        {/* Book Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                  loading="eager"
                  decoding="async"
                  width="400"
                  height="533"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <FaBook className="text-white text-6xl" />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {/* 카테고리 배지 (복수 표시) */}
                  {book.categoryIds && book.categoryIds.length > 0 ? (
                    (book.categoryIds as any[]).map((catIdOrObj: any) => {
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
                    book.category && (
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                        {book.category}
                      </span>
                    )
                  )}
                </div>
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Link
                      to={`/admin`}
                      state={{ tab: 'books', editId: book._id }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                      aria-label="서적 수정"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={handleDeleteBook}
                      disabled={isDeleting}
                      className={`p-2 rounded-lg text-red-600 dark:text-red-400 transition-colors ${
                        isDeleting 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label="서적 삭제"
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {getLocalizedField(currentLang, book.title, book.titleEn, book.titleJa)}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {getLocalizedField(currentLang, book.author, book.authorEn, book.authorJa)}
              </p>
              <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  {renderRatingStars(book.rating)}
                  <span className="font-medium ml-1">{book.rating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar />
                  <span>읽은 날짜: {formatDate(book.readDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🌟 이 책을 통해 학습한 핵심 스킬 섹션 */}
        {linkedBookSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaCubes className="text-primary-600" /> 이 책을 통해 학습한 핵심 스킬
            </h3>
            <div className="flex flex-wrap gap-2">
              {linkedBookSkills.map(skill => {
                // 🌟 동적 스타일 적용
                const badgeStyle = skill.color ? getBadgeStyle(skill.color) : undefined

                return (
                  <Link
                    key={skill._id}
                    to={`/projects?skillId=${skill._id}`}
                    title={`${skill.name} 스킬이 사용된 모든 프로젝트 보기`}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium hover:ring-2 transition-all hover:opacity-80"
                    style={{
                      ...badgeStyle,
                      '--tw-ring-color': skill.color || '#3B82F6',
                    } as React.CSSProperties}
                  >
                    {skill.name}
                    <span 
                      className="ml-1 text-xs font-semibold"
                      style={{ color: skill.color || '#3B82F6' }}
                    >
                      [{skill.levelText}]
                    </span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Learnings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              학습 내용
            </h2>
            {isAuthenticated && (!bookChapters || bookChapters.length === 0) && (
              <button
                onClick={handleToggleAddForm}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <FaPlus /> {showAddForm ? '추가 취소' : '새 내용 추가'}
              </button>
            )}
          </div>

          {/* Add Learning Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card p-6 mb-6 overflow-hidden"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  새 학습 내용 추가
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      학습 주제
                    </label>
                    <input
                      type="text"
                      id="topic"
                      value={currentFormData.topic}
                      onChange={(e) => setCurrentFormData(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="학습 주제를 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      학습 내용
                    </label>
                    <RichTextEditor
                      value={currentFormData.content}
                      onChange={(value) => setCurrentFormData(prev => ({ ...prev, content: value }))}
                      placeholder="학습 내용을 입력하세요. 리치텍스트 에디터를 사용하여 다양한 서식을 적용할 수 있습니다."
                      rows={8}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleAddLearning}
                      disabled={isSaving || !currentFormData.topic.trim() || !currentFormData.content.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isSaving ? '저장 중...' : '추가'}
                    </button>
                    <button
                      onClick={handleToggleAddForm}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 학습 내용 리스트 - 아코디언 버전 */}
          {(() => {
            // 목차 기반 학습 내용이 있는 경우
            if (bookChapters && bookChapters.length > 0) {
              return (
                <div className="space-y-4">
                  {bookChapters.map((chapter) => {
                    // 🌟 현재 챕터가 확장되었는지 확인
                    const isExpanded = expandedChapterId === chapter._id
                    
                    return (
                      <div key={chapter._id} className="card p-6 border border-gray-200 dark:border-gray-700">
                        
                        {/* 🌟 챕터 제목 (클릭 가능한 아코디언 헤더) */}
                        <div 
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 -m-6 p-6 rounded-lg transition-colors"
                          onClick={() => toggleChapter(chapter._id!)}
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                            {chapter.title}
                            <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">
                              ({(chapter.learnings || []).length}개의 학습 내용)
                            </span>
                          </h3>
                          {/* 🌟 확장/축소 아이콘 */}
                          <motion.span
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-primary-600 dark:text-primary-400 text-xl ml-4"
                          >
                            <FaChevronRight />
                          </motion.span>
                        </div>

                        {/* 🌟 학습 내용 (아코디언 바디) */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-6 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                {(chapter.learnings || []).map((learning, index: number) => (
                                  <LearningItem 
                                    key={learning._id}
                                    learning={learning}
                                    index={index}
                                    isAuthenticated={isAuthenticated}
                                    isEditing={editingLearningId === learning._id}
                                    currentFormData={currentFormData}
                                    setCurrentFormData={setCurrentFormData}
                                    onStartEdit={handleStartEdit}
                                    onSaveEdit={handleSaveEdit}
                                    onCancelEdit={handleCancelEdit}
                                    onDelete={handleDeleteLearning}
                                    isSaving={isSaving}
                                    allSkillsMap={allSkillsMap}  // 🌟 스킬 맵 전달
                                    onSkillLinkChange={handleSkillLinkChange}  // 🌟 스킬 연결 핸들러 전달
                                    chapterId={chapter._id}  // 🌟 목차 ID 전달
                                  />
                                ))}
                                {(!chapter.learnings || chapter.learnings.length === 0) && (
                                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    이 목차에는 아직 학습 내용이 없습니다.
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )
            }
            // 기존 학습 내용이 있는 경우
            else if (sortedLearnings.length > 0) {
              return (
                <div className="space-y-6">
                  {sortedLearnings.map((learning, index) => (
                    <LearningItem 
                      key={learning._id}
                      learning={learning}
                      index={index}
                      isAuthenticated={isAuthenticated}
                      isEditing={editingLearningId === learning._id}
                      currentFormData={currentFormData}
                      setCurrentFormData={setCurrentFormData}
                      onStartEdit={handleStartEdit}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onDelete={handleDeleteLearning}
                      isSaving={isSaving}
                      allSkillsMap={allSkillsMap}  // 🌟 스킬 맵 전달
                      onSkillLinkChange={handleSkillLinkChange}  // 🌟 스킬 연결 핸들러 전달
                    />
                  ))}
                </div>
              )
            }
            // 학습 내용이 없는 경우
            else {
              return (
                <div className="card p-12 text-center">
                  <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    아직 작성된 학습 내용이 없습니다
                  </p>
                </div>
              )
            }
          })()}
        </motion.div>
      </div>
    </section>
  )
}

export default BookDetail

// 💡 LearningForm과 LearningItem 컴포넌트는 별도 파일로 분리됨
