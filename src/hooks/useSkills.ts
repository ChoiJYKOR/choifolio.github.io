import { useQuery } from '@tanstack/react-query';
import { skillsAPI } from '../services/api';
import { SkillCategory } from '../types';

interface UseSkillsResult {
  skillCategories: SkillCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// React Query를 사용한 데이터 페칭
const fetchSkillCategories = async (): Promise<SkillCategory[]> => {
  const response = await skillsAPI.getCategories();
  // API 응답이 { data: [...] } 형태인지 확인
  const categories = response.data?.data || response.data || [];
  return categories;
};

export const useSkills = (): UseSkillsResult => {
  const {
    data: skillCategories = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: fetchSkillCategories,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });

  return { 
    skillCategories, 
    loading, 
    error: error ? '스킬 데이터를 불러오는데 실패했습니다.' : null, 
    refetch 
  };
};
