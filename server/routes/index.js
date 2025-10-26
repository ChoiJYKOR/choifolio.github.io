/**
 * 메인 라우트 통합
 * 모든 라우트를 통합하여 Express 앱에 등록
 */

const express = require('express');
const setupAuthRoutes = require('./auth');
const setupCategoryRoutes = require('./categories');
const setupBookRoutes = require('./books');
const setupVideoLearningRoutes = require('./videoLearnings');
const setupVideoLearningCategoryRoutes = require('./videoLearningCategories');
const setupVideoPlaylistRoutes = require('./videoPlaylists');
const setupPlaylistVideoRoutes = require('./playlistVideos');
const setupExperienceRoutes = require('./experiences');
const setupProjectRoutes = require('./projects');
const setupContactRoutes = require('./contact');
const setupSettingsRoutes = require('./settings');
const uploadRoutes = require('./upload');
const { authenticateToken, logAdminActivity } = require('../middleware/auth');
const { skillSchema, skillCategorySchema, validateRequest } = require('../validation/schemas');

// =================================================================
// 라우트 설정 함수
// =================================================================

const setupRoutes = (app, models) => {
  const { Admin, Book, Category, VideoLearning, VideoPlaylist, PlaylistVideo, Experience, Project, ContactMessage, SiteSettings } = models;
  
  // 인증 미들웨어 생성
  const authMiddleware = authenticateToken(Admin);
  
  // API 라우트 등록
  app.use('/api/auth', setupAuthRoutes(Admin));
  app.use('/api/categories', setupCategoryRoutes(Category, Book, Project, VideoLearning, VideoPlaylist, authMiddleware));
  app.use('/api/books', setupBookRoutes(Book));
  app.use('/api/video-learnings', setupVideoLearningRoutes(VideoLearning));
  app.use('/api/video-playlists', setupVideoPlaylistRoutes(VideoPlaylist));
  app.use('/api/playlist-videos', setupPlaylistVideoRoutes(PlaylistVideo));
  app.use('/api/experiences', setupExperienceRoutes(Experience));
  app.use('/api/projects', setupProjectRoutes(Project));
  app.use('/api', setupContactRoutes(ContactMessage, Admin)); // /api로 변경하여 /admin/messages 경로가 /api/admin/messages가 되도록 함
  app.use('/api/settings', setupSettingsRoutes(SiteSettings));
  app.use('/api/upload', authMiddleware, uploadRoutes); // 인증 미들웨어 추가
  
  // 메시지 관리 라우트는 이제 contact.js에서 처리됩니다

  // 스킬 관리 라우트 (기존 기능 유지)
  const { SkillCategory, Skill } = models;
  
  // 모든 스킬 조회 (프론트엔드 호환성)
  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await Skill.find().populate('categoryId').sort({ order: 1 });
      
      // 🔍 디버깅: 새 필드가 포함되어 있는지 확인
      const sidebarCount = skills.filter(s => s.showInSidebar).length;
      const languageCount = skills.filter(s => s.showInLanguageCard).length;
      console.log(`🔍 [서버] 스킬 조회: 전체 ${skills.length}개, showInSidebar=${sidebarCount}개, showInLanguageCard=${languageCount}개`);
      
      if (sidebarCount > 0) {
        console.log('✅ [서버] showInSidebar=true 스킬:', skills.filter(s => s.showInSidebar).map(s => s.name));
      }
      if (languageCount > 0) {
        console.log('✅ [서버] showInLanguageCard=true 스킬:', skills.filter(s => s.showInLanguageCard).map(s => s.name));
      }
      
      res.json(skills);
    } catch (error) {
      console.error('Skills fetch error:', error);
      res.status(500).json({ message: '스킬 조회에 실패했습니다.' });
    }
  });

  // 스킬 카테고리 조회
  app.get('/api/skill-categories', async (req, res) => {
    try {
      const categories = await SkillCategory.find().populate('skills').sort({ order: 1 });
      res.json({ data: categories, message: '스킬 카테고리 조회 성공' });
    } catch (error) {
      console.error('Skill categories fetch error:', error);
      res.status(500).json({ message: '스킬 카테고리 조회에 실패했습니다.' });
    }
  });

  // 스킬 카테고리 생성
  app.post('/api/skill-categories', authMiddleware, validateRequest(skillCategorySchema), async (req, res) => {
    try {
      const category = new SkillCategory(req.body);
      await category.save();
      res.status(201).json({ data: category, message: '스킬 카테고리가 추가되었습니다.' });
    } catch (error) {
      console.error('Skill category add error:', error);
      res.status(500).json({ message: '스킬 카테고리 추가에 실패했습니다.' });
    }
  });

  // 스킬 카테고리 수정
  app.put('/api/skill-categories/:id', authMiddleware, validateRequest(skillCategorySchema), async (req, res) => {
    try {
      const category = await SkillCategory.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      if (!category) {
        return res.status(404).json({ message: '스킬 카테고리를 찾을 수 없습니다.' });
      }
      res.json({ data: category, message: '스킬 카테고리가 수정되었습니다.' });
    } catch (error) {
      console.error('Skill category update error:', error);
      res.status(500).json({ message: '스킬 카테고리 수정에 실패했습니다.' });
    }
  });

  // 스킬 카테고리 삭제
  app.delete('/api/skill-categories/:id', authMiddleware, async (req, res) => {
    try {
      // 카테고리 삭제 전에 해당 카테고리의 모든 스킬도 삭제
      await Skill.deleteMany({ categoryId: req.params.id });
      const category = await SkillCategory.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ message: '스킬 카테고리를 찾을 수 없습니다.' });
      }
      res.json({ message: '스킬 카테고리가 삭제되었습니다.' });
    } catch (error) {
      console.error('Skill category delete error:', error);
      res.status(500).json({ message: '스킬 카테고리 삭제에 실패했습니다.' });
    }
  });

  // 특정 카테고리의 스킬 조회
  app.get('/api/skill-categories/:id/skills', async (req, res) => {
    try {
      const skills = await Skill.find({ categoryId: req.params.id }).sort({ order: 1 });
      res.json({ data: skills });
    } catch (error) {
      console.error('Category skills fetch error:', error);
      res.status(500).json({ message: '스킬 조회에 실패했습니다.' });
    }
  });

  // 스킬 생성 (카테고리별)
  app.post('/api/skill-categories/:categoryId/skills', authMiddleware, async (req, res) => {
    try {
      const skillData = { ...req.body, categoryId: req.params.categoryId };
      // Validation with categoryId included
      const { error } = skillSchema.validate(skillData, { abortEarly: false, stripUnknown: true });
      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: '입력값 유효성 검사 실패', errors: errorMessages });
      }
      
      const skill = new Skill(skillData);
      await skill.save();
      res.status(201).json({ data: skill, message: '스킬이 추가되었습니다.' });
    } catch (error) {
      console.error('Skill add error:', error);
      res.status(500).json({ message: '스킬 추가에 실패했습니다.' });
    }
  });

  // 스킬 수정
  app.put('/api/skills/:id', authMiddleware, validateRequest(skillSchema), async (req, res) => {
    try {
      console.log('🔧 [서버] 스킬 업데이트 요청:', req.params.id);
      console.log('📋 [서버] 업데이트 데이터:', {
        name: req.body.name,
        showInSidebar: req.body.showInSidebar,
        showInLanguageCard: req.body.showInLanguageCard
      });
      
      const skill = await Skill.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).lean();
      if (!skill) {
        return res.status(404).json({ message: '스킬을 찾을 수 없습니다.' });
      }
      
      console.log('✅ [서버] 업데이트 완료:', {
        name: skill.name,
        showInSidebar: skill.showInSidebar,
        showInLanguageCard: skill.showInLanguageCard
      });
      
      res.json({ data: skill, message: '스킬이 수정되었습니다.' });
    } catch (error) {
      console.error('❌ [서버] Skill update error:', error);
      res.status(500).json({ message: '스킬 수정에 실패했습니다.' });
    }
  });

  // 스킬 삭제
  app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
    try {
      const skill = await Skill.findByIdAndDelete(req.params.id);
      if (!skill) {
        return res.status(404).json({ message: '스킬을 찾을 수 없습니다.' });
      }
      res.json({ message: '스킬이 삭제되었습니다.' });
    } catch (error) {
      console.error('Skill delete error:', error);
      res.status(500).json({ message: '스킬 삭제에 실패했습니다.' });
    }
  });

  // 관리자 계정 설정 라우트
  const bcrypt = require('bcryptjs');
  app.post('/api/admin/setup', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: '사용자명과 비밀번호를 입력해주세요.' });
      }

      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ message: '이미 존재하는 사용자명입니다.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new Admin({
        username,
        password: hashedPassword,
        email: email || '',
        isAdmin: true
      });

      await admin.save();
      res.status(201).json({ success: true, message: '관리자 계정이 생성되었습니다.' });
    } catch (error) {
      console.error('Admin setup error:', error);
      res.status(500).json({ message: '관리자 계정 설정에 실패했습니다.' });
    }
  });
  
  console.log('✅ 모든 라우트 설정 완료');
};

module.exports = setupRoutes;
