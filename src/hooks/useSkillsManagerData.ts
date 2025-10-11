import { useSkills } from './useSkills'
import { SkillFormData, SkillCategoryFormData } from '../types'
import { 
  useUpdateSkillMutation,
  useCreateSkillCategoryMutation,
  useUpdateSkillCategoryMutation,
  useDeleteSkillCategoryMutation,
  useCreateSkillMutation,
  useDeleteSkillMutation
} from './useSkillMutations'

/**
 * 🌟 React Query 기반 스킬 관리 훅
 * 
 * 주요 개선사항:
 * 1. useState → React Query Cache (단일 데이터 소스)
 * 2. useEffect → useQuery (자동 캐싱 및 동기화)
 * 3. 낙관적 업데이트로 즉각적인 UI 반응
 * 4. 에러 시 자동 롤백
 */
export const useSkillsManagerData = () => {
  // 🌟 1. 데이터 조회: useSkills 훅에서 글로벌 캐시 데이터 가져오기
  const { 
    skillCategories, 
    loading: isLoading, 
    refetch: fetchSkillCategories 
  } = useSkills()

  // 🌟 2. 뮤테이션 훅 초기화
  const updateSkillMutation = useUpdateSkillMutation()
  const createCategoryMutation = useCreateSkillCategoryMutation()
  const updateCategoryMutation = useUpdateSkillCategoryMutation()
  const deleteCategoryMutation = useDeleteSkillCategoryMutation()
  const createSkillMutation = useCreateSkillMutation()
  const deleteSkillMutation = useDeleteSkillMutation()

  // 🌟 3. updateSkill 함수를 useMutation으로 대체
  const updateSkill = async (id: string, data: SkillFormData) => {
    try {
      const result = await updateSkillMutation.mutateAsync({ id, data })
      return { success: true, data: result }
    } catch (error) {
      console.error('스킬 수정 실패:', error)
      return { success: false, error }
    }
  }

  // 🌟 4. 기타 CRUD 함수를 useMutation으로 대체
  const createSkillCategory = async (data: SkillCategoryFormData) => {
    try {
      const result = await createCategoryMutation.mutateAsync(data)
      return { success: true, data: result }
    } catch (error) {
      console.error('스킬 카테고리 생성 실패:', error)
      return { success: false, error }
    }
  }

  const updateSkillCategory = async (id: string, data: SkillCategoryFormData) => {
    try {
      const result = await updateCategoryMutation.mutateAsync({ id, data })
      return { success: true, data: result }
    } catch (error) {
      console.error('스킬 카테고리 수정 실패:', error)
      return { success: false, error }
    }
  }

  const deleteSkillCategory = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      console.error('스킬 카테고리 삭제 실패:', error)
      return { success: false, error }
    }
  }

  const createSkill = async (categoryId: string, data: SkillFormData) => {
    try {
      const result = await createSkillMutation.mutateAsync({ categoryId, data })
      return { success: true, data: result }
    } catch (error) {
      console.error('스킬 생성 실패:', error)
      return { success: false, error }
    }
  }

  const deleteSkill = async (id: string) => {
    try {
      await deleteSkillMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      console.error('스킬 삭제 실패:', error)
      return { success: false, error }
    }
  }

  return { 
    skillCategories, 
    isLoading, 
    fetchSkillCategories,
    createSkillCategory,
    updateSkillCategory,
    deleteSkillCategory,
    createSkill,
    updateSkill,
    deleteSkill
  }
}
