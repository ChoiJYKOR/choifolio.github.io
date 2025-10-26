import { useState, useEffect, useCallback } from 'react'
import { useAbortController } from './useAbortController'
import { useOptimisticArrayUpdate } from './useOptimisticUpdate'
import { useToastHelpers } from './useToast'
import { booksAPI } from '../services/api'
import { Book, BookFormData, BookUpdateData } from '../types'

/**
 * 리팩토링된 BookManager 데이터 관리 Hook
 * 
 * 주요 개선사항:
 * 1. AbortController를 사용한 메모리 누수 방지
 * 2. 낙관적 업데이트로 성능 개선
 * 3. Toast 알림으로 사용자 피드백 개선
 * 4. 에러 처리 강화
 */
export function useBookManagerData() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { createAbortController } = useAbortController()
  const { success, error: showError } = useToastHelpers()

  // 낙관적 업데이트를 사용한 서적 데이터 관리
  const {
    data: books,
    isOptimistic,
    optimisticAdd,
    optimisticUpdateItem,
    optimisticDelete,
    resetData
  } = useOptimisticArrayUpdate<Book>([])

  // 서적 데이터 로드
  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const abortController = createAbortController()
      const response = await booksAPI.getAll()
      
        if (!abortController.signal.aborted) {
          resetData(response.data.data || [])
        }
    } catch (err) {
      if (!(err as Error).name?.includes('AbortError')) {
        const errorMessage = '서적 목록을 불러오는데 실패했습니다.'
        setError(errorMessage)
        showError('로드 실패', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [createAbortController, resetData, showError])

  // 서적 생성
  const createBook = useCallback(async (bookData: BookFormData) => {
    try {
      const newBook = {
        ...bookData,
        _id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Book

      const result = await optimisticAdd(
        newBook,
        () => booksAPI.create(bookData).then(res => res.data)
      )

      success('서적 추가 완료', `${bookData.title}이(가) 성공적으로 추가되었습니다.`)
      return result
    } catch (err) {
      showError('서적 추가 실패', err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      throw err
    }
  }, [optimisticAdd, success, showError])

  // 서적 수정
  const updateBook = useCallback(async (bookId: string, bookData: BookUpdateData) => {
    try {
      const result = await optimisticUpdateItem(
        bookId,
        bookData,
        () => booksAPI.update(bookId, bookData).then(res => res.data)
      )

      success('서적 수정 완료', '서적 정보가 성공적으로 수정되었습니다.')
      return result
    } catch (err) {
      showError('서적 수정 실패', err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      throw err
    }
  }, [optimisticUpdateItem, success, showError])

  // 서적 삭제
  const deleteBook = useCallback(async (bookId: string) => {
    try {
      const result = await optimisticDelete(
        bookId,
        () => booksAPI.delete(bookId).then(() => {})
      )

      success('서적 삭제 완료', '서적이 성공적으로 삭제되었습니다.')
      return result
    } catch (err) {
      showError('서적 삭제 실패', err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      throw err
    }
  }, [optimisticDelete, success, showError])

  // 초기 데이터 로드
  useEffect(() => {
    fetchBooks()
  }, [])

  return {
    books,
    isLoading,
    error,
    isOptimistic,
    createBook,
    updateBook,
    deleteBook,
    refetch: fetchBooks
  }
}

export default useBookManagerData