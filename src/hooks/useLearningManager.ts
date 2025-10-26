import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { learningsAPI } from '../services/api'
import { Learning, LearningFormData, Book, Chapter } from '../types'
import { BOOK_QUERY_KEY } from './useBooks'

/**
 * 🌟 React Query 기반 학습 내용(Learning) 관리 훅
 * 
 * 주요 개선사항:
 * 1. React Query Mutation 사용으로 캐시 자동 관리
 * 2. 서적 상세 정보 캐시 무효화로 실시간 업데이트
 * 3. 데이터 카운트 자동 동기화
 * 4. 스킬 연결/해제 낙관적 업데이트
 */

// =================================================================
// ✏️ 학습 내용 생성 (React Query Mutation)
// =================================================================

export const useCreateLearning = (bookId: string) => {
  const queryClient = useQueryClient()

  return useMutation<Learning, Error, LearningFormData>({
    mutationFn: async (data: LearningFormData) => {
      const response = await learningsAPI.createForBook(bookId, data)
      return response.data
    },
    onSuccess: () => {
      // 💡 해당 서적 상세 캐시 무효화 → BookDetail 자동 업데이트
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'detail', bookId] })
      // 💡 서적 목록도 무효화 (learnings 배열이 포함될 수 있음)
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'list'] })
      // 💡 목차(chapters) 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['chapters', bookId] })
    },
  })
}

// =================================================================
// 🔄 학습 내용 수정 (React Query Mutation)
// =================================================================

export const useUpdateLearning = (bookId: string) => {
  const queryClient = useQueryClient()

  return useMutation<Learning, Error, { learningId: string; data: LearningFormData }>({
    mutationFn: async ({ learningId, data }) => {
      const response = await learningsAPI.updateForBook(bookId, learningId, data)
      return response.data
    },
    onSuccess: () => {
      // 💡 해당 서적 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'detail', bookId] })
      // 💡 서적 목록도 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'list'] })
      // 💡 목차(chapters) 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['chapters', bookId] })
    },
  })
}

// =================================================================
// 🗑️ 학습 내용 삭제 (React Query Mutation)
// =================================================================

export const useDeleteLearning = (bookId: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (learningId: string) => {
      await learningsAPI.deleteForBook(bookId, learningId)
    },
    onSuccess: () => {
      // 💡 해당 서적 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'detail', bookId] })
      // 💡 서적 목록도 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'list'] })
      // 💡 목차(chapters) 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['chapters', bookId] })
    },
  })
}

// =================================================================
// 🔗 학습 내용 스킬 업데이트 (React Query Mutation)
// =================================================================

export const useUpdateLearningSkills = (bookId: string) => {
  const queryClient = useQueryClient()

  return useMutation<Learning, Error, { learningId: string; skillIds: string[] }>({
    mutationFn: async ({ learningId, skillIds }) => {
      // 💡 learningsAPI.updateSkills 함수 사용
      const response = await learningsAPI.updateSkills(bookId, learningId, skillIds)
      return response.data
    },
    onSuccess: () => {
      // 스킬 업데이트 성공 시, Book Detail 캐시를 무효화하여 모든 UI를 새로고침
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'detail', bookId] })
      // 서적 목록도 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'list'] })
      // 목차(chapters) 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['chapters', bookId] })
    },
  })
}

// =================================================================
// 🔄 기존 훅 호환성 유지 (useLearningManager)
// =================================================================

/**
 * 학습 내용(Learning)의 추가, 수정, 삭제 및 폼 상태 관리를 담당하는 커스텀 훅
 * @param bookId 현재 서적 ID
 */
