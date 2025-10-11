const express = require('express');
const { videoPlaylistSchema, validateRequest } = require('../validation/schemas');
const { authenticateToken } = require('../middleware/auth');

// =================================================================
// 재생 목록 라우트 설정 함수
// =================================================================
function setupVideoPlaylistRoutes(VideoPlaylist) {
  const router = express.Router();

  // GET /api/video-playlists - 모든 재생 목록 조회
  router.get('/', async (req, res) => {
    try {
      const playlists = await VideoPlaylist.find()
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon')  // 스킬 정보 populate
        .sort({ order: 1, createdAt: -1 });
      
      res.json({
        success: true,
        data: playlists
      });
    } catch (error) {
      console.error('재생 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '재생 목록을 불러오는 데 실패했습니다'
      });
    }
  });

  // GET /api/video-playlists/:id - 특정 재생 목록 조회
  router.get('/:id', async (req, res) => {
    try {
      const playlist = await VideoPlaylist.findById(req.params.id)
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon');  // 스킬 정보 populate
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: '재생 목록을 찾을 수 없습니다'
        });
      }

      res.json({
        success: true,
        data: playlist
      });
    } catch (error) {
      console.error('재생 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '재생 목록을 불러오는 데 실패했습니다'
      });
    }
  });

  // POST /api/video-playlists - 재생 목록 생성 (관리자 전용)
  router.post('/', validateRequest(videoPlaylistSchema), async (req, res) => {
    try {
      console.log('✅ [서버] 재생 목록 생성 요청 수신:', {
        body: req.body,
        user: req.user?.email || 'unknown'
      });

      const playlist = new VideoPlaylist(req.body);
      console.log('✅ [서버] VideoPlaylist 객체 생성 완료');
      
      await playlist.save();
      console.log('✅ [서버] DB 저장 완료:', playlist._id);

      const populatedPlaylist = await VideoPlaylist.findById(playlist._id)
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon');  // 스킬 정보 populate
      console.log('✅ [서버] categoryIds 및 skillIds populate 완료');

      res.status(201).json({
        success: true,
        data: populatedPlaylist
      });
      console.log('✅ [서버] 응답 전송 완료');
    } catch (error) {
      console.error('❌ [서버] 재생 목록 생성 실패:', error);
      console.error('❌ [서버] 에러 상세:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: '재생 목록 생성에 실패했습니다',
        error: error.message
      });
    }
  });

  // PUT /api/video-playlists/:id - 재생 목록 수정 (관리자 전용)
  router.put('/:id', validateRequest(videoPlaylistSchema), async (req, res) => {
    try {
      const playlist = await VideoPlaylist.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      )
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon');  // 스킬 정보 populate

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: '재생 목록을 찾을 수 없습니다'
        });
      }

      res.json({
        success: true,
        data: playlist
      });
    } catch (error) {
      console.error('재생 목록 수정 실패:', error);
      res.status(500).json({
        success: false,
        message: '재생 목록 수정에 실패했습니다'
      });
    }
  });

  // DELETE /api/video-playlists/:id - 재생 목록 삭제 (관리자 전용)
  router.delete('/:id', async (req, res) => {
    try {
      const playlist = await VideoPlaylist.findByIdAndDelete(req.params.id);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: '재생 목록을 찾을 수 없습니다'
        });
      }

      res.json({
        success: true,
        message: '재생 목록이 삭제되었습니다'
      });
    } catch (error) {
      console.error('재생 목록 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: '재생 목록 삭제에 실패했습니다'
      });
    }
  });

  return router;
}

module.exports = setupVideoPlaylistRoutes;

