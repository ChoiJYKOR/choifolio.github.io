import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { videoPlaylistsAPI, playlistVideosAPI } from '../services/api'
import { VideoPlaylist, VideoPlaylistFormData, PlaylistVideo, PlaylistVideoFormData } from '../types'

// =================================================================
// 재생 목록 조회 훅
// =================================================================

export const useVideoPlaylists = () => {
  return useQuery<VideoPlaylist[], Error>({
    queryKey: ['videoPlaylists'],
    queryFn: async () => {
      const response = await videoPlaylistsAPI.getAll()
      return response.data?.data || response.data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useVideoPlaylist = (id: string | undefined) => {
  return useQuery<VideoPlaylist, Error>({
    queryKey: ['videoPlaylist', id],
    queryFn: async () => {
      if (!id) throw new Error('ID가 필요합니다')
      const response = await videoPlaylistsAPI.getById(id)
      return response.data?.data || response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// =================================================================
// 재생 목록 내 영상 조회 훅
// =================================================================

export const usePlaylistVideos = (playlistId: string | undefined) => {
  return useQuery<PlaylistVideo[], Error>({
    queryKey: ['playlistVideos', playlistId],
    queryFn: async () => {
      if (!playlistId) return []
      const response = await playlistVideosAPI.getByPlaylist(playlistId)
      return response.data?.data || response.data || []
    },
    enabled: !!playlistId,
    staleTime: 5 * 60 * 1000,
  })
}

// =================================================================
// 재생 목록 Mutation 훅
// =================================================================

export const useCreateVideoPlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VideoPlaylistFormData) => videoPlaylistsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoPlaylists'] })
    },
  })
}

export const useUpdateVideoPlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VideoPlaylistFormData }) =>
      videoPlaylistsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['videoPlaylists'] })
      queryClient.invalidateQueries({ queryKey: ['videoPlaylist', variables.id] })
    },
  })
}

export const useDeleteVideoPlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => videoPlaylistsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoPlaylists'] })
    },
  })
}

// =================================================================
// 재생 목록 영상 Mutation 훅
// =================================================================

export const useCreatePlaylistVideo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaylistVideoFormData) => playlistVideosAPI.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlistVideos', variables.playlistId] })
    },
  })
}

export const useUpdatePlaylistVideo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlaylistVideoFormData }) =>
      playlistVideosAPI.update(id, data),
    onSuccess: (response) => {
      const playlistId = response.data?.data?.playlistId
      if (playlistId) {
        queryClient.invalidateQueries({ queryKey: ['playlistVideos', playlistId] })
      }
    },
  })
}

export const useDeletePlaylistVideo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => playlistVideosAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlistVideos'] })
    },
  })
}

// =================================================================
// 관리자용 데이터 훅
// =================================================================

export const useVideoPlaylistManagerData = () => {
  const { data: playlists = [], isLoading } = useVideoPlaylists()
  const createMutation = useCreateVideoPlaylist()
  const updateMutation = useUpdateVideoPlaylist()
  const deleteMutation = useDeleteVideoPlaylist()

  const createPlaylist = async (data: VideoPlaylistFormData) => {
    try {
      console.log('🎬 재생 목록 생성 시도:', data)
      const result = await createMutation.mutateAsync(data)
      console.log('✅ 재생 목록 생성 성공:', result)
      return { success: true }
    } catch (error: any) {
      console.error('❌ 재생 목록 생성 실패:', error)
      console.error('❌ 에러 상세:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      })
      return { success: false, error }
    }
  }

  const updatePlaylist = async (id: string, data: VideoPlaylistFormData) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      return { success: true }
    } catch (error) {
      console.error('재생 목록 수정 실패:', error)
      return { success: false, error }
    }
  }

  const deletePlaylist = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      console.error('재생 목록 삭제 실패:', error)
      return { success: false, error }
    }
  }

  return {
    playlists,
    isLoading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
  }
}

