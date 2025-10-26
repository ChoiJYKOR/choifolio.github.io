import { useState, useEffect, useMemo } from 'react'
import { projectsAPI } from '../services/api'
import { Project, Skill } from '../types'
import { useSkills } from './useSkills'
import { 
  getLocalizedField, 
  getLocalizedArrayField,
  getLocalizedSkillName,
  getLocalizedSkillDescription,
  Language 
} from '@/utils/i18nUtils'

interface LocalizedProject extends Omit<Project, 'technologies' | 'features' | 'learnings' | 'videoDescriptions'> {
  title: string
  description: string
  detailedDescription: string
  technologies: string[]
  features: string[]
  learnings: string[]
  videoDescriptions: string[]
}

interface LinkedSkill extends Skill {
  levelText: string
}

interface UseProjectDetailReturn {
  loading: boolean
  error: string | null
  localizedProject: LocalizedProject | null
  linkedSkills: LinkedSkill[]
}

/**
 * Custom hook for ProjectDetail component
 * Handles data fetching, multilingual field processing, and skill matching
 */
export const useProjectDetail = (
  id: string | undefined,
  currentLang: Language
): UseProjectDetailReturn => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { skillCategories } = useSkills()

  // Fetch project data by ID
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await projectsAPI.getById(id)
        setProject(response.data)
      } catch (error) {
        console.error('Failed to fetch project:', error)
        setError('프로젝트를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  // Create localized project object with all multilingual fields processed
  const localizedProject = useMemo<LocalizedProject | null>(() => {
    if (!project) return null

    return {
      ...project,
      // String fields
      title: getLocalizedField(currentLang, project.title, project.titleEn, project.titleJa),
      description: getLocalizedField(currentLang, project.description, project.descriptionEn, project.descriptionJa),
      detailedDescription: getLocalizedField(
        currentLang,
        project.detailedDescription,
        project.detailedDescriptionEn,
        project.detailedDescriptionJa
      ),
      // Array fields - CRITICAL: Always add || [] fallback to prevent runtime errors
      technologies: getLocalizedArrayField(
        currentLang,
        project.technologies,
        project.technologiesEn,
        project.technologiesJa
      ) || [],
      features: getLocalizedArrayField(
        currentLang,
        project.features,
        project.featuresEn,
        project.featuresJa
      ) || [],
      learnings: getLocalizedArrayField(
        currentLang,
        project.learnings,
        project.learningsEn,
        project.learningsJa
      ) || [],
      videoDescriptions: getLocalizedArrayField(
        currentLang,
        project.videoDescriptions,
        project.videoDescriptionsEn,
        project.videoDescriptionsJa
      ) || [],
    }
  }, [project, currentLang])

  // Helper function to get level text
  const getLevelText = (level: number): string => {
    if (level >= 90) return 'Expert'
    if (level >= 70) return 'Proficient'
    if (level >= 50) return 'Competent'
    return 'Basic'
  }

  // Process linked skills with multilingual support
  const linkedSkills = useMemo<LinkedSkill[]>(() => {
    if (!project || !skillCategories) return []

    // Flatten all skills from categories
    const allSkills = skillCategories.flatMap(category => category.skills || [])

    // Create Set for O(1) lookup performance
    const skillIdSet = new Set(project.skillIds || [])

    // Filter and map skills with localization
    return allSkills
      .filter(skill => skillIdSet.has(skill._id!))
      .map(skill => ({
        ...skill,
        name: getLocalizedSkillName(currentLang, skill),
        description: getLocalizedSkillDescription(currentLang, skill),
        levelText: getLevelText(skill.level || 0),
      }))
  }, [project, skillCategories, currentLang])

  return {
    loading,
    error,
    localizedProject,
    linkedSkills,
  }
}

