import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa'
import { Toast as ToastType } from '../../hooks/useToast'

interface ToastProps {
  toast: ToastType
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheck className="text-green-500" />
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />
      case 'info':
        return <FaInfo className="text-blue-500" />
      default:
        return <FaInfo className="text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${getBgColor()}
        max-w-md w-full
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <FaTimes className="w-3 h-3 text-gray-400" />
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  onClose: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
export { Toast }
