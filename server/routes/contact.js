/**
 * 연락처 메시지 라우트
 */

const express = require('express');
const { contactMessageSchema, validateRequest } = require('../validation/schemas');
const { authenticateToken } = require('../middleware/auth');
const { limiter } = require('../middleware/security'); // 🌟 Rate Limiter import

const router = express.Router();

const setupContactRoutes = (ContactMessage, Admin) => {
  
  // 🌟 연락처 메시지 전송 (퍼블릭) - Rate Limiter 적용
  router.post('/contact', limiter, validateRequest(contactMessageSchema), async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
      }

      const contactMessage = new ContactMessage({ name, email, subject, message });
      await contactMessage.save();

      res.status(201).json({ 
        success: true, 
        message: '메시지가 성공적으로 전송되었습니다.' 
      });
    } catch (error) {
      console.error('Contact message error:', error);
      res.status(500).json({ message: '메시지 전송에 실패했습니다.' });
    }
  });

  // 관리자용 메시지 관리 라우트
  const authMiddleware = authenticateToken(Admin);

  // 관리자용 메시지 조회
  router.get('/admin/messages', authMiddleware, async (req, res) => {
    try {
      const messages = await ContactMessage.find().sort({ createdAt: -1 });
      res.json({ data: messages, message: '메시지 조회 성공' });
    } catch (error) {
      console.error('Admin messages fetch error:', error);
      res.status(500).json({ message: '메시지 목록을 불러오는데 실패했습니다.' });
    }
  });

  // 관리자용 메시지 상세 조회
  router.get('/admin/messages/:id', authMiddleware, async (req, res) => {
    try {
      const message = await ContactMessage.findById(req.params.id);
      if (!message) {
        return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
      }
      res.json({ data: message, message: '메시지 상세 조회 성공' });
    } catch (error) {
      console.error('Admin message detail fetch error:', error);
      res.status(500).json({ message: '메시지 상세 정보를 불러오는데 실패했습니다.' });
    }
  });

  // 관리자용 메시지 읽음 처리
  router.put('/admin/messages/:id/read', authMiddleware, async (req, res) => {
    try {
      const message = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
      if (!message) {
        return res.status(404).json({ message: '메시지를 찾을 수 없습니다.' });
      }
      res.json({ data: message, message: '메시지가 읽음 처리되었습니다.' });
    } catch (error) {
      console.error('Message update error:', error);
      res.status(500).json({ message: '메시지 업데이트에 실패했습니다.' });
    }
  });

  // 관리자용 메시지 삭제
  router.delete('/admin/messages/:id', authMiddleware, async (req, res) => {
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

  return router;
};

module.exports = setupContactRoutes;
