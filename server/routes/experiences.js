/**
 * 경력 관리 라우트
 */

const express = require('express');
const { experienceSchema, validateRequest, validateObjectId } = require('../validation/schemas');
const { authenticateToken, logAdminActivity } = require('../middleware/auth');

const router = express.Router();

const setupExperienceRoutes = (Experience) => {
  const authMiddleware = authenticateToken(require('../models').Admin);
  
  // 모든 경력 조회 (퍼블릭)
  router.get('/', async (req, res) => {
    try {
      const experiences = await Experience.find()
        .populate('skillIds', 'name icon color')  // 🌟 스킬 정보 populate
        .sort({ order: 1, createdAt: -1 });
      res.json({ data: experiences, message: '경력 목록 조회 성공' });
    } catch (error) {
      console.error('Experience fetch error:', error);
      res.status(500).json({ message: '경력 목록을 불러오는데 실패했습니다.' });
    }
  });

  // 특정 경력 조회 (퍼블릭)
  router.get('/:id', validateObjectId, async (req, res) => {
    try {
      const experience = await Experience.findById(req.params.id)
        .populate('skillIds', 'name icon color');  // 🌟 스킬 정보 populate
      if (!experience) {
        return res.status(404).json({ message: '경력을 찾을 수 없습니다.' });
      }
      res.json(experience);
    } catch (error) {
      console.error('Experience fetch by ID error:', error);
      res.status(500).json({ message: '경력 정보를 불러오는데 실패했습니다.' });
    }
  });

  // 경력 생성 (관리자만)
  router.post('/', authMiddleware, validateRequest(experienceSchema), async (req, res) => {
    try {
      const experience = new Experience(req.body);
      await experience.save();
      res.status(201).json(experience);
    } catch (error) {
      console.error('Experience add error:', error);
      res.status(500).json({ message: '경력 추가에 실패했습니다.' });
    }
  });

  // 경력 수정 (관리자만)
  router.put('/:id', authMiddleware, validateObjectId, validateRequest(experienceSchema), async (req, res) => {
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

  // 경력 삭제 (관리자만)
  router.delete('/:id', authMiddleware, validateObjectId, logAdminActivity('EXPERIENCE_DELETE'), async (req, res) => {
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

  return router;
};

module.exports = setupExperienceRoutes;
