import { SerializedEditorState, SerializedLexicalNode } from 'lexical'

export interface LexicalEditorProps {
  value: string | SerializedEditorState | null
  onChange: (value: SerializedEditorState) => void
  placeholder?: string
  className?: string
}

export interface SerializedCollapsibleNode extends SerializedLexicalNode {
  type: 'collapsible'
  title: string
  isOpen: boolean
  children: SerializedLexicalNode[]
}

