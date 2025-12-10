/**
 * 데이터베이스 모델
 * 모든 Mongoose 모델을 중앙에서 관리
 */

const mongoose = require('mongoose');

// =================================================================
// 스키마 정의
// =================================================================

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  isAdmin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  category: String,  // 🔄 마이그레이션 후 제거 예정 (호환성 유지)
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],  // 🌟 카테고리 ID 목록 (다중 선택)
  coverImage: String,
  readDate: Date,
  rating: Number,
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],  // 🌟 서적 전체와 관련된 스킬 ID 목록
  // 새로운 목차 구조
  chapters: [{
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    learnings: [{
      topic: String,
      content: String,
      skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],  // 🌟 관련 스킬 ID 목록
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  // 기존 learnings 호환성을 위해 유지
  learnings: [{
    topic: String,
    content: String,
    skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],  // 🌟 관련 스킬 ID 목록
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ExperienceSchema = new mongoose.Schema({
  period: String,
  title: String,
  titleEn: String,
  titleJa: String,
  company: String,
  companyEn: String,
  companyJa: String,
  description: String,
  descriptionEn: String,
  descriptionJa: String,
  // 🌟 카테고리별 상세 내용 (신규)
  // IMPORTANT: Single details array with multilingual internal fields (not split by language)
  details: [{
    category: { type: String, required: true },  // 카테고리 이름 (예: "근무경험", "교육", "근무매장")
    categoryEn: String,
    categoryJa: String,
    items: [String],  // 카테고리별 항목들
    itemsEn: [String],
    itemsJa: [String],
    order: { type: Number, default: 0 }  // 🌟 드래그 앤 드롭 순서 관리
  }],
  skills: [String],  // 🔄 호환성 유지 (기존 데이터 - legacy field)
  skillsEn: [String],
  skillsJa: [String],
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],  // 🌟 스킬 ID 목록 (Skills 페이지와 연결)
  iconKey: String,
  color: String,
  bgColor: String,
  order: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  titleEn: String,
  titleJa: String,
  description: String,
  descriptionEn: String,
  descriptionJa: String,
  technologies: [String],
  technologiesEn: [String],
  technologiesJa: [String],
  category: String,  // 🔄 마이그레이션 후 제거 예정 (호환성 유지)
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],  // 🌟 카테고리 ID 목록 (다중 선택)
  status: { type: String, enum: ['preparing', 'planning', 'completed'], default: 'preparing' },
  githubLink: String,
  liveLink: String,
  image: String,
  images: [String],
  imageDescriptions: [String],  // 🌟 각 이미지의 설명 (images 배열과 동일한 순서)
  imageDescriptionsEn: [String],
  imageDescriptionsJa: [String],
  videos: [String],
  videoDescriptions: [String],  // 🌟 각 영상의 설명 (videos 배열과 동일한 순서)
  videoDescriptionsEn: [String],
  videoDescriptionsJa: [String],
  detailedDescription: String,
  detailedDescriptionEn: String,
  detailedDescriptionJa: String,
  features: [String],
  featuresEn: [String],
  featuresJa: [String],
  learnings: [String],
  learningsEn: [String],
  learningsJa: [String],
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],  // 🌟 프로젝트에서 사용된 스킬 ID 목록
  order: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const SiteSettingsSchema = new mongoose.Schema({
  // 개인 정보 (Personal Info)
  fullName: { type: String, default: '최주영' },
  fullNameEn: String,
  fullNameJa: String,
  firstName: { type: String, default: '주영' },
  firstNameEn: String,
  firstNameJa: String,
  role: { type: String, default: '공장자동화 전문가' },
  roleEn: String,
  roleJa: String,
  subtitle: { type: String, default: '바리스타 → 자동화 엔지니어' },
  subtitleEn: String,
  subtitleJa: String,
  location: { type: String, default: '부산' },
  locationEn: String,
  locationJa: String,
  education: { type: String, default: '부산인력개발원' },
  educationEn: String,
  educationJa: String,
  yearsOfExperience: { type: String, default: '5년' },
  yearsOfExperienceEn: String,
  yearsOfExperienceJa: String,
  email: { type: String, default: 'juyeong_choi@naver.com' },
  phone: { type: String, default: '+82 10-1234-5678' },
  
  // 소셜 링크 (Social Links)
  githubUrl: { type: String, default: '#' },
  linkedinUrl: { type: String, default: '#' },
  
  // 섹션별 제목 및 부제목 (Section Titles & Subtitles)
  heroTitle: { type: String, default: '공장자동화 전문가' },
  heroTitleEn: String,
  heroTitleJa: String,
  heroSubtitle: { type: String, default: '스타벅스 바리스타에서 공장자동화 전문가로의 여정을 시작한 최주영입니다.\nPLC 프로그래밍부터 데이터 분석까지, 스마트 팩토리의 미래를 만들어갑니다.' },
  heroSubtitleEn: String,
  heroSubtitleJa: String,
  heroTag: { type: String, default: '🎯 취업 준비 중' },
  heroTagEn: String,
  heroTagJa: String,
  aboutTitle: { type: String, default: '저의 여정' },
  aboutTitleEn: String,
  aboutTitleJa: String,
  aboutSubtitle: { type: String, default: '커피 한 잔에서 시작된 공장자동화 전문가로의 여정' },
  aboutSubtitleEn: String,
  aboutSubtitleJa: String,
  aboutDescription1: { type: String, default: '스타벅스에서 5년간 바리스타로 일하며 고객 서비스, 품질 관리, 효율성 개선에 대한 깊은 이해를 얻었습니다. 매일 반복되는 작업을 더 효율적으로 만들고 싶다는 생각이 공장자동화 분야에 대한 관심으로 이어졌습니다.' },
  aboutDescription1En: String,
  aboutDescription1Ja: String,
  aboutDescription2: { type: String, default: '현재는 PLC 프로그래밍(멜섹, 지멘스), 통계학, 데이터과학, Python을 활용한 데이터 분석, 전자회로, 유공압, 협동로봇(뉴로메카), 아두이노, 라즈베리파이, MySQL 등 다양한 기술을 학습하며 스마트 팩토리의 미래를 준비하고 있습니다.' },
  aboutDescription2En: String,
  aboutDescription2Ja: String,
  aboutCardTitle: { type: String, default: '바리스타에서 자동화 전문가로' },
  aboutCardTitleEn: String,
  aboutCardTitleJa: String,
  aboutJourneyTitle: { type: String, default: '성장 여정' },
  aboutJourneyTitleEn: String,
  aboutJourneyTitleJa: String,
  skillsTitle: { type: String, default: '기술 스택' },
  skillsTitleEn: String,
  skillsTitleJa: String,
  skillsSubtitle: { type: String, default: '공장자동화와 데이터 분석을 위한 다양한 기술을 습득했습니다.' },
  skillsSubtitleEn: String,
  skillsSubtitleJa: String,
  projectsTitle: { type: String, default: '프로젝트' },
  projectsTitleEn: String,
  projectsTitleJa: String,
  projectsSubtitle: { type: String, default: '다양한 분야의 프로젝트를 통해 기술적 역량을 보여드립니다.' },
  projectsSubtitleEn: String,
  projectsSubtitleJa: String,
  // 🌟 프로젝트 업데이트 카드 설정
  projectsUpdateTitle: { type: String, default: '프로젝트 업데이트 예정' },
  projectsUpdateTitleEn: String,
  projectsUpdateTitleJa: String,
  projectsUpdateDescription: { type: String, default: '현재 학습 중인 기술들을 활용한 실제 프로젝트들을 곧 업로드할 예정입니다.' },
  projectsUpdateDescriptionEn: String,
  projectsUpdateDescriptionJa: String,
  projectsUpdateTechList: [{ type: String }],  // 업데이트 예정 기술 목록
  projectsUpdateTechListEn: [String],
  projectsUpdateTechListJa: [String],
  booksTitle: { type: String, default: '기술 서적 & 학습 노트' },
  booksTitleEn: String,
  booksTitleJa: String,
  booksSubtitle: { type: String, default: '읽은 기술 서적과 그로부터 배운 지식을 공유합니다' },
  booksSubtitleEn: String,
  booksSubtitleJa: String,
  contactTitle: { type: String, default: '연락처' },
  contactTitleEn: String,
  contactTitleJa: String,
  contactSubtitle: { type: String, default: '프로젝트나 협업에 관심이 있으시다면 언제든지 연락해주세요.' },
  contactSubtitleEn: String,
  contactSubtitleJa: String,
  
  // 통계 (Stats)
  stat1Number: { type: String, default: '5+' },
  stat1Label: { type: String, default: '년 경력' },
  stat1LabelEn: String,
  stat1LabelJa: String,
  stat2Number: { type: String, default: '3+' },
  stat2Label: { type: String, default: '완료 프로젝트' },
  stat2LabelEn: String,
  stat2LabelJa: String,
  stat3Number: { type: String, default: '10+' },
  stat3Label: { type: String, default: '기술 스택' },
  stat3LabelEn: String,
  stat3LabelJa: String,
  
  // Hero 섹션 추가 필드
  heroTag: { type: String, default: '🎯 취업 준비 중' },
  heroCtaLink1: { type: String, default: '/#projects' },
  heroCtaLink2: { type: String, default: '/resume.pdf' },
  
  // 경력 (Experience Section)
  experienceTitle: { type: String, default: '경력 & 학습' },
  experienceTitleEn: String,
  experienceTitleJa: String,
  experienceSubtitle: { type: String, default: '바리스타에서 자동화 전문가로의 성장 여정' },
  experienceSubtitleEn: String,
  experienceSubtitleJa: String,
  
  // 🌟 학습 목표 (Learning Goals Section - Skills 페이지)
  learningGoalsTitle: { type: String, default: '앞으로의 학습 목표' },
  learningGoalsTitleEn: String,
  learningGoalsTitleJa: String,
  learningGoalsDescription: { type: String, default: '4차 산업혁명 시대에 발맞춰 **지능형 공장(Smart Factory) 구현**을 위해 다음 기술들을 집중적으로 탐구하여 전문성을 확대해 나가겠습니다.' },
  learningGoalsDescriptionEn: String,
  learningGoalsDescriptionJa: String,
  learningGoalsList: [{ type: String }], // 학습 목표 기술 목록
  learningGoalsListEn: [String],
  learningGoalsListJa: [String],
  mainSkills: [String],  // 메인 스킬 목록
  mainSkillsEn: [String],
  mainSkillsJa: [String],
  
  // 🌟 사이드바 설정 (Sidebar Settings)
  sidebarSkillCount: { type: Number, default: 4, min: 3, max: 6 }, // 사이드바 핵심 기술 표시 개수
  languageCardSkillCount: { type: Number, default: 3, min: 2, max: 5 }, // 사이드바 언어 카드 표시 개수
  
  // 보안 설정 필드들 (Security Settings)
  enableHttps: { type: Boolean, default: true },
  enableCsp: { type: Boolean, default: true },
  cspDirectives: { type: String, default: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" },
  enableHsts: { type: Boolean, default: true },
  hstsMaxAge: { type: String, default: '31536000' },
  enableXssProtection: { type: Boolean, default: true },
  enableContentTypeOptions: { type: Boolean, default: true },
  enableFrameOptions: { type: Boolean, default: true },
  frameOptionsValue: { type: String, default: 'DENY' },
  enableReferrerPolicy: { type: Boolean, default: true },
  referrerPolicyValue: { type: String, default: 'strict-origin-when-cross-origin' },
  enablePermissionsPolicy: { type: Boolean, default: true },
  permissionsPolicyValue: { type: String, default: 'camera=(), microphone=(), geolocation=(), payment=()' },
  enableApiRateLimit: { type: Boolean, default: true },
  apiRateLimitPerMinute: { type: String, default: '60' },
  enableAdminAuth: { type: Boolean, default: true },
  adminSessionTimeout: { type: String, default: '3600' },
  enableTwoFactorAuth: { type: Boolean, default: false },
  enableIpWhitelist: { type: Boolean, default: false },
  allowedIpAddresses: { type: String, default: '' },
  enableAuditLog: { type: Boolean, default: true },
  enableBackup: { type: Boolean, default: true },
  backupFrequency: { type: String, default: 'daily' },

  // SEO 설정 필드들 (SEO Settings)
  siteTitle: { type: String, default: '' },
  siteDescription: { type: String, default: '' },
  siteKeywords: { type: String, default: '' },
  siteAuthor: { type: String, default: '' },
  siteLanguage: { type: String, default: 'ko' },
  siteUrl: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  ogType: { type: String, default: 'website' },
  twitterCard: { type: String, default: 'summary_large_image' },
  twitterSite: { type: String, default: '' },
  twitterCreator: { type: String, default: '' },
  robotsIndex: { type: Boolean, default: true },
  robotsFollow: { type: Boolean, default: true },
  googleAnalyticsId: { type: String, default: '' },
  googleSiteVerification: { type: String, default: '' },

  // 소셜 미디어 설정 필드들 (Social Media Settings)
  instagramUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  tiktokUrl: { type: String, default: '' },
  behanceUrl: { type: String, default: '' },
  dribbbleUrl: { type: String, default: '' },
  mediumUrl: { type: String, default: '' },
  telegramUrl: { type: String, default: '' },
  discordUrl: { type: String, default: '' },
  kakaoTalkUrl: { type: String, default: '' },
  naverBlogUrl: { type: String, default: '' },
  tistoryUrl: { type: String, default: '' },
  velogUrl: { type: String, default: '' },
  notionUrl: { type: String, default: '' },

  // 분석 도구 설정 필드들 (Analytics Settings)
  googleTagManagerId: { type: String, default: '' },
  facebookPixelId: { type: String, default: '' },
  naverAnalyticsId: { type: String, default: '' },
  kakaoPixelId: { type: String, default: '' },
  hotjarId: { type: String, default: '' },
  mixpanelToken: { type: String, default: '' },
  amplitudeApiKey: { type: String, default: '' },
  sentryDsn: { type: String, default: '' },
  logRocketId: { type: String, default: '' },
  fullStoryOrgId: { type: String, default: '' },
  intercomAppId: { type: String, default: '' },
  zendeskWidgetKey: { type: String, default: '' },
  crispWebsiteId: { type: String, default: '' },
  tawkToPropertyId: { type: String, default: '' },
  liveChatLicense: { type: String, default: '' },
  olarkSiteId: { type: String, default: '' },
  
  // 메타 정보 (Meta)
  updatedAt: { type: Date, default: Date.now }
});

// 통합 카테고리 스키마 (Book, Project, VideoLearning, VideoPlaylist 공통 사용)
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  nameEn: String,
  nameJa: String,
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SkillCategorySchema = new mongoose.Schema({
  title: { type: String, required: true }, // name → title로 변경 (프론트엔드와 일치)
  titleEn: String,
  titleJa: String,
  description: { type: String }, // 설명 필드 추가
  descriptionEn: String,
  descriptionJa: String,
  icon: { type: String }, // 선택 사항으로 변경 (현재 사용하지 않음)
  color: { type: String, default: '#3B82F6' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual populate for skills
SkillCategorySchema.virtual('skills', {
  ref: 'Skill',
  localField: '_id',
  foreignField: 'categoryId'
});

// Ensure virtual fields are serialized
SkillCategorySchema.set('toJSON', { virtuals: true });
SkillCategorySchema.set('toObject', { virtuals: true });

const SkillSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillCategory', required: true },
  name: { type: String, required: true },
  nameEn: String,
  nameJa: String,
  level: { type: Number, min: 0, max: 100, default: 0 }, // proficiency에서 level로 변경
  icon: String,
  color: { type: String, default: '#3B82F6' },
  order: { type: Number, default: 0 },
  description: String, // 🌟 스킬 상세 설명 (툴팁/팝오버 용도)
  descriptionEn: String,
  descriptionJa: String,
  projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], // 🌟 관련 프로젝트 ID 목록
  showInSidebar: { type: Boolean, default: false }, // 🌟 사이드바 핵심 기술에 표시
  showInLanguageCard: { type: Boolean, default: false }, // 🌟 사이드바 언어 카드에 표시
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// =================================================================
// 모델 생성
// =================================================================

const Admin = mongoose.model('Admin', AdminSchema);
// =================================================================
// 📹 VideoLearning 스키마 (유튜브 영상 학습 기록)
// =================================================================
const VideoLearningSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoId: { type: String, required: true, length: 11 },  // 유튜브 영상 ID (11자 고정)
  category: String,  // 🔄 마이그레이션 후 제거 예정 (호환성 유지)
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],  // 🌟 카테고리 ID 목록 (다중 선택)
  watchDate: Date,
  purpose: String,  // 시청 목적
  keyTakeaways: String,  // 핵심 배움 (마크다운 지원)
  application: String,  // 적용 계획 (마크다운 지원)
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],  // 관련 스킬 ID 목록
  rating: { type: Number, min: 1, max: 5 },  // 이해도 평점
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 🌟 유튜브 재생 목록 학습 스키마
const VideoPlaylistSchema = new mongoose.Schema({
  playlistId: { 
    type: String, 
    required: true,
    validate: {
      validator: (v) => /^[a-zA-Z0-9_-]{13,}$/.test(v),
      message: '올바른 유튜브 재생 목록 ID가 아닙니다'
    }
  },
  title: { type: String, required: true },
  category: String,  // 🔄 마이그레이션 후 제거 예정 (호환성 유지)
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],  // 🌟 카테고리 ID 목록 (다중 선택)
  purpose: String,  // 재생 목록 시청 목적
  application: String,  // 통합 적용 계획
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  rating: { type: Number, min: 1, max: 5 },
  watchDate: Date,
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 🌟 재생 목록 내 개별 영상 학습 기록 스키마
const PlaylistVideoSchema = new mongoose.Schema({
  playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoPlaylist', required: true },
  videoId: { 
    type: String, 
    required: true,
    validate: {
      validator: (v) => /^[a-zA-Z0-9_-]{11}$/.test(v),
      message: '올바른 유튜브 영상 ID가 아닙니다 (11자)'
    }
  },
  title: { type: String, required: true },
  keyTakeaways: String,  // 타임스탬프 기반 학습 기록 (마크다운)
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', BookSchema);
const Experience = mongoose.model('Experience', ExperienceSchema);
const Project = mongoose.model('Project', ProjectSchema);
const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
const Category = mongoose.model('Category', CategorySchema);
const VideoLearning = mongoose.model('VideoLearning', VideoLearningSchema);
const VideoPlaylist = mongoose.model('VideoPlaylist', VideoPlaylistSchema);
const PlaylistVideo = mongoose.model('PlaylistVideo', PlaylistVideoSchema);
const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema);
const SkillCategory = mongoose.model('SkillCategory', SkillCategorySchema);
const Skill = mongoose.model('Skill', SkillSchema);

// =================================================================
// 모듈 내보내기
// =================================================================

module.exports = {
  Admin,
  Book,
  Category,
  VideoLearning,
  VideoPlaylist,
  PlaylistVideo,
  Experience,
  Project,
  ContactMessage,
  SiteSettings,
  SkillCategory,
  Skill
};
