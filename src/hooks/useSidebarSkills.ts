import { useState, useEffect, useCallback, useMemo } from 'react'
import { skillsAPI } from '../services/api'
import { Skill } from '../types'
import { useSiteSettings } from './useSiteSettings'

/**
 * 사이드바에 표시할 스킬 데이터를 관리하는 커스텀 훅
 * 
 * @returns {Object} 스킬 데이터 및 로딩 상태
 * @property {Skill[]} coreSkills - 사이드바에 표시할 핵심 기술
 * @property {Skill[]} languageSkills - 언어 카드에 표시할 언어 스킬
 * @property {boolean} isLoadingSkills - 스킬 데이터 로딩 상태
 */
export const useSidebarSkills = () => {
  const [coreSkills, setCoreSkills] = useState<Skill[]>([])
  const [languageSkills, setLanguageSkills] = useState<Skill[]>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const { settings: siteSettings } = useSiteSettings()

  // 스킬 데이터를 가져오는 함수 (useCallback으로 메모이제이션)
  const fetchSkills = useCallback(async () => {
    setIsLoadingSkills(true)
    try {
      const response = await skillsAPI.getAll()
      const allSkills = response.data || []
      
      // 사이드바 핵심 기술 필터링 (showInSidebar: true)
      let sidebarSkills = allSkills
        .filter((skill: Skill) => skill.showInSidebar)
        .sort((a: Skill, b: Skill) => a.order - b.order)
        .slice(0, siteSettings?.sidebarSkillCount || 4)
      
      // 선택된 스킬이 없으면 레벨 높은 순으로 fallback
      if (sidebarSkills.length === 0) {
        sidebarSkills = allSkills
          .sort((a: Skill, b: Skill) => b.level - a.level)
          .slice(0, siteSettings?.sidebarSkillCount || 4)
      }
      setCoreSkills(sidebarSkills)
      
      // 언어 카드 스킬 필터링 (showInLanguageCard: true)
      // 레벨 높은 순으로 정렬 (왼쪽에 잘하는 언어)
      let langSkills = allSkills
        .filter((skill: Skill) => skill.showInLanguageCard)
        .sort((a: Skill, b: Skill) => b.level - a.level)
        .slice(0, siteSettings?.languageCardSkillCount || 3)
      
      // 선택된 언어 스킬이 없으면 빈 배열 유지 (언어 카드는 숨김)
      setLanguageSkills(langSkills)
    } catch (error) {
      console.error('스킬 데이터 로드 실패:', error)
      // 에러 시 빈 배열로 설정하여 "스킬 데이터가 없습니다" 메시지 표시
      setCoreSkills([])
      setLanguageSkills([])
    } finally {
      setIsLoadingSkills(false)
    }
  }, [siteSettings?.sidebarSkillCount, siteSettings?.languageCardSkillCount])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  // 반환 객체를 useMemo로 메모이제이션하여 불필요한 리렌더링 방지
  return useMemo(() => ({
    coreSkills,
    languageSkills,
    isLoadingSkills
  }), [coreSkills, languageSkills, isLoadingSkills])
}

