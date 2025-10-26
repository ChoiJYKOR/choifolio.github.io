import { useState, useEffect, useCallback } from 'react'
import { SiteSettings } from '@/types'
import { AdminLanguage } from '@/components/common/LanguageTabs'
import { settingsAPI } from '@/services/api'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { MessageType } from '../types'
import { initialSettings } from '../constants'
import { getFilteredSections } from '../utils'

/**
 * Custom hook for managing settings form state and business logic
 * @param activeSection - Optional section filter ('general', 'appearance', etc.)
 */
export const useSettingsForm = (activeSection: string | null = null) => {
  const { refetchSettings } = useSiteSettings()
  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<MessageType | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['개인 정보', '소셜 링크'])
  )
  const [currentLang, setCurrentLang] = useState<AdminLanguage>('ko')

  /**
   * Normalize settings data, ensuring number fields are properly typed
   */
  const normalizeSettings = (data: any): SiteSettings => {
    const normalized = { ...initialSettings, ...data }
    
    // Ensure number fields are numbers, not strings
    if (normalized.sidebarSkillCount) {
      normalized.sidebarSkillCount = typeof normalized.sidebarSkillCount === 'number' 
        ? normalized.sidebarSkillCount 
        : parseInt(String(normalized.sidebarSkillCount)) || 4
    }
    if (normalized.languageCardSkillCount) {
      normalized.languageCardSkillCount = typeof normalized.languageCardSkillCount === 'number'
        ? normalized.languageCardSkillCount
        : parseInt(String(normalized.languageCardSkillCount)) || 3
    }

    return normalized
  }

  /**
   * Fetch settings from API
   */
  const fetchSettings = useCallback(async () => {
    try {
      const response = await settingsAPI.get()
      const normalizedData = normalizeSettings(response.data)
      setSettings(normalizedData)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setMessage({ 
        type: 'error', 
        text: '설정을 불러오는데 실패했습니다. 기본 값으로 표시됩니다.' 
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Save settings to API
   */
  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      await settingsAPI.update(settings)
      await refetchSettings()
      
      setMessage({ 
        type: 'success', 
        text: '✅ 설정이 성공적으로 저장되었습니다! 화면이 업데이트됩니다.' 
      })
      
      // Auto-hide message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ 
        type: 'error', 
        text: '❌ 설정 저장에 실패했습니다. 콘솔을 확인해주세요.' 
      })
    } finally {
      setSaving(false)
    }
  }

  /**
   * Update a single field value
   */
  const handleChange = (field: keyof SiteSettings, value: string | boolean | string[] | number) => {
    setSettings(prevSettings => ({ ...prevSettings, [field]: value }))
  }

  /**
   * Toggle section expand/collapse state
   */
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle)
      } else {
        newSet.add(sectionTitle)
      }
      return newSet
    })
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Auto-expand sections based on activeSection
  useEffect(() => {
    if (activeSection) {
      if (activeSection === 'appearance') {
        // Start with all sections collapsed for appearance
        setExpandedSections(new Set())
      } else {
        // Expand all filtered sections for other categories
        const filteredSections = getFilteredSections(activeSection)
        const sectionTitles = filteredSections.map(section => section.title)
        setExpandedSections(new Set(sectionTitles))
      }
    } else {
      // Default expanded sections
      setExpandedSections(new Set(['개인 정보', '소셜 링크']))
    }
  }, [activeSection])

  return {
    settings,
    loading,
    saving,
    message,
    expandedSections,
    currentLang,
    setCurrentLang,
    handleChange,
    handleSave,
    toggleSection,
    setExpandedSections
  }
}

