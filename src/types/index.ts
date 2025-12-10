// =================================================================
// API 타입 정의 (개선된 버전 - DRY 원칙 적용)
// =================================================================

// =================================================================
// 1. 공통 기본 타입 정의
// =================================================================

// 기본 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 공통 리소스 기본 타입 (서버 생성 필드들)
export interface BaseResource {
  _id: string
  createdAt: string
  updatedAt: string
}

// 인증 사용자 타입 (공통 사용)
export interface AuthUser {
  username: string
  email: string
  isAdmin: boolean
}

// =================================================================
// 2. 인증 관련 타입 (개선됨)
// =================================================================

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user: AuthUser
}

export interface VerifyResponse {
  success: boolean
  user: AuthUser
}

export interface LogoutResponse {
  success: boolean
  message: string
}

// =================================================================
// 3. Skill 관련 타입 (새로 추가)
// =================================================================

// 개별 스킬 타입
export interface Skill extends BaseResource {
  name: string
  nameEn?: string
  nameJa?: string
  icon: string // 아이콘 이름 (react-icons에서 사용)
  level: number // 0-100 사이의 숙련도
  categoryId: string // 속한 카테고리 ID
  order: number // 카테고리 내 순서
  description?: string // 🌟 스킬 상세 설명 (툴팁/팝오버 용도)
  descriptionEn?: string
  descriptionJa?: string
  projectIds?: string[] // 🌟 관련 프로젝트 ID 목록
  color?: string // 🌟 스킬 개별 색상 (hex 코드, 예: #3B82F6)
  showInSidebar?: boolean // 🌟 사이드바 핵심 기술에 표시
  showInLanguageCard?: boolean // 🌟 사이드바 언어 카드에 표시
}

// 스킬 카테고리 타입
export interface SkillCategory extends BaseResource {
  title: string
  titleEn?: string
  titleJa?: string
  description?: string
  descriptionEn?: string
  descriptionJa?: string
  color: string // 테마 색상 (primary, secondary 등)
  order: number // 전체 카테고리 순서
  skills: Skill[]
}

// 스킬 폼 데이터 타입
export type SkillFormData = Omit<Skill, '_id' | 'createdAt' | 'updatedAt' | 'categoryId'>

// 스킬 카테고리 폼 데이터 타입
export type SkillCategoryFormData = Omit<SkillCategory, '_id' | 'createdAt' | 'updatedAt' | 'skills'>

// =================================================================
// 4. Book 관련 타입 (목차 구조 개선됨)
// =================================================================

// 목차 타입 정의
export interface Chapter extends BaseResource {
  title: string
  titleEn?: string
  titleJa?: string
  order: number
  learnings: Learning[]
}

// 학습 내용 타입 (기존 유지)
export interface Learning extends BaseResource {
  topic: string
  topicEn?: string
  topicJa?: string
  content: string
  contentEn?: string
  contentJa?: string
  skillIds?: string[]  // 🌟 학습 내용과 관련된 스킬 ID 목록
}

export type LearningFormData = Omit<Learning, '_id' | 'createdAt' | 'updatedAt'>

// 목차 폼 데이터 타입
export type ChapterFormData = Omit<Chapter, '_id' | 'createdAt' | 'updatedAt' | 'learnings'>

// 도서 타입 (목차 구조 포함)
export interface Book extends BaseResource {
  title: string
  titleEn?: string
  titleJa?: string
  author: string
  authorEn?: string
  authorJa?: string
  category: string  // 🔄 호환성 유지 (마이그레이션 후 제거 예정)
  categoryIds?: string[]  // 🌟 카테고리 ID 목록 (다중 선택)
  coverImage?: string
  readDate: string
  rating: number
  skillIds?: string[]  // 🌟 서적 전체와 관련된 스킬 ID 목록
  chapters?: Chapter[]  // 새로운 목차 구조
  learnings?: Learning[]  // 기존 구조와 호환성 유지
}

// Omit을 사용하여 FormData 타입 간소화
export type BookFormData = Omit<Book, '_id' | 'createdAt' | 'updatedAt' | 'chapters' | 'learnings'>

// =================================================================
// 📹 VideoLearning 관련 타입 (영상 학습 기록)
// =================================================================

