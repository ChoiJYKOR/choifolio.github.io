import React, { useState } from 'react'
import { FaTrash, FaEye, FaEnvelope } from 'react-icons/fa'
import { ContactMessage } from '../../types'
import { useMessageManagerData } from '../../hooks/useMessageManagerData'
import MessageDetail from './MessageDetail'

const MessageManager: React.FC = () => {
  const { messages, isLoading, markAsRead, deleteMessage } = useMessageManagerData()
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(undefined)
  const [showDetail, setShowDetail] = useState(false)

  const handleMarkAsRead = async (message: ContactMessage) => {
    try {
      await markAsRead(message._id!)
    } catch (error) {
      console.error('읽음 처리 실패:', error)
    }
  }

  const handleDelete = async (message: ContactMessage) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        setIsDeleting(true)
        await deleteMessage(message._id!)
      } catch (error) {
        console.error('삭제 실패:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleViewDetail = (message: ContactMessage) => {
    setSelectedMessageId(message._id)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedMessageId(undefined)
  }

  const handleDetailMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleDetailDelete = async (id: string) => {
    await deleteMessage(id)
    handleCloseDetail()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">메시지 데이터를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">메시지 관리</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            총 {messages.length}개의 메시지
          </div>
        </div>
        
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message._id} 
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetail(message)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{message.subject}</h3>
                    {!message.isRead && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        새 메시지
                      </span>
                    )}
                  </div>
                  <p 
                    className="text-gray-600 dark:text-gray-400 mb-2"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {message.message.length > 100 ? `${message.message.substring(0, 100)}...` : message.message}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    <p>보낸이: {message.name} ({message.email})</p>
                    <p>받은 시간: {message.createdAt ? new Date(message.createdAt).toLocaleString('ko-KR') : '알 수 없음'}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleViewDetail(message)}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="상세 보기"
                  >
                    <FaEye />
                  </button>
                  {!message.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(message)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      읽음 처리
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message)}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    disabled={isDeleting}
                    title="삭제"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 메시지 상세 보기 모달 */}
      {showDetail && (
        <MessageDetail
          messageId={selectedMessageId}
          isOpen={showDetail}
          onClose={handleCloseDetail}
          onMarkAsRead={handleDetailMarkAsRead}
          onDelete={handleDetailDelete}
        />
      )}
    </>
  )
}

export default MessageManager