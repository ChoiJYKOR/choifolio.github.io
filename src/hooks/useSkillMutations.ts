import { useMutation, useQueryClient } from '@tanstack/react-query'
import { skillsAPI } from '@/services/api'
import { SkillCategory, SkillFormData, SkillCategoryFormData } from '@/types'

// useSkills.ts와 동일한 캐시 키
const SKILLS_QUERY_KEY = ['skillCategories']

// =================================================================
// 🌟 1. 스킬 업데이트 (핵심 문제 해결)
// =================================================================

export const useUpdateSkillMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { id: string; data: SkillFormData }>({
    mutationFn: async ({ id, data }) => {
      // 서버에 저장
      const response = await skillsAPI.update(id, data)
      return response.data?.data || response.data
    },
    
    // 🚀 낙관적 업데이트
    onMutate: async ({ id, data }) => {
      // 1. 진행 중인 쿼리 취소 (경쟁 조건 방지)
      await queryClient.cancelQueries({ queryKey: SKILLS_QUERY_KEY })
      
      // 2. 이전 캐시 백업 (롤백용)
      const previousCategories = queryClient.getQueryData<SkillCategory[]>(SKILLS_QUERY_KEY)

      // 3. 캐시를 낙관적으로 업데이트
      queryClient.setQueryData<SkillCategory[]>(SKILLS_QUERY_KEY, (oldCategories) => {
        if (!oldCategories) return previousCategories
        return oldCategories.map(category => ({
          ...category,
          skills: category.skills?.map(skill => 
            skill._id === id 
              ? { ...skill, ...data, updatedAt: new Date().toISOString() } // 🌟 병합
              : skill
          ) || []
        }))
      })
      
      // 4. 롤백에 사용할 Context 반환
      return { previousCategories }
    },

    // ✅ 에러 시 롤백
    onError: (err, variables, context: any) => {
      console.error("❌ 스킬 업데이트 실패 - 롤백 실행:", err)
      if (context?.previousCategories) {
        queryClient.setQueryData(SKILLS_QUERY_KEY, context.previousCategories)
      }
    },

    // 🌟 onSettled 제거: 슬라이더 드래그 중 invalidateQueries 호출 방지
    // 낙관적 업데이트만으로도 충분하며, 페이지 새로고침 시에만 서버 데이터 동기화
  })
}

// =================================================================
// 🌟 2. 스킬 카테고리 생성
// =================================================================

export const useCreateSkillCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, SkillCategoryFormData>({
    mutationFn: async (data) => {
      const response = await skillsAPI.createCategory(data)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY })
    },
  })
}

// =================================================================
// 🌟 3. 스킬 카테고리 수정
// =================================================================

export const useUpdateSkillCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { id: string; data: SkillCategoryFormData }>({
    mutationFn: async ({ id, data }) => {
      const response = await skillsAPI.updateCategory(id, data)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY })
    },
  })
}

// =================================================================
// 🌟 4. 스킬 카테고리 삭제
// =================================================================

export const useDeleteSkillCategoryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      await skillsAPI.deleteCategory(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY })
    },
  })
}

// =================================================================
// 🌟 5. 스킬 생성
// =================================================================

export const useCreateSkillMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { categoryId: string; data: SkillFormData }>({
    mutationFn: async ({ categoryId, data }) => {
      const response = await skillsAPI.create(categoryId, data)
      return response.data?.data || response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY })
    },
  })
}

// =================================================================
// 🌟 6. 스킬 삭제
// =================================================================

export const useDeleteSkillMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      await skillsAPI.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY })
    },
  })
}

