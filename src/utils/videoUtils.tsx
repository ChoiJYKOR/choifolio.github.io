// =================================================================
// 📹 유튜브 영상 관련 유틸리티 함수
// =================================================================

/**
 * 다양한 유튜브 URL 형식에서 영상 ID 추출
 * @param url - 유튜브 URL
 * @returns 영상 ID 또는 null
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null
  
  // 다양한 유튜브 URL 패턴
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,  // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,  // https://youtu.be/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,  // https://www.youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,  // https://www.youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,  // https://www.youtube.com/v/VIDEO_ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

/**
 * 유튜브 영상 ID로 고해상도 썸네일 URL 생성
 * @param videoId - 유튜브 영상 ID
 * @param quality - 썸네일 품질 (maxresdefault, hqdefault, mqdefault, sddefault)
 * @returns 썸네일 URL
 */
export const getYouTubeThumbnail = (videoId: string, quality: string = 'maxresdefault'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * 유튜브 임베드 URL 생성 (타임스탬프 지원, 전문성 최적화)
 * @param videoId - 유튜브 영상 ID
 * @param startTime - 시작 시간 (초 단위)
 * @param autoplay - 자동 재생 여부 (기본값: false)
 * @returns 임베드 URL
 */
export const getYouTubeEmbedUrl = (videoId: string, startTime?: number, autoplay: boolean = false): string => {
  const baseUrl = `https://www.youtube.com/embed/${videoId}`
  const params = new URLSearchParams()
  
  if (startTime !== undefined && startTime > 0) {
    params.append('start', startTime.toString())
  }
  
  if (autoplay) {
    params.append('autoplay', '1')
  }
  
  // 🌟 전문성을 위한 플레이어 최적화 파라미터
  params.append('rel', '0')  // 관련 영상 추천 비활성화
  params.append('modestbranding', '1')  // 유튜브 로고 최소화 & '동영상 더보기' 툴팁 제거
  params.append('iv_load_policy', '3')  // 영상 주석(annotations) 비활성화
  params.append('showinfo', '0')  // 영상 정보 표시 최소화
  params.append('fs', '1')  // 전체 화면 버튼 표시
  params.append('cc_load_policy', '0')  // 자막 자동 로드 비활성화
  params.append('controls', '1')  // 컨트롤러 표시
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * 텍스트에서 타임스탬프 패턴 추출 및 초 단위 변환
 * @param text - 타임스탬프를 포함한 텍스트
 * @returns 타임스탬프 정보 배열 [{ text: '[1:30]', seconds: 90, position: 10 }]
 */
export interface TimestampMatch {
  text: string  // 원본 텍스트 (예: '[1:30]')
  seconds: number  // 초 단위 시간
  position: number  // 텍스트 내 위치
}

export const parseTimestamps = (text: string): TimestampMatch[] => {
  if (!text) return []
  
  // 타임스탬프 패턴: [MM:SS] 또는 [H:MM:SS]
  const pattern = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g
  const matches: TimestampMatch[] = []
  
  let match
  while ((match = pattern.exec(text)) !== null) {
    const hours = match[3] ? parseInt(match[1], 10) : 0
    const minutes = match[3] ? parseInt(match[2], 10) : parseInt(match[1], 10)
    const seconds = match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10)
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    
    matches.push({
      text: match[0],
      seconds: totalSeconds,
      position: match.index,
    })
  }
  
  return matches
}

/**
 * 타임스탬프가 포함된 텍스트를 클릭 가능한 링크로 변환
 * @param text - 원본 텍스트
 * @param onTimestampClick - 타임스탬프 클릭 핸들러
 * @returns JSX 요소 배열
 */
export const renderTextWithTimestamps = (
  text: string,
  onTimestampClick?: (seconds: number) => void
): (string | JSX.Element)[] => {
  if (!text) return []
  
  const timestamps = parseTimestamps(text)
  if (timestamps.length === 0) return [text]
  
  const result: (string | JSX.Element)[] = []
  let lastIndex = 0
  
  timestamps.forEach((ts, idx) => {
    // 타임스탬프 이전 텍스트 추가
    if (ts.position > lastIndex) {
      result.push(text.substring(lastIndex, ts.position))
    }
    
    // 타임스탬프를 클릭 가능한 버튼으로 추가
    if (onTimestampClick) {
      result.push(
        <button
          key={`ts-${idx}`}
          onClick={() => onTimestampClick(ts.seconds)}
          className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-xs font-bold transition-colors mx-1"
          title={`영상 ${ts.text} 위치로 이동`}
        >
          {ts.text}
        </button>
      )
    } else {
      result.push(
        <span key={`ts-${idx}`} className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs font-bold mx-1">
          {ts.text}
        </span>
      )
    }
    
    lastIndex = ts.position + ts.text.length
  })
  
  // 마지막 타임스탬프 이후 텍스트 추가
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }
  
  return result
}

