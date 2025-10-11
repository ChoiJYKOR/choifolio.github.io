import { useState, useEffect } from 'react'
import { Project, ProjectFormData } from '../types'
import { AdminLanguage } from '../components/common/LanguageTabs'

// Video item type with multilingual descriptions
export interface VideoItem {
  url: string
  description: string
  descriptionEn: string
  descriptionJa: string
}

interface UseProjectFormReturn {
  formData: any
  videoItems: VideoItem[]
  currentLang: AdminLanguage
  setCurrentLang: (lang: AdminLanguage) => void
  setFormData: React.Dispatch<React.SetStateAction<any>>
  setVideoItems: React.Dispatch<React.SetStateAction<VideoItem[]>>
  handleFieldChange: (key: string, value: any) => void
  handleArrayFieldChange: (key: string, value: string[]) => void
  handleVideoUrlChange: (index: number, url: string) => void
  handleVideoDescriptionChange: (index: number, description: string, lang: 'ko' | 'en' | 'ja') => void
  handleAddVideo: () => void
  handleRemoveVideo: (index: number) => void
  prepareDataForSubmit: () => any
}

/**
 * Custom hook for ProjectForm
 * Handles all form state management, data initialization, and preparation for submission
 */
export const useProjectForm = (initialData: Project | null): UseProjectFormReturn => {
  const [currentLang, setCurrentLang] = useState<AdminLanguage>('ko')
  
  // Initialize categoryIds
  const initialCategoryIds = initialData?.categoryIds 
    ? (initialData.categoryIds as any[]).map((catIdOrObj: any) => 
        typeof catIdOrObj === 'string' ? catIdOrObj : catIdOrObj._id
      ).filter(Boolean) as string[]
    : []

  // Initialize skillIds
  const initialSkillIds = initialData?.skillIds 
    ? (initialData.skillIds as any[]).map((skillIdOrObj: any) => 
        typeof skillIdOrObj === 'string' ? skillIdOrObj : skillIdOrObj._id
      ).filter(Boolean) as string[]
    : []

  // Initialize video items
  const [videoItems, setVideoItems] = useState<VideoItem[]>(() => {
    if (initialData?.videos && Array.isArray(initialData.videos)) {
      return initialData.videos.map((url, index) => ({
        url,
        description: initialData.videoDescriptions?.[index] || '',
        descriptionEn: initialData.videoDescriptionsEn?.[index] || '',
        descriptionJa: initialData.videoDescriptionsJa?.[index] || ''
      }))
    }
    return []
  })

  // Initialize form data
  const [formData, setFormData] = useState<any>(
    initialData ? {
      ...initialData,
      // Convert arrays to strings for textarea inputs
      technologies: Array.isArray(initialData.technologies) ? initialData.technologies.join('\n') : initialData.technologies || '',
      technologiesEn: Array.isArray(initialData.technologiesEn) ? initialData.technologiesEn.join('\n') : initialData.technologiesEn || '',
      technologiesJa: Array.isArray(initialData.technologiesJa) ? initialData.technologiesJa.join('\n') : initialData.technologiesJa || '',
      images: Array.isArray(initialData.images) ? initialData.images.join('\n') : initialData.images || '',
      features: Array.isArray(initialData.features) ? initialData.features.join('\n') : initialData.features || '',
      featuresEn: Array.isArray(initialData.featuresEn) ? initialData.featuresEn.join('\n') : initialData.featuresEn || '',
      featuresJa: Array.isArray(initialData.featuresJa) ? initialData.featuresJa.join('\n') : initialData.featuresJa || '',
      learnings: Array.isArray(initialData.learnings) ? initialData.learnings.join('\n') : initialData.learnings || '',
      learningsEn: Array.isArray(initialData.learningsEn) ? initialData.learningsEn.join('\n') : initialData.learningsEn || '',
      learningsJa: Array.isArray(initialData.learningsJa) ? initialData.learningsJa.join('\n') : initialData.learningsJa || '',
      skillIds: initialSkillIds,
      categoryIds: initialCategoryIds
    } : {
      title: '',
      titleEn: '',
      titleJa: '',
      description: '',
      descriptionEn: '',
      descriptionJa: '',
      technologies: '',
      technologiesEn: '',
      technologiesJa: '',
      category: 'automation',
      categoryIds: [],
      status: 'preparing',
      githubLink: '',
      liveLink: '',
      image: '',
      images: '',
      detailedDescription: '',
      detailedDescriptionEn: '',
      detailedDescriptionJa: '',
      features: '',
      featuresEn: '',
      featuresJa: '',
      learnings: '',
      learningsEn: '',
      learningsJa: '',
      order: 0,
      skillIds: []
    }
  )

  // Handle simple field change
  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }))
  }

  // Handle array field change (for TagInput or other array inputs)
  const handleArrayFieldChange = (key: string, value: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }))
  }

  // Video management functions
  const handleAddVideo = () => {
    setVideoItems([...videoItems, { url: '', description: '', descriptionEn: '', descriptionJa: '' }])
  }

  const handleRemoveVideo = (index: number) => {
    setVideoItems(videoItems.filter((_, i) => i !== index))
  }

  const handleVideoUrlChange = (index: number, url: string) => {
    const newVideoItems = [...videoItems]
    if (newVideoItems[index]) {
      newVideoItems[index].url = url
      setVideoItems(newVideoItems)
    }
  }

  const handleVideoDescriptionChange = (index: number, description: string, lang: 'ko' | 'en' | 'ja') => {
    const newVideoItems = [...videoItems]
    if (newVideoItems[index]) {
      if (lang === 'ko') {
        newVideoItems[index].description = description
      } else if (lang === 'en') {
        newVideoItems[index].descriptionEn = description
      } else if (lang === 'ja') {
        newVideoItems[index].descriptionJa = description
      }
      setVideoItems(newVideoItems)
    }
  }

  // Prepare data for submission
  const prepareDataForSubmit = (): any => {
    // Extract video data
    const videos = videoItems.map(item => item.url).filter(url => url.trim().length > 0)
    const videoDescriptions = videoItems.map(item => item.description)
    const videoDescriptionsEn = videoItems.map(item => item.descriptionEn)
    const videoDescriptionsJa = videoItems.map(item => item.descriptionJa)
    
    // Validate video descriptions length
    for (let i = 0; i < videoItems.length; i++) {
      const item = videoItems[i]
      if (item.description && item.description.length > 5000) {
        throw new Error(`영상 ${i + 1}의 한국어 설명이 너무 깁니다 (현재: ${item.description.length}자, 최대: 5000자)`)
      }
      if (item.descriptionEn && item.descriptionEn.length > 5000) {
        throw new Error(`영상 ${i + 1}의 영어 설명이 너무 깁니다 (현재: ${item.descriptionEn.length}자, 최대: 5000자)`)
      }
      if (item.descriptionJa && item.descriptionJa.length > 5000) {
        throw new Error(`영상 ${i + 1}의 일본어 설명이 너무 깁니다 (현재: ${item.descriptionJa.length}자, 최대: 5000자)`)
      }
    }
    
    // Process all array fields
    const processedData = {
      ...formData,
      // Technologies
      technologies: typeof formData.technologies === 'string' 
        ? formData.technologies.split(/[,\n]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.technologies || [],
      technologiesEn: typeof formData.technologiesEn === 'string'
        ? formData.technologiesEn.split(/[,\n]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.technologiesEn || [],
      technologiesJa: typeof formData.technologiesJa === 'string'
        ? formData.technologiesJa.split(/[,\n]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.technologiesJa || [],
      // Images
      images: typeof formData.images === 'string' 
        ? formData.images.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.images || [],
      // Videos
      videos,
      videoDescriptions,
      videoDescriptionsEn,
      videoDescriptionsJa,
      // Features
      features: typeof formData.features === 'string' 
        ? formData.features.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.features || [],
      featuresEn: typeof formData.featuresEn === 'string'
        ? formData.featuresEn.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.featuresEn || [],
      featuresJa: typeof formData.featuresJa === 'string'
        ? formData.featuresJa.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.featuresJa || [],
      // Learnings
      learnings: typeof formData.learnings === 'string' 
        ? formData.learnings.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.learnings || [],
      learningsEn: typeof formData.learningsEn === 'string'
        ? formData.learningsEn.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.learningsEn || [],
      learningsJa: typeof formData.learningsJa === 'string'
        ? formData.learningsJa.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : formData.learningsJa || [],
      // SkillIds (already array)
      skillIds: formData.skillIds || []
    }
    
    return processedData
  }

  return {
    formData,
    videoItems,
    currentLang,
    setCurrentLang,
    setFormData,
    setVideoItems,
    handleFieldChange,
    handleArrayFieldChange,
    handleVideoUrlChange,
    handleVideoDescriptionChange,
    handleAddVideo,
    handleRemoveVideo,
    prepareDataForSubmit
  }
}

