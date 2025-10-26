import React from 'react'

interface SettingsMenuProps {
  activeSettingsSection: string | null
  setActiveSettingsSection: (section: string | null) => void
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  activeSettingsSection, 
  setActiveSettingsSection 
}) => {
  const settingsOptions = [
    { id: 'general', label: '🏠 일반 설정', description: '사이트 기본 정보' },
    { id: 'appearance', label: '🎨 외관 설정', description: '테마 및 디자인' },
    { id: 'seo', label: '🔍 SEO 설정', description: '검색 엔진 최적화' },
    { id: 'social', label: '📱 소셜 미디어', description: '소셜 링크 및 연락처' },
    { id: 'analytics', label: '📊 분석 도구', description: 'Google Analytics 등' },
    { id: 'security', label: '🔒 보안 설정', description: '인증 및 보안' },
  ]

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        사이트 설정
      </h4>
      
      <div className="space-y-1">
        {settingsOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveSettingsSection(option.id)}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
              activeSettingsSection === option.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {option.description}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 설정 초기화 버튼 */}
      {activeSettingsSection && (
        <button
          onClick={() => setActiveSettingsSection(null)}
          className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ← 설정 메뉴로 돌아가기
        </button>
      )}
    </div>
  )
}

export default SettingsMenu
