import { useQuery, useQueryClient } from '@tanstack/react-query'
import { booksAPI, videoLearningsAPI, videoPlaylistsAPI, experiencesAPI, projectsAPI, messagesAPI, skillsAPI, categoriesAPI } from '../services/api'
import { MESSAGE_QUERY_KEY } from './useMessageManagerData'

interface DataCounts {
  books: number
  videoLearnings: number
  videoPlaylists: number
  experiences: number
  projects: number
  messages: number
  skills: number
  categories: number
}

// 🌟 React Query를 사용한 데이터 카운트 조회
export const useDataCounts = () => {
  const queryClient = useQueryClient()
  
  const { data: counts, isLoading } = useQuery<DataCounts, Error>({
    queryKey: ['dataCounts'], // 💡 독립적인 쿼리 키
    queryFn: async () => {
      // 실제로는 각 API에서 데이터 개수만 반환하는 전용 엔드포인트를 호출하는 것이 효율적
      // 현재는 기존 API를 사용하여 데이터를 가져온 후 length를 계산
      const [booksResponse, videoLearningsResponse, videoPlaylistsResponse, experiencesResponse, projectsResponse, messagesResponse, skillsResponse, categoriesResponse] = await Promise.all([
        booksAPI.getAll(),
        videoLearningsAPI.getAll(),
        videoPlaylistsAPI.getAll(),
        experiencesAPI.getAll(),
        projectsAPI.getAll(),
        messagesAPI.getAll(), // 💡 메시지도 직접 조회
        skillsAPI.getCategories(),
        categoriesAPI.getAll()
      ])
      
      return {
        books: booksResponse.data?.data?.length || booksResponse.data?.length || 0,
        videoLearnings: videoLearningsResponse.data?.data?.length || videoLearningsResponse.data?.length || 0,
        videoPlaylists: videoPlaylistsResponse.data?.data?.length || videoPlaylistsResponse.data?.length || 0,
        experiences: experiencesResponse.data?.data?.length || experiencesResponse.data?.length || 0,
        projects: projectsResponse.data?.data?.length || projectsResponse.data?.length || 0,
        messages: messagesResponse.data?.data?.length || messagesResponse.data?.length || 0, // 💡 메시지 API 응답에서 길이 계산
        skills: skillsResponse.data?.data?.length || skillsResponse.data?.length || 0,
        categories: categoriesResponse.data?.length || 0,
      }
    },
    staleTime: 2 * 60 * 1000, // 2분 동안 캐시 유지
    gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
    refetchOnWindowFocus: true, // 창 포커스 시 자동 새로고침 (데이터 동기화)
  })

  return { 
    counts: counts || {
      books: 0,
      videoLearnings: 0,
      videoPlaylists: 0,
      experiences: 0,
      projects: 0,
      messages: 0,
      skills: 0,
      categories: 0,
    }, 
    isLoading,
    refreshCounts: () => {} // 더 이상 필요 없지만 호환성 유지
  }
}

export default useDataCounts
