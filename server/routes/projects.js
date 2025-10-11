/**
 * 프로젝트 관리 라우트
 */

const express = require('express');
const { projectSchema, validateRequest, validateObjectId } = require('../validation/schemas');
const { authenticateToken, logAdminActivity } = require('../middleware/auth');

const router = express.Router();

const setupProjectRoutes = (Project) => {
  const authMiddleware = authenticateToken(require('../models').Admin);
  
  // 모든 프로젝트 조회 (퍼블릭)
  router.get('/', async (req, res) => {
    try {
      const projects = await Project.find()
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon')  // 스킬 정보 populate
        .sort({ order: 1, createdAt: -1 });
      res.json({ data: projects, message: '프로젝트 목록 조회 성공' });
    } catch (error) {
      console.error('Project fetch error:', error);
      res.status(500).json({ message: '프로젝트 목록을 불러오는데 실패했습니다.' });
    }
  });

  // 특정 프로젝트 조회 (퍼블릭)
  router.get('/:id', validateObjectId, async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('categoryIds', 'name order')  // 🌟 카테고리 정보 populate
        .populate('skillIds', 'name icon');  // 스킬 정보 populate
      if (!project) {
        return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
      }
      res.json(project);
    } catch (error) {
      console.error('Project fetch by ID error:', error);
      res.status(500).json({ message: '프로젝트 정보를 불러오는데 실패했습니다.' });
    }
  });

  // 프로젝트 생성 (관리자만)
  router.post('/', authMiddleware, validateRequest(projectSchema), async (req, res) => {
    try {
      console.log('➕ 프로젝트 생성 요청 받음');
      console.log('📦 요청 데이터:', req.body);
      console.log('🔗 skillIds:', req.body.skillIds);
      
      const project = new Project(req.body);
      await project.save();
      
      console.log('✅ 프로젝트 생성 성공:', project._id);
      console.log('✅ 저장된 skillIds:', project.skillIds);
      res.status(201).json(project);
    } catch (error) {
      console.error('❌ Project add error:', error);
      res.status(500).json({ message: '프로젝트 추가에 실패했습니다.' });
    }
  });

  // 프로젝트 수정 (관리자만)
  router.put('/:id', authMiddleware, validateObjectId, validateRequest(projectSchema), async (req, res) => {
    try {
      console.log('🔄 프로젝트 업데이트 요청 받음:', req.params.id);
      console.log('📦 요청 데이터:', req.body);
      console.log('🔗 skillIds:', req.body.skillIds);
      
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!project) {
        console.log('❌ 프로젝트를 찾을 수 없음:', req.params.id);
        return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
      }
      
      console.log('✅ 프로젝트 업데이트 성공:', project._id);
      console.log('✅ 저장된 skillIds:', project.skillIds);
      res.json(project);
    } catch (error) {
      console.error('❌ Project update error:', error);
      res.status(500).json({ message: '프로젝트 수정에 실패했습니다.' });
    }
  });

  // 프로젝트 삭제 (관리자만)
  router.delete('/:id', authMiddleware, validateObjectId, logAdminActivity('PROJECT_DELETE'), async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) {
        return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
      }
      res.json({ message: '프로젝트가 삭제되었습니다.' });
    } catch (error) {
      console.error('Project delete error:', error);
      res.status(500).json({ message: '프로젝트 삭제에 실패했습니다.' });
    }
  });

  return router;
};

module.exports = setupProjectRoutes;
