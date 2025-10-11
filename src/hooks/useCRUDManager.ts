import { useState, useCallback } from 'react'

interface CRUDState<T> {
  showForm: boolean
  editingItem: T | null
  isSaving: boolean
  isDeleting: boolean
}

interface CRUDActions<T> {
  handleCreate: () => void
  handleEdit: (item: T) => void
  handleCancel: () => void
  handleSave: (data: any) => Promise<void>
  handleDelete: (item: T) => Promise<void>
  setShowForm: (show: boolean) => void
  setEditingItem: (item: T | null) => void
}

interface UseCRUDManagerOptions<T> {
  onSave: (data: any, editingItem?: T | null) => Promise<void>
  onDelete: (item: T) => Promise<void>
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * CRUD 관리자를 위한 재사용 가능한 Custom Hook
 * BookManager, ExperienceManager, ProjectManager 등에서 공통으로 사용되는
 * 상태 관리 로직을 중앙화하여 코드 중복을 제거합니다.
 */
export function useCRUDManager<T>({
  onSave,
  onDelete,
  onSuccess,
  onError
}: UseCRUDManagerOptions<T>): [CRUDState<T>, CRUDActions<T>] {
  
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 새 항목 생성 핸들러
  const handleCreate = useCallback(() => {
    setEditingItem(null)
    setShowForm(true)
  }, [])

  // 기존 항목 편집 핸들러
  const handleEdit = useCallback((item: T) => {
    setEditingItem(item)
    setShowForm(true)
  }, [])

  // 폼 취소 핸들러
  const handleCancel = useCallback(() => {
    setShowForm(false)
    setEditingItem(null)
    setIsSaving(false)
    setIsDeleting(false)
  }, [])

  // 저장 핸들러 (낙관적 업데이트 지원)
  const handleSave = useCallback(async (data: any) => {
    if (isSaving) return

    try {
      setIsSaving(true)
      await onSave(data, editingItem)
      
      // 성공 시 폼 닫기
      handleCancel()
      onSuccess?.()
    } catch (error) {
      console.error('저장 실패:', error)
      onError?.(error as Error)
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, editingItem, onSave, onSuccess, onError, handleCancel])

  // 삭제 핸들러
  const handleDelete = useCallback(async (item: T) => {
    if (isDeleting) return
    
    // 사용자 확인
    const confirmed = window.confirm(
      `정말 "${(item as any).title || (item as any).name || '이 항목'}"을(를) 삭제하시겠습니까?`
    )
    
    if (!confirmed) return

    try {
      setIsDeleting(true)
      await onDelete(item)
      onSuccess?.()
    } catch (error) {
      console.error('삭제 실패:', error)
      onError?.(error as Error)
    } finally {
      setIsDeleting(false)
    }
  }, [isDeleting, onDelete, onSuccess, onError])

  const state: CRUDState<T> = {
    showForm,
    editingItem,
    isSaving,
    isDeleting
  }

  const actions: CRUDActions<T> = {
    handleCreate,
    handleEdit,
    handleCancel,
    handleSave,
    handleDelete,
    setShowForm,
    setEditingItem
  }

  return [state, actions]
}

/**
 * 낙관적 업데이트를 지원하는 CRUD 관리자 Hook
 * API 호출 전에 UI를 먼저 업데이트하여 더 나은 사용자 경험을 제공합니다.
 */
export function useOptimisticCRUDManager<T>({
  onSave,
  onDelete,
  onOptimisticUpdate,
  onOptimisticDelete,
  onSuccess,
  onError
}: UseCRUDManagerOptions<T> & {
  onOptimisticUpdate?: (data: any, editingItem?: T | null) => void
  onOptimisticDelete?: (item: T) => void
}) {
  
  const [state, actions] = useCRUDManager({
    onSave: async (data, editingItem) => {
      // 낙관적 업데이트 실행
      onOptimisticUpdate?.(data, editingItem)
      
      try {
        await onSave(data, editingItem)
      } catch (error) {
        // 실패 시 롤백 (상위 컴포넌트에서 처리)
        throw error
      }
    },
    onDelete: async (item) => {
      // 낙관적 삭제 실행
      onOptimisticDelete?.(item)
      
      try {
        await onDelete(item)
      } catch (error) {
        // 실패 시 롤백 (상위 컴포넌트에서 처리)
        throw error
      }
    },
    onSuccess,
    onError
  })

  return [state, actions] as const
}

export default useCRUDManager
