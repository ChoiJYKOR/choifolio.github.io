/**
 * Mock 서버 - MongoDB 없이 Lexical 테스트용
 * Local 테스트 전용
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 5001;

// 기본 미들웨어
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mock 데이터 저장
let mockData = {
  videoLearnings: [
    {
      _id: '68e5cbb6e1ddfb950304dcb7',
      title: '테스트 영상 - Lexical 형식',
      keyTakeaways: JSON.stringify({
        root: {
          children: [
            {
              children: [{ text: '테스트 내용', type: 'text', version: 1 }],
              type: 'paragraph',
              version: 1,
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1
        }
      })
    },
    {
      _id: '68fe247fb55a9564a5101e62',
      title: '기초 SQL 문법 - 일반 문자열 (JSON.parse 오류 재현용)',
      keyTakeaways: '기초 SQL 문법', // JSON이 아닌 일반 문자열
      videoId: 'test123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'test-editorjs-format',
      title: 'Editor.js 형식 테스트',
      keyTakeaways: JSON.stringify({
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Editor.js 형식의 내용입니다.'
            }
          }
        ]
      }),
      videoId: 'test456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'test-empty-keytakeaways',
      title: '빈 핵심 배움 테스트',
      keyTakeaways: '',
      videoId: 'test789',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  auth: { user: null }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', mode: 'mock' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Mock API Server', mode: 'mock', port: PORT });
});

// Auth routes
app.post('/api/auth/verify', (req, res) => {
  res.json({ valid: false, user: null });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@test.com' && password === 'admin') {
    res.json({ 
      success: true, 
      user: { email: 'admin@test.com', role: 'admin' },
      token: 'mock-token'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Settings route
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      siteTitle: 'Mock Portfolio',
      siteDescription: 'Mock Description'
    }
  });
});

// Skills routes
// /api/skills는 배열을 직접 반환해야 함 (api.get<Skill[]> 형식)
app.get('/api/skills', (req, res) => {
  res.json([]); // 배열 직접 반환
});

app.get('/api/skill-categories', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Video Learning routes
app.get('/api/video-learnings', (req, res) => {
  res.json({
    success: true,
    data: mockData.videoLearnings
  });
});

app.get('/api/video-learnings/:id', (req, res) => {
  const id = req.params.id;
  const item = mockData.videoLearnings.find(v => v._id === id);
  
  if (item) {
    res.json({ success: true, data: item });
  } else {
    res.status(404).json({ success: false, message: 'Not found' });
  }
});

app.post('/api/video-learnings', (req, res) => {
  const newItem = {
    _id: `mock_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockData.videoLearnings.push(newItem);
  res.json({ success: true, data: newItem });
});

app.put('/api/video-learnings/:id', (req, res) => {
  const id = req.params.id;
  const itemIndex = mockData.videoLearnings.findIndex(v => v._id === id);
  
  if (itemIndex !== -1) {
    mockData.videoLearnings[itemIndex] = {
      ...mockData.videoLearnings[itemIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({ success: true, data: mockData.videoLearnings[itemIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Not found' });
  }
});

app.delete('/api/video-learnings/:id', (req, res) => {
  const id = req.params.id;
  const itemIndex = mockData.videoLearnings.findIndex(v => v._id === id);
  
  if (itemIndex !== -1) {
    mockData.videoLearnings.splice(itemIndex, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Not found' });
  }
});

// Video Playlist routes
app.get('/api/video-playlists', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/video-playlists/:id', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Categories routes
// /api/categories는 배열을 직접 반환해야 함 (api.get<Category[]> 형식)
app.get('/api/categories', (req, res) => {
  res.json([]); // 배열 직접 반환
});

// Books routes
app.get('/api/books', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/books/:id', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Projects routes
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/projects/:id', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Experiences routes
app.get('/api/experiences', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get('/api/experiences/:id', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Image upload (실제 업로드는 나중에 구현)
app.post('/api/upload/image', (req, res) => {
  res.json({
    success: true,
    url: 'https://via.placeholder.com/400x300?text=Mock+Image'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Mock server error:', err);
  res.status(500).json({
    message: 'Server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Mock 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📝 MongoDB 없이 테스트 모드`);
  console.log(`🔐 테스트 계정: admin@test.com / admin`);
});

