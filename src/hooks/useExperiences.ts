import { useQuery } from '@tanstack/react-query';
import { experiencesAPI } from '../services/api';

// 경력 상세 카테고리 타입
export interface ExperienceDetail {
  category: string;  // 카테고리 이름 (예: "근무경험", "교육", "근무매장")
  items: string[];   // 카테고리별 항목들
}

// 백엔드 ExperienceSchema에 맞춘 인터페이스 정의
export interface ExperienceItem {
  _id: string;
  period: string;
  title: string;
  company: string;
  description: string;
  details?: ExperienceDetail[];  // 카테고리별 상세 내용 (신규)
  skills: string[];  // 🔄 호환성 유지
  skillIds?: string[];  // 🌟 스킬 ID 목록 (Skills 페이지와 연결)
  iconKey?: string;
  color?: string;
  bgColor?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UseExperiencesResult {
  experiences: ExperienceItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// 데이터 변환 및 정렬 함수
const transformExperiences = (data: ExperienceItem[]): ExperienceItem[] => {
  return data.slice().sort((a, b) => {
    // case 1: 두 항목 모두 order가 있으면 order를 기준으로 오름차순
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    
    // case 2: order가 하나만 있거나 둘 다 없으면 createdAt을 기준으로 역순 (최신순)
    if (a.createdAt && b.createdAt) {
      // Date 객체로 변환하여 비교 (내림차순)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    return 0; // 정렬할 필드가 모두 없으면 순서 변경 없음
  });
};

// React Query를 사용한 데이터 페칭
const fetchExperiences = async (): Promise<ExperienceItem[]> => {
  const response = await experiencesAPI.getAll();
  const data: ExperienceItem[] = response.data.data;
  return transformExperiences(data);
};

export const useExperiences = (): UseExperiencesResult => {
  const {
    data: experiences = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['experiences'],
    queryFn: fetchExperiences,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });

  return { 
    experiences, 
    loading, 
    error: error ? '경험 데이터를 불러오는 중 오류가 발생했습니다.' : null, 
    refetch 
  };
};
