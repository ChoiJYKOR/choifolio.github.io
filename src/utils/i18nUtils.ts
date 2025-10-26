/**
 * 다국어 필드 선택 유틸리티
 * 현재 언어에 맞는 값을 반환하고, 없으면 한국어로 폴백
 */

export type Language = 'ko' | 'en' | 'ja'

/**
 * 단일 필드에서 현재 언어에 맞는 값 추출
 */
export const getLocalizedField = (
  currentLang: Language,
  koValue: string | undefined,
  enValue?: string,
  jaValue?: string
): string => {
  if (currentLang === 'en' && enValue) return enValue
  if (currentLang === 'ja' && jaValue) return jaValue
  return koValue || ''
}

/**
 * 배열 필드에서 현재 언어에 맞는 값 추출
 */
export const getLocalizedArrayField = (
  currentLang: Language,
  koArray: string[] | undefined,
  enArray?: string[],
  jaArray?: string[]
): string[] => {
  if (currentLang === 'en' && enArray && enArray.length > 0) return enArray
  if (currentLang === 'ja' && jaArray && jaArray.length > 0) return jaArray
  return koArray || []
}

/**
 * 객체의 다국어 필드들을 현재 언어에 맞게 변환
 * 예: { title, titleEn, titleJa } -> 현재 언어에 맞는 title 반환
 */
export const getLocalizedObject = <T extends Record<string, any>>(
  obj: T,
  currentLang: Language,
  fields: string[]
): Partial<T> => {
  const result: any = { ...obj }
  
  fields.forEach(field => {
    const koValue = obj[field]
    const enValue = obj[`${field}En`]
    const jaValue = obj[`${field}Ja`]
    
    result[field] = getLocalizedField(currentLang, koValue, enValue, jaValue)
  })
  
  return result
}

// =================================================================
// Resource-Specific Localization Helpers
// =================================================================

/**
 * Get localized skill name
 * @param currentLang - Current language ('ko', 'en', 'ja')
 * @param skill - Skill object
 * @returns Localized skill name
 */
export const getLocalizedSkillName = (
  currentLang: Language,
  skill: { name: string; nameEn?: string; nameJa?: string }
): string => {
  return getLocalizedField(currentLang, skill.name, skill.nameEn, skill.nameJa)
}

/**
 * Get localized skill description
 * @param currentLang - Current language ('ko', 'en', 'ja')
 * @param skill - Skill object
 * @returns Localized skill description or empty string
 */
export const getLocalizedSkillDescription = (
  currentLang: Language,
  skill: { description?: string; descriptionEn?: string; descriptionJa?: string }
): string => {
  return getLocalizedField(currentLang, skill.description, skill.descriptionEn, skill.descriptionJa)
}

/**
 * Get localized category name
 * @param currentLang - Current language ('ko', 'en', 'ja')
 * @param category - Category object
 * @returns Localized category name
 */
export const getLocalizedCategoryName = (
  currentLang: Language,
  category: { name: string; nameEn?: string; nameJa?: string }
): string => {
  return getLocalizedField(currentLang, category.name, category.nameEn, category.nameJa)
}

/**
 * Get localized skill category title
 * @param currentLang - Current language ('ko', 'en', 'ja')
 * @param skillCategory - SkillCategory object
 * @returns Localized skill category title
 */
export const getLocalizedSkillCategoryTitle = (
  currentLang: Language,
  skillCategory: { title: string; titleEn?: string; titleJa?: string }
): string => {
  return getLocalizedField(currentLang, skillCategory.title, skillCategory.titleEn, skillCategory.titleJa)
}

