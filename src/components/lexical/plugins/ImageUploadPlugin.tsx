import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, $createParagraphNode, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'
import { $createImageNode } from '../nodes/ImageNode'
import api from '../../../services/api'

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND')

export const ImageUploadPlugin = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      async (payload: { file: File }) => {
        const { file } = payload
        
        try {
          // FormData 생성
          const formData = new FormData()
          formData.append('image', file)

          // 업로드 요청
          const response = await api.post('/upload/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })

          if (response.data.success && response.data.url) {
            // 성공: 이미지 노드 삽입
            editor.update(() => {
              const imageNode = $createImageNode(response.data.url, file.name)
              $insertNodes([imageNode])
            })
          } else {
            throw new Error('Upload failed')
          }
        } catch (error) {
          console.error('Image upload failed:', error)
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  return null
}