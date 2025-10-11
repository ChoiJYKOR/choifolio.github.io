const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
require('dotenv').config();

const app = express();

// =================================================================
// 1. 미들웨어 (Middleware)
// =================================================================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true // HttpOnly 쿠키를 위한 credentials 허용
}));

// =================================================================
// 보안 헤더 미들웨어 (Security Headers Middleware)
// =================================================================

// 기본 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 관리자 API용 엄격한 Rate Limiting
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20, // 최대 20 요청
  message: {
    error: '관리자 API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
  }
});

// 보안 헤더 설정
app.use(helmet({
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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Rate Limiting 적용
app.use('/api', limiter);
app.use('/api/admin', adminLimiter);

// 동적 보안 헤더 적용 (모든 요청에 적용)
app.use(dynamicSecurityHeaders);

app.use(express.json());
app.use(cookieParser()); // 쿠키 파싱을 위한 미들웨어

// =================================================================
// 2. MongoDB Connection
// =================================================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio') 
.then(() => console.log('✅ MongoDB connected successfully.'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// =================================================================
// 3. 모델 정의 (Mongoose Models)
// =================================================================

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  isAdmin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  category: String,
  coverImage: String,
  readDate: Date,
  rating: Number,
  // 새로운 목차 구조
  chapters: [{
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    learnings: [{
      topic: String,
      content: String,
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  // 기존 learnings 호환성을 위해 유지
  learnings: [{
    topic: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ExperienceSchema = new mongoose.Schema({
  period: String,
  title: String,
  company: String,
  description: String,
  skills: [String],
  iconKey: String,
  color: String,
  bgColor: String,
  order: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  category: String,
  status: { type: String, enum: ['preparing', 'planning', 'completed'], default: 'preparing' },
  githubLink: String,
  liveLink: String,
  image: String,
  images: [String],
  videos: [String],
  detailedDescription: String,
  features: [String],
  learnings: [String],
  order: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const SiteSettingsSchema = new mongoose.Schema({
  // 개인 정보 (Personal Info)
  fullName: { type: String, default: '최주영' },
  firstName: { type: String, default: '주영' },
  role: { type: String, default: '공장자동화 전문가' },
  subtitle: { type: String, default: '바리스타 → 자동화 엔지니어' },
  location: { type: String, default: '부산' },
  education: { type: String, default: '부산인력개발원' },
  yearsOfExperience: { type: String, default: '5년' },
  email: { type: String, default: 'juyeong_choi@naver.com' },
  phone: { type: String, default: '+82 10-1234-5678' },
  
  // 소셜 링크 (Social Links)
  githubUrl: { type: String, default: '#' },
  linkedinUrl: { type: String, default: '#' },
  
  // 섹션별 제목 및 부제목 (Section Titles & Subtitles)
  heroTitle: { type: String, default: '공장자동화 전문가' },
  heroSubtitle: { type: String, default: '스타벅스 바리스타에서 공장자동화 전문가로의 여정을 시작한 최주영입니다.\nPLC 프로그래밍부터 데이터 분석까지, 스마트 팩토리의 미래를 만들어갑니다.' },
  aboutTitle: { type: String, default: '저의 여정' },
  aboutSubtitle: { type: String, default: '커피 한 잔에서 시작된 공장자동화 전문가로의 여정' },
  aboutDescription1: { type: String, default: '스타벅스에서 5년간 바리스타로 일하며 고객 서비스, 품질 관리, 효율성 개선에 대한 깊은 이해를 얻었습니다. 매일 반복되는 작업을 더 효율적으로 만들고 싶다는 생각이 공장자동화 분야에 대한 관심으로 이어졌습니다.' },
  aboutDescription2: { type: String, default: '현재는 PLC 프로그래밍(멜섹, 지멘스), 통계학, 데이터과학, Python을 활용한 데이터 분석, 전자회로, 유공압, 협동로봇(뉴로메카), 아두이노, 라즈베리파이, MySQL 등 다양한 기술을 학습하며 스마트 팩토리의 미래를 준비하고 있습니다.' },
  skillsTitle: { type: String, default: '기술 스택' },
  skillsSubtitle: { type: String, default: '공장자동화와 데이터 분석을 위한 다양한 기술을 습득했습니다.' },
  projectsTitle: { type: String, default: '프로젝트' },
  projectsSubtitle: { type: String, default: '다양한 분야의 프로젝트를 통해 기술적 역량을 보여드립니다.' },
  booksTitle: { type: String, default: '기술 서적 & 학습 노트' },
  booksSubtitle: { type: String, default: '읽은 기술 서적과 그로부터 배운 지식을 공유합니다' },
  contactTitle: { type: String, default: '연락처' },
  contactSubtitle: { type: String, default: '프로젝트나 협업에 관심이 있으시다면 언제든지 연락해주세요.' },
  
  // 통계 (Stats)
  stat1Number: { type: String, default: '5+' },
  stat1Label: { type: String, default: '년 경력' },
  stat2Number: { type: String, default: '3+' },
  stat2Label: { type: String, default: '완료 프로젝트' },
  stat3Number: { type: String, default: '10+' },
  stat3Label: { type: String, default: '기술 스택' },
  
  // Hero 섹션 추가 필드
  heroTag: { type: String, default: '🎯 취업 준비 중' },
  heroCtaLink1: { type: String, default: '/#projects' },
  heroCtaLink2: { type: String, default: '/resume.pdf' },
  
  // 경력 (Experience Section)
  experienceTitle: { type: String, default: '경력 & 학습' },
  experienceSubtitle: { type: String, default: '바리스타에서 자동화 전문가로의 성장 여정' },
    // 보안 설정 필드들 (Security Settings)
  enableHttps: { type: Boolean, default: true },
  enableCsp: { type: Boolean, default: true },
  cspDirectives: { type: String, default: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" },
  enableHsts: { type: Boolean, default: true },
  hstsMaxAge: { type: String, default: '31536000' },
  enableXssProtection: { type: Boolean, default: true },
  enableContentTypeOptions: { type: Boolean, default: true },
  enableFrameOptions: { type: Boolean, default: true },
  frameOptionsValue: { type: String, default: 'DENY' },
  enableReferrerPolicy: { type: Boolean, default: true },
  referrerPolicyValue: { type: String, default: 'strict-origin-when-cross-origin' },
  enablePermissionsPolicy: { type: Boolean, default: true },
  permissionsPolicyValue: { type: String, default: 'camera=(), microphone=(), geolocation=(), payment=()' },
  enableApiRateLimit: { type: Boolean, default: true },
  apiRateLimitPerMinute: { type: String, default: '60' },
  enableAdminAuth: { type: Boolean, default: true },
  adminSessionTimeout: { type: String, default: '3600' },
  enableTwoFactorAuth: { type: Boolean, default: false },
  enableIpWhitelist: { type: Boolean, default: false },
  allowedIpAddresses: { type: String, default: '' },
  enableAuditLog: { type: Boolean, default: true },
  enableBackup: { type: Boolean, default: true },
  backupFrequency: { type: String, default: 'daily' },

  // SEO 설정 필드들 (SEO Settings)
  siteTitle: { type: String, default: '' },
  siteDescription: { type: String, default: '' },
  siteKeywords: { type: String, default: '' },
  siteAuthor: { type: String, default: '' },
  siteLanguage: { type: String, default: 'ko' },
  siteUrl: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  ogType: { type: String, default: 'website' },
  twitterCard: { type: String, default: 'summary_large_image' },
  twitterSite: { type: String, default: '' },
  twitterCreator: { type: String, default: '' },
  robotsIndex: { type: Boolean, default: true },
  robotsFollow: { type: Boolean, default: true },
  googleAnalyticsId: { type: String, default: '' },
  googleSiteVerification: { type: String, default: '' },

  // 소셜 미디어 설정 필드들 (Social Media Settings)
  instagramUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  tiktokUrl: { type: String, default: '' },
  behanceUrl: { type: String, default: '' },
  dribbbleUrl: { type: String, default: '' },
  mediumUrl: { type: String, default: '' },
  telegramUrl: { type: String, default: '' },
  discordUrl: { type: String, default: '' },
  kakaoTalkUrl: { type: String, default: '' },
  naverBlogUrl: { type: String, default: '' },
  tistoryUrl: { type: String, default: '' },
  velogUrl: { type: String, default: '' },
  notionUrl: { type: String, default: '' },

  // 분석 도구 설정 필드들 (Analytics Settings)
  googleTagManagerId: { type: String, default: '' },
  facebookPixelId: { type: String, default: '' },
  naverAnalyticsId: { type: String, default: '' },
  kakaoPixelId: { type: String, default: '' },
  hotjarId: { type: String, default: '' },
  mixpanelToken: { type: String, default: '' },
  amplitudeApiKey: { type: String, default: '' },
  sentryDsn: { type: String, default: '' },
  logRocketId: { type: String, default: '' },
  fullStoryOrgId: { type: String, default: '' },
  intercomAppId: { type: String, default: '' },
  zendeskWidgetKey: { type: String, default: '' },
  crispWebsiteId: { type: String, default: '' },
  tawkToPropertyId: { type: String, default: '' },
  liveChatLicense: { type: String, default: '' },
  olarkSiteId: { type: String, default: '' },
  
  // 메타 정보 (Meta)
  updatedAt: { type: Date, default: Date.now }
});

// 4. 모델 생성 (Model Initialization)
const Admin = mongoose.model('Admin', AdminSchema);
const Book = mongoose.model('Book', BookSchema);
const Experience = mongoose.model('Experience', ExperienceSchema);
const Project = mongoose.model('Project', ProjectSchema);
const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema);

// =================================================================
// 4-1. 동적 보안 헤더 설정 함수 (Dynamic Security Headers)
// =================================================================

// 보안 설정 캐시
let securitySettingsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 보안 설정을 가져오는 함수
async function getSecuritySettings() {
  const now = Date.now();
  
  // 캐시가 유효한 경우 캐시된 설정 반환
  if (securitySettingsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return securitySettingsCache;
  }
  
  try {
    const settings = await SiteSettings.findOne();
    if (settings) {
      securitySettingsCache = settings;
      cacheTimestamp = now;
      return settings;
    }
  } catch (error) {
    console.error('보안 설정 로드 오류:', error);
  }
  
  // 기본 설정 반환
  return {
    enableHttps: true,
    enableCsp: true,
    cspDirectives: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    enableHsts: true,
    hstsMaxAge: '31536000',
    enableXssProtection: true,
    enableContentTypeOptions: true,
    enableFrameOptions: true,
    frameOptionsValue: 'DENY',
    enableReferrerPolicy: true,
    referrerPolicyValue: 'strict-origin-when-cross-origin',
    enablePermissionsPolicy: true,
    permissionsPolicyValue: 'camera=(), microphone=(), geolocation=(), payment=()'
  };
}

// 캐시 무효화 함수
function invalidateSecurityCache() {
  securitySettingsCache = null;
  cacheTimestamp = null;
}

// 동적 보안 헤더 미들웨어
async function dynamicSecurityHeaders(req, res, next) {
  try {
    const settings = await getSecuritySettings();
    
    // HTTPS 강제 (프로덕션에서만)
    if (settings.enableHttps && process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', `max-age=${settings.hstsMaxAge}; includeSubDomains; preload`);
    }
    
    // XSS 보호
    if (settings.enableXssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
    
    // MIME 타입 스니핑 방지
    if (settings.enableContentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    
    // 프레임 옵션
    if (settings.enableFrameOptions) {
      res.setHeader('X-Frame-Options', settings.frameOptionsValue);
    }
    
    // 리퍼러 정책
    if (settings.enableReferrerPolicy) {
      res.setHeader('Referrer-Policy', settings.referrerPolicyValue);
    }
    
    // 권한 정책
    if (settings.enablePermissionsPolicy) {
      res.setHeader('Permissions-Policy', settings.permissionsPolicyValue);
    }
    
    // CSP (Content Security Policy)
    if (settings.enableCsp) {
      res.setHeader('Content-Security-Policy', settings.cspDirectives);
    }
    
    next();
  } catch (error) {
    console.error('동적 보안 헤더 설정 오류:', error);
    next();
  }
}

// =================================================================
// 4-2. Joi 유효성 검사 스키마 (Input Validation Schemas)
// =================================================================

// Joi 유효성 검사 미들웨어
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: '입력값 유효성 검사 실패',
        errors: errorMessages
      });
    }
    
    req[property] = value;
    next();
  };
};

// 1. SQL Injection 방지 스키마들
const adminLoginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': '사용자명은 영문자와 숫자만 사용 가능합니다',
      'string.min': '사용자명은 최소 3자 이상이어야 합니다',
      'string.max': '사용자명은 최대 30자까지 가능합니다',
      'any.required': '사용자명은 필수 입력 항목입니다'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .required()
    .messages({
      'string.min': '비밀번호는 최소 6자 이상이어야 합니다',
      'string.max': '비밀번호는 최대 128자까지 가능합니다',
      'string.pattern.base': '비밀번호에 허용되지 않는 문자가 포함되어 있습니다',
      'any.required': '비밀번호는 필수 입력 항목입니다'
    })
});

// 2. 잘못된 데이터 형식 차단 스키마들
const bookSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  author: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .allow('')
    .messages({
      'string.min': '저자명은 1자 이상이어야 합니다',
      'string.max': '저자명은 100자를 초과할 수 없습니다'
    }),
  category: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.min': '카테고리는 1자 이상이어야 합니다',
      'string.max': '카테고리는 50자를 초과할 수 없습니다'
    }),
  coverImage: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 이미지 URL 형식이어야 합니다'
    }),
  readDate: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.format': '올바른 날짜 형식이어야 합니다 (YYYY-MM-DD)'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .allow(null)
    .messages({
      'number.base': '평점은 숫자여야 합니다',
      'number.integer': '평점은 정수여야 합니다',
      'number.min': '평점은 1점 이상이어야 합니다',
      'number.max': '평점은 5점을 초과할 수 없습니다'
    })
});

const experienceSchema = Joi.object({
  period: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': '기간은 1자 이상이어야 합니다',
      'string.max': '기간은 100자를 초과할 수 없습니다',
      'any.required': '기간은 필수 입력 항목입니다'
    }),
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  company: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': '회사명은 1자 이상이어야 합니다',
      'string.max': '회사명은 100자를 초과할 수 없습니다',
      'any.required': '회사명은 필수 입력 항목입니다'
    }),
  description: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .messages({
      'string.max': '설명은 5000자를 초과할 수 없습니다'
    }),
  skills: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(50)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '기술 스택은 최대 20개까지 입력 가능합니다',
      'string.min': '기술명은 1자 이상이어야 합니다',
      'string.max': '기술명은 50자를 초과할 수 없습니다'
    }),
  iconKey: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.min': '아이콘 키는 1자 이상이어야 합니다',
      'string.max': '아이콘 키는 50자를 초과할 수 없습니다'
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .allow('')
    .messages({
      'string.pattern.base': '색상은 #RRGGBB 형식이어야 합니다'
    }),
  bgColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .allow('')
    .messages({
      'string.pattern.base': '배경색은 #RRGGBB 형식이어야 합니다'
    }),
  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': '순서는 숫자여야 합니다',
      'number.integer': '순서는 정수여야 합니다',
      'number.min': '순서는 0 이상이어야 합니다'
    })
});

const projectSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  description: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .messages({
      'string.max': '설명은 5000자를 초과할 수 없습니다'
    }),
  detailedDescription: Joi.string()
    .max(10000)
    .trim()
    .allow('')
    .messages({
      'string.max': '상세 설명은 10000자를 초과할 수 없습니다'
    }),
  technologies: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(50)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '기술 스택은 최대 20개까지 입력 가능합니다',
      'string.min': '기술명은 1자 이상이어야 합니다',
      'string.max': '기술명은 50자를 초과할 수 없습니다'
    }),
  category: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.min': '카테고리는 1자 이상이어야 합니다',
      'string.max': '카테고리는 50자를 초과할 수 없습니다'
    }),
  status: Joi.string()
    .valid('preparing', 'planning', 'completed')
    .default('preparing')
    .messages({
      'any.only': '상태는 preparing, planning, completed 중 하나여야 합니다'
    }),
  githubLink: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 GitHub URL 형식이어야 합니다'
    }),
  liveLink: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 라이브 링크 URL 형식이어야 합니다'
    }),
  image: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 이미지 URL 형식이어야 합니다'
    }),
  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .messages({
      'array.max': '이미지는 최대 10개까지 업로드 가능합니다',
      'string.uri': '올바른 이미지 URL 형식이어야 합니다'
    }),
  videos: Joi.array()
    .items(Joi.string().uri())
    .max(5)
    .messages({
      'array.max': '동영상은 최대 5개까지 업로드 가능합니다',
      'string.uri': '올바른 동영상 URL 형식이어야 합니다'
    }),
  features: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(200)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '기능은 최대 20개까지 입력 가능합니다',
      'string.min': '기능명은 1자 이상이어야 합니다',
      'string.max': '기능명은 200자를 초과할 수 없습니다'
    }),
  learnings: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(500)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '학습 내용은 최대 20개까지 입력 가능합니다',
      'string.min': '학습 내용은 1자 이상이어야 합니다',
      'string.max': '학습 내용은 500자를 초과할 수 없습니다'
    }),
  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': '순서는 숫자여야 합니다',
      'number.integer': '순서는 정수여야 합니다',
      'number.min': '순서는 0 이상이어야 합니다'
    })
});

