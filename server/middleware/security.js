/**
 * 보안 미들웨어
 * Helmet, CORS, Rate Limiting 등 보안 관련 미들웨어를 중앙에서 관리
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// =================================================================
// CORS 설정
// =================================================================

const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const corsMiddleware = cors(corsOptions);

// =================================================================
// Rate Limiting 설정
// =================================================================

// 기본 Rate Limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: {
    error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 관리자 API용 엄격한 Rate Limiting
const adminLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.adminMax,
  message: {
    error: '관리자 API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
  }
});

// =================================================================
// Helmet 보안 헤더 설정
// =================================================================

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: config.security.headers.hsts,
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
};

const helmetMiddleware = helmet(helmetOptions);

// =================================================================
// 보안 미들웨어 설정 함수
// =================================================================

const setupSecurityMiddleware = (app) => {
  // CORS 설정 - Preflight 요청 먼저 처리
  app.options('*', cors(corsOptions));
  app.use(corsMiddleware);
  
  // 🌟 전역 Rate Limiting 제거 - 선택적 적용으로 변경
  // app.use('/api', limiter);        // 제거됨
  // app.use('/api/admin', adminLimiter); // 제거됨
  
  // Helmet 보안 헤더 적용
  app.use(helmetMiddleware);
  
  console.log('✅ 보안 미들웨어 설정 완료 (선택적 Rate Limiting)');
};

module.exports = {
  setupSecurityMiddleware,
  corsMiddleware,
  limiter,
  adminLimiter,
  helmetMiddleware
};
