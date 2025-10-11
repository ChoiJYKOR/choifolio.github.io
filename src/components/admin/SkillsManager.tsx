import React, { useState, useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import { SkillCategory, Skill, SkillCategoryFormData, SkillFormData } from '../../types'
import { useSkillsManagerData } from '../../hooks/useSkillsManagerData'
import SkillCategoryForm from '../forms/SkillCategoryForm'
import SkillForm from '../forms/SkillForm'
import SortableCategoryCard from './SortableCategoryCard'
import SortableSkillItem from './SortableSkillItem'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { arrayMove } from '@dnd-kit/sortable'

const SkillsManager: React.FC = () => {
  const { 
    skillCategories, 
    isLoading, 
    createSkillCategory,
    updateSkillCategory,
    deleteSkillCategory,
    createSkill,
    updateSkill,
    deleteSkill
  } = useSkillsManagerData()


  // 단일 폼 상태 관리 - 한 번에 하나의 작업만 가능
  const [activeForm, setActiveForm] = useState<'category' | 'skill' | null>(null)
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🌟 숙련도 로컬 상태 관리 (변경사항 추적용)
  const [localLevels, setLocalLevels] = useState<Map<string, number>>(new Map())
  
  // 🌟 저장 중인 스킬 ID 추적
  const [savingSkillIds, setSavingSkillIds] = useState<Set<string>>(new Set())

  // 🌟 슬라이더 변경 핸들러 (즉시 저장 없이 로컬 상태만 업데이트)
  const handleLevelChange = useCallback((skillId: string, newLevel: number) => {
    setLocalLevels(prev => {
      const newMap = new Map(prev)
      newMap.set(skillId, newLevel)
      return newMap
    })
  }, [])

  // 🌟 개별 스킬 숙련도 저장 핸들러
  const handleSaveLevel = useCallback(async (skill: Skill) => {
    const skillId = skill._id!
    const newLevel = localLevels.get(skillId)
    
    if (newLevel === undefined || newLevel === skill.level) {
      // 변경사항이 없으면 로컬 상태만 정리
      setLocalLevels(prev => {
        const newMap = new Map(prev)
        newMap.delete(skillId)
        return newMap
      })
      return
    }

    try {
      setSavingSkillIds(prev => new Set(prev).add(skillId))
      console.log(`💾 숙련도 저장: ${skill.name} = ${newLevel}%`)
      
      await updateSkill(skillId, { 
        name: skill.name,
        icon: skill.icon,
        level: newLevel,
        order: skill.order,
        ...(skill.description && { description: skill.description }),
        ...(skill.color && { color: skill.color }),
        ...(skill.showInSidebar !== undefined && { showInSidebar: skill.showInSidebar }),
        ...(skill.showInLanguageCard !== undefined && { showInLanguageCard: skill.showInLanguageCard })
      })
      
      console.log(`✅ 저장 완료: ${skill.name}`)
      
      // 저장 성공 후 로컬 상태 정리
      setLocalLevels(prev => {
        const newMap = new Map(prev)
        newMap.delete(skillId)
        return newMap
      })
    } catch (error) {
      console.error(`❌ 저장 실패: ${skill.name}`, error)
      alert(`저장 실패: ${skill.name}`)
    } finally {
      setSavingSkillIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(skillId)
        return newSet
      })
    }
  }, [localLevels, updateSkill])

  // 🌟 사이드바 표시 토글 핸들러
  const handleToggleSidebar = useCallback(async (skill: Skill) => {
    if (!skill._id) return
    
    try {
      setSavingSkillIds(prev => new Set(prev).add(skill._id!))
      const newValue = !skill.showInSidebar
      console.log(`💾 [핵심기술] 토글: ${skill.name} = ${newValue}`)
      console.log(`📋 [핵심기술] 전송 데이터:`, {
        name: skill.name,
        showInSidebar: newValue,
        showInLanguageCard: skill.showInLanguageCard
      })
      
      const result = await updateSkill(skill._id, {
        name: skill.name,
        icon: skill.icon,
        level: skill.level,
        order: skill.order,
        showInSidebar: newValue,
        ...(skill.description && { description: skill.description }),
        ...(skill.color && { color: skill.color }),
        ...(skill.showInLanguageCard !== undefined && { showInLanguageCard: skill.showInLanguageCard })
      })
      
      console.log(`✅ [핵심기술] 토글 완료:`, result)
    } catch (error) {
      console.error(`❌ [핵심기술] 토글 실패: ${skill.name}`, error)
      alert(`사이드바 표시 토글 실패: ${skill.name}`)
    } finally {
      setSavingSkillIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(skill._id!)
        return newSet
      })
    }
  }, [updateSkill])

  // 🌟 언어 카드 표시 토글 핸들러
  const handleToggleLanguageCard = useCallback(async (skill: Skill) => {
    if (!skill._id) return
    
    try {
      setSavingSkillIds(prev => new Set(prev).add(skill._id!))
      const newValue = !skill.showInLanguageCard
      console.log(`💾 [언어카드] 토글: ${skill.name} = ${newValue}`)
      console.log(`📋 [언어카드] 전송 데이터:`, {
        name: skill.name,
        showInSidebar: skill.showInSidebar,
        showInLanguageCard: newValue
      })
      
      const result = await updateSkill(skill._id, {
        name: skill.name,
        icon: skill.icon,
        level: skill.level,
        order: skill.order,
        showInLanguageCard: newValue,
        ...(skill.description && { description: skill.description }),
        ...(skill.color && { color: skill.color }),
        ...(skill.showInSidebar !== undefined && { showInSidebar: skill.showInSidebar })
      })
      
      console.log(`✅ [언어카드] 토글 완료:`, result)
    } catch (error) {
      console.error(`❌ [언어카드] 토글 실패: ${skill.name}`, error)
      alert(`언어 카드 표시 토글 실패: ${skill.name}`)
    } finally {
      setSavingSkillIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(skill._id!)
        return newSet
      })
    }
  }, [updateSkill])

  // 🌟 카테고리 드래그 앤 드롭 핸들러
  const handleCategoryDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const oldIndex = skillCategories.findIndex(cat => cat._id === active.id)
    const newIndex = skillCategories.findIndex(cat => cat._id === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return
    
    // 배열 순서 변경
    const reorderedCategories = arrayMove(skillCategories, oldIndex, newIndex)
    
    // 각 카테고리의 order 값을 새로운 인덱스로 업데이트하고 저장
    try {
      for (let i = 0; i < reorderedCategories.length; i++) {
        const category = reorderedCategories[i]
        if (!category?._id) continue
        
        await updateSkillCategory(category._id, {
          title: category.title,
          color: category.color,
          order: i,
          ...(category.description && { description: category.description })
        })
      }
      console.log('✅ 카테고리 순서 변경 완료')
    } catch (error) {
      console.error('❌ 카테고리 순서 변경 실패:', error)
      alert('순서 변경에 실패했습니다.')
    }
  }, [skillCategories, updateSkillCategory])

  // 🌟 스킬 드래그 앤 드롭 핸들러 (카테고리별)
  const handleSkillDragEnd = useCallback(async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const category = skillCategories.find(cat => cat._id === categoryId)
    if (!category || !category.skills) return
    
    const oldIndex = category.skills.findIndex(skill => skill._id === active.id)
    const newIndex = category.skills.findIndex(skill => skill._id === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return
    
    // 스킬 배열 순서 변경
    const reorderedSkills = arrayMove(category.skills, oldIndex, newIndex)
    
    // 각 스킬의 order 값을 새로운 인덱스로 업데이트하고 저장
    try {
      for (let i = 0; i < reorderedSkills.length; i++) {
        const skill = reorderedSkills[i]
        if (!skill?._id) continue
        
        await updateSkill(skill._id, {
          name: skill.name,
          icon: skill.icon,
          level: skill.level,
          order: i,
          ...(skill.description && { description: skill.description }),
          ...(skill.color && { color: skill.color })
        })
      }
      console.log(`✅ 스킬 순서 변경 완료 (카테고리: ${category.title})`)
    } catch (error) {
      console.error('❌ 스킬 순서 변경 실패:', error)
      alert('순서 변경에 실패했습니다.')
    }
  }, [skillCategories, updateSkill])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setActiveForm('category')
  }

  const handleEditCategory = (category: SkillCategory) => {
    setEditingCategory(category)
    setActiveForm('category')
  }

  const handleSaveCategory = async (data: SkillCategoryFormData) => {
    try {
      setIsSaving(true)
      console.log('🔍 카테고리 저장 시작:', data)
      
      if (editingCategory) {
        console.log('📝 카테고리 수정 모드:', editingCategory._id)
        const result = await updateSkillCategory(editingCategory._id!, data)
        console.log('✅ 수정 결과:', result)
        if (result.success) {
          setActiveForm(null)
          setEditingCategory(null)
          alert('카테고리가 성공적으로 수정되었습니다.')
        } else {
          alert(`카테고리 수정 실패: ${result.error || '알 수 없는 오류'}`)
        }
      } else {
        console.log('➕ 카테고리 생성 모드')
        const result = await createSkillCategory(data)
        console.log('✅ 생성 결과:', result)
        if (result.success) {
          setActiveForm(null)
          alert('카테고리가 성공적으로 추가되었습니다.')
        } else {
          alert(`카테고리 추가 실패: ${result.error || '알 수 없는 오류'}`)
        }
      }
    } catch (error) {
      console.error('❌ 카테고리 저장 실패:', error)
      alert(`카테고리 저장 중 오류가 발생했습니다: ${error}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (category: SkillCategory) => {
    if (confirm('정말 삭제하시겠습니까? 카테고리 내 모든 스킬도 함께 삭제됩니다.')) {
      try {
        setIsDeleting(true)
        await deleteSkillCategory(category._id!)
      } catch (error) {
        console.error('카테고리 삭제 실패:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleAddSkill = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setEditingSkill(null)
    setActiveForm('skill')
  }

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill)
    setSelectedCategoryId(skill.categoryId)
    setActiveForm('skill')
  }

  const handleSaveSkill = async (data: SkillFormData) => {
    if (!selectedCategoryId && !editingSkill) return
    
    try {
      setIsSaving(true)
      const categoryId = editingSkill?.categoryId || selectedCategoryId!
      
      if (editingSkill) {
        const result = await updateSkill(editingSkill._id!, data)
        if (result.success) {
          setActiveForm(null)
          setEditingSkill(null)
          setSelectedCategoryId(null)
        }
      } else {
        const result = await createSkill(categoryId, data)
        if (result.success) {
          setActiveForm(null)
          setSelectedCategoryId(null)
        }
      }
    } catch (error) {
      console.error('스킬 저장 실패:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSkill = async (skill: Skill) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        setIsDeleting(true)
        await deleteSkill(skill._id!)
      } catch (error) {
        console.error('스킬 삭제 실패:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCancel = () => {
    setActiveForm(null)
    setEditingCategory(null)
    setEditingSkill(null)
    setSelectedCategoryId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">기술 데이터를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">기술 관리</h2>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          카테고리 추가
        </button>
      </div>

      {/* 카테고리 폼 */}
      {activeForm === 'category' && (
        <SkillCategoryForm
          initialData={editingCategory}
          onSave={handleSaveCategory}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* 스킬 폼 */}
      {activeForm === 'skill' && (
        <SkillForm
          initialData={editingSkill}
          categoryId={selectedCategoryId || undefined}
          onSave={handleSaveSkill}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* 카테고리 목록 - 🌟 드래그 앤 드롭 적용 */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
        <SortableContext items={skillCategories.map(cat => cat._id!)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {skillCategories.map((category) => {
              const isExpanded = expandedCategories.has(category._id!)
              return (
                <SortableCategoryCard
                  key={category._id}
                  category={category}
                  isExpanded={isExpanded}
                  onToggle={toggleCategory}
                  onAddSkill={handleAddSkill}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  isSaving={isSaving}
                  isDeleting={isDeleting}
                >
              
                  {/* 스킬 목록 - 🌟 드래그 앤 드롭 적용 */}
                  <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                    {category.skills && category.skills.length > 0 ? (
                      <DndContext 
                        collisionDetection={closestCenter} 
                        onDragEnd={(event) => handleSkillDragEnd(event, category._id!)}
                      >
                        <SortableContext 
                          items={category.skills.map(skill => skill._id!)} 
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="p-4 space-y-2">
                            {category.skills
                              .sort((a, b) => a.order - b.order)
                              .map((skill) => {
                                const currentLevel = localLevels.get(skill._id!) ?? skill.level
                                const hasChanges = localLevels.has(skill._id!) && localLevels.get(skill._id!) !== skill.level
                                const isSavingThis = savingSkillIds.has(skill._id!)
                                
                                return (
                                  <SortableSkillItem
                                    key={skill._id}
                                    skill={skill}
                                    categoryColor={category.color || '#3B82F6'}
                                    currentLevel={currentLevel}
                                    hasChanges={hasChanges}
                                    isSavingThis={isSavingThis}
                                    isSaving={isSaving}
                                    isDeleting={isDeleting}
                                    onLevelChange={handleLevelChange}
                                    onSaveLevel={handleSaveLevel}
                                    onEdit={handleEditSkill}
                                    onDelete={handleDeleteSkill}
                                    onToggleSidebar={handleToggleSidebar}
                                    onToggleLanguageCard={handleToggleLanguageCard}
                                  />
                                )
                              })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <FaPlus size={32} className="text-blue-400 dark:text-blue-500 mx-auto mb-2" />
                        <p className="text-sm">아직 스킬이 없습니다.</p>
                        <p className="text-xs mt-1">카테고리 제목 옆의 + 버튼을 클릭하여 스킬을 추가하세요.</p>
                      </div>
                    )}
                  </div>
                </SortableCategoryCard>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {skillCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">아직 생성된 카테고리가 없습니다.</p>
          <p>위의 "카테고리 추가" 버튼을 클릭하여 첫 번째 카테고리를 만들어보세요.</p>
        </div>
      )}
    </div>
  )
}

export default SkillsManager
