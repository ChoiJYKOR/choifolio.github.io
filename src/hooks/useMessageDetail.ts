import { useQuery } from '@tanstack/react-query'
import { messagesAPI } from '../services/api'
import { ContactMessage } from '../types'
import { MESSAGE_QUERY_KEY } from './useMessageManagerData'

interface UseMessageDetailOptions {
  enabled?: boolean
  staleTime?: number
}

export function useMessageDetail(
  messageId: string | undefined,
  options: UseMessageDetailOptions = {}
) {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options

  return useQuery({
    queryKey: [MESSAGE_QUERY_KEY, 'detail', messageId], // 💡 통일된 쿼리 키 사용
    queryFn: async () => {
      if (!messageId) return null
      const response = await messagesAPI.getById(messageId)
      return response.data.data
    },
    enabled: !!messageId && enabled,
    staleTime, // 5분 동안 캐시된 데이터 사용
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
    retry: 2, // 실패 시 2번 재시도
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
    refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
    select: (data): ContactMessage | null => {
      // 데이터 변환 로직 (필요시)
      return data || null
    }
  })
}

// 메시지 목록과 상세 정보를 함께 관리하는 복합 훅
export function useMessageWithDetail(messageId: string | undefined) {
  const messageDetailQuery = useMessageDetail(messageId)
  
  return {
    message: messageDetailQuery.data,
    isLoading: messageDetailQuery.isLoading,
    isError: messageDetailQuery.isError,
    error: messageDetailQuery.error,
    refetch: messageDetailQuery.refetch,
    isFetching: messageDetailQuery.isFetching,
    isStale: messageDetailQuery.isStale
  }
}
