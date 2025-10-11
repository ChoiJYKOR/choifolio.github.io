import React from 'react'
import { FaEdit, FaTrash, FaBars, FaSave } from 'react-icons/fa'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Skill } from '../../types'
import DynamicIcon from '../common/DynamicIcon'

interface SortableSkillItemProps {
  skill: Skill
  categoryColor: string
  currentLevel: number
  hasChanges: boolean
  isSavingThis: boolean
  isSaving: boolean
  isDeleting: boolean
  onLevelChange: (skillId: string, level: number) => void
  onSaveLevel: (skill: Skill) => void
  onEdit: (skill: Skill) => void
  onDelete: (skill: Skill) => void
  onToggleSidebar: (skill: Skill) => void
  onToggleLanguageCard: (skill: Skill) => void
}

const SortableSkillItem: React.FC<SortableSkillItemProps> = ({
  skill,
  categoryColor,
  currentLevel,
  hasChanges,
  isSavingThis,
  isSaving,
  isDeleting,
  onLevelChange,
  onSaveLevel,
  onEdit,
  onDelete,
  onToggleSidebar,
  onToggleLanguageCard
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill._id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg"
    >
      <div className="flex items-center gap-3 flex-1">
        {/* 🌟 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          title="드래그하여 순서 변경"
        >
          <FaBars />
        </div>
        
        {/* 🌟 사이드바/언어 카드 표시 체크박스 */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs cursor-pointer" title="사이드바 핵심기술에 표시">
            <input
              type="checkbox"
              checked={skill.showInSidebar || false}
              onChange={() => onToggleSidebar(skill)}
              disabled={isSaving || isDeleting}
              className="w-3 h-3 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600 dark:text-gray-400">핵심</span>
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer" title="사이드바 언어카드에 표시">
            <input
              type="checkbox"
              checked={skill.showInLanguageCard || false}
              onChange={() => onToggleLanguageCard(skill)}
              disabled={isSaving || isDeleting}
              className="w-3 h-3 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-600 dark:text-gray-400">언어</span>
          </label>
        </div>
        
        <div className="text-lg text-blue-600 dark:text-blue-400">
          <DynamicIcon iconName={skill.icon} size={18} />
        </div>
        <span className="font-medium min-w-[120px]">{skill.name}</span>
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={currentLevel}
            onChange={(e) => {
              const newLevel = parseInt(e.target.value)
              onLevelChange(skill._id!, newLevel)
            }}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, ${categoryColor} 0%, ${categoryColor} ${currentLevel}%, #e5e7eb ${currentLevel}%, #e5e7eb 100%)`
            }}
            disabled={isSaving || isDeleting || isSavingThis}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[45px] text-right font-medium">
            {currentLevel}%
          </span>
          {hasChanges && (
            <button
              onClick={() => onSaveLevel(skill)}
              disabled={isSavingThis}
              className={`px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                isSavingThis ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="변경된 숙련도 저장"
            >
              {isSavingThis ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  저장중
                </>
              ) : (
                <>
                  <FaSave size={10} />
                  저장
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-2">
        <button
          onClick={() => onEdit(skill)}
          className="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          disabled={isSaving || isDeleting}
        >
          <FaEdit size={12} />
        </button>
        <button
          onClick={() => onDelete(skill)}
          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          disabled={isSaving || isDeleting}
        >
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  )
}

export default SortableSkillItem

