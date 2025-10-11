import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaFolder, FaBars } from 'react-icons/fa'
import { Category, CategoryFormData } from '../../types'
import { useCategoryManagerData, useCategoryUsage } from '../../hooks/useCategories'
import { useCRUDManager } from '../../hooks/useCRUDManager'
import { useToastHelpers } from '../../hooks/useToast'
import CategoryForm from '../forms/CategoryForm'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 드래그 가능한 카테고리 카드 컴포넌트
interface SortableCategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

const SortableCategoryCard: React.FC<SortableCategoryCardProps> = ({ 
  category, 
  onEdit, 
  onDelete, 
  isDeleting 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: category._id 
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // 카테고리 사용 통계 조회
  const { data: usageData } = useCategoryUsage(category._id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* 드래그 핸들 */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
            title="드래그하여 순서 변경"
          >
            <FaBars />
          </button>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {category.name}
            </h3>
            
            {/* 사용 통계 */}
            {usageData && (
              <div className="flex flex-wrap gap-2 text-sm">
                {usageData.usage.books > 0 && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    📚 서적 {usageData.usage.books}개
                  </span>
                )}
                {usageData.usage.projects > 0 && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    🚀 프로젝트 {usageData.usage.projects}개
                  </span>
                )}
                {usageData.usage.videoLearnings > 0 && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                    📹 영상 {usageData.usage.videoLearnings}개
                  </span>
                )}
                {usageData.usage.videoPlaylists > 0 && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                    📺 재생 목록 {usageData.usage.videoPlaylists}개
                  </span>
                )}
                {usageData.usage.total === 0 && (
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    사용 중이지 않음
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors"
            title="수정"
          >
            <FaEdit />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50"
            title="삭제"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  )
}

const CategoryManager: React.FC = () => {
  const { success, error } = useToastHelpers()
  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategoryManagerData()

  const [categoryState, categoryActions] = useCRUDManager<Category>({
    onSave: async (data: CategoryFormData, editingItem) => {
      if (editingItem) {
        const result = await updateCategory(editingItem._id, data)
        if (result.success) {
          success('카테고리 수정 완료', '카테고리가 성공적으로 수정되었습니다.')
        } else {
          throw result.error
        }
      } else {
        const result = await createCategory(data)
        if (result.success) {
          success('카테고리 추가 완료', '새로운 카테고리가 추가되었습니다.')
        } else {
          throw result.error
        }
      }
    },
    onDelete: async (category: Category) => {
      const result = await deleteCategory(category._id)
      if (result.success) {
        success('카테고리 삭제 완료', `${category.name}이(가) 삭제되었습니다.`)
      } else {
        // 사용 중인 경우 에러 메시지 표시
        const errorMsg = result.error?.response?.data?.message || '카테고리 삭제에 실패했습니다'
        const usage = result.error?.response?.data?.usage
        
        if (usage) {
          const usageDetails = []
          if (usage.books > 0) usageDetails.push(`서적 ${usage.books}개`)
          if (usage.projects > 0) usageDetails.push(`프로젝트 ${usage.projects}개`)
          if (usage.videoLearnings > 0) usageDetails.push(`영상 ${usage.videoLearnings}개`)
          if (usage.videoPlaylists > 0) usageDetails.push(`재생 목록 ${usage.videoPlaylists}개`)
          
          error('삭제 불가', `이 카테고리는 ${usageDetails.join(', ')}에서 사용 중입니다. 먼저 해당 항목들의 카테고리를 변경해주세요.`)
        } else {
          error('삭제 실패', errorMsg)
        }
        throw result.error
      }
    },
    onError: (err) => {
      error('작업 실패', err.message || '알 수 없는 오류가 발생했습니다.')
    }
  })

  // 드래그 앤 드롭으로 순서 변경
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex(cat => cat._id === active.id)
    const newIndex = categories.findIndex(cat => cat._id === over.id)

    const reorderedCategories = arrayMove(categories, oldIndex, newIndex)

    // 순서 업데이트
    for (let i = 0; i < reorderedCategories.length; i++) {
      const category = reorderedCategories[i]
      if (category.order !== i) {
        await updateCategory(category._id, { name: category.name, order: i })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaFolder className="text-yellow-600" />
          카테고리 관리
        </h2>
        <button
          onClick={categoryActions.handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <FaPlus />
          카테고리 추가
        </button>
      </div>

      {/* 카테고리 폼 모달 */}
      {categoryState.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {categoryState.editingItem ? '카테고리 수정' : '카테고리 추가'}
              </h2>
              {categoryState.editingItem ? (
                <CategoryForm
                  data={categoryState.editingItem}
                  onSave={categoryActions.handleSave}
                  onCancel={categoryActions.handleCancel}
                  isSaving={categoryState.isSaving}
                />
              ) : (
                <CategoryForm
                  onSave={categoryActions.handleSave}
                  onCancel={categoryActions.handleCancel}
                  isSaving={categoryState.isSaving}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 목록 - 드래그 앤 드롭 */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(c => c._id)} strategy={verticalListSortingStrategy}>
          <div className="grid gap-4">
            {categories.map((category) => (
              <SortableCategoryCard
                key={category._id}
                category={category}
                onEdit={() => categoryActions.handleEdit(category)}
                onDelete={() => categoryActions.handleDelete(category)}
                isDeleting={categoryState.isDeleting}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FaFolder className="text-6xl mx-auto mb-4 opacity-30" />
          <p>아직 등록된 카테고리가 없습니다</p>
          <p className="text-sm mt-2">위의 "카테고리 추가" 버튼을 클릭하여 첫 카테고리를 만들어보세요</p>
        </div>
      )}
    </div>
  )
}

export default CategoryManager