// 3. XSS 입력값 정제를 위한 연락처 메시지 스키마
const contactMessageSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .pattern(/^[가-힣a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': '이름은 1자 이상이어야 합니다',
      'string.max': '이름은 100자를 초과할 수 없습니다',
      'string.pattern.base': '이름은 한글, 영문, 공백만 사용 가능합니다',
      'any.required': '이름은 필수 입력 항목입니다'
    }),
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': '올바른 이메일 형식이어야 합니다',
      'string.max': '이메일은 255자를 초과할 수 없습니다',
      'any.required': '이메일은 필수 입력 항목입니다'
    }),
  subject: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  message: Joi.string()
    .min(1)
    .max(2000)
    .trim()
    .required()
    .messages({
      'string.min': '메시지는 1자 이상이어야 합니다',
      'string.max': '메시지는 2000자를 초과할 수 없습니다',
      'any.required': '메시지는 필수 입력 항목입니다'
    })
});

// 4. API 요청 데이터 무결성 보장을 위한 ID 검증 스키마
const idSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': '올바른 MongoDB ObjectId 형식이어야 합니다',
      'any.required': 'ID는 필수 입력 항목입니다'
    })
});

// MongoDB ObjectId 검증 함수
const validateObjectId = (req, res, next) => {
  const { error } = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).validate(req.params.id);
  
  if (error) {
    return res.status(400).json({
      message: '올바른 ID 형식이 아닙니다',
      error: 'Invalid ObjectId format'
    });
  }
  
  next();
};

