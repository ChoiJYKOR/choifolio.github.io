import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { ParagraphNode, TextNode } from 'lexical'
import React, { useCallback, useMemo, useEffect } from 'react'
import { EditorState, SerializedEditorState } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ToolbarPlugin } from './plugins/ToolbarPlugin'
import { ImageUploadPlugin } from './plugins/ImageUploadPlugin'
import { CollapsibleNode } from './nodes/CollapsibleNode'
import { ImageNode } from './nodes/ImageNode'
import { theme } from './theme/EditorTheme'
import './theme/index.css'

interface LexicalEditorProps {
  value: string | SerializedEditorState | null
  onChange: (value: SerializedEditorState) => void
  placeholder?: string
  className?: string
}

// value가 변경될 때 에디터 상태를 업데이트하는 플러그인
const UpdateStatePlugin = ({ value, forceUpdate }: { value: string | SerializedEditorState | null; forceUpdate: number }) => {
  const [editor] = useLexicalComposerContext()
  
  useEffect(() => {
    console.log('🔄 UpdateStatePlugin: value 변경됨', { value, forceUpdate })
    
    if (!value) {
      // value가 null이면 아무것도 하지 않음 (기본 상태 유지)
      console.log('⚠️ UpdateStatePlugin: value가 null이므로 업데이트 스킵')
      return
    }
    
    // 에디터가 준비될 때까지 약간의 지연 추가
    const timeoutId = setTimeout(() => {
      let parsedValue: any
      if (typeof value === 'string') {
        try {
          parsedValue = JSON.parse(value)
        } catch (e) {
          console.error('Failed to parse value:', value, e)
          return
        }
      } else {
        parsedValue = value
      }
      
      // Lexical 형식 검증: root가 있고 root.type이 'root'인지 확인
      if (!parsedValue || !parsedValue.root || parsedValue.root.type !== 'root') {
        console.warn('Invalid Lexical state format: missing or invalid root', parsedValue)
        return
      }
      
      // root.children이 배열인지 확인
      if (!Array.isArray(parsedValue.root.children)) {
        console.warn('Invalid Lexical state: root.children is not an array', parsedValue)
        return
      }
      
      // root.version 확인 (Lexical 버전 호환성)
      if (parsedValue.root.version === undefined || parsedValue.root.version === null) {
        console.warn('Invalid Lexical state: missing root.version', parsedValue)
        return
      }
      
      // root.direction 확인
      if (parsedValue.root.direction !== 'ltr' && parsedValue.root.direction !== 'rtl') {
        console.warn('Invalid Lexical state: invalid root.direction', parsedValue)
        return
      }
      
      try {
        console.log('🔄 에디터 상태 업데이트:', parsedValue)
        // parseEditorState를 사용하여 안전하게 파싱
        const editorState = editor.parseEditorState(parsedValue)
        // setEditorState를 사용하여 상태 설정
        editor.setEditorState(editorState)
      } catch (error) {
        console.error('❌ Failed to set editor state (Lexical error #38):', error)
        console.error('Problematic state:', parsedValue)
        // 에러 발생 시 에디터를 빈 상태로 초기화
        try {
          const emptyState = editor.parseEditorState({
            root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 }
          })
          editor.setEditorState(emptyState)
          console.log('✅ Editor reset to empty state')
        } catch (fallbackError) {
          console.error('❌ Failed to reset editor to empty state:', fallbackError)
        }
      }
    }, 100) // 에디터 초기화를 위한 충분한 지연
    
    return () => clearTimeout(timeoutId)
  }, [forceUpdate, editor]) // value 대신 forceUpdate를 dependency로 사용
  
  return null
}

const LexicalEditor: React.FC<LexicalEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  className = '',
}) => {
  // value가 실제로 변경될 때만 force update
  const forceUpdateKey = React.useMemo(() => {
    return JSON.stringify(value)
  }, [value])
  
  const initialConfig = useMemo(() => {
    return {
      namespace: 'LexicalEditor',
      theme,
      onError: (error: Error) => {
        console.error('Lexical error:', error)
      },
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        ParagraphNode,
        TextNode,
        CollapsibleNode,
        ImageNode,
        TableNode,
        TableCellNode,
        TableRowNode,
      ],
    }
  }, [])

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const serialized = editorState.toJSON()
      onChange(serialized as SerializedEditorState)
    },
    [onChange]
  )

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <UpdateStatePlugin value={value} forceUpdate={forceUpdateKey} />
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable className="prose max-w-none p-4 min-h-[200px] outline-none" />}
            placeholder={<div className="absolute top-4 left-4 text-gray-400 pointer-events-none">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImageUploadPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}

export default LexicalEditor

