import { useState, useEffect } from 'react'
import { Project, ProjectFormData } from '../types'
import { AdminLanguage } from '../components/common/LanguageTabs'
import { SerializedEditorState } from 'lexical'

// Video item type with multilingual descriptions
export interface VideoItem {
  url: string
  description: string | SerializedEditorState | null
  descriptionEn: string | SerializedEditorState | null
  descriptionJa: string | SerializedEditorState | null
}

// Image item type with multilingual descriptions
export interface ImageItem {
  url: string
  description: string | SerializedEditorState | null
  descriptionEn: string | SerializedEditorState | null
  descriptionJa: string | SerializedEditorState | null
}

interface UseProjectFormReturn {
  formData: any
  videoItems: VideoItem[]
  imageItems: ImageItem[]
  currentLang: AdminLanguage
  setCurrentLang: (lang: AdminLanguage) => void
  setFormData: React.Dispatch<React.SetStateAction<any>>
  setVideoItems: React.Dispatch<React.SetStateAction<VideoItem[]>>
  setImageItems: React.Dispatch<React.SetStateAction<ImageItem[]>>
  handleFieldChange: (key: string, value: any) => void
  handleArrayFieldChange: (key: string, value: string[]) => void
  handleVideoUrlChange: (index: number, url: string) => void
  handleVideoDescriptionChange: (index: number, description: string | SerializedEditorState, lang: 'ko' | 'en' | 'ja') => void
  handleAddVideo: () => void
  handleRemoveVideo: (index: number) => void
  handleImageUrlChange: (index: number, url: string) => void
  handleImageDescriptionChange: (index: number, description: string | SerializedEditorState, lang: 'ko' | 'en' | 'ja') => void
  handleAddImage: () => void
  handleRemoveImage: (index: number) => void
  prepareDataForSubmit: () => any
}

/**
 * Custom hook for ProjectForm
 * Handles all form state management, data initialization, and preparation for submission
 */