// =================================================================
// 5. 강화된 인증/인가 미들웨어 (Enhanced Auth & Authorization)
// =================================================================

// JWT 토큰 생성 함수
const generateToken = (admin) => {
  const payload = {
    id: admin._id,
    username: admin.username,
    email: admin.email,
    isAdmin: admin.isAdmin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-2024', {
    algorithm: 'HS256',
    issuer: 'personal-portfolio',
    audience: 'admin-dashboard'
  });
};

// JWT 토큰 검증 및 관리자 정보 로드
const authenticateToken = async (req, res, next) => {
  try {
    // HttpOnly 쿠키에서 토큰 가져오기
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: '인증 토큰이 필요합니다.',
        code: 'NO_TOKEN'
      });
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-2024', {
      algorithms: ['HS256'],
      issuer: 'personal-portfolio',
      audience: 'admin-dashboard'
    });

    // 관리자 정보를 DB에서 다시 로드 (토큰 탈취 방지)
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: '관리자 계정을 찾을 수 없습니다.',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // 관리자 계정이 비활성화된 경우
    if (!admin.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '관리자 권한이 없습니다.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // 토큰의 사용자명과 DB의 사용자명이 일치하는지 확인
    if (decoded.username !== admin.username) {
      return res.status(403).json({
        success: false,
        message: '토큰 정보가 일치하지 않습니다.',
        code: 'TOKEN_MISMATCH'
      });
    }

    // 요청 객체에 관리자 정보 저장
    req.user = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      isAdmin: admin.isAdmin,
      tokenIssuedAt: decoded.iat,
      tokenExpiresAt: decoded.exp
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다. 다시 로그인해주세요.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
        code: 'INVALID_TOKEN'
      });
    } else {
      console.error('인증 오류:', error);
      return res.status(500).json({
        success: false,
        message: '인증 처리 중 오류가 발생했습니다.',
        code: 'AUTH_ERROR'
      });
    }
  }
};

// 관리자 권한 검증 미들웨어
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

// 세션 갱신 미들웨어 (토큰이 1시간 이내 만료 예정인 경우)
const refreshTokenIfNeeded = async (req, res, next) => {
  try {
    if (req.user && req.user.tokenExpiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = req.user.tokenExpiresAt - now;
      
      // 토큰이 1시간 이내에 만료되는 경우 새 토큰 발급
      if (timeUntilExpiry < 3600 && timeUntilExpiry > 0) {
        const admin = await Admin.findById(req.user.id);
        if (admin && admin.isAdmin) {
          const newToken = generateToken(admin);
          
          // 새 토큰을 HttpOnly 쿠키로 설정
          res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24시간
          });
          
          console.log(`토큰 갱신: ${req.user.username}`);
        }
      }
    }
    next();
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    next(); // 토큰 갱신 실패해도 요청은 계속 처리
  }
};

