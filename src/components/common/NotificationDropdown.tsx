import React from 'react'
import { FaBell } from 'react-icons/fa'

interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: string
}

interface NotificationDropdownProps {
  notifications: Notification[]
  showNotifications: boolean
  onToggle: () => void
  onNotificationClick?: (notificationId: string) => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  showNotifications,
  onToggle,
  onNotificationClick
}) => {
  const getUnreadNotificationCount = () => {
    return notifications.filter(n => !n.read).length
  }

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
      >
        <FaBell />
        알림
        {getUnreadNotificationCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {getUnreadNotificationCount()}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              알림
            </h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                새로운 알림이 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => onNotificationClick?.(notification.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      !notification.read
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <p className="text-sm text-gray-900 dark:text-white">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    +{notifications.length - 5}개 더 보기
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
