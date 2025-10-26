import React, { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  FaBriefcase, 
  FaCheckCircle, 
  FaCoffee, 
  FaGraduationCap, 
  FaChartLine, 
  FaCode, 
  FaCog, 
  FaRobot, 
  FaChevronDown, 
  FaChevronRight,
  FaCar,           // 🚗 자동차
  FaShieldAlt,     // 🛡️ 군인
  FaLaptopCode     // 💻 프로그래밍
} from 'react-icons/fa';
import { ExperienceItem as ExperienceItemType } from '../hooks/useExperiences';
import { ExperienceDetail } from '../types';
import { useSkills } from '../hooks/useSkills';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedField, getLocalizedArrayField } from '@/utils/i18nUtils';

interface ExperienceItemProps {
  exp: ExperienceItemType;
  variants: Variants;
  isLast?: boolean;
}

// 아이콘 매핑
const iconMap = {
  FaCoffee: FaCoffee,
  FaGraduationCap: FaGraduationCap,
  FaChartLine: FaChartLine,
  FaBriefcase: FaBriefcase,
  FaCode: FaCode,
  FaCog: FaCog,
  FaRobot: FaRobot,
  FaCar: FaCar,               // 🚗 자동차
  FaShieldAlt: FaShieldAlt,   // 🛡️ 군인
  FaLaptopCode: FaLaptopCode, // 💻 프로그래밍
} as const;

const ExperienceItem: React.FC<ExperienceItemProps> = ({ exp, variants, isLast = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { skillCategories } = useSkills();
  const { i18n } = useTranslation();
  const currentLang = i18n.language as 'ko' | 'en' | 'ja';
  
  // 아이콘 매핑 및 대체 아이콘 설정
  const IconComponent = exp.iconKey && iconMap[exp.iconKey as keyof typeof iconMap] 
    ? iconMap[exp.iconKey as keyof typeof iconMap] 
    : FaBriefcase;
  
  // 🌟 연결된 스킬 필터링
  const linkedSkills = useMemo(() => {
    if (!exp.skillIds || !skillCategories) return [];
    const allSkills = skillCategories.flatMap(cat => cat.skills || []);
    return allSkills.filter(skill => {
      const skillId = skill._id;
      return skillId && (exp.skillIds as any[]).some((idOrObj: any) => {
        const id = typeof idOrObj === 'string' ? idOrObj : idOrObj?._id;
        return id === skillId;
      });
    });
  }, [exp.skillIds, skillCategories]);
  
  // description을 줄 바꿈 기준으로 분할하여 목록으로 사용
  const descriptionItems = exp.description 
    ? exp.description.split('\n').filter(line => line.trim() !== '') 
    : [];
  
  // 동적 색상 값 변수 설정 (CSS 변수 Fallback)
  const iconColor = exp.color || '#8B4513';
  const iconBgColor = exp.bgColor || '#F5DEB3';

  return (
    <div className="relative flex items-start gap-6">
      {/* 🌟 타임라인 라인 (세로선) */}
      {!isLast && (
        <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 to-primary-100 dark:from-primary-700 dark:to-primary-900" />
      )}
      
      {/* 🌟 타임라인 아이콘 (원형 배지) */}
      <div className="relative z-10 flex-shrink-0">
        <motion.div
          variants={variants}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-800"
          style={{ 
            backgroundColor: iconBgColor,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <IconComponent 
            size={28}
            style={{ color: iconColor }}
          />
        </motion.div>
      </div>

      {/* 🌟 콘텐츠 카드 */}
      <motion.div
        variants={variants}
        className="flex-1 mb-12"
      >
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          {/* 헤더 (클릭 가능) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {/* 회사명 (작게) */}
                <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-1">
                  {getLocalizedField(currentLang, exp.company, exp.companyEn, exp.companyJa)}
                </p>
                {/* 직책 (크게) */}
                <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-2 flex items-center gap-2">
                  {getLocalizedField(currentLang, exp.title, exp.titleEn, exp.titleJa)}
                  {/* 🌟 토글 화살표 (항상 표시) */}
                  <span className="text-sm">
                    {isExpanded ? (
                      <FaChevronDown className="text-primary-600 dark:text-primary-400" />
                    ) : (
                      <FaChevronRight className="text-gray-400" />
                    )}
                  </span>
                </h3>
                {/* 기간 배지 */}
                <span className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  📅 {exp.period}
                </span>
              </div>
            </div>
          </button>

          {/* 🌟 아코디언: 주요 내용 (펼쳤을 때만 표시) */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              {/* 카테고리별 상세 내용 카드 (details가 있는 경우) */}
              {exp.details && exp.details.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exp.details.map((detail: ExperienceDetail, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-lg p-5 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all hover:shadow-lg"
                    >
                      {/* 카테고리 헤더 */}
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: iconColor }}></div>
                        <h4 className="text-base font-bold text-dark-900 dark:text-white">
                          {getLocalizedField(currentLang, detail.category, detail.categoryEn, detail.categoryJa)}
                        </h4>
                      </div>
                      
                      {/* 항목 리스트 */}
                      <ul className="space-y-2.5">
                        {getLocalizedArrayField(currentLang, detail.items, detail.itemsEn, detail.itemsJa).map((item: string, itemIdx: number) => (
                          <motion.li
                            key={itemIdx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (idx * 0.1) + (itemIdx * 0.03) }}
                            className="flex items-start gap-2 text-sm text-dark-700 dark:text-dark-300"
                          >
                            <FaCheckCircle style={{ color: iconColor }} className="mt-0.5 flex-shrink-0 text-xs" />
                            <span className="flex-1 leading-relaxed">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // 기존 설명 방식 (하위 호환성)
                descriptionItems.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaCheckCircle style={{ color: iconColor }} size={14} />
                      주요 내용
                    </h4>
                    <ul className="space-y-2.5 pl-1">
                      {descriptionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-dark-600 dark:text-dark-300">
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: iconColor }} />
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )
              )}
            </motion.div>
          )}

          {/* 🌟 연결된 스킬 배지 (skillIds 기반) */}
          {linkedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {linkedSkills.map((skill) => (
                <Link
                  key={skill._id}
                  to={`/projects?skillId=${skill._id}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 hover:ring-2"
                  style={{
                    backgroundColor: `${skill.color}26`,
                    color: skill.color,
                    '--tw-ring-color': skill.color || '#3B82F6',
                  } as React.CSSProperties}
                  title={`${skill.name} 스킬이 사용된 프로젝트 보기`}
                >
                  {skill.name}
                </Link>
              ))}
            </div>
          )}
          
          {/* 🔄 호환성: 기존 skills 문자열 배열도 표시 (skillIds가 없을 때만) */}
          {!linkedSkills.length && exp.skills && exp.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {exp.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-secondary-100 dark:bg-secondary-900/50 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm font-medium hover:bg-secondary-200 dark:hover:bg-secondary-800/50 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default ExperienceItem;
