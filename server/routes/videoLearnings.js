/**
 * 영상 학습 관리 라우트
 * VideoLearning CRUD
 */

const express = require('express');
const { videoLearningSchema, validateRequest, validateObjectId } = require('../validation/schemas');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// =================================================================
// 영상 학습 라우트 설정 함수
// =================================================================

const setupVideoLearningRoutes = (VideoLearning) => {
  const authMiddleware = authenticateToken(require('../models').Admin);
  
  // 모든 영상 학습 기록 조회 (퍼블릭)
  router.get('/', async (req, res) => {
    try {
      const videoLearnings = await VideoLearning.find()
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon')  // 스킬 정보 populate
        .sort({ order: 1, createdAt: -1 });
      res.json({ data: videoLearnings, message: '영상 학습 목록 조회 성공' });
    } catch (error) {
      console.error('VideoLearnings fetch error:', error);
      res.status(500).json({ message: '영상 학습 기록을 불러오는데 실패했습니다.' });
    }
  });

  // 특정 영상 학습 기록 조회 (퍼블릭)
  router.get('/:id', validateObjectId, async (req, res) => {
    try {
      const videoLearning = await VideoLearning.findById(req.params.id)
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon');  // 스킬 정보 populate
      if (!videoLearning) {
        return res.status(404).json({ message: '영상 학습 기록을 찾을 수 없습니다.' });
      }
      res.json(videoLearning);
    } catch (error) {
      console.error('VideoLearning detail error:', error);
      res.status(500).json({ message: '영상 학습 기록을 불러오는데 실패했습니다.' });
    }
  });

  // 영상 학습 기록 생성 (관리자만)
  router.post('/', authMiddleware, validateRequest(videoLearningSchema), async (req, res) => {
    try {
      console.log('📹 영상 학습 생성 요청 받음');
      console.log('📦 요청 데이터:', req.body);
      console.log('🔗 skillIds:', req.body.skillIds);
      
      const videoLearning = new VideoLearning(req.body);
      await videoLearning.save();
      
      console.log('✅ 영상 학습 생성 성공:', videoLearning._id);
      console.log('✅ 저장된 skillIds:', videoLearning.skillIds);
      res.status(201).json(videoLearning);
    } catch (error) {
      console.error('❌ VideoLearning add error:', error);
      res.status(500).json({ message: '영상 학습 기록 추가에 실패했습니다.' });
    }
  });

  // 영상 학습 기록 수정 (관리자만)
  router.put('/:id', authMiddleware, validateObjectId, validateRequest(videoLearningSchema), async (req, res) => {
    try {
      console.log('📹 영상 학습 업데이트 요청 받음:', req.params.id);
      console.log('📦 요청 데이터:', req.body);
      console.log('🔗 skillIds:', req.body.skillIds);
      
      const videoLearning = await VideoLearning.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!videoLearning) {
        console.log('❌ 영상 학습을 찾을 수 없음:', req.params.id);
        return res.status(404).json({ message: '영상 학습 기록을 찾을 수 없습니다.' });
      }
      
      console.log('✅ 영상 학습 업데이트 성공:', videoLearning._id);
      console.log('✅ 저장된 skillIds:', videoLearning.skillIds);
      res.json(videoLearning);
    } catch (error) {
      console.error('❌ VideoLearning update error:', error);
      res.status(500).json({ message: '영상 학습 기록 수정에 실패했습니다.' });
    }
  });

  // 영상 학습 기록 삭제 (관리자만)
  router.delete('/:id', authMiddleware, validateObjectId, async (req, res) => {
    try {
      const videoLearning = await VideoLearning.findByIdAndDelete(req.params.id);
      if (!videoLearning) {
        return res.status(404).json({ message: '영상 학습 기록을 찾을 수 없습니다.' });
      }
      res.json({ message: '영상 학습 기록이 삭제되었습니다.' });
    } catch (error) {
      console.error('VideoLearning delete error:', error);
      res.status(500).json({ message: '영상 학습 기록 삭제에 실패했습니다.' });
    }
  });

  return router;
};

module.exports = setupVideoLearningRoutes;
