import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesAPI } from '../services/api'
import { Category, CategoryFormData, CategoryUsage } from '../types'

// 쿼리 키
const CATEGORIES_QUERY_KEY = ['categories']

// 🔍 모든 카테고리 조회
export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const response = await categoriesAPI.getAll()
      return response.data
    }
  })
}

// 🔍 특정 카테고리 조회
export const useCategory = (id: string | undefined) => {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID가 필요합니다')
      const response = await categoriesAPI.getById(id)
      return response.data
    },
    enabled: !!id
  })
}

// 📊 카테고리 사용 통계 조회
export const useCategoryUsage = (id: string | undefined) => {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, id, 'usage'],
    queryFn: async () => {
      if (!id) throw new Error('ID가 필요합니다')
      const response = await categoriesAPI.getUsage(id)
      return response.data
    },
    enabled: !!id
  })
}

// ✏️ 카테고리 생성
export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await categoriesAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    }
  })
}

// 🔄 카테고리 수정
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const response = await categoriesAPI.update(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    }
  })
}

// 🗑️ 카테고리 삭제
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoriesAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    }
  })
}

// 🔧 카테고리 관리를 위한 통합 훅
export const useCategoryManagerData = () => {
  const { data: categories = [], isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  return {
    categories,
    isLoading,
    createCategory: async (data: CategoryFormData) => {
      try {
        await createMutation.mutateAsync(data)
        return { success: true }
      } catch (error: any) {
        console.error('카테고리 생성 실패:', error)
        return { success: false, error }
      }
    },
    updateCategory: async (id: string, data: CategoryFormData) => {
      try {
        await updateMutation.mutateAsync({ id, data })
        return { success: true }
      } catch (error: any) {
        console.error('카테고리 수정 실패:', error)
        return { success: false, error }
      }
    },
    deleteCategory: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        return { success: true }
      } catch (error: any) {
        console.error('카테고리 삭제 실패:', error)
        return { success: false, error }
      }
    }
  }
}
