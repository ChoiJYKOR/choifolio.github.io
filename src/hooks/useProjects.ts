import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../services/api';
import { Project } from '../types';

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// React Query를 사용한 데이터 페칭
const fetchProjects = async (): Promise<Project[]> => {
  const response = await projectsAPI.getAll();
  return response.data.data;
};

export const useProjects = (): UseProjectsResult => {
  const {
    data: projects = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });

  return { 
    projects, 
    loading, 
    error: error ? '프로젝트를 불러오는데 실패했습니다.' : null, 
    refetch 
  };
};
