import React from 'react'
import * as FaIcons from 'react-icons/fa'
import * as SiIcons from 'react-icons/si'

// 모든 아이콘을 하나의 객체로 매핑
const IconMap: { [key: string]: React.ElementType } = {
  ...FaIcons,
  ...SiIcons,
}

interface DynamicIconProps {
  iconName: string
  size?: number
  className?: string
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  iconName, 
  size = 16, 
  className = '' 
}) => {
  const IconComponent = IconMap[iconName]

  if (!IconComponent) {
    // 유효하지 않은 아이콘 이름일 경우 기본 아이콘 표시
    return <FaIcons.FaMicrochip size={size} className={className} />
  }

  return React.createElement(IconComponent, { size, className })
}

export default DynamicIcon
