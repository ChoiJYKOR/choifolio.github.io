# 최주영 - 공장자동화 포트폴리오

바리스타에서 공장자동화 전문가로의 여정을 담은 개인 포트폴리오 웹사이트입니다.

## 주요 기능

### 1. 포트폴리오 기본 섹션
- **Hero**: 메인 소개 페이지
- **About**: 자기소개 및 여정
- **Experience**: 경력 및 학습 이력
- **Skills**: 기술 스택 및 숙련도
- **Projects**: 프로젝트 포트폴리오
- **Contact**: 연락처 정보

### 2. 기술 서적 관리 (Books)
- 읽은 기술 서적 목록 관리
- 각 서적별 학습 내용(Learning Notes) 작성 및 관리
- 카테고리별 필터링 (PLC, 데이터분석, 로봇공학, IoT 등)
- 평점 및 읽은 날짜 기록

### 3. 관리자 기능
- **로그인 시스템**: 관리자 전용 인증
- **관리자 대시보드**: 모든 콘텐츠 관리
  - 서적 추가/수정/삭제
  - 경력 추가/수정/삭제
  - 프로젝트 추가/수정/삭제
- **학습 노트 관리**: 서적별 학습 내용 CRUD

## 기술 스택

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (애니메이션)
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT 인증
- bcryptjs

## 설치 및 실행

### 1. 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 2. MongoDB 설정
MongoDB가 설치되어 있어야 합니다. 로컬에서 실행하거나 MongoDB Atlas를 사용하세요.

\`\`\`bash
# MongoDB 로컬 실행 (Windows)
# MongoDB가 설치된 경로에서
mongod
\`\`\`

### 3. 환경 변수 설정 (중요! 🔒)
프로젝트 루트에 `.env` 파일을 생성하세요:

\`\`\`bash
# .env.example 파일을 복사하여 .env 파일 생성
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
\`\`\`

`.env` 파일을 열고 **반드시 JWT_SECRET을 변경**하세요:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=여기에-강력한-랜덤-문자열을-입력하세요
PORT=5000
\`\`\`

**JWT_SECRET 생성 방법:**
\`\`\`bash
# Node.js로 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 온라인 도구 사용: https://randomkeygen.com/
\`\`\`

### 4. 관리자 계정 생성 (최초 1회 필수! 🔐)

⚠️ **중요**: 이제 관리자 정보가 데이터베이스에 암호화되어 저장됩니다!

\`\`\`bash
npm run setup-admin
\`\`\`

대화형 프롬프트에서 다음을 입력:
- 아이디 (최소 3자)
- 이메일 (선택사항)
- 비밀번호 (최소 8자, 복잡할수록 좋음)
- 비밀번호 확인

예시:
\`\`\`
=== 새 관리자 계정 생성 ===

아이디를 입력하세요: cjy1227
이메일을 입력하세요 (선택사항): juyeong_choi@naver.com
비밀번호를 입력하세요 (최소 8자): ********
비밀번호를 다시 입력하세요: ********

✅ 관리자 계정이 성공적으로 생성되었습니다!
\`\`\`

### 5. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

이 명령어는 다음 두 서버를 동시에 실행합니다:
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5000

### 6. 프로덕션 빌드
\`\`\`bash
npm run build
\`\`\`

## 관리자 로그인

- **아이디**: `npm run setup-admin`에서 설정한 아이디
- **비밀번호**: `npm run setup-admin`에서 설정한 비밀번호

로그인 후 관리자 대시보드에서 비밀번호를 변경할 수 있습니다.

## 사용 방법

### 일반 사용자
1. 포트폴리오의 모든 섹션을 자유롭게 둘러볼 수 있습니다
2. "기술 서적" 메뉴에서 읽은 책과 학습 내용을 확인할 수 있습니다
3. 각 서적을 클릭하면 상세 페이지에서 학습 노트를 읽을 수 있습니다

### 관리자
1. 사이드바 하단의 "관리자 로그인" 버튼 클릭
2. 로그인 후 "관리자 대시보드" 버튼이 나타남
3. 대시보드에서 다음 작업 수행:
   - **서적 관리**: 새 서적 추가, 수정, 삭제
   - **경력 관리**: 경력 정보 추가, 수정, 삭제
   - **프로젝트 관리**: 프로젝트 추가, 수정, 삭제
4. 서적 상세 페이지에서 직접 학습 내용 추가/삭제 가능

## 주요 기능 설명

### 기술 서적 & 학습 노트
- 읽은 기술 서적을 데이터베이스에 저장
- 각 서적에 대해 여러 개의 학습 내용(Learning) 작성 가능
- 주제(Topic)와 내용(Content)으로 구성
- 방문자들이 당신이 배운 기술을 확인 가능

### 콘텐츠 관리
- 관리자 로그인 후 웹 인터페이스에서 직접 모든 콘텐츠 편집
- 별도의 코드 수정 없이 포트폴리오 업데이트 가능
- 실시간으로 변경사항 반영

## 디렉토리 구조

\`\`\`
personal_page/
├── server/                 # 백엔드 서버
│   └── index.js           # Express 서버 및 API
├── src/                   # 프론트엔드
│   ├── components/        # React 컴포넌트
│   │   ├── Sidebar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Experience.tsx
│   │   ├── Skills.tsx
│   │   ├── Projects.tsx
│   │   ├── Books.tsx              # 서적 목록
│   │   ├── BookDetail.tsx         # 서적 상세 & 학습 노트
│   │   ├── AdminDashboard.tsx     # 관리자 대시보드
│   │   ├── LoginModal.tsx         # 로그인 모달
│   │   └── Contact.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx        # 인증 컨텍스트
│   ├── services/
│   │   └── api.ts                 # API 서비스
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── README.md
\`\`\`

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/verify` - 토큰 검증

