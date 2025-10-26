import { SiteSettings } from '@/types'
import { Field, SectionDefinition } from './types'

// Initial settings with default values
export const initialSettings: SiteSettings = {
  fullName: '', firstName: '', role: '', subtitle: '', location: '', education: '', 
  yearsOfExperience: '', email: '', phone: '', githubUrl: '', linkedinUrl: '', 
  heroTitle: '', heroSubtitle: '', aboutTitle: '', aboutSubtitle: '', aboutDescription1: '', 
  aboutDescription2: '', skillsTitle: '', skillsSubtitle: '', projectsTitle: '', 
  projectsSubtitle: '', booksTitle: '', booksSubtitle: '', contactTitle: '', 
  contactSubtitle: '', stat1Number: '', stat1Label: '', stat2Number: '', stat2Label: '',
  experienceTitle: '', experienceSubtitle: '',
  // Learning goals defaults
  learningGoalsTitle: '앞으로의 학습 목표',
  learningGoalsDescription: '4차 산업혁명 시대에 발맞춰 **지능형 공장(Smart Factory) 구현**을 위해 다음 기술들을 집중적으로 탐구하여 전문성을 확대해 나가겠습니다.',
  learningGoalsList: ['첨단 로봇 제어', '딥러닝 기반 비전 시스템', '엣지 컴퓨팅', '클라우드 연동', 'MES/ERP 연동 기술'],
  // SEO defaults
  siteTitle: '', siteDescription: '', siteKeywords: '', siteAuthor: '', siteLanguage: 'ko',
  siteUrl: '', ogTitle: '', ogDescription: '', ogImage: '', ogType: 'website',
  twitterCard: 'summary_large_image', twitterSite: '', twitterCreator: '',
  robotsIndex: true, robotsFollow: true, googleAnalyticsId: '', googleSiteVerification: '',
  // Social media defaults
  instagramUrl: '', twitterUrl: '', facebookUrl: '', youtubeUrl: '', tiktokUrl: '',
  behanceUrl: '', dribbbleUrl: '', mediumUrl: '', telegramUrl: '', discordUrl: '',
  kakaoTalkUrl: '', naverBlogUrl: '', tistoryUrl: '', velogUrl: '', notionUrl: '',
  // Analytics defaults
  googleTagManagerId: '', facebookPixelId: '', naverAnalyticsId: '', kakaoPixelId: '',
  hotjarId: '', mixpanelToken: '', amplitudeApiKey: '', sentryDsn: '',
  logRocketId: '', fullStoryOrgId: '', intercomAppId: '', zendeskWidgetKey: '',
  crispWebsiteId: '', tawkToPropertyId: '', liveChatLicense: '', olarkSiteId: '',
  // Security defaults
  enableHttps: true, enableCsp: true, cspDirectives: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
  enableHsts: true, hstsMaxAge: '31536000', enableXssProtection: true, enableContentTypeOptions: true,
  enableFrameOptions: true, frameOptionsValue: 'DENY', enableReferrerPolicy: true, referrerPolicyValue: 'strict-origin-when-cross-origin',
  enablePermissionsPolicy: true, permissionsPolicyValue: 'camera=(), microphone=(), geolocation=(), payment=()', enableApiRateLimit: true, apiRateLimitPerMinute: '60',
  enableAdminAuth: true, adminSessionTimeout: '3600', enableTwoFactorAuth: false, enableIpWhitelist: false, allowedIpAddresses: '',
  enableAuditLog: true, enableBackup: true, backupFrequency: 'daily'
}

