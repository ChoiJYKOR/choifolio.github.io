import React, { useState, KeyboardEvent } from 'react'
import { FaPlus, FaTimes } from 'react-icons/fa'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  maxLength?: number
  className?: string
  disabled?: boolean
}

/**
 * TagInput Component
 * Reusable component for managing array fields with add/remove functionality
 * Supports multilingual use through parent component's language state
 */
const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = '항목을 입력하고 Enter 또는 추가 버튼을 클릭하세요',
  maxTags = 20,
  maxLength = 50,
  className = '',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    
    // Validation
    if (!trimmed) {
      setError('빈 항목은 추가할 수 없습니다.')
      return
    }
    
    if (trimmed.length > maxLength) {
      setError(`항목은 최대 ${maxLength}자까지 입력 가능합니다.`)
      return
    }
    
    if (value.includes(trimmed)) {
      setError('이미 존재하는 항목입니다.')
      return
    }
    
    if (value.length >= maxTags) {
      setError(`최대 ${maxTags}개까지만 추가할 수 있습니다.`)
      return
    }
    
    // Add tag
    onChange([...value, trimmed])
    setInputValue('')
    setError(null)
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
    setError(null)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    if (error) setError(null)
  }

  return (
    <div className={className}>
      {/* Input field with add button */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || value.length >= maxTags}
          maxLength={maxLength}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim() || value.length >= maxTags}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          추가
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tags display */}
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {value.length === 0 ? (
          <div className="text-sm text-gray-400 dark:text-gray-500 italic">
            항목 없음
          </div>
        ) : (
          value.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium group"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`${tag} 삭제`}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Tag count */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
        {value.length} / {maxTags} 항목
      </div>
    </div>
  )
}

export default TagInput