// =================================================================
// 📂 통합 Category 타입 (Book, Project, VideoLearning, VideoPlaylist 공통)
// =================================================================

export interface Category extends BaseResource {
  name: string
  nameEn?: string
  nameJa?: string
  order?: number
}

export type CategoryFormData = Omit<Category, '_id' | 'createdAt' | 'updatedAt'>

export interface CategoryUsage {
  categoryId: string
  usage: {
    books: number
    projects: number
    videoLearnings: number
    videoPlaylists: number
    total: number
  }
}

export interface VideoLearning extends BaseResource {
  title: string
  titleEn?: string
  titleJa?: string
  videoId: string  // 유튜브 영상 ID (11자)
  category: string  // 🔄 호환성 유지 (마이그레이션 후 제거 예정)
  categoryIds?: string[]  // 🌟 카테고리 ID 목록 (다중 선택)
  watchDate: string
  purpose?: string  // 시청 목적
  purposeEn?: string
  purposeJa?: string
  keyTakeaways?: string  // 핵심 배움
  keyTakeawaysEn?: string
  keyTakeawaysJa?: string
  application?: string  // 적용 계획
  applicationEn?: string
  applicationJa?: string
  skillIds?: string[]  // 관련 스킬 ID 목록
  rating?: number  // 이해도 평점 (1-5)
  order?: number
}

// VideoLearningFormData는 폼에서 전체 URL을 입력받지만, 저장 시 videoId로 변환됩니다
export type VideoLearningFormData = Omit<VideoLearning, '_id' | 'createdAt' | 'updatedAt'>

// 🌟 유튜브 재생 목록 타입
export interface VideoPlaylist extends BaseResource {
  playlistId: string  // 유튜브 재생 목록 ID
  title: string
  titleEn?: string
  titleJa?: string
  purpose?: string  // 재생 목록 시청 목적
  purposeEn?: string
  purposeJa?: string
  keyTakeaways?: string  // 핵심 배움
  keyTakeawaysEn?: string
  keyTakeawaysJa?: string
  application?: string  // 통합 적용 계획
  applicationEn?: string
  applicationJa?: string
  skillIds?: string[]  // 관련 스킬 ID 목록
  category: string  // 🔄 호환성 유지 (마이그레이션 후 제거 예정)
  categoryIds?: string[]  // 🌟 카테고리 ID 목록 (다중 선택)
  rating?: number  // 평점 (1-5)
  watchDate: string
  order?: number
}

export type VideoPlaylistFormData = Omit<VideoPlaylist, '_id' | 'createdAt' | 'updatedAt'>

// 🌟 재생 목록 내 개별 영상 타입
export interface PlaylistVideo extends BaseResource {
  playlistId: string  // VideoPlaylist _id 참조
  videoId: string  // 유튜브 영상 ID (11자)
  title: string  // 영상 제목
  titleEn?: string
  titleJa?: string
  keyTakeaways?: string  // 타임스탬프 기반 학습 기록
  keyTakeawaysEn?: string
  keyTakeawaysJa?: string
  order?: number
}

export type PlaylistVideoFormData = Omit<PlaylistVideo, '_id' | 'createdAt' | 'updatedAt'>

// =================================================================
// 4. Experience 관련 타입 (개선됨)
// =================================================================

// 경력 상세 카테고리 타입
export interface ExperienceDetail {
  category: string  // 카테고리 이름 (예: "근무경험", "교육", "근무매장")
  categoryEn?: string
  categoryJa?: string
  items: string[]   // 카테고리별 항목들
  itemsEn?: string[]
  itemsJa?: string[]
  order?: number    // 드래그 앤 드롭 순서 관리 (선택적, 기존 데이터 호환성)
}

export interface Experience extends BaseResource {
  period: string
  title: string
  titleEn?: string
  titleJa?: string
  company: string
  companyEn?: string
  companyJa?: string
  description: string  // 전체 설명 (하위 호환성 유지)
  descriptionEn?: string
  descriptionJa?: string
  details?: ExperienceDetail[]  // 카테고리별 상세 내용 (신규)
  detailsEn?: ExperienceDetail[]
  detailsJa?: ExperienceDetail[]
  skills: string[]  // 🔄 호환성 유지 (기존 데이터)
  skillsEn?: string[]
  skillsJa?: string[]
  skillIds?: string[]  // 🌟 스킬 ID 목록 (Skills 페이지와 연결)
  order: number
  iconKey?: string  // 🌟 타임라인 아이콘 선택 (신규)
}

