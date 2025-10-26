import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEdit, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { SiteSettings } from '@/types'
import { AdminLanguage } from '@/components/common/LanguageTabs'
import LanguageTabs from '@/components/common/LanguageTabs'
import { SectionDefinition } from '../types'
import { getMultilingualKey } from '../utils'
import SettingField from './SettingField'

interface SettingsSectionProps {
  section: SectionDefinition
  isExpanded: boolean
  onToggle: () => void
  currentLang: AdminLanguage
  settings: SiteSettings
  onChange: (field: keyof SiteSettings, value: string | boolean | string[] | number) => void
  setCurrentLang: (lang: AdminLanguage) => void
}

/**
 * SettingsSection Component
 * Renders a collapsible section containing multiple setting fields
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({
  section,
  isExpanded,
  onToggle,
  currentLang,
  settings,
  onChange,
  setCurrentLang
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FaEdit className="text-primary-500" size={20} />
          {section.title}
          {isExpanded ? (
            <FaChevronDown className="text-gray-400 ml-auto" size={16} />
          ) : (
            <FaChevronRight className="text-gray-400 ml-auto" size={16} />
          )}
        </h3>
      </button>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`p-6 pt-4 border-t border-gray-200 dark:border-gray-700 ${
              section.title.includes('Hero 섹션') ? 'py-8' : ''
            }`}>
              {/* Language tabs for multilingual sections */}
              {section.fields.some(f => f.isMultilingual) && (
                <LanguageTabs
                  activeLanguage={currentLang}
                  onChange={setCurrentLang}
                />
              )}

              {/* Fields grid */}
              <div className={`grid gap-6 ${
                section.title.includes('About 섹션') ||
                section.title.includes('Hero 섹션') ||
                section.title.includes('Experience 섹션') ||
                section.title.includes('Skills 섹션') ||
                section.title.includes('Projects 섹션') ||
                section.title.includes('Books 섹션') ||
                section.title.includes('소셜 링크') ||
                section.title.includes('Contact 섹션')
                  ? 'grid-cols-1'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {section.fields.map((field) => {
                  // Use multilingual key if field supports it
                  const activeKey = field.isMultilingual
                    ? getMultilingualKey(field.key as string, currentLang) as keyof SiteSettings
                    : field.key

                  return (
                    <SettingField
                      key={field.key}
                      field={field}
                      value={settings[activeKey] || (field.type === 'checkbox' ? false : field.type === 'array' ? [] : '')}
                      onChange={(value) => onChange(activeKey, value)}
                      currentLang={currentLang}
                      settings={settings}
                    />
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsSection

