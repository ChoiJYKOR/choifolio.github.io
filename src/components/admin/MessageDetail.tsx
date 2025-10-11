import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaEnvelope, FaUser, FaCalendar, FaCheck, FaTrash, FaReply, FaArrowLeft, FaSpinner } from 'react-icons/fa'
import { ContactMessage } from '../../types'
import { useMessageDetail } from '../../hooks/useMessageDetail'

interface MessageDetailProps {
  messageId: string | undefined
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReply?: (message: ContactMessage) => void
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  messageId,
  isOpen,
  onClose,
  onMarkAsRead,
  onDelete,
  onReply
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  // React Query를 사용한 메시지 상세 정보 로딩
  const { 
    data: message, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useMessageDetail(messageId, {
    enabled: isOpen && !!messageId // 모달이 열려있고 messageId가 있을 때만 쿼리 실행
  })

  const handleMarkAsRead = async () => {
    if (message.isRead) return
    
    try {
      setIsProcessing(true)
      await onMarkAsRead(message._id!)
    } catch (error) {
      console.error('읽음 처리 실패:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 메시지를 삭제하시겠습니까?')) return
    
    try {
      setIsProcessing(true)
      await onDelete(message._id!)
      onClose()
    } catch (error) {
      console.error('삭제 실패:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message)
    } else {
      setShowReplyForm(true)
    }
  }

  const handleSendReply = () => {
    // 답장 기능 구현 (이메일 발송 등)
    console.log('답장 내용:', replyContent)
    alert('답장 기능은 향후 구현 예정입니다.')
    setShowReplyForm(false)
    setReplyContent('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center">
              <FaSpinner className="text-4xl text-blue-600 dark:text-blue-400 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                메시지 로딩 중...
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                잠시만 기다려주세요
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                메시지를 불러올 수 없습니다
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {error?.message || '알 수 없는 오류가 발생했습니다.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // 메시지 데이터가 없는 경우
  if (!message) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <FaEnvelope className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                메시지를 찾을 수 없습니다
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                요청하신 메시지가 존재하지 않거나 삭제되었습니다.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-blue-600 dark:text-blue-400 text-xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                메시지 상세
              </h2>
              {!message.isRead && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  새 메시지
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* 메시지 정보 */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FaUser className="text-gray-500 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">보낸이</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {message.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaEnvelope className="text-gray-500 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">이메일</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {message.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FaCalendar className="text-gray-500 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">받은 시간</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(message.createdAt || '')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">상태</p>
                  <div className="flex items-center gap-2">
                    {message.isRead ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <FaCheck /> 읽음
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <FaEnvelope /> 읽지 않음
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {message.subject}
              </h3>
            </div>

            {/* 메시지 내용 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                메시지 내용
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            </div>

            {/* 답장 폼 */}
            <AnimatePresence>
              {showReplyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6"
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    답장 작성
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        받는 사람
                      </label>
                      <input
                        type="email"
                        value={message.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        답장 내용
                      </label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답장 내용을 입력하세요..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <FaReply /> 답장 보내기
                      </button>
                      <button
                        onClick={() => {
                          setShowReplyForm(false)
                          setReplyContent('')
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={handleReply}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaReply /> 답장
            </button>
            
            <div className="flex gap-3">
              {!message.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <FaCheck /> {isProcessing ? '처리 중...' : '읽음 처리'}
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaTrash /> {isProcessing ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MessageDetail
