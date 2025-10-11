const express = require('express');
const { playlistVideoSchema, validateRequest } = require('../validation/schemas');
const { authenticateToken } = require('../middleware/auth');

// =================================================================
// 재생 목록 영상 라우트 설정 함수
// =================================================================
function setupPlaylistVideoRoutes(PlaylistVideo) {
  const router = express.Router();

  // GET /api/playlist-videos?playlistId=xxx - 특정 재생 목록의 모든 영상 조회
  router.get('/', async (req, res) => {
    try {
      const { playlistId } = req.query;
      
      const query = playlistId ? { playlistId } : {};
      const videos = await PlaylistVideo.find(query).sort({ order: 1, createdAt: 1 });
      
      res.json({
        success: true,
        data: videos
      });
    } catch (error) {
      console.error('재생 목록 영상 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '영상 목록을 불러오는 데 실패했습니다'
      });
    }
  });

  // GET /api/playlist-videos/:id - 특정 영상 조회
  router.get('/:id', async (req, res) => {
    try {
      const video = await PlaylistVideo.findById(req.params.id);
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: '영상을 찾을 수 없습니다'
        });
      }

      res.json({
        success: true,
        data: video
      });
    } catch (error) {
      console.error('영상 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '영상을 불러오는 데 실패했습니다'
      });
    }
  });

  // POST /api/playlist-videos - 영상 추가 (관리자 전용)
  router.post('/', validateRequest(playlistVideoSchema), async (req, res) => {
    try {
      console.log('✅ [서버] 재생 목록 영상 생성 요청 수신:', req.body);
      
      const video = new PlaylistVideo(req.body);
      console.log('✅ [서버] PlaylistVideo 객체 생성 완료');
      
      await video.save();
      console.log('✅ [서버] DB 저장 완료:', video._id);

      res.status(201).json({
        success: true,
        data: video
      });
      console.log('✅ [서버] 응답 전송 완료');
    } catch (error) {
      console.error('❌ [서버] 영상 생성 실패:', error);
      console.error('❌ [서버] 에러 상세:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: '영상 생성에 실패했습니다',
        error: error.message
      });
    }
  });

  // PUT /api/playlist-videos/:id - 영상 수정 (관리자 전용)
  router.put('/:id', validateRequest(playlistVideoSchema), async (req, res) => {
    try {
      const video = await PlaylistVideo.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!video) {
        return res.status(404).json({
          success: false,
          message: '영상을 찾을 수 없습니다'
        });
      }

      res.json({
        success: true,
        data: video
      });
    } catch (error) {
      console.error('영상 수정 실패:', error);
      res.status(500).json({
        success: false,
        message: '영상 수정에 실패했습니다'
      });
    }
  });

  // DELETE /api/playlist-videos/:id - 영상 삭제 (관리자 전용)
  router.delete('/:id', async (req, res) => {
    try {
      const video = await PlaylistVideo.findByIdAndDelete(req.params.id);

      if (!video) {
        return res.status(404).json({
          success: false,
          message: '영상을 찾을 수 없습니다'
        });
      }

      res.json({
        success: true,
        message: '영상이 삭제되었습니다'
      });
    } catch (error) {
      console.error('영상 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: '영상 삭제에 실패했습니다'
      });
    }
  });

  return router;
}

module.exports = setupPlaylistVideoRoutes;

