import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../stores/notifications'

export function useNotifications() {
  const notifStore = useNotificationStore()

  const {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    isDropdownOpen,
    activeToast
  } = storeToRefs(notifStore)

  const {
    initNotificationsListener,
    showLiveToast,
    dismissToast,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    emitNotification,
    stopListener
  } = notifStore

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    isDropdownOpen,
    activeToast,
    initNotificationsListener,
    showLiveToast,
    dismissToast,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    emitNotification,
    stopListener
  }
}
