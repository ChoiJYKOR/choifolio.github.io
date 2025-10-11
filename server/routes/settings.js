/**
 * 사이트 설정 라우트
 */

const express = require('express');
const { authenticateToken, logAdminActivity } = require('../middleware/auth');

const router = express.Router();

const setupSettingsRoutes = (SiteSettings) => {
  const authMiddleware = authenticateToken(require('../models').Admin);
  const { invalidateSecurityCache } = require('../middleware/dynamicHeaders');
  
  // 설정 조회 (퍼블릭)
  router.get('/', async (req, res) => {
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

  // 설정 업데이트 (관리자만)
  router.put('/', authMiddleware, logAdminActivity('SETTINGS_UPDATE'), async (req, res) => {
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

  return router;
};

module.exports = setupSettingsRoutes;
