import { useState, useCallback, useRef } from 'react'

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error, rollback: () => void) => void
  onRollback?: (data: T) => void
}

/**
 * 낙관적 업데이트를 관리하는 Hook
 * API 요청 전에 UI를 먼저 업데이트하여 더 나은 사용자 경험을 제공합니다.
 * 실패 시 자동으로 롤백합니다.
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData)
  const [isOptimistic, setIsOptimistic] = useState(false)
  const previousDataRef = useRef<T>(initialData)

  const { onSuccess, onError, onRollback } = options

  // 낙관적 업데이트 실행
  const optimisticUpdate = useCallback(async (
    optimisticData: T | ((prev: T) => T),
    apiCall: () => Promise<T>
  ) => {
    // 이전 데이터 백업
    previousDataRef.current = data
    
    // 낙관적 업데이트 실행
    setData(prev => {
      const newData = typeof optimisticData === 'function' 
        ? (optimisticData as (prev: T) => T)(prev)
        : optimisticData
      return newData
    })
    
    setIsOptimistic(true)

    try {
      // API 호출
      const result = await apiCall()
      
      // 성공 시 실제 데이터로 업데이트
      setData(result)
      setIsOptimistic(false)
      onSuccess?.(result)
      
      return result
    } catch (error) {
      // 실패 시 롤백
      setData(previousDataRef.current)
      setIsOptimistic(false)
      
      const rollback = () => {
        setData(previousDataRef.current)
        onRollback?.(previousDataRef.current)
      }
      
      onError?.(error as Error, rollback)
      throw error
    }
  }, [data, onSuccess, onError, onRollback])

  // 데이터 업데이트 (낙관적 업데이트 없이)
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(prev)
        : newData
      return updated
    })
  }, [])

  // 데이터 리셋
  const resetData = useCallback((newData: T) => {
    setData(newData)
    previousDataRef.current = newData
    setIsOptimistic(false)
  }, [])

  return {
    data,
    isOptimistic,
    optimisticUpdate,
    updateData,
    resetData
  }
}

/**
 * 배열 데이터를 위한 낙관적 업데이트 Hook
 * 추가, 수정, 삭제 작업에 특화되어 있습니다.
 */
export function useOptimisticArrayUpdate<T extends { _id: string }>(
  initialData: T[],
  options: OptimisticUpdateOptions<T[]> = {}
) {
  const {
    data,
    isOptimistic,
    optimisticUpdate,
    updateData,
    resetData
  } = useOptimisticUpdate<T[]>(initialData, options)

  // 항목 추가
  const optimisticAdd = useCallback(async (
    newItem: T,
    apiCall: () => Promise<T>
  ) => {
    return optimisticUpdate(
      (prev) => [...prev, { ...newItem, _id: `temp_${Date.now()}` } as T],
      async () => {
        const result = await apiCall()
        // 임시 ID를 실제 ID로 교체
        updateData(prev => prev.map(item => 
          item._id.startsWith('temp_') ? result : item
        ))
        return [...data.filter(item => !item._id.startsWith('temp_')), result]
      }
    )
  }, [optimisticUpdate, updateData, data])

  // 항목 수정
  const optimisticUpdateItem = useCallback(async (
    id: string,
    updates: Partial<T>,
    apiCall: () => Promise<T>
  ) => {
    return optimisticUpdate(
      (prev) => prev.map(item => 
        item._id === id ? { ...item, ...updates } : item
      ),
      async () => {
        const result = await apiCall()
        updateData(prev => prev.map(item => 
          item._id === id ? result : item
        ))
        return data.map(item => item._id === id ? result : item)
      }
    )
  }, [optimisticUpdate, updateData, data])

  // 항목 삭제
  const optimisticDelete = useCallback(async (
    id: string,
    apiCall: () => Promise<void>
  ) => {
    const itemToDelete = data.find(item => item._id === id)
    if (!itemToDelete) return

    return optimisticUpdate(
      (prev) => prev.filter(item => item._id !== id),
      async () => {
        await apiCall()
        return data.filter(item => item._id !== id)
      }
    )
  }, [optimisticUpdate, data])

  // 항목 재정렬
  const optimisticReorder = useCallback(async (
    reorderedItems: T[],
    apiCall: () => Promise<T[]>
  ) => {
    return optimisticUpdate(
      reorderedItems,
      async () => {
        const result = await apiCall()
        return result
      }
    )
  }, [optimisticUpdate])

  return {
    data,
    isOptimistic,
    optimisticAdd,
    optimisticUpdateItem,
    optimisticDelete,
    optimisticReorder,
    updateData,
    resetData
  }
}

export default useOptimisticUpdate
