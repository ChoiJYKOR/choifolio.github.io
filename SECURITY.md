# 보안 가이드 🔒

이 문서는 포트폴리오 웹사이트의 보안 설정 및 모범 사례를 설명합니다.

## 목차
1. [초기 설정](#초기-설정)
2. [보안 기능](#보안-기능)
3. [비밀번호 관리](#비밀번호-관리)
4. [프로덕션 배포](#프로덕션-배포)
5. [보안 체크리스트](#보안-체크리스트)

## 초기 설정

### 1. 환경 변수 설정

**절대 하지 말아야 할 것:**
- ❌ `.env` 파일을 Git에 커밋
- ❌ 하드코딩된 비밀번호 사용
- ❌ 기본 JWT_SECRET 사용

**해야 할 것:**
```bash
# 1. .env.example을 복사하여 .env 생성
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux

# 2. JWT_SECRET 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. .env 파일에 생성된 값 입력
JWT_SECRET=생성된_랜덤_문자열_여기에_붙여넣기
```

### 2. 관리자 계정 생성

```bash
npm run setup-admin
```

**강력한 비밀번호 조건:**
- 최소 12자 이상 (권장)
- 대문자, 소문자, 숫자, 특수문자 조합
- 사전에 없는 단어 사용
- 다른 서비스와 다른 비밀번호 사용

**예시 (강력한 비밀번호):**
- `Aut0m@t1on2024!Cjy`
- `P!c_M3l3c_2024#Secure`
- `My$tr0ng_P@ssw0rd_2024`

## 보안 기능

### 구현된 보안 조치

#### 1. 비밀번호 암호화
- **bcrypt**: 비밀번호를 해싱하여 데이터베이스에 저장
- **Salt Rounds**: 10 (충분한 보안 강도 제공)
- 원본 비밀번호는 절대 저장되지 않음

#### 2. JWT 인증
- **토큰 기반 인증**: 상태를 서버에 저장하지 않음
- **만료 시간**: 24시간 (필요시 조정 가능)
- **토큰 저장**: 클라이언트의 localStorage (HTTPS 환경 필수)

#### 3. API 보안
- **인증 미들웨어**: 민감한 API는 JWT 토큰 검증 필수
- **에러 메시지**: 구체적인 정보 노출 방지
- **CORS**: 허용된 도메인만 API 접근 가능 (설정 필요)

## 비밀번호 관리

### 비밀번호 변경

웹 인터페이스에서:
1. 관리자 로그인
2. 관리자 대시보드 → "비밀번호 변경"
3. 현재 비밀번호와 새 비밀번호 입력
4. 저장

### 비밀번호 분실 시

**방법 1: 관리자 계정 재설정 (권장)**
```bash
npm run setup-admin
# 프롬프트에서 'y' 선택하여 새 계정 생성
```

**방법 2: MongoDB에서 직접 삭제 (고급 사용자)**
```bash
# MongoDB Shell 접속
mongosh

# 데이터베이스 선택
use portfolio

# 관리자 계정 삭제
db.admins.deleteMany({})

# 새 계정 생성
exit
npm run setup-admin
```

## 프로덕션 배포

### 필수 보안 설정

#### 1. HTTPS 사용
```javascript
// server/index.js에 추가
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

#### 2. CORS 설정
```javascript
// server/index.js에서 CORS 설정 변경
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

`.env`에 추가:
```env
CLIENT_URL=https://your-domain.com
NODE_ENV=production
```

#### 3. Rate Limiting (DDoS 방지)
```bash
npm install express-rate-limit
```

```javascript
// server/index.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5번 시도
  message: '너무 많은 로그인 시도가 있었습니다. 나중에 다시 시도해주세요.'
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // ... 로그인 로직
});
```

#### 4. Helmet (HTTP 헤더 보안)
```bash
npm install helmet
```

```javascript
// server/index.js
const helmet = require('helmet');
app.use(helmet());
```

#### 5. MongoDB Atlas (프로덕션 DB)
- ✅ 로컬 MongoDB 대신 MongoDB Atlas 사용
- ✅ IP 화이트리스트 설정
- ✅ 강력한 데이터베이스 비밀번호 사용
- ✅ 정기적인 백업 설정

`.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
```

### 환경 변수 관리

**개발 환경:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your-dev-secret
CLIENT_URL=http://localhost:3000
PORT=5000
```

**프로덕션 환경:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # Atlas URL
JWT_SECRET=super-strong-production-secret
CLIENT_URL=https://your-domain.com
PORT=5000
```

## 보안 체크리스트

### 배포 전 확인사항

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] JWT_SECRET이 강력한 랜덤 문자열로 설정되었는가?
- [ ] 관리자 비밀번호가 강력한가? (12자 이상, 복잡한 조합)
- [ ] HTTPS를 사용하는가?
- [ ] CORS가 올바르게 설정되었는가?
- [ ] MongoDB Atlas를 사용하는가? (프로덕션)
- [ ] Rate Limiting이 설정되었는가?
- [ ] Helmet이 설치되었는가?
- [ ] 에러 메시지에 민감한 정보가 포함되지 않는가?
- [ ] API 엔드포인트에 적절한 인증이 적용되었는가?

### 정기 점검 (3개월마다)

- [ ] 관리자 비밀번호 변경
- [ ] JWT_SECRET 변경 (선택적)
- [ ] 의존성 패키지 업데이트 (`npm audit fix`)
- [ ] MongoDB 백업 확인
- [ ] 로그 파일 확인 (의심스러운 활동)

### 보안 감사

```bash
# 의존성 보안 취약점 확인
npm audit

# 자동 수정
npm audit fix

# 강제 수정 (주의: breaking changes 가능)
npm audit fix --force
```

## 문제 발생 시

### 로그인이 안 되는 경우

1. MongoDB가 실행 중인지 확인
2. `.env` 파일이 올바르게 설정되었는지 확인
3. 관리자 계정이 생성되었는지 확인
4. 브라우저 콘솔에서 에러 메시지 확인

### 토큰 만료

- 토큰은 24시간 후 만료됩니다
- 다시 로그인하면 새 토큰이 발급됩니다
- 필요시 `server/index.js`에서 `expiresIn` 값 조정

### 데이터베이스 연결 오류

```bash
# MongoDB 실행 확인
mongosh

# 연결 테스트
use portfolio
show collections
```

## 추가 보안 권장사항

### 1. 2단계 인증 (2FA)
향후 구현 고려:
- Google Authenticator
- 이메일 인증
- SMS 인증

### 2. 로그 시스템
의심스러운 활동 기록:
- 로그인 시도 (성공/실패)
- API 호출 로그
- 에러 로그

### 3. 정기 백업
- MongoDB 자동 백업 설정
- 백업 복구 테스트

### 4. 보안 업데이트
- Node.js 최신 LTS 버전 사용
- npm 패키지 정기 업데이트
- 보안 뉴스레터 구독

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**마지막 업데이트**: 2024년
**문의**: 보안 관련 문제 발견 시 즉시 연락 주세요.

