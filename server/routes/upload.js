/**
 * Cloudinary 이미지 업로드 라우트
 * 인증된 사용자만 파일 업로드 가능
 */

const express = require('express');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

const router = express.Router();

// Cloudinary 설정 검증
const validateCloudinaryConfig = () => {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Cloudinary environment variables: ${missing.join(', ')}`);
  }
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// 초기 설정 검증
let isCloudinaryConfigured = false;
try {
  validateCloudinaryConfig();
  isCloudinaryConfigured = true;
  console.log('✅ Cloudinary configuration loaded');
} catch (error) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cloudinary configuration error:', error.message);
    process.exit(1); // 프로덕션 환경에서는 서버 시작 중단
  } else {
    console.warn('⚠️  Cloudinary configuration missing. Image upload will be disabled.');
    console.warn('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env file');
  }
}

/**
 * POST /api/upload/image
 * 이미지 업로드 (인증 필요)
 * 
 * 요구사항:
 * - 관리자 인증 필수
 * - image/jpeg, image/png, image/webp만 허용
 * - 파일 크기 5MB 이하
 */
router.post('/image', async (req, res) => {
  // Cloudinary가 설정되지 않았으면 에러 반환
  if (!isCloudinaryConfigured) {
    return res.status(503).json({ 
      error: 'Cloudinary not configured',
      message: '이미지 업로드 기능을 사용하려면 Cloudinary 설정이 필요합니다.' 
    });
  }

  try {
    // 1. 인증 확인 (authMiddleware에서 이미 처리됨)
    // req.user는 미들웨어에서 설정됨
    
    // 2. 파일 존재 확인
    if (!req.files || !req.files.image) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: '이미지 파일을 업로드해주세요.' 
      });
    }
    
    const imageFile = req.files.image;
    
    // 3. 파일 타입 검사 (보안 강화)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: '지원되는 이미지 형식: JPEG, PNG, WEBP' 
      });
    }
    
    // 4. 파일 크기 확인 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large',
        message: '파일 크기는 5MB 이하여야 합니다.' 
      });
    }
    
    // 5. Cloudinary에 업로드
    const uploadResult = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'editorjs', // 편의를 위한 폴더 구조
      resource_type: 'image',
    });
    
    // 6. 임시 파일 정리
    try {
      if (imageFile.tempFilePath && fs.existsSync(imageFile.tempFilePath)) {
        fs.unlinkSync(imageFile.tempFilePath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError.message);
    }
    
    // 7. 성공 응답
    res.json({
      success: true,
      file: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    // 에러 발생 시 임시 파일 정리
    if (req.files && req.files.image && req.files.image.tempFilePath) {
      try {
        if (fs.existsSync(req.files.image.tempFilePath)) {
          fs.unlinkSync(req.files.image.tempFilePath);
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError.message);
      }
    }
    
    res.status(500).json({ 
      error: 'Upload failed',
      message: '이미지 업로드에 실패했습니다.' 
    });
  }
});

module.exports = router;

