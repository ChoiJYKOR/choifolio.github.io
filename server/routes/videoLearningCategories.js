/**
 * Video Learning Category 라우트
 * 영상 학습 카테고리 관리 API
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { videoLearningCategorySchema, validateRequest } = require('../validation/schemas');

const setupVideoLearningCategoryRoutes = (VideoLearningCategory) => {
  const router = express.Router();

  // 🔍 GET: 모든 카테고리 조회
  router.get('/', async (req, res) => {
    try {
      const categories = await VideoLearningCategory.find().sort({ order: 1, name: 1 });
      res.json(categories);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      res.status(500).json({ message: '카테고리 조회 중 오류가 발생했습니다' });
    }
  });

  // 🔍 GET: 특정 카테고리 조회
  router.get('/:id', async (req, res) => {
    try {
      const category = await VideoLearningCategory.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: '카테고리를 찾을 수 없습니다' });
      }
      res.json(category);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      res.status(500).json({ message: '카테고리 조회 중 오류가 발생했습니다' });
    }
  });

  // ✏️ POST: 새 카테고리 생성
  router.post('/', validateRequest(videoLearningCategorySchema), async (req, res) => {
    console.log('📝 POST /api/video-learning-categories 요청 받음:', req.body)
    try {
      const newCategory = new VideoLearningCategory(req.body);
      console.log('💾 카테고리 저장 시도:', newCategory)
      await newCategory.save();
      console.log('✅ 카테고리 저장 성공:', newCategory)
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('❌ 카테고리 생성 실패:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: '이미 존재하는 카테고리 이름입니다' });
      }
      res.status(500).json({ message: '카테고리 생성 중 오류가 발생했습니다', error: error.message });
    }
  });

  // 🔄 PUT: 카테고리 수정
  router.put('/:id', authenticateToken, validateRequest(videoLearningCategorySchema), async (req, res) => {
    try {
      const updatedCategory = await VideoLearningCategory.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: '카테고리를 찾을 수 없습니다' });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: '이미 존재하는 카테고리 이름입니다' });
      }
      res.status(500).json({ message: '카테고리 수정 중 오류가 발생했습니다' });
    }
  });

  // 🗑️ DELETE: 카테고리 삭제
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const category = await VideoLearningCategory.findByIdAndDelete(req.params.id);

      if (!category) {
        return res.status(404).json({ message: '카테고리를 찾을 수 없습니다' });
      }

      res.json({ message: '카테고리가 삭제되었습니다', category });
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      res.status(500).json({ message: '카테고리 삭제 중 오류가 발생했습니다' });
    }
  });

  return router;
};

module.exports = setupVideoLearningCategoryRoutes;

