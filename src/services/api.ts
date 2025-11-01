import axios from 'axios'
import {
  // 인증 관련 타입
  LoginRequest,
  LoginResponse,
  VerifyResponse,
  LogoutResponse,
  // Book 관련 타입
  Book,
  BookFormData,
  BookUpdateData,
  LearningFormData,
  // Category 관련 타입
  Category,
  CategoryFormData,
  CategoryUsage,
  // VideoLearning 관련 타입
  VideoLearning,
  VideoLearningFormData,
  // VideoPlaylist 관련 타입
  VideoPlaylist,
  VideoPlaylistFormData,
  PlaylistVideo,
  PlaylistVideoFormData,
  // Experience 관련 타입
  Experience,
  ExperienceFormData,
  ExperienceUpdateData,
  // Project 관련 타입
  Project,
  ProjectFormData,
  ProjectUpdateData,
  // Skill 관련 타입
  Skill,
  SkillCategory,
  SkillFormData,
  SkillCategoryFormData,
  // Settings 관련 타입
  SiteSettings,
  SettingsUpdateData,
  // Contact 관련 타입
  ContactFormData,
  ContactResponse,
} from '../types'

// 환경 변수에서 API URL 가져오기 (개발/운영 환경 대응)
// Vite에서는 import.meta.env를 사용
// 개발 환경에서는 Vite 프록시 사용 (/api), 프로덕션에서는 Render 백엔드 URL 사용
const getApiBaseUrl = () => {
  // 환경 변수로 직접 지정된 경우 우선 사용
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string
  }
  
  // 개발 환경: Vite 프록시 사용
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // 프로덕션 환경: Render 백엔드 URL 사용
  // 현재 도메인을 기반으로 백엔드 URL 추론
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 로컬 프로덕션 빌드인 경우
    return 'http://localhost:5000/api'
  }
  
  // GitHub Pages에서 접근하는 경우 Render 백엔드 URL 사용
  return 'https://choifolio-github-io-backend.onrender.com/api'
}

const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // HttpOnly 쿠키를 위한 credentials 포함
  timeout: 30000, // 30초 타임아웃
})

// HttpOnly 쿠키 사용으로 토큰 인터셉터 제거
// 브라우저가 자동으로 쿠키를 포함하여 전송

// Auth API - 타입 안정성 강화
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password } as LoginRequest),
  verify: () => api.post<VerifyResponse>('/auth/verify'), // POST 메서드로 수정 (백엔드와 일치)
  logout: () => api.post<LogoutResponse>('/auth/logout'),
}

// Books API - 타입 안정성 강화 (개선된 UpdateData 타입 사용)
export const booksAPI = {
  getAll: () => api.get<{ data: Book[] }>('/books'),
  getById: (id: string) => api.get<Book>(`/books/${id}`),
  create: (data: BookFormData) => api.post<Book>('/books', data),
  update: (id: string, data: BookUpdateData) => api.put<Book>(`/books/${id}`, data),
  delete: (id: string) => api.delete(`/books/${id}`),
}

// Chapters API - 목차 관리 (새로 분리)
export const chaptersAPI = {
  getByBook: (bookId: string) => api.get(`/books/${bookId}/chapters`),
  create: (bookId: string, data: { title: string; order: number }) => 
    api.post(`/books/${bookId}/chapters`, data),
  update: (bookId: string, chapterId: string, data: { title: string; order: number }) => 
    api.put(`/books/${bookId}/chapters/${chapterId}`, data),
  delete: (bookId: string, chapterId: string) => 
    api.delete(`/books/${bookId}/chapters/${chapterId}`),
  reorder: (bookId: string, chapterIds: string[]) => 
    api.put(`/books/${bookId}/chapters/reorder`, { chapterIds }),
}

// Learnings API - 학습 내용 관리 (새로 분리)
export const learningsAPI = {
  // 서적 직접 학습 내용
  getByBook: (bookId: string) => api.get(`/books/${bookId}/learnings`),
  createForBook: (bookId: string, data: LearningFormData) => 
    api.post(`/books/${bookId}/learnings`, data),
  updateForBook: (bookId: string, learningId: string, data: LearningFormData) => 
    api.put(`/books/${bookId}/learnings/${learningId}`, data),
  deleteForBook: (bookId: string, learningId: string) => 
    api.delete(`/books/${bookId}/learnings/${learningId}`),
  
  // 목차별 학습 내용
  getByChapter: (bookId: string, chapterId: string) => 
    api.get(`/books/${bookId}/chapters/${chapterId}/learnings`),
  createForChapter: (bookId: string, chapterId: string, data: LearningFormData) => 
    api.post(`/books/${bookId}/chapters/${chapterId}/learnings`, data),
  updateForChapter: (bookId: string, chapterId: string, learningId: string, data: LearningFormData) => 
    api.put(`/books/${bookId}/chapters/${chapterId}/learnings/${learningId}`, data),
  deleteForChapter: (bookId: string, chapterId: string, learningId: string) => 
    api.delete(`/books/${bookId}/chapters/${chapterId}/learnings/${learningId}`),
  
  // 🌟 스킬 연결/해제 (skillIds 업데이트)
  updateSkills: (bookId: string, learningId: string, skillIds: string[]) => 
    api.patch(`/books/${bookId}/learnings/${learningId}/skills`, { skillIds }),
}

