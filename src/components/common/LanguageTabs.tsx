import React from 'react'

export type AdminLanguage = 'ko' | 'en' | 'ja'

interface LanguageTabsProps {
  activeLanguage: AdminLanguage
  onChange: (lang: AdminLanguage) => void
}

const LanguageTabs: React.FC<LanguageTabsProps> = ({ activeLanguage, onChange }) => {
  const languages: { code: AdminLanguage; flag: string; label: string }[] = [
    { code: 'ko', flag: '🇰🇷', label: '한국어' },
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'ja', flag: '🇯🇵', label: '日本語' }
  ]

  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
      {languages.map((lang) => {
        const isActive = activeLanguage === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
              isActive
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default LanguageTabs