// 로그아웃 처리 미들웨어
const logout = (req, res, next) => {
  // HttpOnly 쿠키 제거
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  next();
};

// 관리자 활동 로깅 미들웨어
const logAdminActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      const logEntry = {
        timestamp: new Date(),
        adminId: req.user.id,
        adminUsername: req.user.username,
        action: action,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: `${req.method} ${req.originalUrl}`
      };
      
      // 개발 환경에서는 콘솔에 로그, 프로덕션에서는 파일이나 DB에 저장
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 관리자 활동:', logEntry);
      }
    }
    next();
  };
};

// =================================================================
// 6. 라우트 정의 (API Routes)
// =================================================================

// --- Auth Routes ---
app.post('/api/auth/login', validateRequest(adminLoginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 새로운 강화된 토큰 생성 함수 사용
    const token = generateToken(admin);

    // HttpOnly 쿠키로 토큰 설정
    res.cookie('token', token, {
      httpOnly: true,    // XSS 공격 방지
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송 (프로덕션)
      sameSite: 'strict', // CSRF 공격 방지
      maxAge: 24 * 60 * 60 * 1000 // 24시간 (밀리초)
    });

    res.json({
      success: true,
      user: { username: admin.username, email: admin.email, isAdmin: admin.isAdmin }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 로그아웃 API
app.post('/api/auth/logout', logout, (req, res) => {
  try {
    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: '로그아웃 처리 중 오류가 발생했습니다.' 
    });
  }
});

// 토큰 검증 API (프론트엔드에서 세션 상태 확인용)
app.get('/api/auth/verify', authenticateToken, refreshTokenIfNeeded, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      tokenExpiresAt: req.user.tokenExpiresAt
    }
  });
});


app.post('/api/auth/change-password', authenticateToken, logAdminActivity('PASSWORD_CHANGE'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: '새 비밀번호는 최소 8자 이상이어야 합니다.' });
    }

    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ success: false, message: '관리자를 찾을 수 없습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    admin.password = hashedPassword;
    admin.updatedAt = Date.now();
    await admin.save();

    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// --- Books Routes ---
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error('Books fetch error:', error);
    res.status(500).json({ message: '서적 목록을 불러오는데 실패했습니다.' });
  }
});

app.get('/api/books/:id', validateObjectId, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    res.json(book);
  } catch (error) {
    console.error('Book fetch error:', error);
    res.status(500).json({ message: '서적 정보를 불러오는데 실패했습니다.' });
  }
});

app.post('/api/books', authenticateToken, validateRequest(bookSchema), logAdminActivity('BOOK_CREATE'), async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Book add error:', error);
    res.status(500).json({ message: '서적 추가에 실패했습니다.' });
  }
});

app.put('/api/books/:id', authenticateToken, validateObjectId, validateRequest(bookSchema), logAdminActivity('BOOK_UPDATE'), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    res.json(book);
  } catch (error) {
    console.error('Book update error:', error);
    res.status(500).json({ message: '서적 수정에 실패했습니다.' });
  }
});

app.delete('/api/books/:id', authenticateToken, validateObjectId, logAdminActivity('BOOK_DELETE'), async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    res.json({ message: '서적이 삭제되었습니다.' });
  } catch (error) {
    console.error('Book delete error:', error);
    res.status(500).json({ message: '서적 삭제에 실패했습니다.' });
  }
});

// --- Learning Routes (for books) ---
app.get('/api/books/:id/learnings', validateObjectId, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    res.json({ data: book.learnings });
  } catch (error) {
    console.error('Learning fetch error:', error);
    res.status(500).json({ message: '학습 내용 조회에 실패했습니다.' });
  }
});

app.post('/api/books/:id/learnings', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const newLearning = req.body;
    book.learnings.push(newLearning);
    book.updatedAt = Date.now();
    await book.save();
    
    // 방금 추가된 학습 내용 반환
    const addedLearning = book.learnings[book.learnings.length - 1];
    res.status(201).json({ data: addedLearning });
  } catch (error) {
    console.error('Learning add error:', error);
    res.status(500).json({ message: '학습 내용 추가에 실패했습니다.' });
  }
});

app.put('/api/books/:bookId/learnings/:learningId', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const learning = book.learnings.id(req.params.learningId);
    if (!learning) {
      return res.status(404).json({ message: '학습 내용을 찾을 수 없습니다.' });
    }
    learning.set(req.body);
    book.updatedAt = Date.now();
    await book.save();
    
    // 업데이트된 학습 내용 반환
    res.json({ data: learning });
  } catch (error) {
    console.error('Learning update error:', error);
    res.status(500).json({ message: '학습 내용 수정에 실패했습니다.' });
  }
});

app.delete('/api/books/:bookId/learnings/:learningId', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    book.learnings.pull(req.params.learningId);
    book.updatedAt = Date.now();
    await book.save();
    res.json({ message: '학습 내용이 삭제되었습니다.' });
  } catch (error) {
    console.error('Learning delete error:', error);
    res.status(500).json({ message: '학습 내용 삭제에 실패했습니다.' });
  }
});

// --- Chapter Routes (for books) ---
app.get('/api/books/:id/chapters', validateObjectId, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    res.json({ data: book.chapters || [] });
  } catch (error) {
    console.error('Chapter fetch error:', error);
    res.status(500).json({ message: '목차 조회에 실패했습니다.' });
  }
});

