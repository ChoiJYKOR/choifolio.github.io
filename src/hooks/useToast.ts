import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface UseToastReturn {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

/**
 * Toast 알림 시스템을 위한 Custom Hook
 * 성공, 에러, 경고, 정보 메시지를 표시할 수 있습니다.
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000, // 기본 5초
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // 자동 제거 (duration이 0이 아닌 경우)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id)
      }, newToast.duration)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts
  }
}

/**
 * 편의 메서드들을 제공하는 Toast Hook
 */
export function useToastHelpers() {
  const { showToast, ...rest } = useToast()

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message })
  }, [showToast])

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  return {
    ...rest,
    success,
    error,
    warning,
    info
  }
}

export default useToast
