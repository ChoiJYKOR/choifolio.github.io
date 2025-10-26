import { useState, useEffect, useCallback } from 'react'
import { projectsAPI } from '../services/api'
import { Project } from '../types'

export const useProjectManagerData = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Project 데이터만 가져오는 함수
  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('📥 프로젝트 목록 가져오기...')
      const response = await projectsAPI.getAll()
      const projectsData = response.data.data || []
      console.log(`✅ ${projectsData.length}개 프로젝트 로드됨`)
      console.log('📊 프로젝트 데이터:', projectsData)
      setProjects(projectsData)
    } catch (error) {
      console.error('❌ Project 데이터 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Project 생성
  const createProject = useCallback(async (projectData: any) => {
    try {
      console.log('➕ 프로젝트 생성 API 호출:', projectData)
      const response = await projectsAPI.create(projectData)
      console.log('✅ 서버 응답:', response.data)
      console.log('🔄 프로젝트 목록 새로고침 시작...')
      await fetchProjects() // 새로고침
      console.log('✅ 프로젝트 목록 새로고침 완료')
      return { success: true }
    } catch (error) {
      console.error('❌ Project 생성 실패:', error)
      return { success: false, error }
    }
  }, [fetchProjects])

  // Project 수정
  const updateProject = useCallback(async (id: string, projectData: any) => {
    try {
      console.log('🔄 프로젝트 수정 API 호출:', { id, projectData })
      const response = await projectsAPI.update(id, projectData)
      console.log('✅ 서버 응답:', response.data)
      console.log('🔄 프로젝트 목록 새로고침 시작...')
      await fetchProjects() // 새로고침
      console.log('✅ 프로젝트 목록 새로고침 완료')
      return { success: true }
    } catch (error) {
      console.error('❌ Project 수정 실패:', error)
      return { success: false, error }
    }
  }, [fetchProjects])

  // Project 삭제
  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectsAPI.delete(id)
      await fetchProjects() // 새로고침
      return { success: true }
    } catch (error) {
      console.error('Project 삭제 실패:', error)
      return { success: false, error }
    }
  }, [fetchProjects])

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
