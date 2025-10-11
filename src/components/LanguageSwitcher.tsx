import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaGlobe } from 'react-icons/fa'

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact'
}

type Language = 'ko' | 'en' | 'ja'

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'default' }) => {
  const { i18n } = useTranslation()

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const languages = [
    { code: 'ko' as Language, short: 'KOR', full: '한국어' },
    { code: 'en' as Language, short: 'ENG', full: 'English' },
    { code: 'ja' as Language, short: 'JPN', full: '日本語' }
  ]

  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <FaGlobe className="text-base text-gray-600 dark:text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Language</span>
        </div>
        <div className="flex items-center gap-2">
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-label={`${lang.full}로 변경`}
                aria-current={isActive ? 'true' : 'false'}
              >
                {lang.short}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FaGlobe className="text-primary-600 dark:text-primary-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">언어 선택</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => {
          const isActive = i18n.language === lang.code
          return (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300'
              }`}
              aria-label={`${lang.full}로 변경`}
              aria-current={isActive ? 'true' : 'false'}
            >
              {lang.full}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LanguageSwitcher

