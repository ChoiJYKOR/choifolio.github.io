import React, { useState } from 'react'
import { FaBook, FaImage } from 'react-icons/fa'

interface BookCoverImageProps {
  src?: string
  alt: string
  className?: string
  fallbackIcon?: React.ReactNode
}

/**
 * 책 커버 이미지 컴포넌트
 * - 지연 로딩 지원
 * - 로딩 상태 표시
 * - 오류 시 대체 아이콘 표시
 */
const BookCoverImage: React.FC<BookCoverImageProps> = ({
  src,
  alt,
  className = "w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300",
  fallbackIcon
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [imageSrc, setImageSrc] = useState(src)

  const handleImageLoad = () => {
    setImageState('loaded')
  }

  const handleImageError = () => {
    setImageState('error')
    setImageSrc(undefined)
  }

  // 이미지가 없거나 오류가 발생한 경우 대체 아이콘 표시
  if (!imageSrc || imageState === 'error') {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
        {fallbackIcon || <FaBook className="text-white text-6xl" />}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* 로딩 상태 스켈레톤 */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <FaImage className="text-gray-400 text-4xl" />
        </div>
      )}
      
      {/* 실제 이미지 */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${imageState === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        width="400"
        height="256"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  )
}

export default BookCoverImage
