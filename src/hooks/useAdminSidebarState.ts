import { useState } from 'react'

// 탭 타입 정의
export type AdminTab = 'settings' | 'books' | 'videoLearnings' | 'videoPlaylists' | 'experiences' | 'projects' | 'messages' | 'skills' | 'categories'

// 필터 타입들
export type BookFilter = 'all' | 'five-star' | 'category'
export type ExperienceFilter = 'all' | 'company' | 'year'
export type ProjectFilter = 'all' | 'category' | 'featured'

// 필터 그룹 인터페이스들
export interface BookFilterGroup {
  state: {
    filter: BookFilter
    searchTerm: string
    selectedCategory: string
  }
  actions: {
    setFilter: (filter: BookFilter) => void
    setSearchTerm: (term: string) => void
    setSelectedCategory: (category: string) => void
  }
  data: {
    categories: string[]
  }
}

export interface ExperienceFilterGroup {
  state: {
    filter: ExperienceFilter
    searchTerm: string
    selectedCompany: string
    selectedYear: string
  }
  actions: {
    setFilter: (filter: ExperienceFilter) => void
    setSearchTerm: (term: string) => void
    setSelectedCompany: (company: string) => void
    setSelectedYear: (year: string) => void
  }
  data: {
    companies: string[]
    years: string[]
  }
}

export interface ProjectFilterGroup {
  state: {
    filter: ProjectFilter
    searchTerm: string
    selectedCategory: string
  }
  actions: {
    setFilter: (filter: ProjectFilter) => void
    setSearchTerm: (term: string) => void
    setSelectedCategory: (category: string) => void
  }
  data: {
    categories: string[]
  }
}

export const useAdminSidebarState = () => {
  // 탭 및 설정 섹션 상태
  const [activeTab, setActiveTab] = useState<AdminTab>('settings')
  const [activeSettingsSection, setActiveSettingsSection] = useState<string | null>(null)

  // 서적 필터 상태
  const [bookFilter, setBookFilter] = useState<BookFilter>('all')
  const [bookSearchTerm, setBookSearchTerm] = useState('')
  const [selectedBookCategory, setSelectedBookCategory] = useState('')

  // 경력 필터 상태
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all')
  const [experienceSearchTerm, setExperienceSearchTerm] = useState('')
  const [selectedExperienceCompany, setSelectedExperienceCompany] = useState('')
  const [selectedExperienceYear, setSelectedExperienceYear] = useState('')

  // 프로젝트 필터 상태
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all')
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [selectedProjectCategory, setSelectedProjectCategory] = useState('')

  // 더미 데이터 (실제로는 API에서 가져와야 함)
  const bookCategories = ['프로그래밍', '데이터베이스', '웹 개발', 'AI/ML', '시스템 설계']
  const experienceCompanies = ['ABC Corp', 'XYZ Inc', 'Dev Solutions', 'Tech Startup']
  const experienceYears = ['2024', '2023', '2022', '2021', '2020']
  const projectCategories = ['웹 개발', '모바일 앱', '데이터 분석', '임베디드', 'AI/ML']

  return {
    // 탭 관련 상태와 액션
    activeTab,
    setActiveTab,
    activeSettingsSection,
    setActiveSettingsSection,

    // 서적 필터 관련 상태와 액션을 하나의 객체로 묶어서 반환
    bookFilters: {
      state: {
        filter: bookFilter,
        searchTerm: bookSearchTerm,
        selectedCategory: selectedBookCategory,
      },
      actions: {
        setFilter: setBookFilter,
        setSearchTerm: setBookSearchTerm,
        setSelectedCategory: setSelectedBookCategory,
      },
      data: {
        categories: bookCategories,
      },
    } as BookFilterGroup,

    // 경력 필터 관련 상태와 액션을 하나의 객체로 묶어서 반환
    experienceFilters: {
      state: {
        filter: experienceFilter,
        searchTerm: experienceSearchTerm,
        selectedCompany: selectedExperienceCompany,
        selectedYear: selectedExperienceYear,
      },
      actions: {
        setFilter: setExperienceFilter,
        setSearchTerm: setExperienceSearchTerm,
        setSelectedCompany: setSelectedExperienceCompany,
        setSelectedYear: setSelectedExperienceYear,
      },
      data: {
        companies: experienceCompanies,
        years: experienceYears,
      },
    } as ExperienceFilterGroup,

    // 프로젝트 필터 관련 상태와 액션을 하나의 객체로 묶어서 반환
    projectFilters: {
      state: {
        filter: projectFilter,
        searchTerm: projectSearchTerm,
        selectedCategory: selectedProjectCategory,
      },
      actions: {
        setFilter: setProjectFilter,
        setSearchTerm: setProjectSearchTerm,
        setSelectedCategory: setSelectedProjectCategory,
      },
      data: {
        categories: projectCategories,
      },
    } as ProjectFilterGroup,
  }
}
