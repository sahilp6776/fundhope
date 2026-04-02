// NotificationsPanel – shows user notifications with real-time updates via WebSocket
import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../../config/api'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'

export default function NotificationsPanel() {
  const { getToken } = useAuth()
  const { socket, connected } = useSocket()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }
      const res = await api.get('/notifications', { headers })
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to fetch notifications:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Listen for real-time notifications via WebSocket
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (notification) => {
      // Add new notification to top of list
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
      
      // Show toast for new notification
      toast.success(`${notification.title}`)
    }

    socket.on('notification', handleNewNotification)

    return () => {
      socket.off('notification', handleNewNotification)
    }
  }, [socket])

  const markAsRead = async (notificationId) => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }
      await api.patch(`/notifications/${notificationId}/read`, {}, { headers })
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err.response?.data || err.message)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }
      await api.patch('/notifications/read-all', {}, { headers })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (err) {
      console.error('Failed to mark all as read:', err.response?.data || err.message)
      toast.error('Failed to update notifications')
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }
      await api.delete(`/notifications/${notificationId}`, { headers })
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
    } catch (err) {
      console.error('Failed to delete notification:', err.response?.data || err.message)
      toast.error('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      case 'reminder':
        return '🔔'
      default:
        return '📬'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'approved':
        return 'border-l-4 border-success-500 bg-success-50 dark:bg-success-900/20'
      case 'rejected':
        return 'border-l-4 border-warning-500 bg-warning-50 dark:bg-warning-900/20'
      case 'reminder':
        return 'border-l-4 border-brand-400 bg-brand-50 dark:bg-brand-900/20'
      default:
        return 'border-l-4 border-neutral-400 bg-neutral-50 dark:bg-neutral-900/20'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setShowPanel(!showPanel)
          if (!showPanel) fetchNotifications()
        }}
        className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        title={`Notifications${connected ? ' (Live)' : ''}`}
      >
        <span className="text-xl">🔔</span>
        {connected && (
          <span className="absolute top-1 right-1 inline-flex h-2 w-2 bg-success-500 rounded-full animate-pulse" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-warning-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-900 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
              {connected && (
                <span className="text-xs px-2 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-full font-medium">
                  Live
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-brand-500 rounded-full border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 dark:text-neutral-500">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                      !notification.read ? 'bg-neutral-50/50 dark:bg-neutral-900/10' : ''
                    } ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 dark:text-white text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="text-neutral-400 hover:text-warning-500 flex-shrink-0 text-lg"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 font-medium mt-2 ml-8"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
