import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja }
    },
    lng: (() => {
      try {
        return localStorage.getItem('language') || 'ko'
      } catch (error) {
        console.warn('localStorage 접근 불가:', error)
        return 'ko'
      }
    })(),
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n

