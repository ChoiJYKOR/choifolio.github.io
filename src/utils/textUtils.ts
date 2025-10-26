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
export const escapeHtml = (text: string | any): string => {
  if (!text) return ''
  
  // 문자열이 아니면 문자열로 변환
  const textStr = typeof text === 'string' ? text : String(text)
  
  return textStr
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

/**
 * Editor.js OutputData를 HTML로 렌더링
 * @param data - OutputData 또는 JSON 문자열
 * @returns HTML 문자열
 */
export const renderEditorJSData = (data: string | any): string => {
  if (!data) return ''
  
  let outputData: any
  if (typeof data === 'string') {
    try {
      outputData = JSON.parse(data)
    } catch {
      // 파싱 실패 시 빈 문자열 반환
      return ''
    }
  } else {
    outputData = data
  }
  
  if (!outputData.blocks || !Array.isArray(outputData.blocks)) {
    return ''
  }
  
  let html = ''
  for (const block of outputData.blocks) {
    switch (block.type) {
      case 'paragraph':
        const paragraphText = block.data?.text || ''
        // <br> 태그를 실제 줄바꿈으로 변환
        const processedText = paragraphText.replace(/<br\s*\/?>/gi, '\n')
        // 줄바꿈을 <br>로 변환
        const finalText = processedText.split('\n').map(line => escapeHtml(line)).join('<br>')
        html += `<p class="mb-4">${finalText}</p>`
        break
      case 'header':
        const level = block.data?.level || 2
        let headerText = block.data?.text || ''
        // <br> 태그를 실제 줄바꿈으로 변환
        headerText = headerText.replace(/<br\s*\/?>/gi, '\n')
        // 줄바꿈을 <br>로 변환
        const finalHeaderText = headerText.split('\n').map(line => escapeHtml(line)).join('<br>')
        html += `<h${level} class="font-bold text-gray-900 dark:text-white mb-2 mt-4">${finalHeaderText}</h${level}>`
        break
      case 'list':
        const items = block.data?.items || []
        const listClass = block.data?.style === 'ordered' ? 'list-decimal' : 'list-disc'
        html += `<ul class="${listClass} ml-6 mb-4">`
        for (const item of items) {
          // Editor.js list format 확인
          let itemText: string
          if (typeof item === 'string') {
            itemText = item
          } else if (typeof item === 'object' && item !== null) {
            // 다양한 객체 형태 체크
            if ((item as any).text) {
              itemText = (item as any).text
            } else if ((item as any).content) {
              itemText = (item as any).content
            } else if (Array.isArray(item)) {
              itemText = item.join(', ')
            } else {
              itemText = JSON.stringify(item)
            }
          } else {
            itemText = String(item)
          }
          // <br> 태그를 실제 줄바꿈으로 변환
          itemText = itemText.replace(/<br\s*\/?>/gi, '\n')
          // 줄바꿈을 <br>로 변환
          itemText = itemText.split('\n').map(line => escapeHtml(line)).join('<br>')
          html += `<li class="mb-2">${itemText}</li>`
        }
        html += `</ul>`
        break
      case 'code':
        html += `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">${escapeHtml(block.data?.code || '')}</code></pre>`
        break
      case 'toggle':
        const toggleTitle = escapeHtml(block.data?.title || '제목 없음')
        let toggleContent = block.data?.content || ''
        
        // editorjs-toggle-block의 content는 블록 배열로 저장됨
        if (Array.isArray(toggleContent) && toggleContent.length > 0) {
          // toggle 내부의 블록들을 렌더링
          const toggleOutputData = { blocks: toggleContent }
          toggleContent = renderEditorJSData(toggleOutputData)
        } else if (typeof toggleContent === 'string') {
          // 문자열인 경우도 처리
          toggleContent = toggleContent.replace(/<br\s*\/?>/gi, '\n')
          toggleContent = toggleContent.split('\n').map(line => escapeHtml(line)).join('<br>')
        } else if (typeof toggleContent === 'object' && toggleContent !== null && toggleContent.blocks) {
          // block.data.content가 이미 OutputData 형태인 경우
          toggleContent = renderEditorJSData(toggleContent)
        } else {
          toggleContent = ''
        }
        
        // toggle block의 content는 이미 HTML로 저장되어 있으므로 그대로 사용
        // toggle data에 isCollapsed가 있으면 closed 상태로 시작
        const isCollapsed = block.data?.isCollapsed === true
        const openAttr = isCollapsed ? '' : ' open'
        html += `<details${openAttr} class="my-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <summary class="px-4 py-2 cursor-pointer font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span class="flex items-center gap-2">${toggleTitle}</span>
          </summary>
          <div class="px-4 py-3 prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            ${toggleContent}
          </div>
        </details>`
        break
      case 'image':
        const url = block.data?.file?.url || block.data?.url || ''
        const caption = block.data?.caption || ''
        html += `<div class="my-4">
          <img src="${url}" alt="${escapeHtml(caption)}" class="max-w-full rounded-lg" />
          ${caption ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${escapeHtml(caption)}</p>` : ''}
        </div>`
        break
      default:
        // 알 수 없는 블록 타입은 무시
        break
    }
  }
  
  return html
}

/**
 * Lexical EditorState를 HTML로 렌더링
 * @param data - Lexical의 SerializedEditorState 또는 JSON 문자열
 * @returns HTML 문자열
 */
export const renderLexicalData = (data: string | any): string => {
  if (!data) return ''
  
  let lexicalData: any
  if (typeof data === 'string') {
    try {
      lexicalData = JSON.parse(data)
    } catch {
      return ''
    }
  } else {
    lexicalData = data
  }
  
  if (!lexicalData?.root || !Array.isArray(lexicalData.root.children)) {
    return ''
  }
  
  let html = ''
  
  const renderNode = (node: any): string => {
    switch (node.type) {
      case 'paragraph':
        const text = node.children?.map((child: any) => {
          if (child.type === 'text') {
            let textContent = child.text || ''
            // <br> 태그를 실제 줄바꿈으로 변환
            textContent = textContent.replace(/<br\s*\/?>/gi, '\n')
            // 줄바꿈을 <br>로 변환
            return textContent.split('\n').map(line => escapeHtml(line)).join('<br>')
          }
          if (child.type === 'link') {
            const href = child.url || ''
            const content = child.children?.map((c: any) => c.text).join('') || ''
            return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${escapeHtml(content)}</a>`
          }
          return ''
        }).join('') || ''
        return `<p class="mb-4">${text}</p>`
        
      case 'heading':
        const level = node.tag || 'h2'
        const headingText = node.children?.map((child: any) => {
          if (child.type === 'text') {
            let textContent = child.text || ''
            textContent = textContent.replace(/<br\s*\/?>/gi, '\n')
            return textContent.split('\n').map(line => escapeHtml(line)).join('<br>')
          }
          return ''
        }).join('') || ''
        return `<h${level.slice(1)} class="font-bold text-gray-900 dark:text-white mb-2 mt-4">${headingText}</h${level.slice(1)}>`
        
      case 'list':
        const listType = node.listType === 'number' ? 'ol' : 'ul'
        const items = node.children || []
        let listHtml = `<${listType} class="${listType === 'ol' ? 'list-decimal' : 'list-disc'} ml-6 mb-4">`
        for (const item of items) {
          const itemText = item.children?.map((child: any) => {
            if (child.type === 'text') {
              let textContent = child.text || ''
              textContent = textContent.replace(/<br\s*\/?>/gi, '\n')
              return textContent.split('\n').map(line => escapeHtml(line)).join('<br>')
            }
            return ''
          }).join('') || ''
          listHtml += `<li class="mb-2">${itemText}</li>`
        }
        listHtml += `</${listType}>`
        return listHtml
        
      case 'quote':
        const quoteText = node.children?.map((child: any) => {
          if (child.type === 'text') {
            let textContent = child.text || ''
            textContent = textContent.replace(/<br\s*\/?>/gi, '\n')
            return textContent.split('\n').map(line => escapeHtml(line)).join('<br>')
          }
          return ''
        }).join('') || ''
        return `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300">${quoteText}</blockquote>`
        
      case 'code':
        const codeText = node.text || ''
        return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">${escapeHtml(codeText)}</code></pre>`
        
      case 'collapsible':
        const title = node.title || '제목 없음'
        const isOpen = node.open || false
        const content = node.children?.map(renderNode).join('') || ''
        const openAttr = isOpen ? ' open' : ''
        return `<details${openAttr} class="my-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <summary class="px-4 py-2 cursor-pointer font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
            ${escapeHtml(title)}
          </summary>
          <div class="px-4 py-3 prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            ${content}
          </div>
        </details>`
        
      case 'image':
        const src = node.src || ''
        const alt = node.altText || ''
        return `<div class="my-4">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="max-w-full rounded-lg" />
        </div>`
        
      default:
        return ''
    }
  }
  
  for (const child of lexicalData.root.children) {
    html += renderNode(child)
  }
  
  return html
}

/**
 * 데이터가 Lexical 형식인지 확인
 */
export const isLexicalData = (data: any): boolean => {
  return data?.root && Array.isArray(data?.root?.children)
}
