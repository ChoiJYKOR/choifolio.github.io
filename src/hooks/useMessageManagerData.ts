import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesAPI } from '../services/api'
import { ContactMessage } from '../types'

// 💡 메시지 관련 쿼리 키 상수 - 모든 메시지 데이터 캐시의 기준점
export const MESSAGE_QUERY_KEY = 'adminMessages'

// 🌟 메시지 목록 조회 (React Query)
export const useMessages = () => {
  return useQuery<ContactMessage[], Error>({
    queryKey: [MESSAGE_QUERY_KEY, 'list'],
    queryFn: async () => {
      const response = await messagesAPI.getAll()
      return response.data.data || response.data || []
    },
    staleTime: 2 * 60 * 1000, // 2분 동안 캐시 유지
    gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
  })
}

// 🌟 메시지 읽음 처리 (React Query Mutation)
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => messagesAPI.markAsRead(id),
    onSuccess: () => {
      // 💡 핵심: 메시지 관련 모든 쿼리 무효화 → 자동으로 다시 fetch
      queryClient.invalidateQueries({ queryKey: [MESSAGE_QUERY_KEY] })
      // 💡 데이터 카운트도 무효화하여 메시지 개수 업데이트
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// 🌟 메시지 삭제 (React Query Mutation)
export const useDeleteMessage = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => messagesAPI.delete(id),
    onSuccess: () => {
      // 💡 핵심: 메시지 관련 모든 쿼리 무효화 → 자동으로 다시 fetch
      queryClient.invalidateQueries({ queryKey: [MESSAGE_QUERY_KEY] })
      // 💡 데이터 카운트도 무효화하여 메시지 개수 업데이트
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// 🌟 일괄 읽음 처리 (React Query Mutation)
export const useBulkMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string[]>({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => messagesAPI.markAsRead(id))).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGE_QUERY_KEY] })
      // 💡 데이터 카운트도 무효화하여 메시지 개수 업데이트
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// 🌟 일괄 삭제 (React Query Mutation)
export const useBulkDeleteMessages = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string[]>({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => messagesAPI.delete(id))).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGE_QUERY_KEY] })
      // 💡 데이터 카운트도 무효화하여 메시지 개수 업데이트
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// 🔄 기존 훅 호환성 유지 (기존 컴포넌트가 바로 사용할 수 있도록)
export const useMessageManagerData = () => {
  const { data: messages = [], isLoading } = useMessages()
  const markAsReadMutation = useMarkMessageAsRead()
  const deleteMessageMutation = useDeleteMessage()
  const bulkMarkAsReadMutation = useBulkMarkAsRead()
  const bulkDeleteMutation = useBulkDeleteMessages()

  const markAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      console.error('Message 읽음 처리 실패:', error)
      return { success: false, error }
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      await deleteMessageMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      console.error('Message 삭제 실패:', error)
      return { success: false, error }
    }
  }

  const bulkMarkAsRead = async (ids: string[]) => {
    try {
      await bulkMarkAsReadMutation.mutateAsync(ids)
      return { success: true }
    } catch (error) {
      console.error('Message 일괄 읽음 처리 실패:', error)
      return { success: false, error }
    }
  }

  const bulkDelete = async (ids: string[]) => {
    try {
      await bulkDeleteMutation.mutateAsync(ids)
      return { success: true }
    } catch (error) {
      console.error('Message 일괄 삭제 실패:', error)
      return { success: false, error }
    }
  }

  return {
    messages,
    isLoading,
    fetchMessages: () => {}, // 더 이상 필요 없지만 호환성 유지
    markAsRead,
    deleteMessage,
    bulkMarkAsRead,
    bulkDelete
  }
}
