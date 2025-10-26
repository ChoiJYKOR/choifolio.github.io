import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksAPI } from '../services/api'
import { Book, BookFormData, BookUpdateData } from '../types'

// 💡 서적 관련 쿼리 키 상수 - 모든 서적 데이터 캐시의 기준점
export const BOOK_QUERY_KEY = 'books'

// =================================================================
// 📚 서적 목록 조회 (React Query)
// =================================================================

export const useBooks = () => {
  return useQuery<Book[], Error>({
    queryKey: [BOOK_QUERY_KEY, 'list'],
    queryFn: async () => {
      const response = await booksAPI.getAll()
      return response.data.data || response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
  })
}

// =================================================================
// 📖 개별 서적 상세 조회 (React Query)
// =================================================================

export const useBook = (bookId: string | undefined) => {
  return useQuery<Book, Error>({
    queryKey: [BOOK_QUERY_KEY, 'detail', bookId],
    queryFn: async () => {
      if (!bookId) throw new Error('Book ID is required')
      const response = await booksAPI.getById(bookId)
      return response.data
    },
    enabled: !!bookId, // bookId가 있을 때만 실행
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// =================================================================
// ✏️ 서적 생성 (React Query Mutation)
// =================================================================

export const useCreateBook = () => {
  const queryClient = useQueryClient()

  return useMutation<Book, Error, BookFormData>({
    mutationFn: async (bookData: BookFormData) => {
      const response = await booksAPI.create(bookData)
      return response.data
    },
    onSuccess: () => {
      // 💡 서적 목록 캐시 무효화 → 자동으로 다시 fetch
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'list'] })
      // 💡 데이터 카운트도 무효화하여 서적 개수 업데이트
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// =================================================================
// 🔄 서적 수정 (React Query Mutation)
// =================================================================

export const useUpdateBook = () => {
  const queryClient = useQueryClient()

  return useMutation<Book, Error, { id: string; data: BookUpdateData }>({
    mutationFn: async ({ id, data }) => {
      const response = await booksAPI.update(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      // 💡 서적 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'list'] })
      // 💡 해당 서적 상세 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'detail', variables.id] })
    },
  })
}

// =================================================================
// 🗑️ 서적 삭제 (React Query Mutation)
// =================================================================

export const useDeleteBook = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await booksAPI.delete(id)
    },
    onSuccess: () => {
      // 💡 서적 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [BOOK_QUERY_KEY, 'list'] })
      // 💡 데이터 카운트도 무효화하여 서적 개수 업데이트
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// =================================================================
// 🔄 기존 훅 호환성 유지 (기존 컴포넌트가 바로 사용할 수 있도록)
// =================================================================

export const useBookManagerData = () => {
  const { data: books = [], isLoading, isError, error, refetch } = useBooks()
  const createMutation = useCreateBook()
  const updateMutation = useUpdateBook()
  const deleteMutation = useDeleteBook()

  const createBook = async (bookData: BookFormData) => {
    try {
      const result = await createMutation.mutateAsync(bookData)
      return { success: true, data: result }
    } catch (error) {
      console.error('서적 추가 실패:', error)
      return { success: false, error }
    }
  }

  const updateBook = async (id: string, bookData: BookUpdateData) => {
    try {
      const result = await updateMutation.mutateAsync({ id, data: bookData })
      return { success: true, data: result }
    } catch (error) {
      console.error('서적 수정 실패:', error)
      return { success: false, error }
    }
  }

  const deleteBook = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      console.error('서적 삭제 실패:', error)
      return { success: false, error }
    }
  }

  return {
    books,
    isLoading,
    error: isError ? (error?.message || '서적을 불러오는데 실패했습니다.') : null,
    isOptimistic: false, // React Query는 자체적으로 낙관적 업데이트 지원
    createBook,
    updateBook,
    deleteBook,
    refetch,
  }
}

export default useBooks
