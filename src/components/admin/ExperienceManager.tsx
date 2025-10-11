import React, { useState, useMemo } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { Experience, ExperienceFormData } from '../../types'
import ExperienceForm from '../forms/ExperienceForm'
import { useExperienceManagerData } from '../../hooks/useExperienceManagerData'

interface ExperienceManagerProps {
  experienceFilter?: 'all' | 'company' | 'year'
  experienceSearchTerm?: string
  selectedExperienceCompany?: string
  selectedExperienceYear?: string
}

const ExperienceManager: React.FC<ExperienceManagerProps> = ({ 
  experienceFilter = 'all', 
  experienceSearchTerm = '', 
  selectedExperienceCompany = '',
  selectedExperienceYear = ''
}) => {
  const { experiences, isLoading, createExperience, updateExperience, deleteExperience } = useExperienceManagerData()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Experience | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 필터링된 경력 목록 계산
  const filteredExperiences = useMemo(() => {
    let filtered = [...experiences]

    // 필터 적용
    if (experienceFilter === 'company' && selectedExperienceCompany) {
      filtered = filtered.filter(exp => exp.company === selectedExperienceCompany)
    } else if (experienceFilter === 'year' && selectedExperienceYear) {
      filtered = filtered.filter(exp => {
        // period에서 연도 추출 (예: "2023.01 - 2023.12" 또는 "2023 - 현재")
        const period = exp.period || ''
        return period.includes(selectedExperienceYear)
      })
    }

    // 검색어 적용
    if (experienceSearchTerm) {
      const searchLower = experienceSearchTerm.toLowerCase()
      filtered = filtered.filter(exp => 
        exp.title.toLowerCase().includes(searchLower) ||
        exp.company.toLowerCase().includes(searchLower) ||
        (exp.description && exp.description.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [experiences, experienceFilter, experienceSearchTerm, selectedExperienceCompany, selectedExperienceYear])

  // 회사 목록은 필요시 사용
  // const experienceCompanies = useMemo(() => {
  //   const companies = [...new Set(experiences.map(exp => exp.company))]
  //   return companies.sort()
  // }, [experiences])

  // 연도 목록은 필요시 사용
  // const experienceYears = useMemo(() => {
  //   const years = new Set<string>()
  //   experiences.forEach(exp => {
  //     const period = exp.period || ''
  //     const yearMatches = period.match(/\b(20\d{2})\b/g)
  //     if (yearMatches) {
  //       yearMatches.forEach(year => years.add(year))
  //     }
  //   })
  //   return Array.from(years).sort().reverse()
  // }, [experiences])

  const handleSave = async (data: ExperienceFormData) => {
    try {
      setIsSaving(true)
      if (editingItem) {
        const result = await updateExperience(editingItem._id!, data)
        if (result.success) {
          setShowForm(false)
          setEditingItem(null)
        }
      } else {
        const result = await createExperience(data)
        if (result.success) {
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('저장 실패:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const handleDelete = async (experience: Experience) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        setIsDeleting(true)
        await deleteExperience(experience._id!)
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

  const handleEdit = (experience: Experience) => {
    setEditingItem(experience)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">경력 데이터를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">경력 관리</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          경력 추가
        </button>
      </div>

      {/* 필터 정보 표시 */}
      {(experienceFilter !== 'all' || experienceSearchTerm || selectedExperienceCompany || selectedExperienceYear) && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                현재 필터: 
                {experienceFilter === 'all' && !experienceSearchTerm && ' 💼 모든 경력'}
                {experienceFilter === 'company' && selectedExperienceCompany && ` 🏢 ${selectedExperienceCompany} 회사`}
                {experienceFilter === 'year' && selectedExperienceYear && ` 📅 ${selectedExperienceYear}년`}
                {experienceSearchTerm && ` 🔍 "${experienceSearchTerm}" 검색`}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filteredExperiences.length}개 경력 표시 중 (전체 {experiences.length}개)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showForm && (
        <div className="mb-6">
          <ExperienceForm
            data={editingItem}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* 경력 목록 */}
      {filteredExperiences.length > 0 ? (
        <div className="space-y-4">
          {filteredExperiences.map((experience) => (
            <div key={experience._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{experience.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{experience.company}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {experience.period}
                  </p>
                  {experience.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {experience.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(experience)}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={isSaving || isDeleting}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(experience)}
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
            {experienceFilter !== 'all' || experienceSearchTerm || selectedExperienceCompany || selectedExperienceYear
              ? '필터 조건에 맞는 경력이 없습니다.'
              : '등록된 경력이 없습니다.'
            }
          </p>
          {(experienceFilter !== 'all' || experienceSearchTerm || selectedExperienceCompany || selectedExperienceYear) && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              필터를 초기화하거나 다른 검색어를 시도해보세요.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ExperienceManager