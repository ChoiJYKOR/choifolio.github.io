import React, { useState, useEffect } from 'react'
import { Skill, SkillFormData } from '../../types'
import DynamicIcon from '../common/DynamicIcon'
import LanguageTabs, { AdminLanguage } from '../common/LanguageTabs'

interface SkillFormProps {
  initialData?: Skill | null
  categoryId?: string | undefined
  onSave: (data: SkillFormData) => void
  onCancel: () => void
  isSaving?: boolean
}

const SkillForm: React.FC<SkillFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isSaving = false
}) => {
  const [currentLang, setCurrentLang] = useState<AdminLanguage>('ko')
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    nameEn: '',
    nameJa: '',
    level: 50, // 새 스킬 생성 시 기본 숙련도
    icon: 'FaMicrochip',
    description: '',
    descriptionEn: '',
    descriptionJa: '',
    order: 0
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        nameEn: initialData.nameEn || '',
        nameJa: initialData.nameJa || '',
        level: initialData.level, // 기존 스킬의 숙련도 유지 (목록에서 조절)
        icon: initialData.icon,
        description: initialData.description || '',
        descriptionEn: initialData.descriptionEn || '',
        descriptionJa: initialData.descriptionJa || '',
        order: initialData.order
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: keyof SkillFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? '스킬 수정' : '새 스킬 추가'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Language Tabs */}
        <LanguageTabs activeLanguage={currentLang} onChange={setCurrentLang} />

        {/* Name Field (Multilingual) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            이름 {currentLang === 'ko' && <span className="text-red-500">*</span>}
            <span className="text-xs text-gray-500 ml-2">
              ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
            </span>
          </label>
          {currentLang === 'ko' && (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="예: Python, React, PLC"
              required
            />
          )}
          {currentLang === 'en' && (
            <input
              type="text"
              value={formData.nameEn || ''}
              onChange={(e) => handleChange('nameEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Python, React, PLC"
            />
          )}
          {currentLang === 'ja' && (
            <input
              type="text"
              value={formData.nameJa || ''}
              onChange={(e) => handleChange('nameJa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例: Python, React, PLC"
            />
          )}
        </div>

        {/* Description Field (Multilingual) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            설명 (선택사항)
            <span className="text-xs text-gray-500 ml-2">
              ({currentLang === 'ko' ? '🇰🇷 한국어' : currentLang === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'})
            </span>
          </label>
          {currentLang === 'ko' && (
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="스킬에 대한 간단한 설명"
            />
          )}
          {currentLang === 'en' && (
            <textarea
              value={formData.descriptionEn || ''}
              onChange={(e) => handleChange('descriptionEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Brief description of this skill"
            />
          )}
          {currentLang === 'ja' && (
            <textarea
              value={formData.descriptionJa || ''}
              onChange={(e) => handleChange('descriptionJa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="このスキルの簡単な説明"
            />
          )}
        </div>
        
        {/* 🌟 숙련도는 기술 관리 목록의 인라인 슬라이더로 조절합니다 */}
        
        <div>
          <label className="block text-sm font-medium mb-2">아이콘</label>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-lg text-blue-600 dark:text-blue-400">
              <DynamicIcon iconName={formData.icon} size={20} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">미리보기</span>
          </div>
          <select
            value={formData.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <optgroup label="프로그래밍 언어">
              <option value="FaPython">Python</option>
              <option value="SiJavascript">JavaScript</option>
              <option value="SiTypescript">TypeScript</option>
              <option value="SiC">C</option>
              <option value="SiCplusplus">C++</option>
              <option value="SiCsharp">C#</option>
              <option value="SiGo">Go</option>
              <option value="SiRust">Rust</option>
              <option value="SiJava">Java</option>
              <option value="SiPhp">PHP</option>
              <option value="SiRuby">Ruby</option>
              <option value="SiSwift">Swift</option>
              <option value="SiKotlin">Kotlin</option>
            </optgroup>
            <optgroup label="프레임워크 & 라이브러리">
              <option value="SiReact">React</option>
              <option value="SiNodedotjs">Node.js</option>
              <option value="SiVuedotjs">Vue.js</option>
              <option value="SiAngular">Angular</option>
              <option value="SiNextdotjs">Next.js</option>
              <option value="SiExpress">Express</option>
              <option value="SiDjango">Django</option>
              <option value="SiFlask">Flask</option>
              <option value="SiSpring">Spring</option>
            </optgroup>
            <optgroup label="데이터베이스">
              <option value="FaDatabase">Database</option>
              <option value="SiMysql">MySQL</option>
              <option value="SiMongodb">MongoDB</option>
              <option value="SiPostgresql">PostgreSQL</option>
              <option value="SiRedis">Redis</option>
              <option value="SiSqlite">SQLite</option>
            </optgroup>
            <optgroup label="자동화 & 하드웨어">
              <option value="FaMicrochip">Microchip</option>
              <option value="FaRobot">Robot</option>
              <option value="SiArduino">Arduino</option>
              <option value="SiRaspberrypi">Raspberry Pi</option>
              <option value="SiSiemens">Siemens</option>
              <option value="SiMitsubishi">Mitsubishi</option>
            </optgroup>
            <optgroup label="개발 도구">
              <option value="FaCode">Code</option>
              <option value="FaServer">Server</option>
              <option value="SiDocker">Docker</option>
              <option value="SiGit">Git</option>
              <option value="SiLinux">Linux</option>
              <option value="SiGithub">GitHub</option>
              <option value="SiGitlab">GitLab</option>
              <option value="SiVisualstudiocode">VS Code</option>
            </optgroup>
            <optgroup label="언어">
              <option value="FaLanguage">언어 일반</option>
              <option value="FaGlobeAsia">일본어</option>
              <option value="FaGlobeEurope">독일어</option>
              <option value="FaFlag">러시아어</option>
              <option value="FaFlagCheckered">한국어</option>
              <option value="FaGlobe">에스토니아어</option>
              <option value="FaFont">중국어</option>
              <option value="FaComment">영어</option>
            </optgroup>
            <optgroup label="학문 & 전공">
              <option value="FaLaptopCode">컴퓨터공학</option>
              <option value="FaChartBar">통계학</option>
              <option value="FaCalculator">수학</option>
              <option value="FaSquareRootAlt">수학 (고급)</option>
              <option value="FaUniversity">대학/학술</option>
              <option value="FaGraduationCap">졸업/학위</option>
            </optgroup>
            <optgroup label="공학">
              <option value="FaCogs">공학 일반</option>
              <option value="FaTools">기계공학</option>
              <option value="FaWrench">기계설계</option>
              <option value="FaBolt">전기공학</option>
              <option value="FaPlug">전력공학</option>
              <option value="FaMicrochip">전자공학</option>
              <option value="FaHardHat">토목공학</option>
              <option value="FaBuilding">건축공학</option>
              <option value="FaIndustry">산업공학</option>
              <option value="FaChartLine">경영공학</option>
              <option value="FaFlask">화학공학</option>
              <option value="FaCubes">재료공학</option>
              <option value="FaPlane">항공공학</option>
              <option value="FaRocket">우주공학</option>
              <option value="FaLeaf">환경공학</option>
              <option value="FaRecycle">자원공학</option>
              <option value="FaDna">생명공학</option>
              <option value="FaOilCan">석유공학</option>
              <option value="FaFire">에너지공학</option>
              <option value="FaShieldAlt">안전공학</option>
            </optgroup>
            <optgroup label="과학">
              <option value="FaAtom">원자/물리학</option>
              <option value="FaFlask">화학/실험</option>
              <option value="FaMicroscope">생물학/연구</option>
              <option value="FaDna">DNA/유전학</option>
              <option value="FaRocket">우주/항공</option>
              <option value="FaSatellite">위성/통신</option>
              <option value="FaBrain">뇌과학/심리학</option>
              <option value="FaLightbulb">발명/혁신</option>
              <option value="FaWaveSquare">전자/전기공학</option>
              <option value="FaMagnet">자기학/물리</option>
            </optgroup>
            <optgroup label="예술 & 취미">
              <option value="FaPalette">미술</option>
              <option value="FaPaintBrush">그림</option>
              <option value="FaCamera">사진</option>
              <option value="FaCameraRetro">사진 (레트로)</option>
              <option value="FaCoffee">커피</option>
              <option value="FaMugHot">커피 (머그)</option>
              <option value="FaMusic">음악</option>
              <option value="FaGuitar">악기</option>
              <option value="FaFilm">영화/영상</option>
            </optgroup>
            <optgroup label="경력 & 경험">
              <option value="FaUserShield">군인</option>
              <option value="FaShieldAlt">방어/보안</option>
              <option value="FaCar">운전</option>
              <option value="FaTruck">트럭 운전</option>
              <option value="FaShippingFast">물류</option>
              <option value="FaBriefcase">비즈니스</option>
              <option value="FaHandshake">협업</option>
            </optgroup>
            <optgroup label="기타">
              <option value="FaChartLine">Chart</option>
              <option value="FaCubes">Cubes</option>
              <option value="FaCog">Settings</option>
              <option value="FaMobile">Mobile</option>
              <option value="FaDesktop">Desktop</option>
              <option value="FaCloud">Cloud</option>
              <option value="FaNetworkWired">Network</option>
            </optgroup>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">순서 (고급 옵션)</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="0"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 스킬 목록에서 드래그하여 순서를 변경할 수 있습니다
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default SkillForm
