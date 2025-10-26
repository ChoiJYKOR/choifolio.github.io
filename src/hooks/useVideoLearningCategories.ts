import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videoLearningCategoriesAPI } from '../services/api'
import { VideoLearningCategory, VideoLearningCategoryFormData } from '../types'

// 쿼리 키
const VIDEO_LEARNING_CATEGORIES_QUERY_KEY = ['videoLearningCategories']

// 🔍 모든 카테고리 조회
export const useVideoLearningCategories = () => {
  return useQuery({
    queryKey: VIDEO_LEARNING_CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const response = await videoLearningCategoriesAPI.getAll()
      return response.data
    }
  })
}

// 🔍 특정 카테고리 조회
export const useVideoLearningCategory = (id: string | undefined) => {
  return useQuery({
    queryKey: [...VIDEO_LEARNING_CATEGORIES_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID가 필요합니다')
      const response = await videoLearningCategoriesAPI.getById(id)
      return response.data
    },
    enabled: !!id
  })
}

// ✏️ 카테고리 생성
export const useCreateVideoLearningCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: VideoLearningCategoryFormData) => {
      const response = await videoLearningCategoriesAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEO_LEARNING_CATEGORIES_QUERY_KEY })
    }
  })
}

// 🔄 카테고리 수정
export const useUpdateVideoLearningCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VideoLearningCategoryFormData }) => {
      const response = await videoLearningCategoriesAPI.update(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEO_LEARNING_CATEGORIES_QUERY_KEY })
    }
  })
}

// 🗑️ 카테고리 삭제
export const useDeleteVideoLearningCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await videoLearningCategoriesAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEO_LEARNING_CATEGORIES_QUERY_KEY })
    }
  })
}