### 서적
- `GET /api/books` - 전체 서적 목록
- `GET /api/books/:id` - 특정 서적 조회
- `POST /api/books` - 서적 추가 (인증 필요)
- `PUT /api/books/:id` - 서적 수정 (인증 필요)
- `DELETE /api/books/:id` - 서적 삭제 (인증 필요)

### 학습 내용
- `POST /api/books/:id/learnings` - 학습 내용 추가 (인증 필요)
- `PUT /api/books/:bookId/learnings/:learningId` - 학습 내용 수정 (인증 필요)
- `DELETE /api/books/:bookId/learnings/:learningId` - 학습 내용 삭제 (인증 필요)

### 경력
- `GET /api/experiences` - 전체 경력 목록
- `POST /api/experiences` - 경력 추가 (인증 필요)
- `PUT /api/experiences/:id` - 경력 수정 (인증 필요)
- `DELETE /api/experiences/:id` - 경력 삭제 (인증 필요)

### 프로젝트
- `GET /api/projects` - 전체 프로젝트 목록
- `POST /api/projects` - 프로젝트 추가 (인증 필요)
- `PUT /api/projects/:id` - 프로젝트 수정 (인증 필요)
- `DELETE /api/projects/:id` - 프로젝트 삭제 (인증 필요)

## 보안 기능 🔒

### 구현된 보안 조치

✅ **비밀번호 해싱**: bcrypt를 사용하여 비밀번호를 암호화하여 저장
✅ **JWT 인증**: 토큰 기반 인증으로 세션 보안 강화
✅ **환경 변수 분리**: 민감한 정보는 .env 파일에만 저장
✅ **데이터베이스 저장**: 관리자 정보를 MongoDB에 안전하게 저장
✅ **비밀번호 변경 기능**: 관리자 대시보드에서 비밀번호 변경 가능

### 비밀번호 변경하기

1. 관리자로 로그인
2. 관리자 대시보드로 이동
3. "비밀번호 변경" 버튼 클릭
4. 현재 비밀번호와 새 비밀번호 입력
5. 저장

### 보안 권장사항

⚠️ **반드시 지켜야 할 사항**: 
- ❌ `.env` 파일을 절대 Git에 커밋하지 마세요 (이미 .gitignore에 추가됨)
- ✅ `JWT_SECRET`을 강력한 랜덤 문자열로 변경하세요
- ✅ 관리자 비밀번호는 최소 8자 이상, 영문/숫자/특수문자 조합 사용
- ✅ 관리자 비밀번호를 정기적으로 변경하세요 (최소 3개월마다)
- ✅ HTTPS를 사용하여 배포하세요
- ✅ 프로덕션 환경에서는 MongoDB Atlas 등 안전한 데이터베이스 사용
- ✅ 방화벽을 설정하여 백엔드 API 접근을 제한하세요

### 관리자 계정 재설정

관리자 비밀번호를 잊어버린 경우:

\`\`\`bash
# 기존 관리자 계정 삭제하고 새로 생성
npm run setup-admin

# 프롬프트에서 'y' 선택하여 기존 계정 삭제 후 새로 생성
\`\`\`

## 라이선스

개인 포트폴리오 프로젝트입니다.

## 연락처

- **이메일**: juyeong_choi@naver.com
- **GitHub**: [Your GitHub]
- **LinkedIn**: [Your LinkedIn]

---

Made with ❤️ by 최주영
