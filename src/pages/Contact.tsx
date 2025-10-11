import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaPlus } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useAuth } from '@/contexts/AuthContext'
import { contactAPI } from '@/services/api'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '@/utils/i18nUtils'

// 폼 데이터 타입 정의
interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

const Contact: React.FC = () => {
  const { settings: siteSettings } = useSiteSettings()
  const { isAuthenticated } = useAuth()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ko' | 'en' | 'ja'
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  
  // 폼 제출 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // 폼 제출 로직 - DB 저장만 사용
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      // DB에 메시지 저장
      await contactAPI.sendEmail(formData)
      
      // 성공 처리
      setSubmitStatus('success')
      setSubmitMessage('메시지가 성공적으로 전송되었습니다. 곧 연락 드리겠습니다.')
      setFormData({ name: '', email: '', subject: '', message: '' }) // 폼 초기화

    } catch (error) {
      // 에러 처리
      console.error('Failed to submit form:', error)
      setSubmitStatus('error')
      setSubmitMessage('메시지 전송에 실패했습니다. 이메일로 직접 연락해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: '이메일',
      value: siteSettings?.email || 'juyeong_choi@naver.com',
      href: `mailto:${siteSettings?.email || 'juyeong_choi@naver.com'}`,
    },
    {
      icon: FaPhone,
      title: '전화번호',
      value: siteSettings?.phone || '연락처 문의 시 제공',
      href: siteSettings?.phone ? `tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}` : '#',
    },
    {
      icon: FaMapMarkerAlt,
      title: '위치',
      value: siteSettings?.location || '부산, 대한민국',
      href: '#',
    },
  ]

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  // 폼 유효성 검사 (모든 필드 채워졌는지 확인)
  const isFormValid = formData.name && formData.email && formData.subject && formData.message

  return (
    <section className="section-padding bg-white dark:bg-dark-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* 1. 제목 및 부제목 */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-6">
              {getLocalizedField(currentLang, siteSettings?.contactTitle, siteSettings?.contactTitleEn, siteSettings?.contactTitleJa) || '연락처'}
            </h2>
            <p className="text-xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto mb-8">
              {getLocalizedField(currentLang, siteSettings?.contactSubtitle, siteSettings?.contactSubtitleEn, siteSettings?.contactSubtitleJa) || '프로젝트나 협업에 관심이 있으시다면 언제든지 연락해주세요.'}
            </p>
          </motion.div>

          {/* 2. 연락처 편집 버튼 (인증된 경우) */}
          {isAuthenticated && (
            <motion.div variants={itemVariants} className="mb-8 flex justify-end">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-600 shadow-medium hover:shadow-glow"
              >
                <FaPlus /> 연락처 편집
              </Link>
            </motion.div>
          )}

          {/* 3. 연락처 정보 및 폼 */}
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <motion.a
                    key={info.title}
                    href={info.href}
                    className="flex items-center space-x-4 p-6 card hover:shadow-xl transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-xl">
                      <info.icon className="text-primary-600 dark:text-primary-400" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-dark-900 dark:text-white mb-1">
                        {info.title}
                      </div>
                      <div className="text-dark-600 dark:text-dark-300">
                        {info.value}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="card p-8 bg-primary-600 text-white">
                <h4 className="text-xl font-bold mb-6">취업 관심 분야</h4>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary-300 rounded-full"></div>
                    <span>공장자동화 엔지니어</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary-300 rounded-full"></div>
                    <span>PLC 프로그래머</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary-300 rounded-full"></div>
                    <span>데이터 분석가</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary-300 rounded-full"></div>
                    <span>IoT 시스템 개발자</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="card p-10"
            >
              <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-8">
                메시지 보내기
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-secondary-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-white transition-colors duration-200"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-secondary-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-white transition-colors duration-200"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {/* Subject Input */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-white transition-colors duration-200"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {/* Message Textarea */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    메시지
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-secondary-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-dark-900 dark:text-white resize-none transition-colors duration-200"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {/* Submit Button */}
                <motion.button
                  type="submit"
                    className={`w-full text-lg py-4 flex items-center justify-center space-x-2 rounded-xl transition-colors duration-200 
                    ${isSubmitting || !isFormValid ? 'bg-primary-400 dark:bg-primary-700 text-white cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
                  whileHover={{ scale: isSubmitting || !isFormValid ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting || !isFormValid ? 1 : 0.98 }}
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>전송 중...</span>
                    </>
                  ) : (
                    <>
                      <span>메시지 전송</span>
                      <FaPaperPlane />
                    </>
                  )}
                </motion.button>

                {/* Submit Status Feedback */}
                {submitStatus !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-sm font-medium ${submitStatus === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {submitStatus === 'success' ? <FaCheckCircle size={18} /> : <FaExclamationCircle size={18} />}
                      <span>{submitMessage}</span>
                    </div>
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-20 pt-12 border-t border-secondary-200 dark:border-dark-700"
          >
            <p className="text-dark-600 dark:text-dark-400">
              © 2024 최주영. Made with ❤️ and lots of ☕
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
