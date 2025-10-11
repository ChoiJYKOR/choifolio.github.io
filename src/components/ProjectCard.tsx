import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaGithub, FaExternalLinkAlt, FaImage } from 'react-icons/fa'
import { Project } from '../types'
import { useTranslation } from 'react-i18next'
import { getLocalizedField, getLocalizedArrayField } from '@/utils/i18nUtils'

interface ProjectCardProps {
  project: Project
  itemVariants: any // framer-motion variants 타입
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
}

// 기술 스택 최대 표시 개수 상수
const MAX_TECH_DISPLAY = 5

const ProjectCard: React.FC<ProjectCardProps> = ({ project, itemVariants, getStatusColor, getStatusText }) => {
  const { i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  // Get localized technologies
  const technologies = getLocalizedArrayField(
    currentLang,
    project.technologies,
    project.technologiesEn,
    project.technologiesJa
  )
  
  // 프로젝트 링크 존재 여부 확인
  const hasLinks = project.githubLink || project.liveLink

  return (
    <motion.div
      key={project._id}
      variants={itemVariants}
      // 레이아웃 변경 시 부드러운 전환을 위해 layout 속성 추가
      layout
      className="card overflow-hidden bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group"
    >
      <Link 
        to={`/projects/${project._id}`}
        state={{ scrollPosition: window.scrollY }}
        className="block flex flex-col h-full"
      >
      <div className="h-48 bg-cream-200 dark:bg-dark-700 flex items-center justify-center relative flex-shrink-0">
        {project.image ? (
          <img 
            src={project.image} 
            alt={`${project.title} 썸네일`} 
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            width="640"
            height="192"
          />
        ) : (
          <FaImage className="text-dark-400 dark:text-dark-500 text-5xl" />
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-dark-900 dark:text-cream-100 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {getLocalizedField(currentLang, project.title, project.titleEn, project.titleJa)}
        </h3>
        <p className="text-dark-600 dark:text-dark-300 mb-6 leading-relaxed flex-grow">
          {getLocalizedField(currentLang, project.description, project.descriptionEn, project.descriptionJa)}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.slice(0, MAX_TECH_DISPLAY).map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-coffee-50 dark:bg-coffee-900 text-coffee-700 dark:text-coffee-300 rounded-lg text-sm font-medium"
            >
              {tech}
            </span>
          ))}
          {technologies.length > MAX_TECH_DISPLAY && (
            <span className="px-3 py-1 bg-cream-200 dark:bg-dark-700 text-dark-500 dark:text-dark-400 rounded-lg text-sm font-medium">
              외 {technologies.length - MAX_TECH_DISPLAY}개
            </span>
          )}
        </div>
        <div 
          className="flex flex-wrap gap-4 pt-4 border-t border-cream-200 dark:border-dark-700"
          onClick={(e) => e.stopPropagation()}
        >
          {hasLinks ? (
            <>
              {project.liveLink && (
                <a 
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 
                    ${project.status === 'completed' 
                      ? 'bg-coffee-600 text-white hover:bg-coffee-700 shadow-md'
                      : 'bg-cream-200 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-cream-300 dark:hover:bg-dark-600'
                    }`}
                  aria-label={`${project.title} 라이브 데모 보기`}
                >
                  <FaExternalLinkAlt size={16} />
                  라이브 보기
                </a>
              )}
              {project.githubLink && (
                <a 
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 bg-white dark:bg-dark-900 text-dark-600 dark:text-dark-300 hover:bg-cream-100 dark:hover:bg-dark-700 border border-cream-200 dark:border-dark-700"
                  aria-label={`${project.title} GitHub 레포지토리`}
                >
                  <FaGithub size={20} />
                  GitHub
                </a>
              )}
            </>
          ) : null}
        </div>
      </div>
      </Link>
    </motion.div>
  )
}

export default ProjectCard
