import React, { useState, useMemo } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { Project, ProjectFormData } from '../../types'
import ProjectForm from '../forms/ProjectForm'
import { useProjectManagerData } from '../../hooks/useProjectManagerData'

interface ProjectManagerProps {
  projectFilter?: 'all' | 'category' | 'featured'
  projectSearchTerm?: string
  selectedProjectCategory?: string
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  projectFilter = 'all', 
  projectSearchTerm = '', 
  selectedProjectCategory = ''
}) => {
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjectManagerData()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 필터링된 프로젝트 목록 계산
  const filteredProjects = useMemo(() => {
    let filtered = [...projects]

    // 필터 적용
    if (projectFilter === 'category' && selectedProjectCategory) {
      filtered = filtered.filter(project => project.category === selectedProjectCategory)
    } else if (projectFilter === 'featured') {
      // 주요 프로젝트: 완료된 프로젝트 중 상세 설명이 있는 것
      filtered = filtered.filter(project => 
        project.status === 'completed' && 
        project.detailedDescription && 
        project.detailedDescription.trim().length > 0
      )
    }

    // 검색어 적용
    if (projectSearchTerm) {
      const searchLower = projectSearchTerm.toLowerCase()
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        (project.technologies && project.technologies.some(tech => 
          tech.toLowerCase().includes(searchLower)
        )) ||
        (project.category && project.category.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [projects, projectFilter, projectSearchTerm, selectedProjectCategory])

  // 카테고리 목록은 필요시 사용
  // const projectCategories = useMemo(() => {
  //   const categories = [...new Set(projects.map(project => project.category).filter(Boolean))]
  //   return categories.sort()
  // }, [projects])

  // 주요 프로젝트 수 계산
  const featuredProjectsCount = useMemo(() => {
    return projects.filter(project => 
      project.status === 'completed' && 
      project.detailedDescription && 
      project.detailedDescription.trim().length > 0
    ).length
  }, [projects])

  const handleSave = async (data: ProjectFormData) => {
    console.log('🎯 ProjectManager handleSave 호출됨')
    console.log('📦 받은 데이터:', data)
    console.log('🔗 skillIds:', data.skillIds)
    
    try {
      setIsSaving(true)
      console.log('⏳ isSaving = true 설정됨')
      
      if (editingItem) {
        console.log('✏️ 프로젝트 수정 모드:', editingItem._id)
        const result = await updateProject(editingItem._id!, data)
        console.log('✅ 수정 결과:', result)
        if (result.success) {
          setShowForm(false)
          setEditingItem(null)
          alert('✅ 프로젝트가 성공적으로 수정되었습니다!')
        } else {
          // 🌟 서버 오류 메시지 상세 출력
          console.error('❌ 서버 거부 이유:', result.error)
          const errorMsg = (result.error as any)?.response?.data?.message || '알 수 없는 오류'
          alert(`❌ 프로젝트 수정 실패: ${errorMsg}`)
          if ((result.error as any)?.response?.data) {
            console.error('📋 서버 응답 상세:', (result.error as any).response.data)
          }
        }
      } else {
        console.log('➕ 프로젝트 생성 모드')
        const result = await createProject(data)
        console.log('✅ 생성 결과:', result)
        if (result.success) {
          setShowForm(false)
          alert('✅ 프로젝트가 성공적으로 추가되었습니다!')
        } else {
          // 🌟 서버 오류 메시지 상세 출력
          console.error('❌ 서버 거부 이유:', result.error)
          const errorMsg = (result.error as any)?.response?.data?.message || '알 수 없는 오류'
          alert(`❌ 프로젝트 추가 실패: ${errorMsg}`)
          if ((result.error as any)?.response?.data) {
            console.error('📋 서버 응답 상세:', (result.error as any).response.data)
          }
        }
      }
    } catch (error: any) {
      console.error('❌ 저장 실패:', error)
      // 🌟 Axios 오류 상세 정보 출력
      const errorMsg = error?.response?.data?.message || error.message || '알 수 없는 오류'
      alert(`❌ 저장 중 오류 발생: ${errorMsg}`)
      if (error?.response?.data) {
        console.error('📋 서버 응답 상세:', error.response.data)
        console.error('🔢 상태 코드:', error.response.status)
      }
    } finally {
      console.log('🏁 isSaving = false 설정됨')
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const handleDelete = async (project: Project) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        setIsDeleting(true)
        await deleteProject(project._id!)
      } catch (error) {
        console.error('삭제 실패:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (project: Project) => {
    setEditingItem(project)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">프로젝트 데이터를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">프로젝트 관리</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          프로젝트 추가
        </button>
      </div>

      {/* 필터 정보 표시 */}
      {(projectFilter !== 'all' || projectSearchTerm || selectedProjectCategory) && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                현재 필터: 
                {projectFilter === 'all' && !projectSearchTerm && ' 📁 모든 프로젝트'}
                {projectFilter === 'category' && selectedProjectCategory && ` 🏷️ ${selectedProjectCategory} 카테고리`}
                {projectFilter === 'featured' && ' 🌟 주요 프로젝트'}
                {projectSearchTerm && ` 🔍 "${projectSearchTerm}" 검색`}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filteredProjects.length}개 프로젝트 표시 중 (전체 {projects.length}개)
                {projectFilter === 'featured' && ` (주요 프로젝트: ${featuredProjectsCount}개)`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showForm && (
        <div className="mb-6">
          <ProjectForm
            data={editingItem}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* 프로젝트 목록 */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{project.description}</p>
              {project.category && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">{project.category}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <span key={index} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    project.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {project.status === 'completed' ? '완료' : '진행중'}
                  </span>
                  {project.status === 'completed' && project.detailedDescription && project.detailedDescription.trim().length > 0 && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                      🌟 주요
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={isSaving || isDeleting}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    disabled={isSaving || isDeleting}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            {projectFilter !== 'all' || projectSearchTerm || selectedProjectCategory
              ? '필터 조건에 맞는 프로젝트가 없습니다.'
              : '등록된 프로젝트가 없습니다.'
            }
          </p>
          {(projectFilter !== 'all' || projectSearchTerm || selectedProjectCategory) && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              필터를 초기화하거나 다른 검색어를 시도해보세요.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectManager