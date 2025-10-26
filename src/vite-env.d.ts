/// <reference types="vite/client" />

/**
 * Vite 환경 변수 타입 정의
 * 
 * ⚠️ 중요: Vite 환경 변수 규칙
 * - 클라이언트 코드에 노출되는 환경 변수는 반드시 `VITE_` 접두사로 시작해야 합니다.
 * - `VITE_` 접두사가 없는 환경 변수는 서버 측에서만 사용하고 클라이언트에 노출되지 않습니다.
 * - 민감한 정보(API 키, 비밀번호 등)는 절대 `VITE_` 접두사를 사용하지 마세요.
 * 
 * 사용 예시:
 * - ✅ 안전: VITE_API_URL, VITE_APP_NAME, VITE_DEBUG_MODE
 * - ❌ 위험: API_SECRET_KEY, DATABASE_PASSWORD, JWT_SECRET
 */

interface ImportMetaEnv {
  /**
   * API 서버 기본 URL
   * 예: 'http://localhost:5000/api' 또는 'https://api.example.com'
   */
  readonly VITE_API_URL: string
  
  /**
   * 애플리케이션 이름
   * 예: '포트폴리오 웹사이트'
   */
  readonly VITE_APP_NAME?: string
  
  /**
   * 개발 모드 디버그 플래그
   * 예: 'true' 또는 'false'
   */
  readonly VITE_DEBUG_MODE?: string
  
  /**
   * 환경 식별자
   * 예: 'development', 'staging', 'production'
   */
  readonly VITE_NODE_ENV?: string
  
  /**
   * 프론트엔드 URL (CORS 설정용)
   * 예: 'http://localhost:5173' 또는 'https://portfolio.example.com'
   */
  readonly VITE_FRONTEND_URL?: string
  
  /**
   * 애플리케이션 버전
   * 예: '1.0.0'
   */
  readonly VITE_APP_VERSION?: string
  
  /**
   * 빌드 타임스탬프
   * 예: '2024-01-01T00:00:00.000Z'
   */
  readonly VITE_BUILD_TIME?: string
  
  /**
   * Git 커밋 해시
   * 예: 'abc123def456'
   */
  readonly VITE_GIT_COMMIT?: string
  
  // 다른 클라이언트 노출 환경 변수들도 필요시 여기에 추가
  // 단, 반드시 VITE_ 접두사를 사용하세요!
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Vite에서 정의한 전역 변수 타입
 */
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string
