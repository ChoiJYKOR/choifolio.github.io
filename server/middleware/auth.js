/**
 * 인증 및 인가 미들웨어
 * JWT 토큰 검증, 관리자 권한 확인, 세션 관리 등 인증 관련 기능
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

// =================================================================
// JWT 토큰 관리
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
  
  return jwt.sign(payload, config.jwt.secret, {
    algorithm: 'HS256',
    issuer: config.jwt.issuer,
    audience: config.jwt.audience
  });
};

// JWT 토큰 검증 및 관리자 정보 로드
const authenticateToken = (Admin) => {
  return async (req, res, next) => {
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
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256'],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
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
};

// =================================================================
// 권한 검증 미들웨어
// =================================================================

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

// =================================================================
// 세션 관리 미들웨어
// =================================================================

// 세션 갱신 미들웨어 (토큰이 1시간 이내 만료 예정인 경우)
const refreshTokenIfNeeded = (Admin) => {
  return async (req, res, next) => {
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
            res.cookie('token', newToken, config.cookie);
            
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
};

// 로그아웃 처리 미들웨어
const logout = (req, res, next) => {
  // HttpOnly 쿠키 제거
  res.clearCookie('token', config.cookie);
  next();
};

// =================================================================
// 활동 로깅 미들웨어
// =================================================================

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
      if (config.nodeEnv === 'development') {
        console.log('🔐 관리자 활동:', logEntry);
      }
    }
    next();
  };
};

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  refreshTokenIfNeeded,
  logout,
  logAdminActivity
};
