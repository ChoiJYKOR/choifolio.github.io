import React from 'react'
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaBars } from 'react-icons/fa'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SkillCategory } from '../../types'

interface SortableCategoryCardProps {
  category: SkillCategory
  isExpanded: boolean
  onToggle: (categoryId: string) => void
  onAddSkill: (categoryId: string) => void
  onEdit: (category: SkillCategory) => void
  onDelete: (category: SkillCategory) => void
  isSaving: boolean
  isDeleting: boolean
  children?: React.ReactNode
}

const SortableCategoryCard: React.FC<SortableCategoryCardProps> = ({
  category,
  isExpanded,
  onToggle,
  onAddSkill,
  onEdit,
  onDelete,
  isSaving,
  isDeleting,
  children
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
    >
      <div className="p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1" onClick={() => onToggle(category._id!)}>
            {/* 🌟 드래그 핸들 */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              title="드래그하여 순서 변경"
              onClick={(e) => e.stopPropagation()}
            >
              <FaBars />
            </div>
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            ></div>
            <h3 className="font-semibold text-lg cursor-pointer">{category.title}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({category.skills?.length || 0}개 스킬)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddSkill(category._id!)
              }}
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              disabled={isSaving || isDeleting}
            >
              <FaPlus size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(category)
              }}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={isSaving || isDeleting}
            >
              <FaEdit size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(category)
              }}
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={isSaving || isDeleting}
            >
              <FaTrash size={12} />
            </button>
            {isExpanded ? (
              <FaChevronDown className="text-gray-400" />
            ) : (
              <FaChevronRight className="text-gray-400" />
            )}
          </div>
        </div>
        {category.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-7">
            {category.description}
          </p>
        )}
      </div>
      
      {/* 스킬 목록 (children으로 전달) */}
      {isExpanded && children}
    </div>
  )
}

export default SortableCategoryCard

