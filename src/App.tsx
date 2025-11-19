import { useState, useEffect, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { SiteSettingsProvider } from '@/hooks/useSiteSettings'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoadScene from '@/components/LoadScene'
import AppLayout from '@/components/AppLayout'

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Lazy Load할 컴포넌트들 정의 (성능 최적화)
const HomePage = lazy(() => import('@/pages/HomePage'))
const Books = lazy(() => import('@/pages/Books'))
const BookDetail = lazy(() => import('@/components/BookDetail'))
const VideoLearnings = lazy(() => import('@/pages/VideoLearnings'))
const VideoLearningDetail = lazy(() => import('@/components/VideoLearningDetail'))
const VideoPlaylistDetail = lazy(() => import('@/components/VideoPlaylistDetail'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDetail = lazy(() => import('@/components/ProjectDetail'))
const Experience = lazy(() => import('@/pages/Experience'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const Skills = lazy(() => import('@/pages/Skills'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))


function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  // 다크 모드 및 첫 방문 상태 초기화
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
    }

    // 첫 방문 여부 확인
    const hasVisited = localStorage.getItem('hasVisited')
    if (hasVisited) {
      setIsFirstVisit(false)
    }
  }, [])

  // 다크 모드 상태에 따른 DOM 클래스 및 로컬 스토리지 업데이트
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <AuthProvider>
          <Router
            basename=""
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* 로딩 화면 - 사이트 접속 시 가장 먼저 표시 (사이드바 없음) */}
              <Route path="/" element={<LoadScene onFirstVisitComplete={() => setIsFirstVisit(false)} />} />
              
              
              {/* 일반 페이지들 - 사이드바와 레이아웃 포함 */}
              <Route 
                path="/*" 
                element={
                  <AppLayout
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    showLoginModal={showLoginModal}
                    setShowLoginModal={setShowLoginModal}
                    isFirstVisit={isFirstVisit}
                  />
                }
              >
                <Route path="home" element={<HomePage />} />
                
                {/* 서적 관련 페이지 - Lazy Load 적용 */}
                <Route path="books" element={<Books />} />
                <Route path="books/:id" element={<BookDetail />} />
                
                {/* 영상 학습 관련 페이지 - Lazy Load 적용 */}
                <Route path="video-learnings" element={<VideoLearnings />} />
                <Route path="video-learnings/:id" element={<VideoLearningDetail />} />
                <Route path="video-playlists/:id" element={<VideoPlaylistDetail />} />
                
                {/* 프로젝트 페이지 - Lazy Load 적용 */}
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                
                {/* 경력 페이지 - Lazy Load 적용 */}
                <Route path="experience" element={<Experience />} />
                
                {/* 소개 페이지 - Lazy Load 적용 */}
                <Route path="about" element={<About />} />
                
                {/* 연락처 페이지 - Lazy Load 적용 */}
                <Route path="contact" element={<Contact />} />
                
                {/* 기술 페이지 - Lazy Load 적용 */}
                <Route path="skills" element={<Skills />} />
                
                {/* 관리자 페이지 - 인증 보호 및 Lazy Load 적용 */}
                <Route 
                  path="admin" 
                  element={<ProtectedRoute element={AdminDashboard} />} 
                />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  )
}

export default App