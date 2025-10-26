import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  $insertNodes,
} from 'lexical'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { $createCodeNode } from '@lexical/code'
import { useCallback, useEffect } from 'react'
import { $createImageNode } from '../nodes/ImageNode'
import { $createCollapsibleNode } from '../nodes/CollapsibleNode'

export const INSERT_IMAGE_COMMAND_KEY = 'INSERT_IMAGE_COMMAND'

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext()

  const handleBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }, [editor])

  const handleItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }, [editor])

  const handleUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  }, [editor])

  const handleHeading = useCallback((level: 1 | 2 | 3) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const headingNode = $createHeadingNode(`h${level}`)
        selection.insertNodes([headingNode])
      }
    })
  }, [editor])

  const handleCode = useCallback(() => {
    editor.update(() => {
      const codeNode = $createCodeNode('')
      $insertNodes([codeNode])
    })
  }, [editor])

  const handleInsertCollapsible = useCallback(() => {
    editor.update(() => {
      const collapsible = $createCollapsibleNode('제목 없음', true)
      $insertNodes([collapsible])
    })
  }, [editor])

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <button
        type="button"
        onClick={handleBold}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={handleItalic}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 italic"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={handleUnderline}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 underline"
        title="Underline"
      >
        <u>U</u>
      </button>
      <div className="border-l border-gray-300 dark:border-gray-600 mx-2" />
      <button
        type="button"
        onClick={() => handleHeading(1)}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => handleHeading(2)}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => handleHeading(3)}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Heading 3"
      >
        H3
      </button>
      <div className="border-l border-gray-300 dark:border-gray-600 mx-2" />
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Bullet List"
      >
        •
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Numbered List"
      >
        1.
      </button>
      <button
        type="button"
        onClick={handleCode}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Code Block"
      >
        {'</>'}
      </button>
      <div className="border-l border-gray-300 dark:border-gray-600 mx-2" />
      <button
        type="button"
        onClick={handleInsertCollapsible}
        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Toggle/Collapsible"
      >
        ▼
      </button>
    </div>
  )
}