// Omit을 사용하여 FormData 타입 간소화
export type ExperienceFormData = Omit<Experience, '_id' | 'createdAt' | 'updatedAt'>

// =================================================================
// 5. Project 관련 타입 (개선됨)
// =================================================================

export interface Project extends BaseResource {
  title: string
  titleEn?: string
  titleJa?: string
  description: string
  descriptionEn?: string
  descriptionJa?: string
  technologies: string[]
  technologiesEn?: string[]
  technologiesJa?: string[]
  category: string  // 🔄 호환성 유지 (마이그레이션 후 제거 예정)
  categoryIds?: string[]  // 🌟 카테고리 ID 목록 (다중 선택)
  status: 'preparing' | 'planning' | 'completed'
  githubLink?: string
  liveLink?: string
  image?: string
  images?: string[]
  imageDescriptions?: string[]  // 🌟 각 이미지의 설명 (images 배열과 동일한 순서)
  imageDescriptionsEn?: string[]
  imageDescriptionsJa?: string[]
  videos?: string[]
  videoDescriptions?: string[]  // 🌟 각 영상의 설명 (videos 배열과 동일한 순서)
  videoDescriptionsEn?: string[]
  videoDescriptionsJa?: string[]
  detailedDescription?: string
  detailedDescriptionEn?: string
  detailedDescriptionJa?: string
  features?: string[]
  featuresEn?: string[]
  featuresJa?: string[]
  learnings?: string[]
  learningsEn?: string[]
  learningsJa?: string[]
  skillIds?: string[]  // 🌟 프로젝트에서 사용된 스킬 ID 목록
  order: number
}

// Omit을 사용하여 FormData 타입 간소화
export type ProjectFormData = Omit<Project, '_id' | 'createdAt' | 'updatedAt'>

// =================================================================
// 6. Site Settings 관련 타입 (개선됨 - 기능별 분리)
// =================================================================

// 기본 정보 관련 설정
export interface GeneralInfo {
  fullName: string
  fullNameEn?: string
  fullNameJa?: string
  firstName: string
  firstNameEn?: string
  firstNameJa?: string
  role: string
  roleEn?: string
  roleJa?: string
  subtitle: string
  subtitleEn?: string
  subtitleJa?: string
  location: string
  locationEn?: string
  locationJa?: string
  education: string
  educationEn?: string
  educationJa?: string
  yearsOfExperience: string
  yearsOfExperienceEn?: string
  yearsOfExperienceJa?: string
}

// 연락처 정보 관련 설정
export interface ContactInfo {
  email: string
  phone: string
  githubUrl: string
  linkedinUrl: string
}

