/**
 * 텍스트 포맷팅 및 마크다운 관련 유틸리티 함수들
 */
import React from 'react'

/**
 * 마크다운 스타일 텍스트를 HTML로 변환 (정밀한 버전)
 * @param text - 마크다운 스타일의 텍스트
 * @returns HTML 문자열
 */
export const parseMarkdown = (text: string): string => {
  if (!text) return ''
  
  return text
    // 코드 블록: ```code``` (먼저 처리하여 다른 마크다운과 충돌 방지)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
    
    // 인라인 코드: `code` (코드 블록 처리 후)
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // 볼드체: **text** 또는 __text__ (이탤릭체보다 먼저 처리)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // 이탤릭체: *text* 또는 _text_ (볼드체 처리 후, 경계 명확화)
    .replace(/(^|[^*])\*([^*\s][^*]*[^*\s]|[^*\s])\*([^*]|$)/g, '$1<em>$2</em>$3')
    .replace(/(^|[^_])\_([^_\s][^_]*[^_\s]|[^_\s])\_([^_]|$)/g, '$1<em>$2</em>$3')
    
    // 링크: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // 헤더: # ## ###
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">$1</h1>')
    
    // 목록: - item 또는 * item
    .replace(/^[\s]*[-*] (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li class="ml-4">.*<\/li>)/s, '<ul class="list-disc list-inside my-2">$1</ul>')
    
    // 블록 인용: > quote
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')
    
    // 수평선: ---
    .replace(/^---$/gm, '<hr class="border-gray-300 dark:border-gray-600 my-4">')
    
    // 줄바꿈을 <br>로 변환 (마지막에 처리)
    .replace(/\n/g, '<br>')
}

/**
 * 텍스트를 안전하게 HTML로 렌더링하기 위한 함수
 * @param text - 변환할 텍스트
 * @returns JSX 요소
 */
export const renderFormattedText = (text: string): React.ReactElement => {
  const htmlContent = parseMarkdown(text)
  
  return React.createElement('div', {
    className: "text-gray-600 dark:text-gray-300 leading-relaxed",
    dangerouslySetInnerHTML: { __html: htmlContent }
  })
}

/**
 * 텍스트 길이에 따라 요약본 생성
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이
 * @returns 요약된 텍스트
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * 텍스트에서 해시태그 추출
 * @param text - 검색할 텍스트
 * @returns 해시태그 배열
 */
export const extractHashtags = (text: string): string[] => {
  if (!text) return []
  
  const hashtagRegex = /#[\w가-힣]+/g
  const matches = text.match(hashtagRegex)
  
  return matches ? matches.map(tag => tag.substring(1)) : []
}

/**
 * 텍스트에서 멘션(@username) 추출
 * @param text - 검색할 텍스트
 * @returns 멘션 배열
 */
export const extractMentions = (text: string): string[] => {
  if (!text) return []
  
  const mentionRegex = /@[\w가-힣]+/g
  const matches = text.match(mentionRegex)
  
  return matches ? matches.map(mention => mention.substring(1)) : []
}

/**
 * 텍스트를 읽기 시간으로 변환 (분 단위)
 * @param text - 텍스트
 * @param wordsPerMinute - 분당 읽는 단어 수 (기본값: 200)
 * @returns 읽기 시간 (분)
 */
export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  if (!text) return 0
  
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  
  return Math.max(1, minutes) // 최소 1분
}

/**
 * 읽기 시간을 포맷팅하여 표시 문자열로 변환
 * @param minutes - 읽기 시간 (분)
 * @returns 표시 문자열 (예: "5분 읽기")
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes === 0) return '읽기 시간 없음'
  if (minutes === 1) return '1분 읽기'
  return `${minutes}분 읽기`
}

/**
 * 텍스트에서 읽기 시간을 계산하고 포맷팅
 * @param text - 텍스트
 * @param wordsPerMinute - 분당 읽는 단어 수 (기본값: 200)
 * @returns 포맷팅된 읽기 시간 문자열
 */
export const getFormattedReadingTime = (text: string, wordsPerMinute: number = 200): string => {
  const minutes = calculateReadingTime(text, wordsPerMinute)
  return formatReadingTime(minutes)
}

/**
 * 텍스트에서 단어 수를 계산
 * @param text - 텍스트
 * @returns 단어 수
 */
export const getWordCount = (text: string): number => {
  if (!text) return 0
  return text.trim().split(/\s+/).length
}

/**
 * 텍스트에서 문자 수를 계산 (공백 포함/제외)
 * @param text - 텍스트
 * @param includeSpaces - 공백 포함 여부 (기본값: true)
 * @returns 문자 수
 */
export const getCharacterCount = (text: string, includeSpaces: boolean = true): number => {
  if (!text) return 0
  return includeSpaces ? text.length : text.replace(/\s/g, '').length
}

/**
 * 텍스트에서 문장 수를 계산
 * @param text - 텍스트
 * @returns 문장 수
 */
export const getSentenceCount = (text: string): number => {
  if (!text) return 0
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
  return sentences.length
}

/**
 * 텍스트의 가독성 점수를 계산 (간단한 버전)
 * @param text - 텍스트
 * @returns 가독성 점수 (0-100, 높을수록 읽기 쉬움)
 */
export const calculateReadabilityScore = (text: string): number => {
  if (!text) return 0
  
  const words = getWordCount(text)
  const sentences = getSentenceCount(text)
  const characters = getCharacterCount(text, false)
  
  if (words === 0 || sentences === 0) return 0
  
  // 간단한 가독성 공식 (Flesch Reading Ease 기반)
  const avgWordsPerSentence = words / sentences
  const avgSyllablesPerWord = characters / words * 0.5 // 근사치
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * 텍스트를 안전하게 HTML 이스케이프 처리
 * @param text - 이스케이프할 텍스트
 * @returns 이스케이프된 HTML 문자열
 */
export const escapeHtml = (text: string): string => {
  if (!text) return ''
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 텍스트에서 URL을 자동으로 링크로 변환
 * @param text - 텍스트
 * @returns URL이 링크로 변환된 텍스트
 */
export const autoLinkUrls = (text: string): string => {
  if (!text) return ''
  
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, '<a href="$1" class="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
}

/**
 * 텍스트에서 이메일 주소를 자동으로 링크로 변환
 * @param text - 텍스트
 * @returns 이메일이 링크로 변환된 텍스트
 */
export const autoLinkEmails = (text: string): string => {
  if (!text) return ''
  
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  return text.replace(emailRegex, '<a href="mailto:$1" class="text-primary-600 hover:text-primary-700 underline">$1</a>')
}

/**
 * 텍스트를 완전히 포맷팅 (마크다운 + 자동 링크)
 * @param text - 포맷팅할 텍스트
 * @returns 완전히 포맷팅된 HTML 문자열
 */
export const formatTextCompletely = (text: string): string => {
  if (!text) return ''
  
  // 마크다운 파싱
  let formatted = parseMarkdown(text)
  // 자동 URL 링크
  formatted = autoLinkUrls(formatted)
  // 자동 이메일 링크
  formatted = autoLinkEmails(formatted)
  
  return formatted
}
