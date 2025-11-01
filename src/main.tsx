import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // i18n 초기화

// GitHub Pages SPA 라우팅 지원: 404.html에서 리다이렉트된 경로 복원
const redirectPath = sessionStorage.getItem('redirectPath')
if (redirectPath) {
  sessionStorage.removeItem('redirectPath')
  // React Router가 경로를 처리하도록 history를 업데이트
  if (redirectPath !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(null, '', redirectPath)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