// Experiences API - 타입 안정성 강화 (개선된 UpdateData 타입 사용)
export const experiencesAPI = {
  getAll: () => api.get<{ data: Experience[] }>('/experiences'),
  getById: (id: string) => api.get<Experience>(`/experiences/${id}`),
  create: (data: ExperienceFormData) => api.post<Experience>('/experiences', data),
  update: (id: string, data: ExperienceUpdateData) => api.put<Experience>(`/experiences/${id}`, data),
  delete: (id: string) => api.delete(`/experiences/${id}`),
}

// Projects API - 타입 안정성 강화 및 getById 추가 (개선된 UpdateData 타입 사용)
export const projectsAPI = {
  getAll: () => api.get<{ data: Project[] }>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`), // 누락된 엔드포인트 추가
  create: (data: ProjectFormData) => api.post<Project>('/projects', data),
  update: (id: string, data: ProjectUpdateData) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

// Settings API - 타입 안정성 강화 (개선된 UpdateData 타입 사용)
export const settingsAPI = {
  get: () => api.get<SiteSettings>('/settings'),
  update: (data: SettingsUpdateData) => api.put<SiteSettings>('/settings', data),
}

// Contact API - 타입 안정성 강화
export const contactAPI = {
  sendEmail: (data: ContactFormData) => api.post<ContactResponse>('/contact', data),
}

// Messages API - 관리자용 연락처 메시지 관리
export const messagesAPI = {
  getAll: () => api.get('/admin/messages'),
  getById: (id: string) => api.get(`/admin/messages/${id}`),
  markAsRead: (id: string) => api.put(`/admin/messages/${id}/read`),
  delete: (id: string) => api.delete(`/admin/messages/${id}`),
}

// Skills API - 스킬 관리
export const skillsAPI = {
  // 카테고리 관리
  getCategories: () => api.get<{ data: SkillCategory[] }>('/skill-categories'),
  createCategory: (data: SkillCategoryFormData) => api.post<{ data: SkillCategory }>('/skill-categories', data),
  updateCategory: (id: string, data: SkillCategoryFormData) => api.put<{ data: SkillCategory }>(`/skill-categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/skill-categories/${id}`),
  
  // 스킬 관리
  getAll: () => api.get<Skill[]>('/skills'),
  getByCategory: (categoryId: string) => api.get<{ data: Skill[] }>(`/skill-categories/${categoryId}/skills`),
  create: (categoryId: string, data: SkillFormData) => api.post<{ data: Skill }>(`/skill-categories/${categoryId}/skills`, data),
  update: (id: string, data: SkillFormData) => api.put<{ data: Skill }>(`/skills/${id}`, data),
  delete: (id: string) => api.delete(`/skills/${id}`),
  
    // 모든 데이터 삭제
    clearAllData: () => api.post('/skills/clear-all-data'),
  
  // 중복 데이터 정리
  cleanupDuplicates: () => api.post('/skills/cleanup-duplicates'),
  
  // 순서 업데이트
  reorderSkills: (skillIds: string[]) => api.put('/skills/reorder', { skillIds }),
  reorderCategories: (categoryIds: string[]) => api.put('/skill-categories/reorder', { categoryIds }),
}

// =================================================================
// 📂 Category API (통합 카테고리 관리)
// =================================================================

export const categoriesAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  getUsage: (id: string) => api.get<CategoryUsage>(`/categories/${id}/usage`),
  create: (data: CategoryFormData) => api.post<Category>('/categories', data),
  update: (id: string, data: CategoryFormData) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// =================================================================
// 📹 VideoLearning API (영상 학습 기록)
// =================================================================

export const videoLearningsAPI = {
  getAll: () => api.get<{ data: VideoLearning[] }>('/video-learnings'),
  getById: (id: string) => api.get<VideoLearning>(`/video-learnings/${id}`),
  create: (data: VideoLearningFormData) => api.post<VideoLearning>('/video-learnings', data),
  update: (id: string, data: VideoLearningFormData) => api.put<VideoLearning>(`/video-learnings/${id}`, data),
  delete: (id: string) => api.delete(`/video-learnings/${id}`),
}

// 🌟 재생 목록 API
export const videoPlaylistsAPI = {
  getAll: () => api.get<{ data: VideoPlaylist[] }>('/video-playlists'),
  getById: (id: string) => api.get<{ data: VideoPlaylist }>(`/video-playlists/${id}`),
  create: (data: VideoPlaylistFormData) => api.post<{ data: VideoPlaylist }>('/video-playlists', data),
  update: (id: string, data: VideoPlaylistFormData) => api.put<{ data: VideoPlaylist }>(`/video-playlists/${id}`, data),
  delete: (id: string) => api.delete(`/video-playlists/${id}`),
}

// 🌟 재생 목록 내 영상 API
export const playlistVideosAPI = {
  getByPlaylist: (playlistId: string) => api.get<{ data: PlaylistVideo[] }>(`/playlist-videos?playlistId=${playlistId}`),
  getById: (id: string) => api.get<{ data: PlaylistVideo }>(`/playlist-videos/${id}`),
  create: (data: PlaylistVideoFormData) => api.post<{ data: PlaylistVideo }>('/playlist-videos', data),
  update: (id: string, data: PlaylistVideoFormData) => api.put<{ data: PlaylistVideo }>(`/playlist-videos/${id}`, data),
  delete: (id: string) => api.delete(`/playlist-videos/${id}`),
}

export default api