/**
 * 서적 관리 라우트
 * 서적 CRUD, 학습 내용, 목차 관리 등
 */

const express = require('express');
const { bookSchema, validateRequest, validateObjectId } = require('../validation/schemas');
const { authenticateToken, logAdminActivity } = require('../middleware/auth');

const router = express.Router();

// =================================================================
// 서적 라우트 설정 함수
// =================================================================

const setupBookRoutes = (Book) => {
  const authMiddleware = authenticateToken(require('../models').Admin);
  
  // 모든 서적 조회 (퍼블릭)
  router.get('/', async (req, res) => {
    try {
      const books = await Book.find()
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon')  // 스킬 정보 populate
        .sort({ createdAt: -1 });
      res.json({ data: books, message: '서적 목록 조회 성공' });
    } catch (error) {
      console.error('Books fetch error:', error);
      res.status(500).json({ message: '서적 목록을 불러오는데 실패했습니다.' });
    }
  });

  // 특정 서적 조회 (퍼블릭)
  router.get('/:id', validateObjectId, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id)
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon');  // 스킬 정보 populate
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }
      res.json(book);
    } catch (error) {
      console.error('Book fetch error:', error);
      res.status(500).json({ message: '서적 정보를 불러오는데 실패했습니다.' });
    }
  });

  // 서적 생성 (관리자만)
  router.post('/', authMiddleware, validateRequest(bookSchema), async (req, res) => {
    try {
      console.log('📚 서적 생성 요청 받음');
      console.log('📦 요청 데이터:', req.body);
      console.log('🔗 skillIds:', req.body.skillIds);
      
      const book = new Book(req.body);
      await book.save();
      
      console.log('✅ 서적 생성 성공:', book._id);
      console.log('✅ 저장된 skillIds:', book.skillIds);
      res.status(201).json(book);
    } catch (error) {
      console.error('❌ Book add error:', error);
      res.status(500).json({ message: '서적 추가에 실패했습니다.' });
    }
  });

  // 서적 수정 (관리자만)
  router.put('/:id', authMiddleware, validateObjectId, validateRequest(bookSchema), async (req, res) => {
    try {
      console.log('📚 서적 업데이트 요청 받음:', req.params.id);
      console.log('📦 요청 데이터:', req.body);
      console.log('🔗 skillIds:', req.body.skillIds);
      
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!book) {
        console.log('❌ 서적을 찾을 수 없음:', req.params.id);
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }
      
      console.log('✅ 서적 업데이트 성공:', book._id);
      console.log('✅ 저장된 skillIds:', book.skillIds);
      console.log('📦 전체 응답 객체 필드:', Object.keys(book.toObject()));
      console.log('🔍 skillIds 타입:', typeof book.skillIds);
      console.log('🔍 skillIds 배열 길이:', Array.isArray(book.skillIds) ? book.skillIds.length : 'Not an array');
      res.json(book);
    } catch (error) {
      console.error('❌ Book update error:', error);
      res.status(500).json({ message: '서적 수정에 실패했습니다.' });
    }
  });

  // 서적 삭제 (관리자만)
  router.delete('/:id', authMiddleware, validateObjectId, logAdminActivity('BOOK_DELETE'), async (req, res) => {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }
      res.json({ message: '서적이 삭제되었습니다.' });
    } catch (error) {
      console.error('Book delete error:', error);
      res.status(500).json({ message: '서적 삭제에 실패했습니다.' });
    }
  });

  // =================================================================
  // 학습 내용 관련 라우트
  // =================================================================

  // 특정 서적의 학습 내용 조회 (퍼블릭)
  router.get('/:id/learnings', validateObjectId, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }
      res.json(book.learnings || []);
    } catch (error) {
      console.error('Learnings fetch error:', error);
      res.status(500).json({ message: '학습 내용을 불러오는데 실패했습니다.' });
    }
  });

  // 서적에 학습 내용 추가 (관리자만)
  router.post('/:id/learnings', authMiddleware, validateObjectId, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const { topic, content } = req.body;
      if (!topic || !content) {
        return res.status(400).json({ message: '주제와 내용을 모두 입력해주세요.' });
      }

      book.learnings.push({ topic, content });
      await book.save();

      res.status(201).json(book.learnings[book.learnings.length - 1]);
    } catch (error) {
      console.error('Learning add error:', error);
      res.status(500).json({ message: '학습 내용 추가에 실패했습니다.' });
    }
  });

  // 특정 학습 내용 수정 (관리자만)
  router.put('/:bookId/learnings/:learningId', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const learning = book.learnings.id(req.params.learningId);
      if (!learning) {
        return res.status(404).json({ message: '학습 내용을 찾을 수 없습니다.' });
      }

      const { topic, content } = req.body;
      if (topic !== undefined) learning.topic = topic;
      if (content !== undefined) learning.content = content;

      await book.save();
      res.json(learning);
    } catch (error) {
      console.error('Learning update error:', error);
      res.status(500).json({ message: '학습 내용 수정에 실패했습니다.' });
    }
  });

  // 🌟 학습 내용의 스킬 연결/해제 (관리자만)
  router.patch('/:bookId/learnings/:learningId/skills', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      // 먼저 기존 learnings에서 찾기
      let learning = book.learnings.id(req.params.learningId);
      
      // 없으면 chapters의 learnings에서 찾기
      if (!learning) {
        for (const chapter of book.chapters || []) {
          learning = chapter.learnings.id(req.params.learningId);
          if (learning) break;
        }
      }

      if (!learning) {
        return res.status(404).json({ message: '학습 내용을 찾을 수 없습니다.' });
      }

      const { skillIds } = req.body;
      if (!Array.isArray(skillIds)) {
        return res.status(400).json({ message: 'skillIds는 배열이어야 합니다.' });
      }

      learning.skillIds = skillIds;

      await book.save();
      res.json({ data: learning, message: '스킬 연결이 업데이트되었습니다.' });
    } catch (error) {
      console.error('Learning skills update error:', error);
      res.status(500).json({ message: '스킬 연결 업데이트에 실패했습니다.' });
    }
  });

  // 특정 학습 내용 삭제 (관리자만)
  router.delete('/:bookId/learnings/:learningId', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const learning = book.learnings.id(req.params.learningId);
      if (!learning) {
        return res.status(404).json({ message: '학습 내용을 찾을 수 없습니다.' });
      }

      await learning.deleteOne();
      await book.save();
      res.json({ message: '학습 내용이 삭제되었습니다.' });
    } catch (error) {
      console.error('Learning delete error:', error);
      res.status(500).json({ message: '학습 내용 삭제에 실패했습니다.' });
    }
  });

  // =================================================================
  // 목차 관련 라우트
  // =================================================================

  // 특정 서적의 목차 조회 (퍼블릭)
  router.get('/:id/chapters', validateObjectId, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }
      res.json(book.chapters || []);
    } catch (error) {
      console.error('Chapters fetch error:', error);
      res.status(500).json({ message: '목차를 불러오는데 실패했습니다.' });
    }
  });

  // 서적에 목차 추가 (관리자만)
  router.post('/:id/chapters', authMiddleware, validateObjectId, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const { title, order } = req.body;
      if (!title) {
        return res.status(400).json({ message: '목차 제목을 입력해주세요.' });
      }

      const chapter = {
        title,
        order: order || (book.chapters.length + 1),
        learnings: []
      };

      book.chapters.push(chapter);
      await book.save();

      res.status(201).json(book.chapters[book.chapters.length - 1]);
    } catch (error) {
      console.error('Chapter add error:', error);
      res.status(500).json({ message: '목차 추가에 실패했습니다.' });
    }
  });

  // 특정 목차 수정 (관리자만)
  router.put('/:bookId/chapters/:chapterId', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const chapter = book.chapters.id(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
      }

      const { title, order } = req.body;
      if (title !== undefined) chapter.title = title;
      if (order !== undefined) chapter.order = order;

      await book.save();
      res.json(chapter);
    } catch (error) {
      console.error('Chapter update error:', error);
      res.status(500).json({ message: '목차 수정에 실패했습니다.' });
    }
  });

  // 특정 목차 삭제 (관리자만)
  router.delete('/:bookId/chapters/:chapterId', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const chapter = book.chapters.id(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
      }

      await chapter.deleteOne();
      await book.save();
      res.json({ message: '목차가 삭제되었습니다.' });
    } catch (error) {
      console.error('Chapter delete error:', error);
      res.status(500).json({ message: '목차 삭제에 실패했습니다.' });
    }
  });

  // 목차에 학습 내용 추가 (관리자만)
  router.post('/:bookId/chapters/:chapterId/learnings', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const chapter = book.chapters.id(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
      }

      const { topic, content } = req.body;
      if (!topic || !content) {
        return res.status(400).json({ message: '주제와 내용을 모두 입력해주세요.' });
      }

      chapter.learnings.push({ topic, content });
      await book.save();

      res.status(201).json(chapter.learnings[chapter.learnings.length - 1]);
    } catch (error) {
      console.error('Chapter learning add error:', error);
      res.status(500).json({ message: '학습 내용 추가에 실패했습니다.' });
    }
  });

  // 목차의 특정 학습 내용 수정 (관리자만)
  router.put('/:bookId/chapters/:chapterId/learnings/:learningId', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const chapter = book.chapters.id(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
      }

      const learning = chapter.learnings.id(req.params.learningId);
      if (!learning) {
        return res.status(404).json({ message: '학습 내용을 찾을 수 없습니다.' });
      }

      const { topic, content } = req.body;
      if (topic !== undefined) learning.topic = topic;
      if (content !== undefined) learning.content = content;

      await book.save();
      res.json(learning);
    } catch (error) {
      console.error('Chapter learning update error:', error);
      res.status(500).json({ message: '학습 내용 수정에 실패했습니다.' });
    }
  });

  // 목차의 특정 학습 내용 삭제 (관리자만)
  router.delete('/:bookId/chapters/:chapterId/learnings/:learningId', authMiddleware, async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: '서적을 찾을 수 없습니다.' });
      }

      const chapter = book.chapters.id(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: '목차를 찾을 수 없습니다.' });
      }

      const learning = chapter.learnings.id(req.params.learningId);
      if (!learning) {
        return res.status(404).json({ message: '학습 내용을 찾을 수 없습니다.' });
      }

      await learning.deleteOne();
      await book.save();
      res.json({ message: '학습 내용이 삭제되었습니다.' });
    } catch (error) {
      console.error('Chapter learning delete error:', error);
      res.status(500).json({ message: '학습 내용 삭제에 실패했습니다.' });
    }
  });

  return router;
};

module.exports = setupBookRoutes;