// 콘텐츠 텍스트 관련 설정
export interface ContentText {
  heroTitle: string
  heroTitleEn?: string
  heroTitleJa?: string
  heroSubtitle: string
  heroSubtitleEn?: string
  heroSubtitleJa?: string
  heroTag: string
  heroTagEn?: string
  heroTagJa?: string
  heroCtaLink1: string
  heroCtaLink2: string
  aboutTitle: string
  aboutTitleEn?: string
  aboutTitleJa?: string
  aboutSubtitle: string
  aboutSubtitleEn?: string
  aboutSubtitleJa?: string
  aboutDescription1: string
  aboutDescription1En?: string
  aboutDescription1Ja?: string
  aboutDescription2: string
  aboutDescription2En?: string
  aboutDescription2Ja?: string
  aboutCardTitle: string  // 🌟 "바리스타에서 자동화 전문가로" 카드 제목
  aboutCardTitleEn?: string
  aboutCardTitleJa?: string
  aboutJourneyTitle: string  // 🌟 "성장 여정" 섹션 제목
  aboutJourneyTitleEn?: string
  aboutJourneyTitleJa?: string
  skillsTitle: string
  skillsTitleEn?: string
  skillsTitleJa?: string
  skillsSubtitle: string
  skillsSubtitleEn?: string
  skillsSubtitleJa?: string
  projectsTitle: string
  projectsTitleEn?: string
  projectsTitleJa?: string
  projectsSubtitle: string
  projectsSubtitleEn?: string
  projectsSubtitleJa?: string
  // 🌟 프로젝트 업데이트 카드
  projectsUpdateTitle: string
  projectsUpdateTitleEn?: string
  projectsUpdateTitleJa?: string
  projectsUpdateDescription: string
  projectsUpdateDescriptionEn?: string
  projectsUpdateDescriptionJa?: string
  projectsUpdateTechList: string[]
  projectsUpdateTechListEn?: string[]
  projectsUpdateTechListJa?: string[]
  booksTitle: string
  booksTitleEn?: string
  booksTitleJa?: string
  booksSubtitle: string
  booksSubtitleEn?: string
  booksSubtitleJa?: string
  contactTitle: string
  contactTitleEn?: string
  contactTitleJa?: string
  contactSubtitle: string
  contactSubtitleEn?: string
  contactSubtitleJa?: string
  experienceTitle: string
  experienceTitleEn?: string
  experienceTitleJa?: string
  experienceSubtitle: string
  experienceSubtitleEn?: string
  experienceSubtitleJa?: string
  mainSkills: string[]
  mainSkillsEn?: string[]
  mainSkillsJa?: string[]
  // 🌟 학습 목표 (Learning Goals)
  learningGoalsTitle: string
  learningGoalsTitleEn?: string
  learningGoalsTitleJa?: string
  learningGoalsDescription: string
  learningGoalsDescriptionEn?: string
  learningGoalsDescriptionJa?: string
  learningGoalsList: string[]
  learningGoalsListEn?: string[]
  learningGoalsListJa?: string[]
  // 🌟 사이드바 설정 (Sidebar Settings)
  sidebarSkillCount?: number
  languageCardSkillCount?: number
}

// 통계 정보 관련 설정
export interface Stats {
  stat1Number: string
  stat1Label: string
  stat1LabelEn?: string
  stat1LabelJa?: string
  stat2Number: string
  stat2Label: string
  stat2LabelEn?: string
  stat2LabelJa?: string
  stat3Number: string
  stat3Label: string
  stat3LabelEn?: string
  stat3LabelJa?: string
}

// 최종 SiteSettings 타입 (TypeScript Intersection Type 사용)
export type SiteSettings = BaseResource & GeneralInfo & ContactInfo & ContentText & Stats

// Omit을 사용하여 FormData 타입 간소화
export type SettingsFormData = Omit<SiteSettings, '_id' | 'createdAt' | 'updatedAt'>

// 부분 업데이트를 위한 타입 (선택적)
export type PartialSettingsFormData = Partial<SettingsFormData>

// =================================================================
// 7. Contact 관련 타입 (개선됨)
// =================================================================

// ContactMessage는 updatedAt이 없으므로 BaseResource를 직접 사용하지 않음
export interface ContactMessage {
  _id?: string
  name: string
  email: string
  subject: string
  message: string
  isRead?: boolean
  createdAt?: string
}

export type ContactFormData = Omit<ContactMessage, '_id' | 'createdAt'>

export interface ContactResponse {
  success: boolean
  message: string
}

// =================================================================
// 8. 에러 응답 타입
// =================================================================

export interface ErrorResponse {
  success: false
  message: string
  error?: string
}

// =================================================================
// 9. 유틸리티 타입 (추가 개선)
// =================================================================

// 모든 FormData 타입의 유니온 타입
export type AnyFormData = BookFormData | ExperienceFormData | ProjectFormData | SettingsFormData | ContactFormData

// 모든 리소스 타입의 유니온 타입
export type AnyResource = Book | Experience | Project | SiteSettings | ContactMessage

// 업데이트용 Partial 타입들
export type BookUpdateData = Partial<BookFormData>
export type ExperienceUpdateData = Partial<ExperienceFormData>
export type ProjectUpdateData = Partial<ProjectFormData>
export type SettingsUpdateData = Partial<SettingsFormData>
