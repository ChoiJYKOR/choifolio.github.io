import React from 'react'
import { FaPlus } from 'react-icons/fa'
import { FieldRendererProps } from '../types'
import { getMultilingualKey } from '../utils'

/**
 * SettingField Component
 * Renders an individual form field with language indicators for multilingual fields
 */
const SettingField: React.FC<FieldRendererProps> = ({ 
  field, 
  value, 
  onChange, 
  currentLang = 'ko', 
  settings 
}) => {
  // Language indicator for multilingual fields
  const renderLanguageIndicator = () => {
    if (!field.isMultilingual || !settings) return null

    const koValue = settings[field.key]
    const enValue = settings[getMultilingualKey(field.key as string, 'en')]
    const jaValue = settings[getMultilingualKey(field.key as string, 'ja')]

    return (
      <div className="flex gap-2 text-xs mb-2">
        <span className={`px-2 py-1 rounded ${koValue ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
          🇰🇷 {koValue ? '✓' : '○'}
        </span>
        <span className={`px-2 py-1 rounded ${enValue ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
          🇺🇸 {enValue ? '✓' : '○'}
        </span>
        <span className={`px-2 py-1 rounded ${jaValue ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
          🇯🇵 {jaValue ? '✓' : '○'}
        </span>
      </div>
    )
  }

  // Render input based on field type
  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <>
            {renderLanguageIndicator()}
            <textarea
              id={field.key}
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              rows={field.rows || 3}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
            />
          </>
        )

      case 'select':
        return (
          <select
            id={field.key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3">
            <input
              id={field.key}
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor={field.key} className="text-sm text-gray-700 dark:text-gray-300">
              {field.placeholder}
            </label>
          </div>
        )

      case 'number':
        return (
          <input
            id={field.key}
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        )

      case 'array':
        return (
          <div className="space-y-2">
            {((value as string[]) || []).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...(value as string[])]
                    newArray[index] = e.target.value
                    onChange(newArray)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={field.placeholder}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newArray = (value as string[]).filter((_, i) => i !== index)
                    onChange(newArray)
                  }}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newArray = [...((value as string[]) || []), '']
                onChange(newArray)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPlus size={12} /> 항목 추가
            </button>
          </div>
        )

      default:
        return (
          <>
            {renderLanguageIndicator()}
            <input
              id={field.key}
              type={field.type}
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </>
        )
    }
  }

  return (
    <div>
      {field.type !== 'checkbox' && (
        <label
          htmlFor={field.key}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {field.label}
        </label>
      )}
      {renderInput()}
      {field.type === 'checkbox' && (
        <label
          htmlFor={field.key}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {field.label}
        </label>
      )}
    </div>
  )
}

export default SettingField