app.post('/api/books/:id/chapters', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const newChapter = {
      ...req.body,
      order: book.chapters.length
    };
    book.chapters.push(newChapter);
    book.updatedAt = Date.now();
    await book.save();
    
    const addedChapter = book.chapters[book.chapters.length - 1];
    res.status(201).json({ data: addedChapter });
  } catch (error) {
    console.error('Chapter add error:', error);
    res.status(500).json({ message: '목차 추가에 실패했습니다.' });
  }
});

app.put('/api/books/:bookId/chapters/:chapterId', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const chapter = book.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
    }
    chapter.set(req.body);
    book.updatedAt = Date.now();
    await book.save();
    
    res.json({ data: chapter });
  } catch (error) {
    console.error('Chapter update error:', error);
    res.status(500).json({ message: '목차 수정에 실패했습니다.' });
  }
});

app.delete('/api/books/:bookId/chapters/:chapterId', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    book.chapters.pull(req.params.chapterId);
    book.updatedAt = Date.now();
    await book.save();
    res.json({ message: '목차가 삭제되었습니다.' });
  } catch (error) {
    console.error('Chapter delete error:', error);
    res.status(500).json({ message: '목차 삭제에 실패했습니다.' });
  }
});

// --- Chapter Learning Routes ---
app.get('/api/books/:bookId/chapters/:chapterId/learnings', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const chapter = book.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
    }
    res.json({ data: chapter.learnings || [] });
  } catch (error) {
    console.error('Chapter learning fetch error:', error);
    res.status(500).json({ message: '목차별 학습 내용 조회에 실패했습니다.' });
  }
});

app.post('/api/books/:bookId/chapters/:chapterId/learnings', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const chapter = book.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
    }
    const newLearning = req.body;
    chapter.learnings.push(newLearning);
    book.updatedAt = Date.now();
    await book.save();
    
    const addedLearning = chapter.learnings[chapter.learnings.length - 1];
    res.status(201).json({ data: addedLearning });
  } catch (error) {
    console.error('Chapter learning add error:', error);
    res.status(500).json({ message: '목차별 학습 내용 추가에 실패했습니다.' });
  }
});

app.put('/api/books/:bookId/chapters/:chapterId/learnings/:learningId', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const chapter = book.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
    }
    const learning = chapter.learnings.id(req.params.learningId);
    if (!learning) {
      return res.status(404).json({ message: '학습 내용을 찾을 수 없습니다.' });
    }
    learning.set(req.body);
    book.updatedAt = Date.now();
    await book.save();
    
    res.json({ data: learning });
  } catch (error) {
    console.error('Chapter learning update error:', error);
    res.status(500).json({ message: '목차별 학습 내용 수정에 실패했습니다.' });
  }
});

app.delete('/api/books/:bookId/chapters/:chapterId/learnings/:learningId', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
    }
    const chapter = book.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
    }
    chapter.learnings.pull(req.params.learningId);
    book.updatedAt = Date.now();
    await book.save();
    res.json({ message: '목차별 학습 내용이 삭제되었습니다.' });
  } catch (error) {
    console.error('Chapter learning delete error:', error);
    res.status(500).json({ message: '목차별 학습 내용 삭제에 실패했습니다.' });
  }
});

// --- Experience Routes ---
app.get('/api/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ order: 1 });
    res.json(experiences);
  } catch (error) {
    console.error('Experience fetch error:', error);
    res.status(500).json({ message: '경력 목록을 불러오는데 실패했습니다.' });
  }
});

app.get('/api/experiences/:id', validateObjectId, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: '경력을 찾을 수 없습니다.' });
    }
    res.json(experience);
  } catch (error) {
    console.error('Experience fetch by ID error:', error);
    res.status(500).json({ message: '경력 정보를 불러오는데 실패했습니다.' });
  }
});

app.post('/api/experiences', authenticateToken, validateRequest(experienceSchema), logAdminActivity('EXPERIENCE_CREATE'), async (req, res) => {
  try {
    const experience = new Experience(req.body);
    await experience.save();
    res.status(201).json(experience);
  } catch (error) {
    console.error('Experience add error:', error);
    res.status(500).json({ message: '경력 추가에 실패했습니다.' });
  }
});

app.put('/api/experiences/:id', authenticateToken, validateObjectId, validateRequest(experienceSchema), logAdminActivity('EXPERIENCE_UPDATE'), async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!experience) {
      return res.status(404).json({ message: '경력을 찾을 수 없습니다.' });
    }
    res.json(experience);
  } catch (error) {
    console.error('Experience update error:', error);
    res.status(500).json({ message: '경력 수정에 실패했습니다.' });
  }
});

app.delete('/api/experiences/:id', authenticateToken, validateObjectId, logAdminActivity('EXPERIENCE_DELETE'), async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: '경력을 찾을 수 없습니다.' });
    }
    res.json({ message: '경력이 삭제되었습니다.' });
  } catch (error) {
    console.error('Experience delete error:', error);
    res.status(500).json({ message: '경력 삭제에 실패했습니다.' });
  }
});

// --- Project Routes ---
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({ message: '프로젝트 목록을 불러오는데 실패했습니다.' });
  }
});

app.get('/api/projects/:id', validateObjectId, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
    }
    res.json(project);
  } catch (error) {
    console.error('Project fetch by ID error:', error);
    res.status(500).json({ message: '프로젝트 정보를 불러오는데 실패했습니다.' });
  }
});

app.post('/api/projects', authenticateToken, validateRequest(projectSchema), logAdminActivity('PROJECT_CREATE'), async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Project add error:', error);
    res.status(500).json({ message: '프로젝트 추가에 실패했습니다.' });
  }
});

