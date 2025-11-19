import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // i18n 초기화

// GitHub Pages SPA 라우팅 지원: 404.html에서 리다이렉트된 경로 복원
const redirectPath = sessionStorage.getItem('redirectPath')
if (redirectPath !== null) {
  sessionStorage.removeItem('redirectPath')
  // React Router basename과 일치하도록 경로 설정
  // basename은 "/choifolio.github.io"이므로 redirectPath는 서브패스 없이 저장됨
  const targetPath = '/choifolio.github.io' + (redirectPath || '/')
  const currentPath = window.location.pathname + window.location.search + window.location.hash
  if (targetPath !== currentPath) {
    window.history.replaceState(null, '', targetPath)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
