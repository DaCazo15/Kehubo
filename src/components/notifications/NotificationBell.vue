<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '../../composables/useNotifications'
import { useFriends } from '../../composables/useFriends'
import NotificationItemCard from './NotificationItemCard.vue'
import type { NotificationItem } from '../../types'

const router = useRouter()
const {
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = useNotifications()

const { acceptFriendRequest, rejectFriendRequest } = useFriends()

const isOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)
const processingNotifId = ref<string | null>(null)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function handleAcceptFriend(notif: NotificationItem) {
  processingNotifId.value = notif.id
  await acceptFriendRequest(notif)
  notif.status = 'accepted'
  notif.read = true
  processingNotifId.value = null
}

async function handleRejectFriend(notif: NotificationItem) {
  processingNotifId.value = notif.id
  await rejectFriendRequest(notif)
  notif.status = 'rejected'
  notif.read = true
  processingNotifId.value = null
}

function handleNotificationClick(notif: NotificationItem) {
  markAsRead(notif.id)
  closeDropdown()
  if (notif.type === 'room_invite' && ((notif as any).roomId || (notif as any).code)) {
    router.push({ name: 'multiplayer-room', params: { roomId: (notif as any).roomId || (notif as any).code } })
  } else if (notif.senderUserId && notif.senderUserId !== 'anonimo') {
    router.push({ name: 'perfil', params: { id: notif.senderUserId } })
  } else {
    router.push({ name: 'ranking' })
  }
}
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Botón Campana -->
    <button
      type="button"
      @click.stop="toggleDropdown"
      class="relative py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition shadow-md group cursor-pointer"
      :class="{ 'border-amber-400 text-amber-300 ring-2 ring-amber-400/30': isOpen }"
      title="Notificaciones"
    >
      <i class="bi bi-bell-fill text-sm"></i>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1.5 -right-1.5 bg-pink-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950 animate-pulse"
      >
        {{ unreadCount > 9 ? '+9' : unreadCount }}
      </span>
    </button>

    <!-- Fondo Oscuro en Móvil para cerrar al tocar fuera -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 sm:hidden animate-fadeIn"
      @click="closeDropdown"
    ></div>

    <!-- Menú Desplegable de Notificaciones Proporcional -->
    <div
      v-if="isOpen"
      class="fixed left-3 right-3 top-18 sm:top-full sm:mt-2 sm:right-0 sm:left-auto sm:w-96 sm:absolute bg-slate-900/95 sm:bg-slate-900 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn max-h-[calc(100dvh-5.5rem)] sm:max-h-120 flex flex-col"
    >
      <!-- Cabecera del Panel -->
      <div class="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
        <div class="flex items-center gap-2">
          <i class="bi bi-bell-fill text-amber-400 text-sm"></i>
          <span class="text-xs font-black uppercase tracking-wider text-slate-100">
            Avisos del Reino
          </span>
          <span v-if="unreadCount > 0" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            {{ unreadCount }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            type="button"
            @click="markAllAsRead"
            class="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider transition cursor-pointer hover:underline"
          >
            Leídas todas
          </button>
          <button
            type="button"
            @click="closeDropdown"
            class="sm:hidden text-slate-400 hover:text-slate-200 p-1 text-xs cursor-pointer ml-1"
            aria-label="Cerrar avisos"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Lista de Notificaciones -->
      <div class="overflow-y-auto flex-1 divide-y divide-slate-800/40 min-h-0">
        <!-- Cargando -->
        <div v-if="loading && notifications.length === 0" class="p-8 text-center space-y-2">
          <div class="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-slate-400">Cargando avisos...</p>
        </div>

        <!-- Sin Notificaciones -->
        <div v-else-if="notifications.length === 0" class="p-8 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-950 mx-auto flex items-center justify-center text-slate-600 text-xl border border-slate-800">
            <i class="bi bi-bell-slash"></i>
          </div>
          <p class="text-xs font-bold text-slate-300">Bandeja despejada</p>
          <p class="text-[11px] text-slate-500">No tienes notificaciones pendientes.</p>
        </div>

        <!-- Items de Notificación -->
        <template v-else>
          <NotificationItemCard
            v-for="notif in notifications"
            :key="notif.id"
            :notification="notif"
            :processing-id="processingNotifId"
            @click="handleNotificationClick"
            @accept="handleAcceptFriend"
            @reject="handleRejectFriend"
            @delete="deleteNotification"
          />
        </template>
      </div>
    </div>
  </div>
</template>
