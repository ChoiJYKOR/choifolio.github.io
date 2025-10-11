/**
 * 리팩토링된 메인 서버 파일
 * 애플리케이션 초기화, DB 연결, 미들웨어 등록, 라우트 연결만 담당
 */

// =================================================================
// 1. 기본 모듈 및 설정
// =================================================================
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// 설정 및 모듈 가져오기
const config = require('./config');
const models = require('./models');
const { setupSecurityMiddleware } = require('./middleware/security');
const { createDynamicSecurityHeaders } = require('./middleware/dynamicHeaders');
const setupRoutes = require('./routes');

// =================================================================
// 2. Express 앱 초기화
// =================================================================
const app = express();

// =================================================================
// 3. 기본 미들웨어 등록
// =================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// =================================================================
// 4. 보안 미들웨어 설정
// =================================================================
setupSecurityMiddleware(app);

// 동적 보안 헤더 미들웨어 (DB 연결 후 설정)
// 이 부분은 DB 연결 후에 설정됩니다

// =================================================================
// 5. 데이터베이스 연결
// =================================================================
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ MongoDB 연결 성공');
    
    // DB 연결 후 동적 보안 헤더 미들웨어 설정
    app.use(createDynamicSecurityHeaders(models.SiteSettings));
    
    // 라우트 설정
    setupRoutes(app, models);
    
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// =================================================================
// 6. 에러 처리 미들웨어
// =================================================================
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(500).json({
    message: '서버 내부 오류가 발생했습니다.',
    ...(config.nodeEnv === 'development' && { error: err.message })
  });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// =================================================================
// 7. 서버 시작
// =================================================================
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📝 환경: ${config.nodeEnv}`);
  
  // 데이터베이스 연결
  connectDB();
});

// =================================================================
// 8. Graceful Shutdown
// =================================================================
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB 연결이 종료되었습니다.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT 신호를 받았습니다. 서버를 종료합니다...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB 연결이 종료되었습니다.');
    process.exit(0);
  });
});

module.exports = app;
