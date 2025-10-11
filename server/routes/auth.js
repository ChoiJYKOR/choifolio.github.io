/**
 * 인증 관련 라우트
 * 로그인, 로그아웃, 토큰 검증, 비밀번호 변경 등
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { adminLoginSchema, changePasswordSchema, validateRequest } = require('../validation/schemas');
const { authenticateToken, generateToken, refreshTokenIfNeeded, logout, logAdminActivity } = require('../middleware/auth');

const router = express.Router();

// =================================================================
// 인증 라우트 설정 함수
// =================================================================

const setupAuthRoutes = (Admin) => {
  const authMiddleware = authenticateToken(Admin);
  
  // 로그인
  router.post('/login', validateRequest(adminLoginSchema), async (req, res) => {
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
        secure: true, // HTTPS에서만 전송
        sameSite: 'none', // 크로스 도메인 쿠키 허용
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

  // 로그아웃
  router.post('/logout', logout, (req, res) => {
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
  router.post('/verify', authenticateToken(Admin), refreshTokenIfNeeded(Admin), (req, res) => {
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

  // 비밀번호 변경
  router.post('/change-password', authMiddleware, validateRequest(changePasswordSchema), async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
      }

      const admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ success: false, message: '관리자를 찾을 수 없습니다.' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      admin.password = hashedNewPassword;
      admin.updatedAt = Date.now();
      await admin.save();

      res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ success: false, message: '비밀번호 변경 중 오류가 발생했습니다.' });
    }
  });

  return router;
};

module.exports = setupAuthRoutes;
