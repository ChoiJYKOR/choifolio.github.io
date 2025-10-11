import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaEdit, FaTrash, FaTag } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Learning, Skill } from '../../types'
import { formatDate, formatRelativeDate } from '../../utils/dateUtils'
import { parseMarkdown, getFormattedReadingTime } from '../../utils/textUtils'
import RichTextEditor from '../RichTextEditor'

// 🌟 BookDetail.tsx에서 전달받는 Skill Map의 값 타입
interface SkillWithLevel extends Skill {
  levelText: string
}

interface LearningItemProps {
  learning: Learning
  index: number
  isAuthenticated: boolean
  isEditing: boolean
  currentFormData: { topic: string; content: string }
  setCurrentFormData: React.Dispatch<React.SetStateAction<{ topic: string; content: string }>>
  onStartEdit: (learning: Learning, chapterId?: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (learningId: string, chapterId?: string) => void
  isSaving?: boolean
  // 🌟 NEW PROP 1: 전체 스킬 목록 맵 (ID로 스킬 정보를 찾는 용도)
  allSkillsMap?: Map<string, SkillWithLevel>
  // 🌟 NEW PROP 2: 스킬 연결/해제 핸들러 (useLearningManager에 구현 필요)
  onSkillLinkChange?: (learningId: string, skillId: string, isLinked: boolean) => void
  // 🌟 NEW PROP 3: 목차 ID (목차 기반 학습 내용인 경우)
  chapterId?: string
}

/**
 * 개별 학습 내용 아이템 컴포넌트
 * 학습 내용의 표시, 수정, 삭제 기능을 제공합니다.
 */
const LearningItem: React.FC<LearningItemProps> = ({
  learning,
  index,
  isAuthenticated,
  isEditing,
  currentFormData,
  setCurrentFormData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isSaving = false,
  allSkillsMap,
  onSkillLinkChange,
  chapterId,
}) => {
  
  // 🌟 1. 현재 학습 내용에 연결된 스킬 목록 추출 (기본 보기용)
  const linkedSkills = useMemo(() => {
    if (!allSkillsMap) return []
    return (learning.skillIds || [])
      .map(skillId => allSkillsMap.get(skillId))
      .filter((skill): skill is SkillWithLevel => !!skill)
  }, [learning.skillIds, allSkillsMap])
  
  // 🌟 2. 관리자 수정 모드에서 스킬 연결/해제 토글 핸들러
  const handleSkillToggle = (skillId: string) => {
    if (!onSkillLinkChange) return
    const isLinked = learning.skillIds?.includes(skillId) || false
    // 부모 컴포넌트(BookDetail)의 핸들러를 호출하여 LearningManager를 통해 상태 업데이트
    onSkillLinkChange(learning._id, skillId, !isLinked)
  }

  // 🌟 3. 편집 모드에서 사용할 수 있는 전체 스킬 목록 (Map의 값을 배열로 변환)
  const availableSkills = useMemo(() => {
    if (!allSkillsMap) return []
    return Array.from(allSkillsMap.values())
  }, [allSkillsMap])

  // 🌟 4. 색상을 동적으로 적용하는 스타일 생성 함수 (배지용)
  const getBadgeStyle = (colorCode: string) => {
    // 배경색에 10%의 투명도를 적용하여 은은하게 표시
    const bgColor = `${colorCode}1A`
    const textColor = colorCode
    
    return {
      backgroundColor: bgColor,
      color: textColor,
    } as React.CSSProperties
  }
  
  // 🌟 5. 색상을 동적으로 적용하는 스타일 생성 함수 (버튼용)
  const getButtonStyle = (colorCode: string) => {
    return {
      backgroundColor: colorCode,
      color: '#FFFFFF',
    } as React.CSSProperties
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className={`card p-6 ${isEditing ? 'border-2 border-primary-500 shadow-xl' : ''}`}
    >
      {isEditing ? (
        // 🌟 [수정 폼 렌더링]
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

          {/* 🌟 [추가] 스킬 연결 섹션 (관리자용) */}
          {isAuthenticated && allSkillsMap && availableSkills.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FaTag size={14} className="text-primary-600" /> 관련 스킬 연결 ({learning.skillIds?.length || 0}개 연결됨)
              </label>
              {/* 스킬 선택 버튼 목록 */}
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                {availableSkills.map(skill => {
                  const isLinked = learning.skillIds?.includes(skill._id!)
                  // 🌟 동적 스타일 적용
                  const dynamicStyle = skill.color && isLinked ? getButtonStyle(skill.color) : undefined

                  return (
                    <button
                      key={skill._id}
                      onClick={() => handleSkillToggle(skill._id!)}
                      type="button"
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        isLinked
                          ? 'text-white hover:opacity-80'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                      style={dynamicStyle}
                    >
                      {isLinked ? '✔️' : '➕'} {skill.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {/* 🌟 스킬 연결 섹션 끝 */}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onSaveEdit()}
              disabled={isSaving || !currentFormData.topic.trim() || !currentFormData.content.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? '저장 중...' : '수정'}
            </button>
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        // 🌟 [기본 보기 렌더링]
        <>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {learning.topic}
            </h3>
            {isAuthenticated && (
              <div className="flex gap-1">
                <button
                  onClick={() => onStartEdit(learning, chapterId)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                  aria-label="수정"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => onDelete(learning._id, chapterId)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                  aria-label="삭제"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            )}
          </div>
          
          {/* 🌟 [추가] 연결된 스킬 배지 목록 (기본 보기) */}
          {linkedSkills.length > 0 && (
            <div className="flex flex-wrap items-start gap-2 mb-4">
              <FaTag size={16} className="text-gray-500 dark:text-gray-400 mt-1 shrink-0" title="관련 스킬" />
              {linkedSkills.map(skill => {
                // 🌟 동적 스타일 적용
                const badgeStyle = skill.color ? getBadgeStyle(skill.color) : undefined

                return (
                  <Link
                    key={skill._id}
                    to={`/projects?skillId=${skill._id}`}
                    title={`${skill.name} 스킬이 사용된 프로젝트 보기`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 hover:ring-2"
                    style={{
                      ...badgeStyle,
                      '--tw-ring-color': skill.color || '#3B82F6',
                    } as React.CSSProperties}
                  >
                    {skill.name}
                  </Link>
                )
              })}
            </div>
          )}
          {/* 🌟 연결된 스킬 배지 목록 끝 */}

          <div 
            className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(learning.content) }}
          />
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            작성일: {formatDate(learning.createdAt)} ({formatRelativeDate(learning.createdAt)}) • {getFormattedReadingTime(learning.content)}
          </div>
        </>
      )}
    </motion.div>
  )
}

export default LearningItem
