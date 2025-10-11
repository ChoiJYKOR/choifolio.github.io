import React, { useEffect } from 'react'
import Hero from '@/components/Hero'
import { useScrollSpy, SECTION_IDS } from '@/hooks/useScrollSpy'

const HomePage: React.FC = () => {
  // 스크롤 스파이 훅 사용 (기본 옵션: offset=80px, debounceDelay=100ms)
  useScrollSpy()

  // 페이지 로드 시 스크롤 위치 복원 및 섹션 하이라이트
  useEffect(() => {
    // URL 해시가 있으면 해당 섹션으로 스크롤
    const hash = window.location.hash.slice(1)
    if (hash && SECTION_IDS.includes(hash as any)) {
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [])

  return (
    <main role="main" aria-label="포트폴리오 메인 콘텐츠">
      {/* Hero 섹션 */}
      <section 
        id="hero" 
        aria-labelledby="hero-title"
        className="min-h-screen"
      >
        <Hero />
      </section>

      {/* 스크롤 스파이 디버그 정보 제거됨 */}
    </main>
  )
}

export default HomePage