app.put('/api/projects/:id', authenticateToken, validateObjectId, validateRequest(projectSchema), logAdminActivity('PROJECT_UPDATE'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
    }
    res.json(project);
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ message: '프로젝트 수정에 실패했습니다.' });
  }
});

app.delete('/api/projects/:id', authenticateToken, validateObjectId, logAdminActivity('PROJECT_DELETE'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
    }
    res.json({ message: '프로젝트가 삭제되었습니다.' });
  } catch (error) {
    console.error('Project delete error:', error);
    res.status(500).json({ message: '프로젝트 삭제에 실패했습니다.' });
  }
});

// --- Site Settings Routes ---
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ message: '설정을 불러오는데 실패했습니다.' });
  }
});

app.put('/api/settings', authenticateToken, logAdminActivity('SETTINGS_UPDATE'), async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = Date.now();
    }
    
    await settings.save();
    
    // 보안 설정이 변경된 경우 캐시 무효화
    invalidateSecurityCache();
    
    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: '설정 저장에 실패했습니다.' });
  }
});

// =================================================================
// 7. ⚙️ Admin Utility & Contact Routes
// =================================================================

// 7-1. 관리자 계정 초기 생성 라우트 (시딩)
// 🚨 경고: 배포 후 반드시 삭제하거나 강력한 인증/보안을 추가해야 합니다.
app.post('/api/admin/setup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    const defaultUsername = process.env.ADMIN_USERNAME || username;
    const defaultPassword = process.env.ADMIN_PASSWORD || password;

    if (!defaultUsername || !defaultPassword) {
      return res.status(400).json({ message: '시드 정보를 제공해주세요.' });
    }

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(409).json({ message: '관리자 계정이 이미 존재합니다. 추가 생성을 원하시면 기존 계정을 삭제하세요.' });
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newAdmin = new Admin({
      username: defaultUsername,
      password: hashedPassword,
      email: email || 'admin@example.com',
      isAdmin: true,
    });

    await newAdmin.save();
    console.log('✅ Admin account created:', defaultUsername);
    res.status(201).json({ 
      success: true, 
      message: '기본 관리자 계정 생성이 완료되었습니다.', 
      username: defaultUsername 
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ message: '관리자 계정 설정에 실패했습니다.' });
  }
});

// 7-2. 연락처 메시지 전송 라우트 (퍼블릭)
app.post('/api/contact', validateRequest(contactMessageSchema), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
    }

    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();

    console.log('📧 New contact message received:', { name, email, subject });

    // TODO: 실제 이메일 발송 로직 (Nodemailer 등)을 여기에 추가
    // 예: await sendNotificationEmail(newMessage);

    res.status(200).json({ 
      success: true, 
      message: '메시지가 성공적으로 전송되었습니다.',
      data: newMessage 
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: '메시지 전송에 실패했습니다.' });
  }
});

// 7-3. 관리자용 연락처 메시지 목록 조회 라우트
app.get('/api/admin/messages', authenticateToken, async (req, res) => {
  try {
    // isRead가 false인 메시지를 먼저 표시하고, 그 다음 createdAt 역순으로 정렬
    const messages = await ContactMessage.find().sort({ isRead: 1, createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ message: '메시지 목록을 불러오는데 실패했습니다.' });
  }
});

// 7-4. 관리자용 메시지 읽음 처리 라우트
app.put('/api/admin/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
    }
    res.json(message);
  } catch (error) {
    console.error('Message update error:', error);
    res.status(500).json({ message: '메시지 업데이트에 실패했습니다.' });
  }
});

// 7-5. 관리자용 메시지 삭제 라우트
app.delete('/api/admin/messages/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
    }
    res.json({ message: '메시지가 삭제되었습니다.' });
  } catch (error) {
    console.error('Message delete error:', error);
    res.status(500).json({ message: '메시지 삭제에 실패했습니다.' });
  }
});

// =================================================================
// 8. Skill 스키마 및 API (새로 추가)
// =================================================================

// Skill 스키마 정의
const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  level: { type: Number, required: true, min: 0, max: 100 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillCategory', required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SkillCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  color: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Skill = mongoose.model('Skill', SkillSchema);
const SkillCategory = mongoose.model('SkillCategory', SkillCategorySchema);

// --- Skill Category Routes ---
app.get('/api/skill-categories', async (req, res) => {
  try {
    const categories = await SkillCategory.find().sort({ order: 1 });
    // 각 카테고리에 해당하는 스킬들을 가져와서 연결
    const categoriesWithSkills = await Promise.all(
      categories.map(async (category) => {
        const skills = await Skill.find({ categoryId: category._id }).sort({ order: 1 });
        return {
          ...category.toObject(),
          skills: skills
        };
      })
    );
    res.json({ data: categoriesWithSkills });
  } catch (error) {
    console.error('Skill categories fetch error:', error);
    res.status(500).json({ message: '스킬 카테고리 조회에 실패했습니다.' });
  }
});

app.post('/api/skill-categories', authenticateToken, async (req, res) => {
  try {
    const category = new SkillCategory(req.body);
    await category.save();
    res.status(201).json({ data: category });
  } catch (error) {
    console.error('Skill category add error:', error);
    res.status(500).json({ message: '스킬 카테고리 추가에 실패했습니다.' });
  }
});

app.put('/api/skill-categories/:id', authenticateToken, async (req, res) => {
  try {
    const category = await SkillCategory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: '스킬 카테고리를 찾을 수 없습니다.' });
    }
    res.json({ data: category });
  } catch (error) {
    console.error('Skill category update error:', error);
    res.status(500).json({ message: '스킬 카테고리 수정에 실패했습니다.' });
  }
});

