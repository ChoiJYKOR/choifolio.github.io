import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // =================================================================
  // GitHub Pages base 경로 설정 (서브패스 지원)
  // =================================================================
  base: '/choifolio.github.io/',
  
  // =================================================================
  // 경로 별칭 설정 (절대 경로)
  // =================================================================
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // React 단일 인스턴스 강제 (중복 React 오류 방지)
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  
  // =================================================================
  // 개발 서버 설정
  // =================================================================
  server: {
    port: 3000,
    strictPort: true, // 포트 3000을 강제로 사용 (다른 포트로 변경하지 않음)
    open: true,
    host: true, // 네트워크에서 접근 가능하도록 설정
    cors: true, // CORS 활성화
    
    // =================================================================
    // API 프록시 설정 (CORS 문제 해결)
    // =================================================================
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // 백엔드 서버 주소
        changeOrigin: true,
        secure: false, // HTTPS가 아닌 경우
        ws: true, // WebSocket 지원
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('프록시 오류:', err.message);
          });
        },
      },
    },
  },
  
  // =================================================================
  // 빌드 최적화 설정
  // =================================================================
  build: {
    outDir: 'dist',
    sourcemap: true, // 소스맵 생성 (디버깅용)
    minify: 'terser', // 코드 압축 최적화
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true, // 프로덕션에서 debugger 제거
      },
    },
    rollupOptions: {
      output: {
        // =================================================================
        // 동적 청크 분리 전략
        // =================================================================
        manualChunks: (id) => {
          // 벤더 라이브러리 청크 분리
          if (id.includes('node_modules')) {
            // React 관련 라이브러리 (use-sync-external-store 포함)
            if (id.includes('react') || id.includes('react-dom') || 
                id.includes('use-sync-external-store') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // 라우터 관련 라이브러리
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // UI 관련 라이브러리
            if (id.includes('framer-motion') || id.includes('react-icons')) {
              return 'ui-vendor';
            }
            // 유틸리티 라이브러리
            if (id.includes('axios') || id.includes('lodash')) {
              return 'utils-vendor';
            }
            // 기타 라이브러리
            return 'vendor';
          }
          
          // 애플리케이션 코드 청크 분리
          if (id.includes('/src/')) {
            // 페이지별 청크 분리 (코드 스플리팅과 연동)
            if (id.includes('/pages/')) {
              return 'pages';
            }
            // 관리자 관련 코드 분리
            if (id.includes('/components/AdminDashboard') || 
                id.includes('/components/SiteSettingsEditor') ||
                id.includes('/components/forms/')) {
              return 'admin';
            }
            // 공통 컴포넌트
            if (id.includes('/components/')) {
              return 'components';
            }
            // 훅과 컨텍스트
            if (id.includes('/hooks/') || id.includes('/contexts/')) {
              return 'hooks-contexts';
            }
            // 서비스와 타입
            if (id.includes('/services/') || id.includes('/types/')) {
              return 'services-types';
            }
          }
        },
        
        // =================================================================
        // 청크 파일명 최적화
        // =================================================================
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
  },
  
  // =================================================================
  // 환경 변수 설정
  // =================================================================
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // =================================================================
  // 개발 환경 최적화
  // =================================================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-icons',
      'axios',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // =================================================================
  // CSS 최적화
  // =================================================================
  css: {
    devSourcemap: true, // CSS 소스맵 (개발용)
    preprocessorOptions: {
      css: {
        charset: false, // CSS charset 제거
      },
    },
  },
})
