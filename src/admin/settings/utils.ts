import { AdminLanguage } from '@/components/common/LanguageTabs'
import { SectionDefinition } from './types'
import { allSections } from './constants'

/**
 * Generate multilingual field key based on language
 * @param baseKey - Base field key (e.g., 'heroTitle')
 * @param lang - Target language ('ko', 'en', 'ja')
 * @returns Localized field key (e.g., 'heroTitleEn' for 'en')
 */
export const getMultilingualKey = (baseKey: string, lang: AdminLanguage): string => {
  if (lang === 'ko') return baseKey
  if (lang === 'en') return `${baseKey}En`
  if (lang === 'ja') return `${baseKey}Ja`
  return baseKey
}

/**
 * Check if a multilingual field has values in all languages
 * @param settings - Settings object containing field values
 * @param fieldKey - Base field key to check
 * @returns Object with completion status for each language
 */
export const isFieldTranslated = (
  settings: any,
  fieldKey: string
): { ko: boolean; en: boolean; ja: boolean; complete: boolean } => {
  const koValue = settings[fieldKey]
  const enValue = settings[getMultilingualKey(fieldKey, 'en')]
  const jaValue = settings[getMultilingualKey(fieldKey, 'ja')]

  const hasKo = Boolean(koValue && (typeof koValue === 'string' ? koValue.trim() : koValue))
  const hasEn = Boolean(enValue && (typeof enValue === 'string' ? enValue.trim() : enValue))
  const hasJa = Boolean(jaValue && (typeof jaValue === 'string' ? jaValue.trim() : jaValue))

  return {
    ko: hasKo,
    en: hasEn,
    ja: hasJa,
    complete: hasKo && hasEn && hasJa
  }
}

/**
 * Get active section title based on section ID
 * @param activeSection - Section ID ('general', 'appearance', etc.)
 * @returns Human-readable section title
 */
export const getActiveSectionTitle = (activeSection: string | null): string => {
  switch (activeSection) {
    case 'general': return '🏠 일반 설정'
    case 'appearance': return '🎨 외관 설정'
    case 'seo': return '🔍 SEO 설정'
    case 'social': return '📱 소셜 미디어'
    case 'analytics': return '📊 분석 도구'
    case 'security': return '🔒 보안 설정'
    default: return '사이트 설정'
  }
}

/**
 * Get active section description based on section ID
 * @param activeSection - Section ID ('general', 'appearance', etc.)
 * @returns Section description text
 */
export const getActiveSectionDescription = (activeSection: string | null): string => {
  switch (activeSection) {
    case 'general': return '사이트의 기본 정보와 개인 정보를 설정합니다.'
    case 'appearance': return '각 섹션의 제목과 내용을 편집합니다.'
    case 'seo': return '검색 엔진 최적화 설정을 관리합니다.'
    case 'social': return '소셜 미디어 링크와 연락처 정보를 설정합니다.'
    case 'analytics': return 'Google Analytics 등 분석 도구를 설정합니다.'
    case 'security': return '인증 및 보안 설정을 관리합니다.'
    default: return '포트폴리오의 모든 텍스트를 편집하고 저장하세요.'
  }
}

/**
 * Filter sections based on active section ID
 * @param activeSection - Section ID or null for all sections
 * @returns Filtered array of section definitions
 */
export const getFilteredSections = (activeSection: string | null): SectionDefinition[] => {
  if (!activeSection) return allSections

  switch (activeSection) {
    case 'general':
      // General settings: Personal info + Social links + Sidebar settings
      return allSections.filter(section =>
        section.title.includes('개인 정보') || 
        section.title.includes('소셜 링크') || 
        section.title.includes('사이드바 설정')
      )
    
    case 'appearance':
      // Appearance: Hero + About + Experience + Skills + Learning Goals + Projects + Books + Contact + Stats
      return allSections.filter(section =>
        section.title.includes('Hero') ||
        section.title.includes('About') ||
        section.title.includes('Experience') ||
        section.title.includes('Skills') ||
        section.title.includes('학습 목표') ||
        section.title.includes('Projects') ||
        section.title.includes('Books') ||
        section.title.includes('Contact') ||
        section.title.includes('통계')
      )
    
    case 'seo':
      // SEO: All SEO-related sections
      return allSections.filter(section =>
        section.title.includes('SEO') ||
        section.title.includes('Open Graph') ||
        section.title.includes('Twitter Card') ||
        section.title.includes('검색 엔진') ||
        section.title.includes('Google')
      )
    
    case 'social':
      // Social media: Social links + all social media sections
      return allSections.filter(section =>
        section.title.includes('소셜 링크') ||
        section.title.includes('글로벌 소셜 미디어') ||
        section.title.includes('디자인 & 포트폴리오') ||
        section.title.includes('블로그 & 글쓰기') ||
        section.title.includes('메신저 & 커뮤니케이션') ||
        section.title.includes('워크스페이스 & 도구')
      )
    
    case 'analytics':
      // Analytics: All analytics-related sections
      return allSections.filter(section =>
        section.title.includes('웹 분석 도구') ||
        section.title.includes('사용자 행동 분석') ||
        section.title.includes('에러 추적') ||
        section.title.includes('고객 지원') ||
        section.title.includes('추가 채팅 도구')
      )
    
    case 'security':
      // Security: All security-related sections
      return allSections.filter(section =>
        section.title.includes('기본 보안 헤더') ||
        section.title.includes('추가 보안 헤더') ||
        section.title.includes('권한 및 정책') ||
        section.title.includes('API 보안') ||
        section.title.includes('관리자 인증') ||
        section.title.includes('로그 & 백업')
      )
    
    default:
      return allSections
  }
}

