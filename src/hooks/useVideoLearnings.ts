import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { videoLearningsAPI } from '../services/api'
import { VideoLearning, VideoLearningFormData } from '../types'

// =================================================================
// 📹 VideoLearning Query Keys
// =================================================================

const VIDEO_LEARNING_QUERY_KEY = 'videoLearnings'

// =================================================================
// 📥 영상 학습 목록 조회 (React Query)
// =================================================================

export const useVideoLearnings = (): UseQueryResult<VideoLearning[], Error> => {
  return useQuery<VideoLearning[], Error>({
    queryKey: [VIDEO_LEARNING_QUERY_KEY, 'list'],
    queryFn: async () => {
      const response = await videoLearningsAPI.getAll()
      return response.data?.data || response.data || []
    },
    staleTime: 5 * 60 * 1000,  // 5분
  })
}

// =================================================================
// 📥 특정 영상 학습 조회 (React Query)
// =================================================================

export const useVideoLearning = (id: string | undefined): UseQueryResult<VideoLearning, Error> => {
  return useQuery<VideoLearning, Error>({
    queryKey: [VIDEO_LEARNING_QUERY_KEY, 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required')
      const response = await videoLearningsAPI.getById(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// =================================================================
// ➕ 영상 학습 생성 (React Query Mutation)
// =================================================================

export const useCreateVideoLearning = () => {
  const queryClient = useQueryClient()

  return useMutation<VideoLearning, Error, VideoLearningFormData>({
    mutationFn: async (data: VideoLearningFormData) => {
      const response = await videoLearningsAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [VIDEO_LEARNING_QUERY_KEY, 'list'] })
      // 데이터 카운트도 무효화
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// =================================================================
// ✏️ 영상 학습 수정 (React Query Mutation)
// =================================================================

export const useUpdateVideoLearning = () => {
  const queryClient = useQueryClient()

  return useMutation<VideoLearning, Error, { id: string; data: VideoLearningFormData }>({
    mutationFn: async ({ id, data }) => {
      const response = await videoLearningsAPI.update(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [VIDEO_LEARNING_QUERY_KEY, 'list'] })
      // 해당 영상 학습 상세 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: [VIDEO_LEARNING_QUERY_KEY, 'detail', variables.id] })
    },
  })
}

// =================================================================
// 🗑️ 영상 학습 삭제 (React Query Mutation)
// =================================================================

export const useDeleteVideoLearning = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await videoLearningsAPI.delete(id)
    },
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [VIDEO_LEARNING_QUERY_KEY, 'list'] })
      // 데이터 카운트도 무효화
      queryClient.invalidateQueries({ queryKey: ['dataCounts'] })
    },
  })
}

// =================================================================
// 🔄 기존 훅 호환성 유지 (기존 컴포넌트가 바로 사용할 수 있도록)
// =================================================================

export const useVideoLearningManagerData = () => {
  const { data: videoLearnings = [], isLoading, isError, error, refetch } = useVideoLearnings()
  const createMutation = useCreateVideoLearning()
  const updateMutation = useUpdateVideoLearning()
  const deleteMutation = useDeleteVideoLearning()

  const createVideoLearning = async (data: VideoLearningFormData) => {
    try {
      await createMutation.mutateAsync(data)
      return { success: true }
    } catch (error) {
      console.error('VideoLearning 생성 실패:', error)
      return { success: false, error }
    }
  }

  const updateVideoLearning = async (id: string, data: VideoLearningFormData) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      return { success: true }
    } catch (error) {
      console.error('VideoLearning 수정 실패:', error)
      return { success: false, error }
    }
  }

  const deleteVideoLearning = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      console.error('VideoLearning 삭제 실패:', error)
      return { success: false, error }
    }
  }

  return {
    videoLearnings,
    isLoading,
    error: isError ? error : null,
    createVideoLearning,
    updateVideoLearning,
    deleteVideoLearning,
    refetch,
  }
}

