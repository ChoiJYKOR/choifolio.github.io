import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaSun, FaMoon, FaBars, FaTimes, FaGithub, FaLinkedin, FaEnvelope, FaCode, FaBook, FaVideo, FaSignInAlt, FaUserShield, FaHome, FaUser, FaBriefcase, FaLaptopCode, FaWrench, FaCommentDots } from 'react-icons/fa'
import { IconType } from 'react-icons'
import { useAuth } from '../contexts/AuthContext'
import { useScrollSpy, scrollToSection, SectionId } from '../hooks/useScrollSpy'
import { useSidebarSkills } from '../hooks/useSidebarSkills'
import DynamicIcon from './common/DynamicIcon'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { getLocalizedField, getLocalizedSkillName } from '../utils/i18nUtils'

// AuthContext 타입 정의 (실제 AuthContext와 일치해야 함)
// interface AuthContextType {
//   isAuthenticated: boolean
//   logout: () => void
//   // 기타 인증 관련 상태/함수들...
// }

// 타입 정의
interface NavItem {
  name: string
  href: string
  path: string
  icon: IconType
}

interface SidebarProps {
  darkMode: boolean
  toggleDarkMode: () => void
  onLoginClick: () => void
}

// 네비게이션 항목 컴포넌트 분리
interface SidebarNavItemProps {
  item: NavItem
  location: ReturnType<typeof useLocation>
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeSection: SectionId
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, location, setIsOpen, activeSection }) => {
  const navigate = useNavigate()
  
  // 간소화된 활성화 상태 로직
  const isActive = useMemo(() => {
    // 1. 홈 링크인 경우: 메인 페이지에서 hero 섹션이 활성화되었을 때
    if (item.path === '/') {
      return location.pathname === '/' && activeSection === 'hero'
    }
    
    // 2. 별도 라우트인 경우: 경로 일치 (상세 페이지도 활성화하기 위해 startsWith 사용)
    if (item.path !== '/') {
      return location.pathname.startsWith(item.path)
    }
    
    return false
  }, [location.pathname, item.path, activeSection])

  const IconComponent = item.icon
  
  const baseClasses = `flex items-center gap-2 px-4 py-3 rounded-xl transition-colors duration-200 font-medium`
  const activeClasses = 'bg-coffee-100 dark:bg-dark-700 text-coffee-600 dark:text-coffee-400'
  const inactiveClasses = 'text-dark-700 dark:text-dark-300 hover:bg-coffee-100 dark:hover:bg-dark-700 hover:text-coffee-600 dark:hover:text-coffee-400'

  const classes = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`

  // 개선된 네비게이션 핸들러
  const handleNavigation = useCallback(() => {
    // 홈 링크인 경우: 메인 페이지로 이동 후 hero 섹션으로 스크롤
    if (item.path === '/') {
      if (location.pathname === '/') {
        // 이미 메인 페이지에 있으면 hero 섹션으로 스크롤
        scrollToSection('hero', 80)
      } else {
        // 다른 페이지에 있으면 메인 페이지로 이동 후 스크롤
        navigate('/#hero')
      }
    }
    // 별도 라우트 이동 (예: /about, /experience, /skills, /projects, /books, /contact)
    else {
      navigate(item.href)
    }
    
    setIsOpen(false)
  }, [item.path, item.href, location.pathname, navigate, setIsOpen])

  // 별도 라우트 (Link)
  if (item.path !== '/') {
    return (
      <button
        onClick={handleNavigation}
        className={classes}
      >
        <IconComponent size={18} />
        {item.name}
      </button>
    )
  }

  // 메인 페이지 섹션 링크 (button 태그와 네비게이션 핸들러)
  return (
    <button
      onClick={handleNavigation}
      className={classes}
      aria-current={isActive ? 'page' : undefined}
    >
      <IconComponent size={18} />
      {item.name}
    </button>
  )
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode, toggleDarkMode, onLoginClick }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  const { settings: siteSettings } = useSiteSettings()
  // 스크롤 스파이 훅 사용 (기본 옵션 적용)
  const activeSection = useScrollSpy()
  
  // =================================================================
  // 🔄 페이지 변경 감지 및 네비게이션 활성화
  // =================================================================
  
  const navItems: NavItem[] = [
    // 💡 메인 페이지 홈 링크만 남기고 나머지는 모두 별도 라우트로 분리
    { name: t('nav.home'), href: '/', path: '/', icon: FaHome },
    
    // 💡 별도 라우트 링크: path와 href가 동일
    { name: t('nav.about'), href: '/about', path: '/about', icon: FaUser },
    { name: t('nav.experience'), href: '/experience', path: '/experience', icon: FaBriefcase },
    { name: t('nav.skills'), href: '/skills', path: '/skills', icon: FaWrench },
    { name: t('nav.projects'), href: '/projects', path: '/projects', icon: FaLaptopCode },
    { name: t('nav.books'), href: '/books', path: '/books', icon: FaBook },
    { name: t('nav.videoLearnings'), href: '/video-learnings', path: '/video-learnings', icon: FaVideo },
    { name: t('nav.contact'), href: '/contact', path: '/contact', icon: FaCommentDots },
  ]

  // 커스텀 훅을 사용하여 스킬 데이터 가져오기
  const { coreSkills, languageSkills, isLoadingSkills } = useSidebarSkills()

  const socialLinks = [
    { icon: FaGithub, href: '#', label: 'GitHub' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaEnvelope, href: 'mailto:juyeong_choi@naver.com', label: 'Email' },
  ]



  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-coffee-600 text-white rounded-xl shadow-lg hover:bg-coffee-700 transition-colors"
        aria-label={isOpen ? "사이드바 닫기" : "사이드바 열기"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
          aria-label="사이드바 닫기"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-white dark:bg-dark-800 border-r border-cream-200 dark:border-dark-700 z-40 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto custom-scrollbar`}
        aria-label="주요 네비게이션"
      >
        <div className="p-8 space-y-8">
          {/* Profile Section */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-coffee-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {getLocalizedField(currentLang, siteSettings?.firstName, siteSettings?.firstNameEn, siteSettings?.firstNameJa) || '주영'}
              </div>
              <div 
                className="absolute bottom-0 right-0 w-10 h-10 bg-caramel-500 rounded-full flex items-center justify-center border-4 border-white dark:border-dark-800"
                aria-label="프로필 이미지"
              >
                <FaCode className="text-white" size={18} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-cream-100 mb-2">
              {getLocalizedField(currentLang, siteSettings?.fullName, siteSettings?.fullNameEn, siteSettings?.fullNameJa) || '최주영'}
            </h1>
            <p className="text-coffee-600 dark:text-coffee-400 font-medium mb-1">
              {getLocalizedField(currentLang, siteSettings?.role, siteSettings?.roleEn, siteSettings?.roleJa) || '공장자동화 전문가'}
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              {getLocalizedField(currentLang, siteSettings?.subtitle, siteSettings?.subtitleEn, siteSettings?.subtitleJa) || '바리스타 → 자동화 엔지니어'}
            </p>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            <div className="bg-cream-100 dark:bg-dark-700 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-dark-700 dark:text-dark-300 text-sm">{t('about.location')}</span>
                <span className="text-dark-900 dark:text-cream-100 font-medium">
                  {getLocalizedField(currentLang, siteSettings?.location, siteSettings?.locationEn, siteSettings?.locationJa) || '부산'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-dark-700 dark:text-dark-300 text-sm">{t('about.education')}</span>
                <span className="text-dark-900 dark:text-cream-100 font-medium text-right text-xs">
                  {getLocalizedField(currentLang, siteSettings?.education, siteSettings?.educationEn, siteSettings?.educationJa) || '부산인력개발원'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-700 dark:text-dark-300 text-sm">{t('about.yearsOfExperience')}</span>
                <span className="text-dark-900 dark:text-cream-100 font-medium">
                  {getLocalizedField(currentLang, siteSettings?.yearsOfExperience, siteSettings?.yearsOfExperienceEn, siteSettings?.yearsOfExperienceJa) || '5년'}
                </span>
              </div>
            </div>
          </div>

          {/* Language Skills - Circular Progress */}
          {languageSkills.length > 0 && (
            <div>
              <div className="flex justify-around items-center gap-2">
                {isLoadingSkills ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12 mt-2"></div>
                    </div>
                  ))
                ) : (
                  languageSkills.map((skill) => {
                    // 🌟 한국어이고 100%면 "모국어"로 표시
                    const skillName = getLocalizedSkillName(currentLang, skill)
                    const isNative = skillName.includes('한국어') && skill.level === 100
                    
                    return (
                      <div key={skill._id} className="flex flex-col items-center">
                        <div className="relative w-16 h-16">
                          {/* Background Circle */}
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-cream-200 dark:text-dark-700"
                            />
                            {/* Progress Circle */}
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke={skill.color || '#8B4513'}
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${(skill.level / 100) * 176} 176`}
                              className="transition-all duration-1000 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Icon in Center */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <DynamicIcon 
                              iconName={skill.icon} 
                              size={20} 
                              className="text-coffee-600 dark:text-coffee-400"
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-dark-700 dark:text-dark-300 mt-1 text-center">
                          {skillName}
                        </span>
                        <span className="text-xs font-bold text-coffee-600 dark:text-coffee-400">
                          {isNative ? '모국어' : `${skill.level}%`}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Core Skills Progress */}
          <div>
            <h3 className="text-lg font-bold text-dark-900 dark:text-cream-100 mb-4">
              핵심 기술
            </h3>
            <div className="space-y-4">
              {isLoadingSkills ? (
                // 로딩 상태
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : coreSkills.length > 0 ? (
                // 스킬 데이터 표시
                coreSkills.map((skill) => (
                  <div key={skill._id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                        {getLocalizedSkillName(currentLang, skill)}
                      </span>
                      <span className="text-sm font-bold text-coffee-600 dark:text-coffee-400">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-cream-200 dark:bg-dark-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-coffee-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))
              ) : (
                // 데이터가 없을 때
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    스킬 데이터가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <h3 className="text-lg font-bold text-dark-900 dark:text-cream-100 mb-4">
              메뉴
            </h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <SidebarNavItem 
                    item={item} 
                    location={location} 
                    setIsOpen={setIsOpen}
                    activeSection={activeSection}
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* Admin Section */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/admin"
                className="block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium text-center flex items-center justify-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <FaUserShield size={18} /> 관리자 대시보드
              </Link>
            </motion.div>
          )}

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-bold text-dark-900 dark:text-cream-100 mb-4">
              소셜
            </h3>
            <div className="flex space-x-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="p-3 bg-cream-100 dark:bg-dark-700 rounded-xl hover:bg-coffee-100 dark:hover:bg-dark-600 text-dark-700 dark:text-dark-300 hover:text-coffee-600 dark:hover:text-coffee-400 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Language Switcher */}
          <div className="mb-4">
            <LanguageSwitcher variant="compact" />
          </div>

          {/* Dark Mode Toggle & Auth */}
          <div className="space-y-2">
            <button
              onClick={toggleDarkMode}
              className="w-full py-3 px-4 bg-coffee-600 hover:bg-coffee-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
              aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {darkMode ? (
                <>
                  <FaSun size={18} />
                  <span>라이트 모드</span>
                </>
              ) : (
                <>
                  <FaMoon size={18} />
                  <span>다크 모드</span>
                </>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                aria-label="관리자 로그아웃"
              >
                <FaSignInAlt size={18} />
                <span>로그아웃</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onLoginClick()
                  setIsOpen(false)
                }}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                aria-label="관리자 로그인"
              >
                <FaSignInAlt size={18} />
                <span>관리자 로그인</span>
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  )
}

export default Sidebar