export const useLearningManager = (bookId: string) => {
  const queryClient = useQueryClient()
  
  // 폼 및 액션 관련 상태
  const [editingLearningId, setEditingLearningId] = useState<string | null>(null)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [currentFormData, setCurrentFormData] = useState<LearningFormData>({ topic: '', content: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // React Query Mutations
  const createMutation = useCreateLearning(bookId)
  const updateMutation = useUpdateLearning(bookId)
  const deleteMutation = useDeleteLearning(bookId)
  const updateSkillsMutation = useUpdateLearningSkills(bookId)  // 🌟 스킬 업데이트 Mutation 추가

  const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || updateSkillsMutation.isPending

  // 폼 닫기/초기화 공통 로직
  const resetFormState = () => {
    setEditingLearningId(null)
    setEditingChapterId(null)
    setCurrentFormData({ topic: '', content: '' })
    setShowAddForm(false)
  }

  // 학습 내용 추가 폼 표시/숨김 토글
  const handleToggleAddForm = () => {
    if (editingLearningId) {
      handleCancelEdit()
    }
    if (showAddForm) {
      setCurrentFormData({ topic: '', content: '' })
    }
    setShowAddForm(prev => !prev)
    setApiError(null)
  }

  // 🌟 학습 내용 추가 (React Query Mutation 사용)
  const handleAddLearning = async () => {
    if (!currentFormData.topic || !currentFormData.content) return

    try {
      setApiError(null)
      await createMutation.mutateAsync(currentFormData)
      resetFormState()
    } catch (error) {
      console.error('Failed to add learning:', error)
      setApiError('학습 내용 추가에 실패했습니다.')
    }
  }

  // 🌟 학습 내용 삭제 (목차 기반/직접 학습 내용 구분)
  const handleDeleteLearning = async (learningId: string, chapterId?: string) => {
    if (!confirm('이 학습 내용을 삭제하시겠습니까?')) return

    try {
      setApiError(null)
      
      // 목차 기반 학습 내용인 경우
      if (chapterId) {
        await learningsAPI.deleteForChapter(bookId, chapterId, learningId)
        console.log('✅ 목차 학습 내용 삭제 성공')
      } else {
        // 직접 학습 내용인 경우
        await deleteMutation.mutateAsync(learningId)
      }
      
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'detail', bookId] })
      queryClient.invalidateQueries({ queryKey: ['chapters', bookId] })
    } catch (error) {
      console.error('Failed to delete learning:', error)
      setApiError('학습 내용 삭제에 실패했습니다.')
    }
  }

  // 학습 내용 수정 시작
  const handleStartEdit = (learning: Learning, chapterId?: string) => {
    setShowAddForm(false)
    setEditingLearningId(learning._id)
    setEditingChapterId(chapterId || null)
    setCurrentFormData({ topic: learning.topic, content: learning.content })
    setApiError(null)
  }

  // 🌟 학습 내용 수정 저장 (목차 기반/직접 학습 내용 구분)
  const handleSaveEdit = async () => {
    if (!editingLearningId || !currentFormData.topic || !currentFormData.content) return

    try {
      setApiError(null)
      
      // 목차 기반 학습 내용인 경우
      if (editingChapterId) {
        const response = await learningsAPI.updateForChapter(
          bookId, 
          editingChapterId, 
          editingLearningId, 
          currentFormData
        )
        console.log('✅ 목차 학습 내용 수정 성공:', response.data)
      } else {
        // 직접 학습 내용인 경우
        await updateMutation.mutateAsync({
          learningId: editingLearningId,
          data: currentFormData
        })
      }
      
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'detail', bookId] })
      queryClient.invalidateQueries({ queryKey: ['chapters', bookId] })
      
      resetFormState()
    } catch (error) {
      console.error('Failed to update learning:', error)
      setApiError('학습 내용 수정에 실패했습니다.')
    }
  }

  // 학습 내용 수정 취소
  const handleCancelEdit = () => {
    resetFormState()
    setApiError(null)
  }

  // =================================================================
  // 🌟 스킬 연결/해제 핸들러 (낙관적 업데이트 포함)
  // =================================================================

  /**
   * 특정 학습 내용에 스킬을 연결하거나 해제합니다.
   * 낙관적 업데이트를 사용하여 UI 반응 속도를 높입니다.
   */
  const handleSkillLinkChange = async (learningId: string, skillId: string, isLinked: boolean) => {
    const queryKey = [BOOK_QUERY_KEY, 'detail', bookId]
    const chaptersQueryKey = ['chapters', bookId]
    
    // 1. Optimistic Update를 위한 현재 캐시 가져오기
    const previousBook = queryClient.getQueryData<Book>(queryKey)
    const previousChapters = queryClient.getQueryData<Chapter[]>(chaptersQueryKey)

    try {
      setApiError(null)

      // 2. 새로운 skillIds 배열 계산
      let newSkillIds: string[] = []
      
      // 현재 학습 내용을 찾기
      const currentLearning = (previousChapters || []).flatMap(c => c.learnings || []).find(l => l._id === learningId)
                              || (previousBook?.learnings || []).find(l => l._id === learningId)

      if (currentLearning) {
        const currentSkillIds = currentLearning.skillIds || []
        if (isLinked) {
          // 연결: skillId 추가 (중복 방지)
          newSkillIds = Array.from(new Set([...currentSkillIds, skillId]))
        } else {
          // 해제: skillId 제거
          newSkillIds = currentSkillIds.filter((id: string) => id !== skillId)
        }
      } else {
        // Learning을 찾을 수 없는 경우
        newSkillIds = isLinked ? [skillId] : []
      }
      
      // 3. Optimistic Update 실행: chapters 캐시 업데이트
      if (previousChapters) {
        queryClient.setQueryData<Chapter[]>(chaptersQueryKey, (oldChapters) => {
          if (!oldChapters) return oldChapters
          
          return oldChapters.map((chapter) => ({
            ...chapter,
            learnings: (chapter.learnings || []).map((learning) => 
              learning._id === learningId ? { ...learning, skillIds: newSkillIds } : learning
            )
          }))
        })
      }
      
      // Book 캐시도 업데이트 (기존 learnings 지원)
      if (previousBook) {
        queryClient.setQueryData<Book>(queryKey, (oldBook) => {
          if (!oldBook) return oldBook
          
          // 목차 기반일 경우
          if (oldBook.chapters && oldBook.chapters.length > 0) {
            return {
              ...oldBook,
              chapters: oldBook.chapters.map((chapter: Chapter) => ({
                ...chapter,
                learnings: (chapter.learnings || []).map((learning: Learning) => 
                  learning._id === learningId ? { ...learning, skillIds: newSkillIds } : learning
                )
              }))
            }
          }
          
          // 기존 학습 내용 리스트 기반일 경우
          return {
            ...oldBook,
            learnings: (oldBook.learnings || []).map((learning: Learning) => 
              learning._id === learningId ? { ...learning, skillIds: newSkillIds } : learning
            )
          }
        })
      }

      // 4. 서버 API 호출
      await updateSkillsMutation.mutateAsync({ learningId, skillIds: newSkillIds })

    } catch (error) {
      console.error('Failed to update learning skills:', error)
      setApiError('스킬 연결/해제에 실패했습니다.')

      // 5. 에러 발생 시 롤백: 이전 데이터로 복원
      if (previousChapters) {
        queryClient.setQueryData(chaptersQueryKey, previousChapters)
      }
      if (previousBook) {
        queryClient.setQueryData(queryKey, previousBook)
      } else {
        // 이전 데이터가 없으면 캐시를 무효화하여 서버에서 다시 가져오도록 합니다
        queryClient.invalidateQueries({ queryKey })
        queryClient.invalidateQueries({ queryKey: chaptersQueryKey })
      }
    }
  }

  return {
    editingLearningId,
    currentFormData,
    setCurrentFormData,
    showAddForm,
    isSaving,
    learningApiError: apiError,
    handleToggleAddForm,
    handleAddLearning,
    handleDeleteLearning,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleSkillLinkChange,  // 🌟 새로운 핸들러 추가
  }
}
