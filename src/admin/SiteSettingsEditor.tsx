import React from 'react'
import { motion } from 'framer-motion'
import { FaSave } from 'react-icons/fa'
import { SiteSettingsEditorProps } from './settings/types'
import { useSettingsForm } from './settings/hooks/useSettingsForm'
import { getFilteredSections, getActiveSectionTitle, getActiveSectionDescription } from './settings/utils'
import SettingsSection from './settings/components/SettingsSection'

/**
 * SiteSettingsEditor - Main orchestrator component
 * Manages the site settings editing interface with categorized sections
 */
const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ activeSection = null }) => {
  const {
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
  } = useSettingsForm(activeSection)

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">설정을 불러오는 중...</p>
      </div>
    )
  }

  const sections = getFilteredSections(activeSection)

  return (
    <div className="space-y-8">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getActiveSectionTitle(activeSection)}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {getActiveSectionDescription(activeSection)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const allSectionTitles = sections.map(s => s.title)
              setExpandedSections(new Set(allSectionTitles))
            }}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            모두 펼치기
          </button>
          <button
            onClick={() => setExpandedSections(new Set())}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            모두 접기
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {saving ? '저장 중...' : '모두 저장'}
          </button>
        </div>
      </div>

      {/* Success/Error message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-4 rounded-lg shadow-md ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-400 dark:border-green-700'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-400 dark:border-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Settings sections */}
      {sections.map((section) => (
        <SettingsSection
          key={section.title}
          section={section}
          isExpanded={expandedSections.has(section.title)}
          onToggle={() => toggleSection(section.title)}
          currentLang={currentLang}
          settings={settings}
          onChange={handleChange}
          setCurrentLang={setCurrentLang}
        />
      ))}

      {/* Bottom save button (hidden for quick menu) */}
      {!activeSection && (
        <div className="py-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave size={20} />
            {saving ? '설정 저장 중...' : '모두 저장하고 적용'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SiteSettingsEditor

