import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  addDoc, 
  serverTimestamp,
  type Unsubscribe 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { NotificationItem } from '../types'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([])
  const loading = ref<boolean>(false)
  const isDropdownOpen = ref<boolean>(false)
  const activeToast = ref<NotificationItem | null>(null) // Notificación emergente para mostrar en pantalla en vivo
  let unsubscribe: Unsubscribe | null = null
  let isFirstLoad = true

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const unreadCount = computed(() => {
    return unreadNotifications.value.length
  })

  // Iniciar escucha en tiempo real para el usuario autenticado
  function initNotificationsListener(userId: string | undefined | null) {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    if (!userId || userId === 'anonimo') {
      notifications.value = []
      activeToast.value = null
      return
    }

    loading.value = true
    isFirstLoad = true

    try {
      const notifRef = collection(db, 'notifications')
      // Consultar las últimas 30 notificaciones del usuario
      const q = query(
        notifRef,
        where('targetUserId', '==', userId),
        limit(30)
      )

      unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as NotificationItem[]

        // Ordenar por fecha descendente en cliente para evitar necesidad de índice compuesto
        docs.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0
          const timeB = b.createdAt?.seconds || 0
          return timeB - timeA
        })

        // Detectar si ha llegado una nueva notificación no leída en tiempo real
        if (!isFirstLoad) {
          const newDoc = docs.find(d => !d.read && !notifications.value.some(old => old.id === d.id))
          if (newDoc) {
            showLiveToast(newDoc)
          }
        }

        notifications.value = docs
        loading.value = false
        isFirstLoad = false
      }, (err) => {
        console.warn('Error escuchando notificaciones:', err)
        loading.value = false
      })
    } catch (err) {
      console.warn('Error inicializando notificaciones:', err)
      loading.value = false
    }
  }

  function showLiveToast(notification: NotificationItem) {
    activeToast.value = notification
    // Ocultar automáticamente después de 6 segundos
    setTimeout(() => {
      if (activeToast.value?.id === notification.id) {
        activeToast.value = null
      }
    }, 6000)
  }

  function dismissToast() {
    activeToast.value = null
  }

  function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value
  }

  function closeDropdown() {
    isDropdownOpen.value = false
  }

  // Marcar una notificación como leída
  async function markAsRead(notificationId: string) {
    if (!notificationId) return
    try {
      const notifDocRef = doc(db, 'notifications', notificationId)
      await updateDoc(notifDocRef, { read: true })
      
      const item = notifications.value.find(n => n.id === notificationId)
      if (item) item.read = true
    } catch (err) {
      console.warn('Error al marcar notificación como leída:', err)
    }
  }

  // Marcar todas las notificaciones como leídas
  async function markAllAsRead() {
    const unread = notifications.value.filter(n => !n.read)
    if (unread.length === 0) return

    try {
      const batch = writeBatch(db)
      unread.forEach(n => {
        const notifDocRef = doc(db, 'notifications', n.id)
        batch.update(notifDocRef, { read: true })
      })
      await batch.commit()

      notifications.value.forEach(n => {
        n.read = true
      })
    } catch (err) {
      console.warn('Error al marcar todas las notificaciones como leídas:', err)
    }
  }

  // Eliminar una notificación
  async function deleteNotification(notificationId: string) {
    if (!notificationId) return
    try {
      const notifDocRef = doc(db, 'notifications', notificationId)
      await deleteDoc(notifDocRef)
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    } catch (err) {
      console.warn('Error al eliminar notificación:', err)
    }
  }

  // Emitir una notificación a otro usuario
  async function emitNotification(params: {
    targetUserId: string
    senderUserId?: string
    senderName?: string
    senderAvatar?: string
    senderCountry?: string
    type?: string
    message?: string
    score?: number
    time?: string
    seconds?: number
    difficulty?: number
  }) {
    const { targetUserId, senderUserId, senderName, senderAvatar, senderCountry, type, message, score, time, seconds, difficulty } = params
    if (!targetUserId || targetUserId === 'anonimo' || targetUserId === senderUserId) return
    try {
      await addDoc(collection(db, 'notifications'), {
        targetUserId,
        senderUserId: senderUserId || '',
        senderName: senderName || 'Guerrero Anónimo',
        senderAvatar: senderAvatar || '',
        senderCountry: senderCountry ? String(senderCountry).toUpperCase() : '',
        type: type || 'record_beaten',
        message: message || '¡Un guerrero ha superado tu récord!',
        score: score || 0,
        time: time || '00:00',
        seconds: seconds || 0,
        difficulty: difficulty || 0,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (err) {
      console.warn('Error emitiendo notificación en Firestore:', err)
    }
  }

  function stopListener() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    notifications.value = []
    activeToast.value = null
  }

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
})
