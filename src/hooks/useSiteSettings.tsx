import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode, useContext } from 'react'
import { settingsAPI } from '../services/api'
import { SettingsFormData } from '../types'

// =================================================================
// 초기 설정값 정의 (기본값 제공) - 상수로 한 번만 생성
// =================================================================

const INITIAL_SETTINGS: Partial<SettingsFormData> = {
  // GeneralInfo 기본값
  fullName: '',
  firstName: '',
  role: '',
  subtitle: '',
  location: '',
  education: '',
  yearsOfExperience: '',
  
  // ContactInfo 기본값
  email: '',
  phone: '',
  githubUrl: '',
  linkedinUrl: '',
  
  // ContentText 기본값
  heroTitle: '',
  heroSubtitle: '',
  heroTag: '',
  heroCtaLink1: '',
  heroCtaLink2: '',
  aboutTitle: '',
  aboutSubtitle: '',
  aboutDescription1: '',
  aboutDescription2: '',
  skillsTitle: '',
  skillsSubtitle: '',
  projectsTitle: '',
  projectsSubtitle: '',
  // 🌟 프로젝트 업데이트 카드 기본값 (빈 값으로 설정 - 관리자가 직접 입력)
  projectsUpdateTitle: '',
  projectsUpdateDescription: '',
  projectsUpdateTechList: [],
  booksTitle: '',
  booksSubtitle: '',
  contactTitle: '',
  contactSubtitle: '',
  experienceTitle: '',
  experienceSubtitle: '',
  
  // 🌟 학습 목표 기본값
  learningGoalsTitle: '앞으로의 학습 목표',
  learningGoalsDescription: '4차 산업혁명 시대에 발맞춰 **지능형 공장(Smart Factory) 구현**을 위해 다음 기술들을 집중적으로 탐구하여 전문성을 확대해 나가겠습니다.',
  learningGoalsList: ['첨단 로봇 제어', '딥러닝 기반 비전 시스템', '엣지 컴퓨팅', '클라우드 연동', 'MES/ERP 연동 기술'],
  
  // Stats 기본값
  stat1Number: '',
  stat1Label: '',
  stat2Number: '',
  stat2Label: '',
  stat3Number: '',
  stat3Label: '',
  
  // MainSkills 기본값
  mainSkills: [],
}

// =================================================================
// Context 타입 정의 및 생성
// =================================================================

interface SiteSettingsContextType {
  settings: SettingsFormData;
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>; // 관리자 페이지를 위한 수동 새로고침 함수
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// =================================================================
// Provider 컴포넌트
// =================================================================

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsFormData>(INITIAL_SETTINGS as SettingsFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 설정 데이터를 가져오는 함수
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await settingsAPI.get();
      
      const mergedSettings = {
        ...INITIAL_SETTINGS,
        ...response.data
      };
      
      setSettings(mergedSettings);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('설정을 불러오는데 실패했습니다.');
      setSettings(INITIAL_SETTINGS as SettingsFormData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Provider가 마운트될 때 *단 한 번만* 데이터를 가져옵니다. (캐싱)
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const refetchSettings = useCallback(async () => {
      await fetchSettings();
  }, [fetchSettings]);

  // Context value를 useMemo로 메모이제이션하여 불필요한 리렌더링 방지
  const value = useMemo(() => ({
    settings,
    loading,
    error,
    refetchSettings
  }), [settings, loading, error, refetchSettings]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// =================================================================
// Custom Hook: 이제 Context를 소비합니다.
// =================================================================

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
