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
    if (!value) return
    
    let parsedValue: any
    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value)
      } catch {
        console.error('Failed to parse value:', value)
        return
      }
    } else {
      parsedValue = value
    }
    
    if (parsedValue && parsedValue.root) {
      console.log('🔄 에디터 상태 업데이트:', parsedValue)
      const editorState = editor.parseEditorState(parsedValue)
      editor.setEditorState(editorState)
    }
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