// Lexical 데이터 파싱 함수
const parseLexicalField = (value: string | undefined): SerializedEditorState | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null
  }
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (parsed && parsed.root && parsed.root.type === 'root') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

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
        description: parseLexicalField(initialData.videoDescriptions?.[index]),
        descriptionEn: parseLexicalField(initialData.videoDescriptionsEn?.[index]),
        descriptionJa: parseLexicalField(initialData.videoDescriptionsJa?.[index])
      }))
    }
    return []
  })

  // Initialize image items
  const [imageItems, setImageItems] = useState<ImageItem[]>(() => {
    if (initialData?.images && Array.isArray(initialData.images)) {
      const items = initialData.images.map((url, index) => ({
        url,
        description: parseLexicalField(initialData.imageDescriptions?.[index]),
        descriptionEn: parseLexicalField(initialData.imageDescriptionsEn?.[index]),
        descriptionJa: parseLexicalField(initialData.imageDescriptionsJa?.[index])
      }))
      console.log('🖼️ ImageItems 초기화:', {
        images: initialData.images,
        imageDescriptions: initialData.imageDescriptions,
        imageDescriptionsEn: initialData.imageDescriptionsEn,
        imageDescriptionsJa: initialData.imageDescriptionsJa,
        items
      })
      return items
    }
    return []
  })
  
  // 🌟 initialData가 변경될 때 imageItems와 videoItems 업데이트
  useEffect(() => {
    if (initialData) {
      console.log('🔄 initialData 변경됨, imageItems/videoItems 업데이트:', initialData)
      
      // Video items 업데이트
      if (initialData.videos && Array.isArray(initialData.videos)) {
        const updatedVideoItems = initialData.videos.map((url, index) => ({
          url,
          description: parseLexicalField(initialData.videoDescriptions?.[index]),
          descriptionEn: parseLexicalField(initialData.videoDescriptionsEn?.[index]),
          descriptionJa: parseLexicalField(initialData.videoDescriptionsJa?.[index])
        }))
        console.log('📹 VideoItems 업데이트:', updatedVideoItems)
        setVideoItems(updatedVideoItems)
      }
      
      // Image items 업데이트
      if (initialData.images && Array.isArray(initialData.images)) {
        const updatedImageItems = initialData.images.map((url, index) => ({
          url,
          description: parseLexicalField(initialData.imageDescriptions?.[index]),
          descriptionEn: parseLexicalField(initialData.imageDescriptionsEn?.[index]),
          descriptionJa: parseLexicalField(initialData.imageDescriptionsJa?.[index])
        }))
        console.log('🖼️ ImageItems 업데이트:', updatedImageItems)
        setImageItems(updatedImageItems)
      }
    }
  }, [initialData])

  // Initialize form data
  const [formData, setFormData] = useState<any>(
    initialData ? {
      ...initialData,
      // Convert arrays to strings for textarea inputs
      technologies: Array.isArray(initialData.technologies) ? initialData.technologies.join('\n') : initialData.technologies || '',
      technologiesEn: Array.isArray(initialData.technologiesEn) ? initialData.technologiesEn.join('\n') : initialData.technologiesEn || '',
      technologiesJa: Array.isArray(initialData.technologiesJa) ? initialData.technologiesJa.join('\n') : initialData.technologiesJa || '',
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

  const handleVideoDescriptionChange = (index: number, description: string | SerializedEditorState, lang: 'ko' | 'en' | 'ja') => {
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

  // Image management functions
  const handleAddImage = () => {
    setImageItems([...imageItems, { url: '', description: '', descriptionEn: '', descriptionJa: '' }])
  }

  const handleRemoveImage = (index: number) => {
    setImageItems(imageItems.filter((_, i) => i !== index))
  }

  const handleImageUrlChange = (index: number, url: string) => {
    const newImageItems = [...imageItems]
    if (newImageItems[index]) {
      newImageItems[index].url = url
      setImageItems(newImageItems)
    }
  }

  const handleImageDescriptionChange = (index: number, description: string | SerializedEditorState, lang: 'ko' | 'en' | 'ja') => {
    const newImageItems = [...imageItems]
    if (newImageItems[index]) {
      if (lang === 'ko') {
        newImageItems[index].description = description
      } else if (lang === 'en') {
        newImageItems[index].descriptionEn = description
      } else if (lang === 'ja') {
        newImageItems[index].descriptionJa = description
      }
      setImageItems(newImageItems)
    }
  }

  // Prepare data for submission
  const prepareDataForSubmit = (): any => {
    // Extract video data
    const videos = videoItems.map(item => item.url).filter(url => url.trim().length > 0)
    const videoDescriptions = videoItems.map(item => {
      // SerializedEditorState 객체인 경우 JSON 문자열로 변환
      if (item.description && typeof item.description === 'object') {
        return JSON.stringify(item.description)
      }
      return item.description || ''
    })
    const videoDescriptionsEn = videoItems.map(item => {
      if (item.descriptionEn && typeof item.descriptionEn === 'object') {
        return JSON.stringify(item.descriptionEn)
      }
      return item.descriptionEn || ''
    })
    const videoDescriptionsJa = videoItems.map(item => {
      if (item.descriptionJa && typeof item.descriptionJa === 'object') {
        return JSON.stringify(item.descriptionJa)
      }
      return item.descriptionJa || ''
    })
    
    // Extract image data
    const images = imageItems.map(item => item.url).filter(url => url.trim().length > 0)
    const imageDescriptions = imageItems.map(item => {
      // SerializedEditorState 객체인 경우 JSON 문자열로 변환
      if (item.description && typeof item.description === 'object') {
        return JSON.stringify(item.description)
      }
      return item.description || ''
    })
    const imageDescriptionsEn = imageItems.map(item => {
      if (item.descriptionEn && typeof item.descriptionEn === 'object') {
        return JSON.stringify(item.descriptionEn)
      }
      return item.descriptionEn || ''
    })
    const imageDescriptionsJa = imageItems.map(item => {
      if (item.descriptionJa && typeof item.descriptionJa === 'object') {
        return JSON.stringify(item.descriptionJa)
      }
      return item.descriptionJa || ''
    })
    
    console.log('💾 이미지 데이터 준비:', {
      images,
      imageDescriptions,
      imageDescriptionsEn,
      imageDescriptionsJa,
      imageItems
    })
    
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
    
    // Validate image descriptions length
    for (let i = 0; i < imageItems.length; i++) {
      const item = imageItems[i]
      if (item.description && item.description.length > 5000) {
        throw new Error(`이미지 ${i + 1}의 한국어 설명이 너무 깁니다 (현재: ${item.description.length}자, 최대: 5000자)`)
      }
      if (item.descriptionEn && item.descriptionEn.length > 5000) {
        throw new Error(`이미지 ${i + 1}의 영어 설명이 너무 깁니다 (현재: ${item.descriptionEn.length}자, 최대: 5000자)`)
      }
      if (item.descriptionJa && item.descriptionJa.length > 5000) {
        throw new Error(`이미지 ${i + 1}의 일본어 설명이 너무 깁니다 (현재: ${item.descriptionJa.length}자, 최대: 5000자)`)
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
      images,
      imageDescriptions,
      imageDescriptionsEn,
      imageDescriptionsJa,
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
    imageItems,
    currentLang,
    setCurrentLang,
    setFormData,
    setVideoItems,
    setImageItems,
    handleFieldChange,
    handleArrayFieldChange,
    handleVideoUrlChange,
    handleVideoDescriptionChange,
    handleAddVideo,
    handleRemoveVideo,
    handleImageUrlChange,
    handleImageDescriptionChange,
    handleAddImage,
    handleRemoveImage,
    prepareDataForSubmit
  }
}

