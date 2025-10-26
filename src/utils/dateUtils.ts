/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 날짜 문자열을 한국어 형식으로 포맷팅
 * @param dateString - 포맷팅할 날짜 문자열
 * @returns 한국어 형식의 날짜 문자열 (예: "2024. 1. 15.")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error)
    return '날짜 정보 없음'
  }
}

/**
 * 날짜 문자열을 상대적 시간으로 포맷팅 (예: "3분 전", "2시간 전", "3일 전")
 * @param dateString - 포맷팅할 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    
    // 음수인 경우 미래 날짜 (방금 전으로 처리)
    if (diffInMs < 0) return '방금 전'
    
    // 분 단위 계산
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    
    // 시간 단위 계산
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours < 24) return `${diffInHours}시간 전`
    
    // 일 단위 계산
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    if (diffInDays === 1) return '어제'
    if (diffInDays < 7) return `${diffInDays}일 전`
    
    // 주 단위 계산
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}주 전`
    
    // 월 단위 계산 (30일 기준)
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths}개월 전`
    
    // 년 단위 계산
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears}년 전`
  } catch (error) {
    console.error('상대적 날짜 포맷팅 오류:', error)
    return '날짜 정보 없음'
  }
}

/**
 * 모던한 Intl.RelativeTimeFormat API를 사용한 상대적 시간 포맷팅
 * @param dateString - 포맷팅할 날짜 문자열
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 상대적 시간 문자열
 */
export const formatRelativeDateModern = (dateString: string, locale: string = 'ko-KR'): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000
    
    // 음수인 경우 미래 날짜
    if (diffInSeconds < 0) return '방금 전'
    
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    
    // 초 단위
    if (diffInSeconds < 60) {
      return '방금 전'
    }
    
    // 분 단위
    if (diffInSeconds < 3600) {
      return formatter.format(Math.floor(-diffInSeconds / 60), 'minute')
    }
    
    // 시간 단위
    if (diffInSeconds < 86400) {
      return formatter.format(Math.floor(-diffInSeconds / 3600), 'hour')
    }
    
    // 일 단위
    if (diffInSeconds < 2592000) { // 30일 미만
      return formatter.format(Math.floor(-diffInSeconds / 86400), 'day')
    }
    
    // 월 단위
    if (diffInSeconds < 31536000) { // 365일 미만
      return formatter.format(Math.floor(-diffInSeconds / 2592000), 'month')
    }
    
    // 년 단위
    return formatter.format(Math.floor(-diffInSeconds / 31536000), 'year')
  } catch (error) {
    console.error('모던 상대적 날짜 포맷팅 오류:', error)
    return '날짜 정보 없음'
  }
}

/**
 * 날짜가 유효한지 확인
 * @param dateString - 확인할 날짜 문자열
 * @returns 유효한 날짜인지 여부
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * 두 날짜 사이의 차이를 계산
 * @param startDate - 시작 날짜 문자열
 * @param endDate - 종료 날짜 문자열 (기본값: 현재 시간)
 * @returns 차이 정보 객체
 */
export const getDateDifference = (
  startDate: string, 
  endDate: string = new Date().toISOString()
): {
  days: number
  hours: number
  minutes: number
  totalMs: number
} => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffInMs = Math.abs(end.getTime() - start.getTime())
    
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return {
      days,
      hours,
      minutes,
      totalMs: diffInMs
    }
  } catch (error) {
    console.error('날짜 차이 계산 오류:', error)
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalMs: 0
    }
  }
}

/**
 * 날짜를 다양한 형식으로 포맷팅
 * @param dateString - 포맷팅할 날짜 문자열
 * @param format - 포맷 타입 ('short', 'long', 'time', 'datetime')
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDateByType = (
  dateString: string, 
  format: 'short' | 'long' | 'time' | 'datetime' = 'short'
): string => {
  try {
    const date = new Date(dateString)
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        })
      case 'long':
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      case 'time':
        return date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      case 'datetime':
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      default:
        return date.toLocaleDateString('ko-KR')
    }
  } catch (error) {
    console.error('날짜 타입별 포맷팅 오류:', error)
    return '날짜 정보 없음'
  }
}

/**
 * 날짜가 오늘인지 확인
 * @param dateString - 확인할 날짜 문자열
 * @returns 오늘인지 여부
 */
export const isToday = (dateString: string): boolean => {
  try {
    const date = new Date(dateString)
    const today = new Date()
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  } catch {
    return false
  }
}

/**
 * 날짜가 최근 N일 이내인지 확인
 * @param dateString - 확인할 날짜 문자열
 * @param days - 기준 일수 (기본값: 7)
 * @returns 최근 N일 이내인지 여부
 */
export const isRecent = (dateString: string, days: number = 7): boolean => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    return diffInDays <= days && diffInDays >= 0
  } catch {
    return false
  }
}
