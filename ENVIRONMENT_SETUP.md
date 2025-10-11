# 환경 변수 설정 가이드

## 📋 개요

이 프로젝트는 Vite를 사용하여 환경 변수를 관리합니다. 클라이언트 코드에서 사용할 수 있는 환경 변수는 반드시 `VITE_` 접두사로 시작해야 합니다.

## ⚠️ 중요: 보안 규칙

### ✅ 안전한 환경 변수 (클라이언트 노출 가능)
- `VITE_API_URL`: API 서버 URL
- `VITE_APP_NAME`: 애플리케이션 이름
- `VITE_DEBUG_MODE`: 디버그 모드 플래그
- `VITE_NODE_ENV`: 환경 식별자

### ❌ 위험한 환경 변수 (클라이언트 노출 금지)
- `API_SECRET_KEY`: API 비밀 키
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호
- `JWT_SECRET`: JWT 시크릿 키

## 🔧 설정 방법

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 필수 환경 변수
VITE_API_URL=http://localhost:5000/api

# 선택적 환경 변수
VITE_APP_NAME=포트폴리오 웹사이트
VITE_DEBUG_MODE=false
VITE_NODE_ENV=development
VITE_FRONTEND_URL=http://localhost:5173
```

### 2. 서버 전용 환경 변수

서버 측에서만 사용되는 환경 변수는 `.env` 파일에 추가하세요:

```bash
# 서버 전용 환경 변수 (VITE_ 접두사 사용 금지!)
DATABASE_URL=mongodb://localhost:27017/portfolio
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 📝 TypeScript 타입 정의

환경 변수의 타입은 `src/vite-env.d.ts` 파일에서 정의됩니다:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME?: string
  readonly VITE_DEBUG_MODE?: string
  readonly VITE_NODE_ENV?: string
  readonly VITE_FRONTEND_URL?: string
}
```

## 🚀 사용 예시

### 클라이언트 코드에서 사용

```typescript
// API 서비스에서 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// 디버그 모드 확인
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true'

// 환경별 설정
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development'
```

### 서버 코드에서 사용

```javascript
// server/index.js에서 사용
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET
const DATABASE_URL = process.env.DATABASE_URL
```

## 🔒 보안 체크리스트

- [ ] 민감한 정보는 `VITE_` 접두사를 사용하지 않았는가?
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] 프로덕션 환경에서 환경 변수가 올바르게 설정되었는가?
- [ ] 클라이언트 코드에서 서버 전용 환경 변수에 접근하지 않는가?

## 📚 참고 자료

- [Vite 환경 변수 문서](https://vitejs.dev/guide/env-and-mode.html)
- [TypeScript 환경 변수 타입 정의](https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript)
