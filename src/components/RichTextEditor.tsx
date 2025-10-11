import React, { useState, useRef } from 'react'
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaIndent, FaOutdent, FaChevronDown } from 'react-icons/fa'
import { MdCode } from 'react-icons/md' // 코드 블록 아이콘 추가

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "내용을 입력하세요",
  rows = 8,
  className = ""
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)

  // 커서 위치 업데이트
  const updateCursorPosition = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart)
    }
  }

  // 현재 줄의 텍스트와 시작 위치 가져오기 (커서 조정 오류 수정)
  const getCurrentLine = () => {
    const lines = value.split('\n')
    let currentLineIndex = 0
    let lineStart = 0 // 현재 줄의 시작 위치

    for (let i = 0; i < lines.length; i++) {
      const lineLengthWithNewline = (lines[i]?.length || 0) + 1 // 줄 길이 + \n (마지막 줄은 \n이 없으므로 주의)
      
      // 커서 위치가 현재 줄 범위 내에 있거나, 마지막 줄인 경우
      if (cursorPosition >= lineStart && (cursorPosition < lineStart + lineLengthWithNewline || i === lines.length - 1)) {
        currentLineIndex = i
        break
      }
      
      lineStart += lineLengthWithNewline
    }
    
    return {
      lineIndex: currentLineIndex,
      line: lines[currentLineIndex] || '',
      lines: lines,
      lineStart: lineStart, // 현재 줄의 절대 시작 위치
    }
  }

  // 텍스트 삽입 함수 제거됨 - applyTextStyle 사용

  // 줄 바꿈과 함께 텍스트 삽입 함수 제거됨 - 사용하지 않음

  // 제목 스타일 적용
  const applyHeading = (level: number) => {
    const { lineIndex, line, lines } = getCurrentLine()
    const prefix = '#'.repeat(level) + ' '
    
    // 이미 제목인 경우 제목 레벨 변경
    if (line.match(/^#+\s/)) {
      lines[lineIndex] = prefix + line.replace(/^#+\s/, '')
    } else {
      lines[lineIndex] = prefix + line
    }
    
    onChange(lines.join('\n'))
  }

  // 리스트 스타일 적용
  const applyListStyle = (type: 'bullet' | 'number') => {
    const { lineIndex, line, lines } = getCurrentLine()
    
    // 이미 리스트인 경우 리스트 해제
    if (line?.match(/^[\s]*[-*+]\s/) || line?.match(/^[\s]*\d+\.\s/)) {
      lines[lineIndex] = line?.replace(/^[\s]*[-*+\d\.]\s/, '').trim() || ''
    } else {
      // 새로운 리스트 항목 추가
      const indent = line?.match(/^[\s]*/)?.[0] || ''
      const prefix = type === 'bullet' ? '- ' : '1. '
      lines[lineIndex] = indent + prefix + (line?.trim() || '')
    }
    
    onChange(lines.join('\n'))
  }

  // 들여쓰기/내어쓰기
  const adjustIndent = (direction: 'in' | 'out') => {
    const { lineIndex, lines } = getCurrentLine()
    const line = lines[lineIndex] || ''
    
    if (direction === 'in') {
      lines[lineIndex] = '  ' + line
    } else {
      lines[lineIndex] = line.replace(/^[\s]{0,2}/, '')
    }
    
    onChange(lines.join('\n'))
  }

  // 토글 블록 생성
  const insertToggle = () => {
    const { lineIndex, lines, lineStart } = getCurrentLine()
    const newLine = '▶ 토글 제목'
    lines.splice(lineIndex + 1, 0, newLine, '  토글 내용을 입력하세요') // 공백 2개 들여쓰기
    onChange(lines.join('\n'))
    
    // 커서를 토글 내용 (두 번째 삽입된 줄)으로 이동
    setTimeout(() => {
      if (textareaRef.current) {
        // 커서 위치: 현재 줄 시작 위치 + 현재 줄 길이 + \n + 첫 번째 삽입된 줄 길이 + \n + 2 (들여쓰기)
        const newPosition = lineStart + (lines[lineIndex]?.length || 0) + 1 + newLine.length + 1 + 2
        textareaRef.current.setSelectionRange(newPosition, newPosition)
        textareaRef.current.focus()
      }
    }, 0)
  }

  // === 새로 추가된 코드 블록 삽입 함수 ===
  const insertCodeBlock = () => {
    const { lineIndex, lines, lineStart } = getCurrentLine()
    
    const codeBlockLines = [
      '```javascript', // 기본 언어
      '// 여기에 코드를 작성하세요',
      '```',
    ]

    // 현재 줄의 바로 아래에 세 줄을 삽입
    lines.splice(lineIndex + 1, 0, ...codeBlockLines)
    const newValue = lines.join('\n')
    onChange(newValue)
    
    // 커서를 코드 블록의 내용 줄로 이동
    setTimeout(() => {
      if (textareaRef.current) {
        // 커서 위치: (현재 줄의 끝) + (첫 번째 백틱 줄 길이 + \n) + (내용 줄 시작)
        const positionToMove = 
          lineStart + (lines[lineIndex]?.length || 0) + 1  // 현재 줄 끝 + \n
          + (codeBlockLines[0]?.length || 0) + 1          // 첫 번째 백틱 줄 + \n
          + 2                                     // '//' 위치까지 이동
        
        textareaRef.current.setSelectionRange(positionToMove, positionToMove)
        textareaRef.current.focus()
      }
    }, 0)
  }
  // ===================================

  // 텍스트 스타일 적용 (간단한 마크다운)
  const applyTextStyle = (style: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let wrap = ''
    switch (style) {
      case 'bold': wrap = '**'; break
      case 'italic': wrap = '*'; break
      case 'underline': wrap = '__'; break
    }
    
    const wrappedText = `${wrap}${selectedText}${wrap}`
    
    const newValue = value.substring(0, start) + wrappedText + value.substring(end)
    onChange(newValue)
    
    // 커서 위치 조정
    setTimeout(() => {
      // 선택된 텍스트가 없으면, 랩퍼 안에 커서를 위치시킵니다.
      if (start === end) {
        textarea.setSelectionRange(start + wrap.length, end + wrap.length)
      } 
      // 선택된 텍스트가 있으면, 전체 랩퍼 뒤에 커서를 위치시킵니다.
      else {
        textarea.setSelectionRange(end + 2 * wrap.length, end + 2 * wrap.length)
      }
      textarea.focus()
    }, 0)
  }

  // 렌더링된 텍스트 (마크다운 → HTML)
  const renderMarkdown = (text: string) => {
    return text
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
      // 인라인 코드 추가
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

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${className}`}>
      {/* 툴바 */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        {/* 제목 버튼들 */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={() => applyHeading(1)}
            className="px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="제목 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => applyHeading(2)}
            className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="제목 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => applyHeading(3)}
            className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="제목 3"
          >
            H3
          </button>
        </div>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

        {/* 텍스트 스타일 */}
        <div className="flex items-center gap-1 mx-2">
          <button
            type="button"
            onClick={() => applyTextStyle('bold')}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="굵게"
          >
            <FaBold className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => applyTextStyle('italic')}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="기울임"
          >
            <FaItalic className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => applyTextStyle('underline')}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="밑줄"
          >
            <FaUnderline className="text-xs" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

        {/* 리스트 */}
        <div className="flex items-center gap-1 mx-2">
          <button
            type="button"
            onClick={() => applyListStyle('bullet')}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="불릿 리스트"
          >
            <FaListUl className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => applyListStyle('number')}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="번호 리스트"
          >
            <FaListOl className="text-xs" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

        {/* 들여쓰기 */}
        <div className="flex items-center gap-1 mx-2">
          <button
            type="button"
            onClick={() => adjustIndent('out')}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="내어쓰기"
          >
            <FaOutdent className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => adjustIndent('in')}
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="들여쓰기"
          >
            <FaIndent className="text-xs" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

        {/* 토글 및 코드 블록 */}
        <button
          type="button"
          onClick={insertToggle}
          className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors mx-2"
          title="토글 블록"
        >
          <FaChevronDown className="text-xs" />
        </button>

        <button
          type="button"
          onClick={insertCodeBlock}
          className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          title="코드 블록"
        >
          <MdCode className="text-sm" />
        </button>
      </div>

      {/* 편집 영역 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          onMouseUp={updateCursorPosition}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-y"
        />
        
        {/* 미리보기 영역 (선택사항) */}
        {value && (
          <div className="absolute inset-0 pointer-events-none opacity-0">
            <div 
              className="p-3 text-gray-900 dark:text-white whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default RichTextEditor
