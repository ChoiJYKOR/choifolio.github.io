import { SiteSettings } from '@/types'
import { AdminLanguage } from '@/components/common/LanguageTabs'

// Extended SiteSettings interface for local state management
export interface LocalSiteSettings extends Partial<SiteSettings> {
  fullName: string
  firstName: string
  role: string
  subtitle: string
  location: string
  education: string
  yearsOfExperience: string
  email: string
  phone: string
  githubUrl: string
  linkedinUrl: string
  heroTitle: string
  heroSubtitle: string
  aboutTitle: string
  aboutSubtitle: string
  aboutDescription1: string
  aboutDescription2: string
  skillsTitle: string
  skillsSubtitle: string
  projectsTitle: string
  projectsSubtitle: string
  projectsUpdateTitle: string
  projectsUpdateDescription: string
  projectsUpdateTechList: string[]
  booksTitle: string
  booksSubtitle: string
  contactTitle: string
  contactSubtitle: string
  stat1Number: string
  stat1Label: string
  stat2Number: string
  stat2Label: string
  experienceTitle: string
  experienceSubtitle: string
  learningGoalsTitle: string
  learningGoalsDescription: string
  learningGoalsList: string[]
  sidebarSkillCount?: number
  languageCardSkillCount?: number
  // SEO fields
  siteTitle: string
  siteDescription: string
  siteKeywords: string
  siteAuthor: string
  siteLanguage: string
  siteUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  twitterCard: string
  twitterSite: string
  twitterCreator: string
  robotsIndex: boolean
  robotsFollow: boolean
  googleAnalyticsId: string
  googleSiteVerification: string
  // Social media fields
  instagramUrl: string
  twitterUrl: string
  facebookUrl: string
  youtubeUrl: string
  tiktokUrl: string
  behanceUrl: string
  dribbbleUrl: string
  mediumUrl: string
  telegramUrl: string
  discordUrl: string
  kakaoTalkUrl: string
  naverBlogUrl: string
  tistoryUrl: string
  velogUrl: string
  notionUrl: string
  // Analytics fields
  googleTagManagerId: string
  facebookPixelId: string
  naverAnalyticsId: string
  kakaoPixelId: string
  hotjarId: string
  mixpanelToken: string
  amplitudeApiKey: string
  sentryDsn: string
  logRocketId: string
  fullStoryOrgId: string
  intercomAppId: string
  zendeskWidgetKey: string
  crispWebsiteId: string
  tawkToPropertyId: string
  liveChatLicense: string
  olarkSiteId: string
  // Security fields
  enableHttps: boolean
  enableCsp: boolean
  cspDirectives: string
  enableHsts: boolean
  hstsMaxAge: string
  enableXssProtection: boolean
  enableContentTypeOptions: boolean
  enableFrameOptions: boolean
  frameOptionsValue: string
  enableReferrerPolicy: boolean
  referrerPolicyValue: string
  enablePermissionsPolicy: boolean
  permissionsPolicyValue: string
  enableApiRateLimit: boolean
  apiRateLimitPerMinute: string
  enableAdminAuth: boolean
  adminSessionTimeout: string
  enableTwoFactorAuth: boolean
  enableIpWhitelist: boolean
  allowedIpAddresses: string
  enableAuditLog: boolean
  enableBackup: boolean
  backupFrequency: string
}

// Field definition for settings form
export interface Field {
  key: keyof SiteSettings
  label: string
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'number' | 'array'
  placeholder: string
  rows?: number
  min?: number
  max?: number
  options?: { value: string; label: string }[]
  isMultilingual?: boolean
}

// Section definition containing multiple fields
export interface SectionDefinition {
  title: string
  fields: Field[]
}

// Props for FieldRenderer component
export interface FieldRendererProps {
  field: Field
  value: string | boolean | string[] | number
  onChange: (value: string | boolean | string[] | number) => void
  currentLang?: AdminLanguage
  settings?: any
}

// Props for main editor component
export interface SiteSettingsEditorProps {
  activeSection?: string | null
}

// Message type for success/error notifications
export interface MessageType {
  type: 'success' | 'error'
  text: string
}

