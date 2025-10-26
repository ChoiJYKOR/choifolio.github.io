import { useEffect, useState, useCallback, useRef } from 'react'

// 섹션 ID 목록 정의
export const SECTION_IDS = [
  'hero',
  'about', 
  'experience',
  'skills',
  'projects',
  'contact',
  'books', // Books 페이지 추가
  'projects-page', // Projects 페이지 추가
  'experience-page', // Experience 페이지 추가
  'about-page', // About 페이지 추가
  'contact-page', // Contact 페이지 추가
  'skills-page' // Skills 페이지 추가
] as const

export type SectionId = typeof SECTION_IDS[number]

// 스크롤 스파이 훅 옵션 인터페이스
interface UseScrollSpyOptions {
  /** 활성화 기준점 오프셋 (픽셀) - 기본값: 80px */
  offset?: number
  /** 디바운스 지연 시간 (밀리초) - 기본값: 100ms */
  debounceDelay?: number
}

// 기본 옵션
const DEFAULT_OPTIONS: Required<UseScrollSpyOptions> = {
  offset: 80,
  debounceDelay: 100
}

// 디바운스 유틸리티 함수
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

// 스크롤 스파이 훅
export const useScrollSpy = (options: UseScrollSpyOptions = {}) => {
  const { offset, debounceDelay } = { ...DEFAULT_OPTIONS, ...options }
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const timeoutRef = useRef<number | null>(null)

  const handleScroll = useCallback(() => {
    // 현재 스크롤 위치 + 오프셋을 활성화 기준점으로 설정
    const activationPoint = window.scrollY + offset
    let newActiveSection: SectionId = 'hero' // 기본값

    // 섹션들을 순회하며 activationPoint를 지난 가장 마지막 섹션을 찾기
    for (const sectionId of SECTION_IDS) {
      const element = document.getElementById(sectionId)
      if (!element) continue

      // 요소의 문서 상단으로부터의 위치 (오프셋 반영)
      const elementTop = element.offsetTop - offset
      
      // 현재 스크롤 위치가 섹션 상단보다 크거나 같다면, 해당 섹션을 활성화
      if (activationPoint >= elementTop) {
        newActiveSection = sectionId
      }
    }
    
    setActiveSection(newActiveSection)
  }, [offset])

  // 디바운스된 스크롤 핸들러
  const debouncedHandleScroll = useCallback(
    debounce(handleScroll, debounceDelay),
    [handleScroll, debounceDelay]
  )

  useEffect(() => {
    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true })
    
    // 초기 실행 (디바운스 없이 즉시 실행)
    handleScroll()

    // 클린업
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
      // 디바운스 타이머 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleScroll, debouncedHandleScroll])

  return activeSection
}

// 부드러운 스크롤 함수 (오프셋 지원)
export const scrollToSection = (sectionId: SectionId, offset: number = 80) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const elementTop = element.offsetTop - offset
    
    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })
  }
}
