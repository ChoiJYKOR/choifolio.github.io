/**
 * 카테고리 관련 유틸리티 함수들
 */

/**
 * 카테고리 문자열의 첫 글자를 대문자로 변환하여 표시명 생성
 * @param category - 카테고리 문자열
 * @returns 표시용 카테고리 이름
 */
export const formatCategoryDisplayName = (category: string): string => {
  if (!category) return '기타'
  
  // 특별한 경우 처리
  const specialCases: { [key: string]: string } = {
    'plc': 'PLC',
    'iot': 'IoT',
    '데이터분석': '데이터 분석',
    '로봇공학': '로봇 공학',
    '기타': '기타',
    'all': '전체'
  }
  
  const lowerCategory = category.toLowerCase()
  if (specialCases[lowerCategory]) {
    return specialCases[lowerCategory]
  }
  
  // 일반적인 경우: 첫 글자만 대문자로 변환
  return category.charAt(0).toUpperCase() + category.slice(1)
}

/**
 * 책 목록에서 모든 고유 카테고리를 추출
 * @param books - 책 목록
 * @returns 고유 카테고리 배열 (소문자로 정규화)
 */
export const extractUniqueCategories = (books: any[]): string[] => {
  const categories = new Set<string>()
  
  // 기본 카테고리 추가
  categories.add('all')
  
  // 책에서 카테고리 추출
  books.forEach(book => {
    if (book.category) {
      categories.add(book.category.toLowerCase())
    }
  })
  
  return Array.from(categories).sort()
}

/**
 * 카테고리별 표시명 매핑 객체 생성
 * @param categories - 카테고리 배열
 * @returns 카테고리 표시명 매핑 객체
 */
export const createCategoryDisplayNames = (categories: string[]): { [key: string]: string } => {
  const displayNames: { [key: string]: string } = {}
  
  categories.forEach(category => {
    displayNames[category] = formatCategoryDisplayName(category)
  })
  
  return displayNames
}
