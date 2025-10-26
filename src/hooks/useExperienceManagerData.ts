import { useState, useEffect, useCallback } from 'react'
import { experiencesAPI } from '../services/api'
import { Experience } from '../types'

export const useExperienceManagerData = () => {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Experience 데이터만 가져오는 함수
  const fetchExperiences = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await experiencesAPI.getAll()
        setExperiences(response.data.data || [])
    } catch (error) {
      console.error('Experience 데이터 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Experience 생성
  const createExperience = useCallback(async (experienceData: any) => {
    try {
      await experiencesAPI.create(experienceData)
      await fetchExperiences() // 새로고침
      return { success: true }
    } catch (error) {
      console.error('Experience 생성 실패:', error)
      return { success: false, error }
    }
  }, [fetchExperiences])

  // Experience 수정
  const updateExperience = useCallback(async (id: string, experienceData: any) => {
    try {
      await experiencesAPI.update(id, experienceData)
      await fetchExperiences() // 새로고침
      return { success: true }
    } catch (error) {
      console.error('Experience 수정 실패:', error)
      return { success: false, error }
    }
  }, [fetchExperiences])

  // Experience 삭제
  const deleteExperience = useCallback(async (id: string) => {
    try {
      await experiencesAPI.delete(id)
      await fetchExperiences() // 새로고침
      return { success: true }
    } catch (error) {
      console.error('Experience 삭제 실패:', error)
      return { success: false, error }
    }
  }, [fetchExperiences])

  useEffect(() => {
    fetchExperiences()
  }, [])

  return {
    experiences,
    isLoading,
    fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience
  }
}
