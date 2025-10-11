/**
 * 동적 보안 헤더 미들웨어
 * DB에서 보안 설정을 읽어와 동적으로 보안 헤더를 적용
 */

const config = require('../config');

// =================================================================
// 동적 보안 헤더 미들웨어
// =================================================================

// 보안 설정 캐시
let securitySettingsCache = null;
let cacheTimestamp = null;

// 보안 설정을 가져오는 함수
async function getSecuritySettings(SiteSettings) {
  const now = Date.now();
  
  // 캐시가 유효한 경우 캐시된 설정 반환
  if (securitySettingsCache && cacheTimestamp && (now - cacheTimestamp) < config.security.cache.duration) {
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
    cspDirectives: config.security.headers.csp,
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

// 동적 보안 헤더 미들웨어 생성 함수
const createDynamicSecurityHeaders = (SiteSettings) => {
  return async (req, res, next) => {
    try {
      const settings = await getSecuritySettings(SiteSettings);
      
      // HTTPS 강제 (프로덕션에서만)
      if (settings.enableHttps && config.nodeEnv === 'production') {
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
  };
};

module.exports = {
  createDynamicSecurityHeaders,
  invalidateSecurityCache,
  getSecuritySettings
};
