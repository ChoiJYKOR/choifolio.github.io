import React, { useEffect, useRef, useState } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Code from '@editorjs/code'
import Image from '@editorjs/image'
import { api } from '../services/api'

interface EditorJSProps {
  value: string | OutputData
  onChange: (value: OutputData) => void
  placeholder?: string
  className?: string
}

const EditorJSComponent: React.FC<EditorJSProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  className = ''
}) => {
  const editorRef = useRef<EditorJS | null>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const holderId = useRef<string>(`editorjs-holder-${Math.random().toString(36).substr(2, 9)}`)

  // value를 OutputData 형식으로 변환
  const parseValue = (val: string | OutputData): OutputData => {
    if (typeof val === 'string') {
      // 기존 텍스트를 Paragraph 블록으로 변환
      if (!val.trim()) {
        return { blocks: [] }
      }
      return {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: val
            }
          }
        ]
      }
    } else {
      return val
    }
  }

  useEffect(() => {
    if (!holderRef.current || editorRef.current) return

    const initializeEditor = async () => {
      const data = parseValue(value)
      
      editorRef.current = new EditorJS({
        holder: holderRef.current!,
        placeholder,
        data,
        tools: {
          header: {
            class: Header,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          code: Code,
          image: {
            class: Image,
            config: {
              endpoints: {
                byFile: '/api/upload/image',
              },
              field: 'image',
              types: 'image/jpeg, image/png, image/webp',
            }
          }
        },
        onChange: async () => {
          if (editorRef.current) {
            const outputData = await editorRef.current.save()
            onChange(outputData)
          }
        }
      })
    }

    initializeEditor()

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        try {
          editorRef.current.destroy()
        } catch (e) {
          console.warn('Editor.js cleanup error:', e)
        }
        editorRef.current = null
      }
    }
  }, []) // 컴포넌트 마운트 시 한 번만 초기화

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
      <div ref={holderRef} id={holderId.current} className="prose max-w-none p-4" />
    </div>
  )
}

export default EditorJSComponent

