/**
 * 환경 설정 관리
 * 모든 환경 변수와 설정을 중앙에서 관리
 */

require('dotenv').config();

const config = {
  // 서버 설정
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 데이터베이스 설정
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',
    options: {}
  },
  
  // JWT 설정
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-2024',
    expiresIn: '24h',
    issuer: 'personal-portfolio',
    audience: 'admin-dashboard'
  },
  
  // CORS 설정
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
  },
  
  // 보안 설정
  security: {
    // Rate Limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // 🌟 공개 API 최대 요청 수 (운영 환경 적합)
      adminMax: 20, // 🌟 관리자 API는 Rate Limiter 미적용 (인증으로만 보호)
    },
    
    // 보안 헤더 기본값
    headers: {
      csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },
    
    // 캐시 설정
    cache: {
      duration: 5 * 60 * 1000, // 5분
    }
  },
  
  // 쿠키 설정
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS 필수
    sameSite: 'none', // 크로스 도메인 쿠키 허용
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
};

// 환경 변수 유효성 검사
const validateConfig = () => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('❌ 필수 환경 변수가 누락되었습니다:', missing);
    process.exit(1);
  }
  
  if (config.jwt.secret === 'your-super-secret-jwt-key-here-2024' && process.env.NODE_ENV === 'production') {
    console.error('❌ 프로덕션 환경에서는 JWT_SECRET을 설정해야 합니다.');
    process.exit(1);
  }
};

// 개발 환경에서만 유효성 검사 실행
if (config.nodeEnv === 'development') {
  validateConfig();
}

module.exports = config;
