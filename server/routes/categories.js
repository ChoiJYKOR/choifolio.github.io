/**
 * Category 라우트
 * 통합 카테고리 관리 API (Book, Project, VideoLearning, VideoPlaylist 공통)
 */

const express = require('express');
const { categorySchema, validateRequest } = require('../validation/schemas');

const setupCategoryRoutes = (Category, Book, Project, VideoLearning, VideoPlaylist, authMiddleware) => {
  const router = express.Router();

  // 🔍 GET: 모든 카테고리 조회
  router.get('/', async (req, res) => {
    try {
      const categories = await Category.find().sort({ order: 1, name: 1 });
      res.json(categories);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      res.status(500).json({ message: '카테고리 조회 중 오류가 발생했습니다' });
    }
  });

  // 🔍 GET: 특정 카테고리 조회
  router.get('/:id', async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: '카테고리를 찾을 수 없습니다' });
      }
      res.json(category);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      res.status(500).json({ message: '카테고리 조회 중 오류가 발생했습니다' });
    }
  });

  // 📊 GET: 카테고리 사용 통계
  router.get('/:id/usage', async (req, res) => {
    try {
      const categoryId = req.params.id;
      
      const [booksCount, projectsCount, videoLearningsCount, videoPlaylistsCount] = await Promise.all([
        Book.countDocuments({ categoryIds: categoryId }),
        Project.countDocuments({ categoryIds: categoryId }),
        VideoLearning.countDocuments({ categoryIds: categoryId }),
        VideoPlaylist.countDocuments({ categoryIds: categoryId })
      ]);

      const total = booksCount + projectsCount + videoLearningsCount + videoPlaylistsCount;

      res.json({
        categoryId,
        usage: {
          books: booksCount,
          projects: projectsCount,
          videoLearnings: videoLearningsCount,
          videoPlaylists: videoPlaylistsCount,
          total
        }
      });
    } catch (error) {
      console.error('카테고리 사용 통계 조회 실패:', error);
      res.status(500).json({ message: '사용 통계 조회 중 오류가 발생했습니다' });
    }
  });

  // ✏️ POST: 새 카테고리 생성
  router.post('/', authMiddleware, validateRequest(categorySchema), async (req, res) => {
    try {
      const newCategory = new Category(req.body);
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('카테고리 생성 실패:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: '이미 존재하는 카테고리 이름입니다' });
      }
      res.status(500).json({ message: '카테고리 생성 중 오류가 발생했습니다' });
    }
  });

  // 🔄 PUT: 카테고리 수정
  router.put('/:id', authMiddleware, validateRequest(categorySchema), async (req, res) => {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
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
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const categoryId = req.params.id;

      // 사용 중인지 확인
      const [booksCount, projectsCount, videoLearningsCount, videoPlaylistsCount] = await Promise.all([
        Book.countDocuments({ categoryIds: categoryId }),
        Project.countDocuments({ categoryIds: categoryId }),
        VideoLearning.countDocuments({ categoryIds: categoryId }),
        VideoPlaylist.countDocuments({ categoryIds: categoryId })
      ]);

      const totalUsage = booksCount + projectsCount + videoLearningsCount + videoPlaylistsCount;

      if (totalUsage > 0) {
        return res.status(400).json({ 
          message: '이 카테고리는 현재 사용 중이므로 삭제할 수 없습니다',
          usage: {
            books: booksCount,
            projects: projectsCount,
            videoLearnings: videoLearningsCount,
            videoPlaylists: videoPlaylistsCount,
            total: totalUsage
          }
        });
      }

      const category = await Category.findByIdAndDelete(categoryId);

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

module.exports = setupCategoryRoutes;
