# 빠른 시작 가이드 🚀

포트폴리오 웹사이트를 5분 안에 실행하는 방법입니다.

## 사전 요구사항

시작하기 전에 다음이 설치되어 있어야 합니다:

- [Node.js](https://nodejs.org/) (v16 이상)
- [MongoDB](https://www.mongodb.com/try/download/community)
- Git

## 1단계: 프로젝트 클론 (이미 다운로드했다면 스킵)

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

## 2단계: 의존성 설치

```bash
npm install
```

⏱️ 예상 시간: 1-2분

## 3단계: MongoDB 실행

### Windows
```bash
# 새 터미널/명령 프롬프트를 열고
mongod
```

### Mac/Linux
```bash
# 새 터미널을 열고
brew services start mongodb-community  # Homebrew 사용 시
# 또는
sudo systemctl start mongod  # Linux systemd
```

🔍 MongoDB가 실행 중인지 확인:
```bash
mongosh
# 연결되면 성공! Ctrl+C로 종료
```

## 4단계: 환경 변수 설정

```bash
# .env.example을 .env로 복사
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

`.env` 파일을 열고 **JWT_SECRET**을 변경하세요:

```bash
# 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 출력된 값을 복사하여 .env 파일의 JWT_SECRET에 붙여넣기
```

`.env` 파일 예시:
```env
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=여기에_복사한_랜덤_문자열을_붙여넣기
PORT=5000
```

## 5단계: 관리자 계정 생성

```bash
npm run setup-admin
```

대화형 프롬프트가 나타나면:

```
아이디를 입력하세요: cjy1227
이메일을 입력하세요 (선택사항): juyeong_choi@naver.com
비밀번호를 입력하세요 (최소 8자): 강력한비밀번호123!
비밀번호를 다시 입력하세요: 강력한비밀번호123!

✅ 관리자 계정이 성공적으로 생성되었습니다!
```

💡 **팁**: 비밀번호를 안전한 곳에 메모해두세요!

## 6단계: 개발 서버 실행

```bash
npm run dev
```

다음 메시지가 나타나면 성공:
```
MongoDB connected
Server is running on port 5000
VITE v4.5.0 ready in 500 ms
➜  Local:   http://localhost:3000/
```

## 7단계: 브라우저에서 확인

1. **프론트엔드**: http://localhost:3000 열기
2. **로그인**: 좌측 사이드바에서 "관리자 로그인" 클릭
3. **관리자 대시보드**: 5단계에서 만든 계정으로 로그인

## 🎉 완료!

이제 다음을 할 수 있습니다:

### 일반 사용자로서
- ✅ 포트폴리오 둘러보기
- ✅ 기술 서적 및 학습 노트 읽기
- ✅ 프로젝트 확인하기

### 관리자로서
- ✅ 서적 추가/수정/삭제
- ✅ 학습 내용 작성
- ✅ 경력 정보 관리
- ✅ 프로젝트 관리
- ✅ 비밀번호 변경

## 다음 단계

### 콘텐츠 추가하기

1. **기술 서적 추가**
   - 로그인 → "기술 서적" 메뉴 → "서적 추가" 버튼
   - 제목, 저자, 카테고리, 평점 입력
   - 저장 후 해당 서적 클릭
   - "추가하기" 버튼으로 학습 내용 작성

2. **프로젝트 추가**
   - 관리자 대시보드 → "프로젝트 관리" 탭
   - "새로 추가" 버튼
   - 프로젝트 정보 입력

3. **경력 수정**
   - 관리자 대시보드 → "경력 관리" 탭
   - 기존 경력 수정 또는 새로 추가

### 포트폴리오 커스터마이징

1. **개인 정보 수정**: `src/components/Sidebar.tsx`
2. **색상 테마 변경**: `tailwind.config.js`
3. **소셜 링크 추가**: `src/components/Sidebar.tsx`

## 문제 해결

### MongoDB 연결 오류
```
MongoDB connection error: connect ECONNREFUSED
```

**해결책**:
1. MongoDB가 실행 중인지 확인
2. 다른 터미널에서 `mongod` 실행
3. Windows 서비스에서 MongoDB 시작 확인

### 포트 이미 사용 중
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결책**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID번호] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### npm install 오류
```
npm ERR! code ERESOLVE
```

**해결책**:
```bash
npm install --legacy-peer-deps
```

### 관리자 로그인 실패
```
아이디 또는 비밀번호가 올바르지 않습니다.
```

**해결책**:
1. 관리자 계정을 다시 생성:
   ```bash
   npm run setup-admin
   ```
2. 프롬프트에서 'y' 선택하여 기존 계정 재설정

## 추가 리소스

- 📖 [전체 README](README.md)
- 🔒 [보안 가이드](SECURITY.md)
- 💻 [API 문서](README.md#api-엔드포인트)

## 도움이 필요하신가요?

문제가 해결되지 않으면:
1. [GitHub Issues](https://github.com/yourusername/portfolio/issues) 확인
2. 새 이슈 생성
3. 이메일: juyeong_choi@naver.com

---

**즐거운 포트폴리오 관리 되세요!** 🎊