// All settings sections with field definitions
export const allSections: SectionDefinition[] = [
  {
    title: '🧑 개인 정보',
    fields: [
      { key: 'fullName', label: '전체 이름', type: 'text', placeholder: '최주영', isMultilingual: true },
      { key: 'firstName', label: '이름', type: 'text', placeholder: '주영', isMultilingual: true },
      { key: 'role', label: '역할/직책', type: 'text', placeholder: '공장자동화 전문가', isMultilingual: true },
      { key: 'subtitle', label: '부제목', type: 'text', placeholder: '바리스타 → 자동화 엔지니어', isMultilingual: true },
      { key: 'location', label: '위치', type: 'text', placeholder: '부산', isMultilingual: true },
      { key: 'education', label: '교육', type: 'text', placeholder: '부산인력개발원', isMultilingual: true },
      { key: 'yearsOfExperience', label: '경력 기간', type: 'text', placeholder: '5년', isMultilingual: true },
      { key: 'email', label: '이메일', type: 'email', placeholder: 'your@email.com' },
      { key: 'phone', label: '전화번호', type: 'tel', placeholder: '+82 10-1234-5678' },
    ] as Field[]
  },
  {
    title: '🔗 소셜 링크',
    fields: [
      { key: 'githubUrl', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/username' },
      { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/username' },
    ] as Field[]
  },
  {
    title: '⚙️ 사이드바 설정',
    fields: [
      { key: 'sidebarSkillCount', label: '사이드바 핵심기술 표시 개수', type: 'number', min: 3, max: 6, placeholder: '4' },
      { key: 'languageCardSkillCount', label: '사이드바 언어카드 표시 개수', type: 'number', min: 2, max: 5, placeholder: '3' },
    ] as Field[]
  },
  {
    title: '🏠 Hero 섹션 (메인 페이지)',
    fields: [
      { key: 'heroTitle', label: 'Hero 제목', type: 'text', placeholder: '공장자동화 전문가', isMultilingual: true },
      { key: 'heroSubtitle', label: 'Hero 부제목', type: 'textarea', rows: 6, placeholder: '여러분의 소개를 작성하세요...', isMultilingual: true },
      { key: 'heroTag', label: 'Hero 태그', type: 'text', placeholder: '🎯 취업 준비 중', isMultilingual: true },
    ] as Field[]
  },
  {
    title: '👤 About 섹션',
    fields: [
      { key: 'aboutTitle', label: 'About 제목', type: 'text', placeholder: '저의 여정', isMultilingual: true },
      { key: 'aboutSubtitle', label: 'About 부제목', type: 'text', placeholder: '커피 한 잔에서 시작된...', isMultilingual: true },
      { key: 'aboutDescription1', label: 'About 설명 1', type: 'textarea', rows: 6, placeholder: '첫 번째 문단...', isMultilingual: true },
      { key: 'aboutDescription2', label: 'About 설명 2', type: 'textarea', rows: 6, placeholder: '두 번째 문단...', isMultilingual: true },
      { key: 'aboutCardTitle', label: '소개 카드 제목', type: 'text', placeholder: '바리스타에서 자동화 전문가로', isMultilingual: true },
      { key: 'aboutJourneyTitle', label: '성장 여정 제목', type: 'text', placeholder: '성장 여정', isMultilingual: true },
    ] as Field[]
  },
  {
    title: '💼 Experience 섹션',
    fields: [
      { key: 'experienceTitle', label: 'Experience 제목', type: 'text', placeholder: '경력 & 학습', isMultilingual: true },
      { key: 'experienceSubtitle', label: 'Experience 부제목', type: 'text', placeholder: '바리스타에서 자동화 전문가로...', isMultilingual: true },
    ] as Field[]
  },
  {
    title: '🛠️ Skills 섹션',
    fields: [
      { key: 'skillsTitle', label: 'Skills 제목', type: 'text', placeholder: '기술 스택', isMultilingual: true },
      { key: 'skillsSubtitle', label: 'Skills 부제목', type: 'text', placeholder: '공장자동화와 데이터 분석을...', isMultilingual: true },
    ] as Field[]
  },
  {
    title: '🎯 학습 목표 (Skills 페이지)',
    fields: [
      { key: 'learningGoalsTitle', label: '학습 목표 제목', type: 'text', placeholder: '앞으로의 학습 목표', isMultilingual: true },
      { key: 'learningGoalsDescription', label: '학습 목표 설명', type: 'textarea', placeholder: '4차 산업혁명 시대에...', isMultilingual: true },
      { key: 'learningGoalsList', label: '학습 목표 기술 목록', type: 'array', placeholder: '기술 이름 입력 (Enter로 추가)' },
    ] as Field[]
  },
  {
    title: '📁 Projects 섹션',
    fields: [
      { key: 'projectsTitle', label: 'Projects 제목', type: 'text', placeholder: '프로젝트', isMultilingual: true },
      { key: 'projectsSubtitle', label: 'Projects 부제목', type: 'text', placeholder: '다양한 분야의 프로젝트...', isMultilingual: true },
      { key: 'projectsUpdateTitle', label: '업데이트 카드 제목', type: 'text', placeholder: '프로젝트 업데이트 예정', isMultilingual: true },
      { key: 'projectsUpdateDescription', label: '업데이트 카드 설명', type: 'textarea', placeholder: '현재 학습 중인 기술들을 활용한 실제 프로젝트들을 곧 업로드할 예정입니다.', isMultilingual: true },
      { key: 'projectsUpdateTechList', label: '업데이트 예정 기술 목록', type: 'array', placeholder: '기술 이름 입력 (Enter로 추가)' },
    ] as Field[]
  },
  {
    title: '📚 Books 섹션',
    fields: [
      { key: 'booksTitle', label: 'Books 제목', type: 'text', placeholder: '기술 서적 & 학습 노트', isMultilingual: true },
      { key: 'booksSubtitle', label: 'Books 부제목', type: 'text', placeholder: '읽은 기술 서적과...', isMultilingual: true },
    ] as Field[]
  },
  {
    title: '📞 Contact 섹션',
    fields: [
      { key: 'contactTitle', label: 'Contact 제목', type: 'text', placeholder: '연락처', isMultilingual: true },
      { key: 'contactSubtitle', label: 'Contact 부제목', type: 'text', placeholder: '프로젝트나 협업에...', isMultilingual: true },
    ] as Field[]
  },
  {
    title: '📊 통계 섹션',
    fields: [
      { key: 'stat1Number', label: '통계 1 숫자', type: 'text', placeholder: '5+' },
      { key: 'stat1Label', label: '통계 1 라벨', type: 'text', placeholder: '년 경력', isMultilingual: true },
      { key: 'stat2Number', label: '통계 2 숫자', type: 'text', placeholder: '10+' },
      { key: 'stat2Label', label: '통계 2 라벨', type: 'text', placeholder: '기술 스택', isMultilingual: true },
      { key: 'stat3Number', label: '통계 3 숫자', type: 'text', placeholder: '3+' },
      { key: 'stat3Label', label: '통계 3 라벨', type: 'text', placeholder: '완료 프로젝트', isMultilingual: true },
    ] as Field[]
  },
  // SEO Settings
  {
    title: '🔍 기본 SEO 설정',
    fields: [
      { key: 'siteTitle', label: '사이트 제목', type: 'text', placeholder: '포트폴리오 - 홍길동' },
      { key: 'siteDescription', label: '사이트 설명', type: 'textarea', rows: 3, placeholder: '공장자동화 전문가 홍길동의 포트폴리오입니다. PLC 프로그래밍, 데이터 분석, 자동화 시스템 개발 경험을 소개합니다.' },
      { key: 'siteKeywords', label: '키워드 (쉼표로 구분)', type: 'text', placeholder: '공장자동화, PLC, 데이터분석, 자동화시스템' },
      { key: 'siteAuthor', label: '작성자', type: 'text', placeholder: '홍길동' },
      { key: 'siteLanguage', label: '사이트 언어', type: 'select', placeholder: '언어 선택', options: [
        { value: 'ko', label: '한국어 (ko)' },
        { value: 'en', label: 'English (en)' },
        { value: 'ja', label: '日本語 (ja)' },
        { value: 'zh', label: '中文 (zh)' }
      ]},
      { key: 'siteUrl', label: '사이트 URL', type: 'url', placeholder: 'https://yourportfolio.com' },
    ] as Field[]
  },
  {
    title: '📱 Open Graph (Facebook, LinkedIn)',
    fields: [
      { key: 'ogTitle', label: 'OG 제목', type: 'text', placeholder: '포트폴리오 - 홍길동' },
      { key: 'ogDescription', label: 'OG 설명', type: 'textarea', rows: 3, placeholder: '공장자동화 전문가 홍길동의 포트폴리오를 확인해보세요.' },
      { key: 'ogImage', label: 'OG 이미지 URL', type: 'url', placeholder: 'https://yourportfolio.com/og-image.jpg' },
      { key: 'ogType', label: 'OG 타입', type: 'select', placeholder: '타입 선택', options: [
        { value: 'website', label: '웹사이트 (website)' },
        { value: 'profile', label: '프로필 (profile)' },
        { value: 'article', label: '기사 (article)' }
      ]},
    ] as Field[]
  },
  {
    title: '🐦 Twitter Card',
    fields: [
      { key: 'twitterCard', label: 'Twitter Card 타입', type: 'select', placeholder: '카드 타입 선택', options: [
        { value: 'summary', label: '요약 (summary)' },
        { value: 'summary_large_image', label: '큰 이미지 요약 (summary_large_image)' },
        { value: 'app', label: '앱 (app)' },
        { value: 'player', label: '플레이어 (player)' }
      ]},
      { key: 'twitterSite', label: 'Twitter 사이트 계정', type: 'text', placeholder: '@yourhandle' },
      { key: 'twitterCreator', label: 'Twitter 작성자 계정', type: 'text', placeholder: '@yourhandle' },
    ] as Field[]
  },
  {
    title: '🤖 검색 엔진 설정',
    fields: [
      { key: 'robotsIndex', label: '검색 엔진 인덱싱 허용', type: 'checkbox', placeholder: '검색 엔진이 이 사이트를 인덱싱할 수 있도록 허용합니다.' },
      { key: 'robotsFollow', label: '링크 팔로우 허용', type: 'checkbox', placeholder: '검색 엔진이 이 사이트의 링크를 따라갈 수 있도록 허용합니다.' },
    ] as Field[]
  },
  {
    title: '📊 Google 설정',
    fields: [
      { key: 'googleAnalyticsId', label: 'Google Analytics ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
      { key: 'googleSiteVerification', label: 'Google 사이트 인증 코드', type: 'text', placeholder: 'google-site-verification=...' },
    ] as Field[]
  },
  // Social Media
  {
    title: '📱 글로벌 소셜 미디어',
    fields: [
      { key: 'instagramUrl', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/yourhandle' },
      { key: 'twitterUrl', label: 'Twitter URL', type: 'url', placeholder: 'https://twitter.com/yourhandle' },
      { key: 'facebookUrl', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/yourpage' },
      { key: 'youtubeUrl', label: 'YouTube URL', type: 'url', placeholder: 'https://youtube.com/@yourchannel' },
      { key: 'tiktokUrl', label: 'TikTok URL', type: 'url', placeholder: 'https://tiktok.com/@yourhandle' },
    ] as Field[]
  },
  {
    title: '🎨 디자인 & 포트폴리오',
    fields: [
      { key: 'behanceUrl', label: 'Behance URL', type: 'url', placeholder: 'https://behance.net/yourprofile' },
      { key: 'dribbbleUrl', label: 'Dribbble URL', type: 'url', placeholder: 'https://dribbble.com/yourhandle' },
    ] as Field[]
  },
  {
    title: '✍️ 블로그 & 글쓰기',
    fields: [
      { key: 'mediumUrl', label: 'Medium URL', type: 'url', placeholder: 'https://medium.com/@yourhandle' },
      { key: 'velogUrl', label: 'Velog URL', type: 'url', placeholder: 'https://velog.io/@yourhandle' },
      { key: 'tistoryUrl', label: 'Tistory URL', type: 'url', placeholder: 'https://yourblog.tistory.com' },
      { key: 'naverBlogUrl', label: '네이버 블로그 URL', type: 'url', placeholder: 'https://blog.naver.com/yourblog' },
    ] as Field[]
  },
  {
    title: '💬 메신저 & 커뮤니케이션',
    fields: [
      { key: 'telegramUrl', label: 'Telegram URL', type: 'url', placeholder: 'https://t.me/yourhandle' },
      { key: 'discordUrl', label: 'Discord URL', type: 'url', placeholder: 'https://discord.gg/yourserver' },
      { key: 'kakaoTalkUrl', label: '카카오톡 URL', type: 'url', placeholder: 'https://open.kakao.com/o/yourgroup' },
    ] as Field[]
  },
  {
    title: '📝 워크스페이스 & 도구',
    fields: [
      { key: 'notionUrl', label: 'Notion 워크스페이스 URL', type: 'url', placeholder: 'https://notion.so/yourworkspace' },
    ] as Field[]
  },
  // Analytics
  {
    title: '📊 웹 분석 도구',
    fields: [
      { key: 'googleTagManagerId', label: 'Google Tag Manager ID', type: 'text', placeholder: 'GTM-XXXXXXX' },
      { key: 'facebookPixelId', label: 'Facebook Pixel ID', type: 'text', placeholder: '123456789012345' },
      { key: 'naverAnalyticsId', label: '네이버 웹마스터 도구 ID', type: 'text', placeholder: 'naver-site-verification=...' },
      { key: 'kakaoPixelId', label: '카카오 픽셀 ID', type: 'text', placeholder: '1234567890' },
    ] as Field[]
  },
  {
    title: '🔍 사용자 행동 분석',
    fields: [
      { key: 'hotjarId', label: 'Hotjar Site ID', type: 'text', placeholder: '1234567' },
      { key: 'mixpanelToken', label: 'Mixpanel Project Token', type: 'text', placeholder: 'abc123def456...' },
      { key: 'amplitudeApiKey', label: 'Amplitude API Key', type: 'text', placeholder: 'abc123def456...' },
    ] as Field[]
  },
  {
    title: '🐛 에러 추적 & 모니터링',
    fields: [
      { key: 'sentryDsn', label: 'Sentry DSN', type: 'text', placeholder: 'https://abc123@sentry.io/123456' },
      { key: 'logRocketId', label: 'LogRocket App ID', type: 'text', placeholder: 'abc123def456' },
      { key: 'fullStoryOrgId', label: 'FullStory Org ID', type: 'text', placeholder: 'ABC123' },
    ] as Field[]
  },
  {
    title: '💬 고객 지원 & 채팅',
    fields: [
      { key: 'intercomAppId', label: 'Intercom App ID', type: 'text', placeholder: 'abc123def' },
      { key: 'zendeskWidgetKey', label: 'Zendesk Widget Key', type: 'text', placeholder: 'abc123def456...' },
      { key: 'crispWebsiteId', label: 'Crisp Website ID', type: 'text', placeholder: 'abc123def456...' },
    ] as Field[]
  },
  {
    title: '🎧 추가 채팅 도구',
    fields: [
      { key: 'tawkToPropertyId', label: 'Tawk.to Property ID', type: 'text', placeholder: 'abc123def456...' },
      { key: 'liveChatLicense', label: 'LiveChat License Number', type: 'text', placeholder: '12345678' },
      { key: 'olarkSiteId', label: 'Olark Site ID', type: 'text', placeholder: 'abc123def456...' },
    ] as Field[]
  },
  // Security
  {
    title: '🔒 기본 보안 헤더',
    fields: [
      { key: 'enableHttps', label: 'HTTPS 강제 사용', type: 'checkbox', placeholder: '모든 HTTP 요청을 HTTPS로 리다이렉트합니다.' },
      { key: 'enableCsp', label: 'Content Security Policy (CSP) 활성화', type: 'checkbox', placeholder: 'XSS 공격을 방지하기 위한 CSP 헤더를 설정합니다.' },
      { key: 'cspDirectives', label: 'CSP 지시문', type: 'textarea', rows: 3, placeholder: 'Content Security Policy 지시문을 설정합니다.' },
      { key: 'enableHsts', label: 'HTTP Strict Transport Security (HSTS) 활성화', type: 'checkbox', placeholder: 'HTTPS 연결을 강제하는 HSTS 헤더를 설정합니다.' },
      { key: 'hstsMaxAge', label: 'HSTS 최대 나이 (초)', type: 'text', placeholder: '31536000 (1년)' },
    ] as Field[]
  },
  {
    title: '🛡️ 추가 보안 헤더',
    fields: [
      { key: 'enableXssProtection', label: 'XSS 보호 활성화', type: 'checkbox', placeholder: '브라우저의 XSS 필터를 활성화합니다.' },
      { key: 'enableContentTypeOptions', label: 'Content-Type 옵션 활성화', type: 'checkbox', placeholder: 'MIME 타입 스니핑 공격을 방지합니다.' },
      { key: 'enableFrameOptions', label: 'X-Frame-Options 활성화', type: 'checkbox', placeholder: '클릭재킹 공격을 방지합니다.' },
      { key: 'frameOptionsValue', label: 'X-Frame-Options 값', type: 'select', placeholder: '헤더 값 선택', options: [
        { value: 'DENY', label: 'DENY (모든 프레임 차단)' },
        { value: 'SAMEORIGIN', label: 'SAMEORIGIN (같은 도메인만 허용)' },
        { value: 'ALLOW-FROM', label: 'ALLOW-FROM (특정 도메인 허용)' }
      ]},
      { key: 'enableReferrerPolicy', label: 'Referrer Policy 활성화', type: 'checkbox', placeholder: '리퍼러 정보 노출을 제어합니다.' },
      { key: 'referrerPolicyValue', label: 'Referrer Policy 값', type: 'select', placeholder: '정책 값 선택', options: [
        { value: 'no-referrer', label: 'no-referrer (리퍼러 정보 전송 안함)' },
        { value: 'strict-origin-when-cross-origin', label: 'strict-origin-when-cross-origin (교차 도메인시 도메인만)' },
        { value: 'same-origin', label: 'same-origin (같은 도메인만)' }
      ]},
    ] as Field[]
  },
  {
    title: '🔐 권한 및 정책',
    fields: [
      { key: 'enablePermissionsPolicy', label: 'Permissions Policy 활성화', type: 'checkbox', placeholder: '브라우저 기능 사용을 제어합니다.' },
      { key: 'permissionsPolicyValue', label: 'Permissions Policy 값', type: 'textarea', rows: 2, placeholder: 'camera=(), microphone=(), geolocation=(), payment=()' },
    ] as Field[]
  },
  {
    title: '⚡ API 보안',
    fields: [
      { key: 'enableApiRateLimit', label: 'API 속도 제한 활성화', type: 'checkbox', placeholder: 'API 요청 빈도를 제한하여 DDoS 공격을 방지합니다.' },
      { key: 'apiRateLimitPerMinute', label: '분당 API 요청 제한', type: 'text', placeholder: '60 (분당 60회)' },
    ] as Field[]
  },
  {
    title: '👤 관리자 인증',
    fields: [
      { key: 'enableAdminAuth', label: '관리자 인증 활성화', type: 'checkbox', placeholder: '관리자 대시보드 접근을 위한 인증을 활성화합니다.' },
      { key: 'adminSessionTimeout', label: '관리자 세션 타임아웃 (초)', type: 'text', placeholder: '3600 (1시간)' },
      { key: 'enableTwoFactorAuth', label: '2단계 인증 활성화', type: 'checkbox', placeholder: '관리자 로그인시 2단계 인증을 요구합니다.' },
      { key: 'enableIpWhitelist', label: 'IP 화이트리스트 활성화', type: 'checkbox', placeholder: '특정 IP 주소에서만 관리자 접근을 허용합니다.' },
      { key: 'allowedIpAddresses', label: '허용된 IP 주소 (쉼표로 구분)', type: 'text', placeholder: '192.168.1.1, 10.0.0.1' },
    ] as Field[]
  },
  {
    title: '📋 로그 & 백업',
    fields: [
      { key: 'enableAuditLog', label: '감사 로그 활성화', type: 'checkbox', placeholder: '관리자 활동을 기록하여 보안 감사를 지원합니다.' },
      { key: 'enableBackup', label: '자동 백업 활성화', type: 'checkbox', placeholder: '정기적으로 데이터를 백업합니다.' },
      { key: 'backupFrequency', label: '백업 빈도', type: 'select', placeholder: '백업 주기 선택', options: [
        { value: 'hourly', label: '매시간 (hourly)' },
        { value: 'daily', label: '매일 (daily)' },
        { value: 'weekly', label: '매주 (weekly)' },
        { value: 'monthly', label: '매월 (monthly)' }
      ]},
    ] as Field[]
  },
]