app.delete('/api/skill-categories/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    // 카테고리 삭제 전에 해당 카테고리의 모든 스킬도 삭제
    await Skill.deleteMany({ categoryId: req.params.id });
    const category = await SkillCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '스킬 카테고리를 찾을 수 없습니다.' });
    }
    res.json({ message: '스킬 카테고리가 삭제되었습니다.' });
  } catch (error) {
    console.error('Skill category delete error:', error);
    res.status(500).json({ message: '스킬 카테고리 삭제에 실패했습니다.' });
  }
});

// --- Skill Routes ---
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find().populate('categoryId').sort({ order: 1 });
    res.json({ data: skills });
  } catch (error) {
    console.error('Skills fetch error:', error);
    res.status(500).json({ message: '스킬 조회에 실패했습니다.' });
  }
});

app.get('/api/skill-categories/:id/skills', validateObjectId, async (req, res) => {
  try {
    const skills = await Skill.find({ categoryId: req.params.id }).sort({ order: 1 });
    res.json({ data: skills });
  } catch (error) {
    console.error('Category skills fetch error:', error);
    res.status(500).json({ message: '카테고리별 스킬 조회에 실패했습니다.' });
  }
});

app.post('/api/skill-categories/:id/skills', authenticateToken, async (req, res) => {
  try {
    const skill = new Skill({
      ...req.body,
      categoryId: req.params.id
    });
    await skill.save();
    res.status(201).json({ data: skill });
  } catch (error) {
    console.error('Skill add error:', error);
    res.status(500).json({ message: '스킬 추가에 실패했습니다.' });
  }
});

app.put('/api/skills/:id', authenticateToken, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!skill) {
      return res.status(404).json({ message: '스킬을 찾을 수 없습니다.' });
    }
    res.json({ data: skill });
  } catch (error) {
    console.error('Skill update error:', error);
    res.status(500).json({ message: '스킬 수정에 실패했습니다.' });
  }
});

app.delete('/api/skills/:id', authenticateToken, validateObjectId, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: '스킬을 찾을 수 없습니다.' });
    }
    res.json({ message: '스킬이 삭제되었습니다.' });
  } catch (error) {
    console.error('Skill delete error:', error);
    res.status(500).json({ message: '스킬 삭제에 실패했습니다.' });
  }
});

// 순서 업데이트 API
app.put('/api/skills/reorder', authenticateToken, async (req, res) => {
  try {
    const { skillIds } = req.body;
    
    // 각 스킬의 순서를 업데이트
    const updatePromises = skillIds.map((skillId, index) => 
      Skill.findByIdAndUpdate(skillId, { order: index }, { new: true })
    );
    
    await Promise.all(updatePromises);
    res.json({ message: '스킬 순서가 업데이트되었습니다.' });
  } catch (error) {
    console.error('Skill reorder error:', error);
    res.status(500).json({ message: '스킬 순서 업데이트에 실패했습니다.' });
  }
});

app.put('/api/skill-categories/reorder', authenticateToken, async (req, res) => {
  try {
    const { categoryIds } = req.body;
    
    // 각 카테고리의 순서를 업데이트
    const updatePromises = categoryIds.map((categoryId, index) => 
      SkillCategory.findByIdAndUpdate(categoryId, { order: index }, { new: true })
    );
    
    await Promise.all(updatePromises);
    res.json({ message: '카테고리 순서가 업데이트되었습니다.' });
  } catch (error) {
    console.error('Category reorder error:', error);
    res.status(500).json({ message: '카테고리 순서 업데이트에 실패했습니다.' });
  }
});

// --- 중복 데이터 정리 ---
app.post('/api/skills/cleanup-duplicates', authenticateToken, async (req, res) => {
  try {
    // 중복된 카테고리 제거 (title 기준)
    const categories = await SkillCategory.find();
    const uniqueCategories = [];
    const seenTitles = new Set();
    
    for (const category of categories) {
      if (!seenTitles.has(category.title)) {
        seenTitles.add(category.title);
        uniqueCategories.push(category);
      } else {
        // 중복된 카테고리와 관련 스킬들 삭제
        await Skill.deleteMany({ categoryId: category._id });
        await SkillCategory.findByIdAndDelete(category._id);
      }
    }
    
    res.json({ message: '중복 데이터 정리가 완료되었습니다.' });
  } catch (error) {
    console.error('Duplicate cleanup error:', error);
    res.status(500).json({ message: '중복 데이터 정리에 실패했습니다.' });
  }
});

// --- 모든 스킬 데이터 삭제 (인증 없이) ---
app.post('/api/skills/clear-all-data', async (req, res) => {
  try {
    // 모든 스킬과 카테고리 삭제
    const deletedSkills = await Skill.deleteMany({});
    const deletedCategories = await SkillCategory.deleteMany({});
    
    console.log(`🗑️ 삭제 완료: ${deletedSkills.deletedCount}개 스킬, ${deletedCategories.deletedCount}개 카테고리`);
    res.json({ 
      message: '모든 스킬 데이터가 삭제되었습니다.',
      deletedSkills: deletedSkills.deletedCount,
      deletedCategories: deletedCategories.deletedCount
    });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ message: '데이터 삭제에 실패했습니다.' });
  }
});

// =================================================================
// 9. 서버 리스너 (Server Listener)
// =================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
