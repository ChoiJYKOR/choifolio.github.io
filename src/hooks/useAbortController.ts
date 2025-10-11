import { useEffect, useRef, useCallback } from 'react'

/**
 * AbortController를 사용하여 API 요청 취소를 관리하는 Hook
 * 컴포넌트 언마운트 시 또는 의존성 변경 시 이전 요청을 취소하여
 * 메모리 누수와 Race Condition을 방지합니다.
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null)

  // 새로운 AbortController 생성
  const createAbortController = useCallback(() => {
    // 이전 컨트롤러가 있다면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // 새로운 컨트롤러 생성
    abortControllerRef.current = new AbortController()
    return abortControllerRef.current
  }, [])

  // 현재 AbortController 가져오기 (없으면 생성)
  const getAbortController = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController()
    }
    return abortControllerRef.current
  }, [])

  // 요청 취소
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    createAbortController,
    getAbortController,
    abort,
    signal: abortControllerRef.current?.signal
  }
}

/**
 * API 요청을 위한 AbortController를 자동으로 관리하는 Hook
 * 의존성 배열이 변경될 때마다 이전 요청을 취소하고 새로운 요청을 시작합니다.
 */
export function useAbortableEffect(
  effect: (signal: AbortSignal) => void | (() => void),
  deps: React.DependencyList = []
) {
  const { createAbortController } = useAbortController()

  useEffect(() => {
    const abortController = createAbortController()
    
    const cleanup = effect(abortController.signal)
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
      abortController.abort()
    }
  }, deps)
}

/**
 * API 요청을 위한 fetch wrapper with AbortController
 */
export async function fetchWithAbort(
  url: string,
  options: RequestInit = {},
  signal?: AbortSignal
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    signal: signal || null
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}

export default useAbortController