/**
 * 유튜브 URL 유효성 검사
 * @param url - 검증할 URL
 * @returns 유효한 유튜브 URL 여부
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  if (!url) return false
  return extractYouTubeId(url) !== null
}

/**
 * 유튜브 재생 목록 ID 추출
 * @param url - 유튜브 재생 목록 URL
 * @returns 재생 목록 ID 또는 null
 */
export const extractYouTubePlaylistId = (url: string): string | null => {
  if (!url) return null
  
  // 재생 목록 URL 패턴
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]{13,})/,  // ?list=PLAYLIST_ID 또는 &list=PLAYLIST_ID
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]{13,})/,  // playlist 전용 URL
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

/**
 * 유튜브 재생 목록 임베드 URL 생성
 * @param playlistId - 유튜브 재생 목록 ID
 * @param startVideoId - 시작할 영상 ID (선택사항)
 * @returns 재생 목록 임베드 URL
 */
export const getYouTubePlaylistEmbedUrl = (playlistId: string, startVideoId?: string): string => {
  const params = new URLSearchParams()
  
  params.append('list', playlistId)
  params.append('rel', '0')
  params.append('modestbranding', '1')
  params.append('iv_load_policy', '3')
  params.append('showinfo', '0')
  params.append('fs', '1')
  params.append('cc_load_policy', '0')
  params.append('controls', '1')
  params.append('enablejsapi', '1')
  
  if (startVideoId) {
    // 특정 영상부터 시작
    return `https://www.youtube.com/embed/${startVideoId}?${params.toString()}`
  } else {
    // 재생 목록 첫 영상부터 시작
    return `https://www.youtube.com/embed?${params.toString()}`
  }
}

/**
 * 유튜브 재생 목록 썸네일 URL 생성
 * @param playlistId - 유튜브 재생 목록 ID
 * @returns 썸네일 URL
 */
export const getYouTubePlaylistThumbnail = (playlistId: string): string => {
  // 재생 목록 썸네일은 특정 API를 통해서만 가능하므로
  // 대신 첫 번째 영상의 썸네일을 사용하거나 기본 이미지 사용
  return `https://i.ytimg.com/vi//hqdefault.jpg` // 플레이스홀더
}

/**
 * 마크다운을 HTML로 변환
 * @param markdown - 마크다운 텍스트
 * @returns HTML 문자열
 */
export const renderMarkdown = (markdown: string): string => {
  if (!markdown) return ''
  
  return markdown
    // 제목
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h1>')
    // 볼드
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // 이탤릭
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // 밑줄
    .replace(/__(.*?)__/g, '<u class="underline">$1</u>')
    // 인라인 코드
    .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-600 text-red-600 dark:text-red-400 px-1 rounded text-sm">$1</code>')
    // 토글
    .replace(/^▶ (.*$)/gim, '<div class="flex items-center mt-2 mb-1"><span class="mr-2">▶</span><span class="font-medium text-gray-900 dark:text-white">$1</span></div>')
    // 불릿 리스트
    .replace(/^[\s]*[-*+]\s(.*$)/gim, '<div class="ml-4 mb-1"><span class="mr-2">•</span>$1</div>')
    // 숫자 리스트
    .replace(/^[\s]*\d+\.\s(.*$)/gim, '<div class="ml-4 mb-1"><span class="mr-2">1.</span>$1</div>')
    // 코드 블록
    .replace(/```(.*?)\n([\s\S]*?)\n```/gim, (_match, p1, p2) => {
      const lang = p1 ? `language-${p1.trim()}` : ''
      return `<pre class="bg-gray-800 p-3 rounded-lg overflow-x-auto my-3"><code class="${lang} text-sm text-gray-100">${p2.trim()}</code></pre>`
    })
    // 줄바꿈
    .replace(/\n/g, '<br>')
}

/**
 * 마크다운을 HTML로 변환하고 타임스탬프를 클릭 가능한 버튼으로 변환
 * @param markdown - 마크다운 형식의 콘텐츠
 * @param onTimestampClick - 타임스탬프 클릭 핸들러
 * @returns 변환된 HTML 문자열
 */
export const renderHtmlWithTimestamps = (
  markdown: string,
  onTimestampClick?: (seconds: number) => void
): string => {
  if (!markdown) return ''
  
  // 1단계: 마크다운을 HTML로 변환
  let html = renderMarkdown(markdown)
  
  // 2단계: 타임스탬프를 버튼으로 변환
  const pattern = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g
  
  html = html.replace(pattern, (match, ...groups) => {
    const hours = groups[2] ? parseInt(groups[0], 10) : 0
    const minutes = groups[2] ? parseInt(groups[1], 10) : parseInt(groups[0], 10)
    const seconds = groups[2] ? parseInt(groups[2], 10) : parseInt(groups[1], 10)
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    
    // 데이터 속성으로 초를 저장하여 클릭 이벤트에서 사용
    return `<button 
      class="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-xs font-bold transition-colors mx-1 cursor-pointer"
      data-timestamp="${totalSeconds}"
      title="영상 ${match} 위치로 이동"
    >${match}</button>`
  })
  
  return html
}

