<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '../../composables/useNotifications'
import { useFriends } from '../../composables/useFriends'
import { getCountryName } from '../../helpers/countries'

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

const isOpen = ref(false)
const dropdownRef = ref(null)
const processingNotifId = ref(null)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleClickOutside(event) {
  if (!isOpen.value) return
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function formatRelativeTime(timestamp) {
  if (!timestamp?.seconds) return 'Reciente'
  const date = new Date(timestamp.seconds * 1000)
  const now = new Date()
  const diffSeconds = Math.floor((now - date) / 1000)

  if (diffSeconds < 60) return 'Hace un momento'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 30) return `Hace ${diffDays}d`
  return date.toLocaleDateString()
}

async function handleAcceptFriend(notif) {
  processingNotifId.value = notif.id
  await acceptFriendRequest(notif)
  notif.status = 'accepted'
  notif.read = true
  processingNotifId.value = null
}

async function handleRejectFriend(notif) {
  processingNotifId.value = notif.id
  await rejectFriendRequest(notif)
  notif.status = 'rejected'
  notif.read = true
  processingNotifId.value = null
}

function handleNotificationClick(notif) {
  markAsRead(notif.id)
  closeDropdown()
  if (notif.senderUserId && notif.senderUserId !== 'anonimo') {
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
      class="relative p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition shadow-md group cursor-pointer"
      :class="{ 'border-amber-400 text-amber-300 ring-2 ring-amber-400/30': isOpen }"
      title="Notificaciones"
      aria-label="Notificaciones"
    >
      <i class="bi bi-bell-fill text-lg group-hover:scale-110 transition-transform inline-block"></i>

      <!-- Badge de no leídas -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1.5 -right-1.5 min-w-5 not-odd:h-5 px-1 bg-linear-to-r from-pink-500 to-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 border border-slate-950 animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown / Panel de Notificaciones -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-950/98 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/80 z-50 overflow-hidden font-['Montserrat'] animate-fadeIn"
      >
        <!-- Encabezado del Dropdown -->
        <div class="px-4 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="bi bi-lightning-charge-fill text-amber-400"></i>
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-100">
              Notificaciones
            </h3>
            <span
              v-if="unreadCount > 0"
              class="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40"
            >
              {{ unreadCount }} nuevas
            </span>
          </div>

          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:underline transition cursor-pointer"
          >
            Leídas
          </button>
        </div>

        <!-- Lista de Notificaciones -->
        <div class="max-h-95 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
          <!-- Sin notificaciones -->
          <div v-if="notifications.length === 0" class="py-10 px-4 text-center space-y-3">
            <div class="w-12 h-12 rounded-full mx-auto bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xl">
              <i class="bi bi-bell-slash"></i>
            </div>
            <p class="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Sin notificaciones
            </p>
            <p class="text-[11px] text-slate-500">
              Te avisaremos aquí cuando alguien supere tu tiempo o récord.
            </p>
          </div>

          <!-- Items de notificación -->
          <div
            v-for="notif in notifications"
            :key="notif.id"
            class="p-3.5 sm:p-4 hover:bg-slate-900/60 transition-colors flex items-start gap-3 group relative cursor-pointer"
            :class="{ 'bg-amber-500/5': !notif.read }"
            @click="handleNotificationClick(notif)"
          >
            <!-- Indicador no leído -->
            <span
              v-if="!notif.read"
              class="w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500 shrink-0 mt-2"
            ></span>

            <!-- Avatar del retador -->
            <div class="relative w-9 h-9 rounded-full shrink-0">
              <img
                v-if="notif.senderAvatar"
                :src="notif.senderAvatar"
                alt="Avatar"
                referrerpolicy="no-referrer"
                class="w-full h-full rounded-full object-cover border border-amber-400/50"
              />
              <div
                v-else
                class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-xs flex items-center justify-center"
              >
                {{ (notif.senderName || 'G').charAt(0).toUpperCase() }}
              </div>
              <!-- Mini bandera -->
              <span
                v-if="notif.senderCountry"
                :class="'flag:' + notif.senderCountry.toUpperCase()"
                class="absolute -bottom-1 -right-1 w-3.5 h-2.5 rounded-xs shadow-xs"
              ></span>
            </div>

            <!-- Contenido del mensaje -->
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-xs font-black text-amber-300 truncate">
                  {{ notif.senderName || 'Guerrero' }}
                </span>
                <span class="text-[10px] text-slate-500 shrink-0">
                  {{ formatRelativeTime(notif.createdAt) }}
                </span>
              </div>

              <p class="text-xs text-slate-200 leading-snug">
                {{ notif.message }}
              </p>

              <!-- Tags para partidas superadas -->
              <div v-if="notif.type === 'record_beaten' || notif.score" class="flex items-center gap-2 pt-1 text-[10px]">
                <span v-if="notif.score" class="font-black text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                  {{ notif.score }} pts
                </span>
                <span v-if="notif.time" class="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  ⏱️ {{ notif.time }}
                </span>
                <span v-if="notif.difficulty" class="text-slate-400 font-medium">
                  {{ notif.difficulty }} cartas
                </span>
              </div>

              <!-- Acciones para Solicitudes de Amistad -->
              <div v-if="notif.type === 'friend_request'" class="pt-2">
                <!-- Pendiente: Botones Aceptar y Rechazar -->
                <div v-if="!notif.status || notif.status === 'pending'" class="flex items-center gap-2">
                  <button
                    type="button"
                    @click.stop="handleAcceptFriend(notif)"
                    :disabled="processingNotifId === notif.id"
                    class="game-btn-gold py-1 px-3 rounded-lg text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <i class="bi bi-check-lg text-xs"></i>
                    <span>Aceptar</span>
                  </button>
                  <button
                    type="button"
                    @click.stop="handleRejectFriend(notif)"
                    :disabled="processingNotifId === notif.id"
                    class="py-1 px-3 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                  >
                    <i class="bi bi-x-lg text-[9px]"></i>
                    <span>Rechazar</span>
                  </button>
                </div>

                <!-- Estado: Ya aceptada -->
                <div v-else-if="notif.status === 'accepted'" class="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                  <i class="bi bi-check-circle-fill"></i>
                  <span>Amistad aceptada</span>
                </div>

                <!-- Estado: Ya rechazada -->
                <div v-else-if="notif.status === 'rejected'" class="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                  <i class="bi bi-x-circle-fill text-slate-500"></i>
                  <span>Solicitud rechazada</span>
                </div>
              </div>

              <!-- Confirmación de Amistad Aceptada -->
              <div v-if="notif.type === 'friend_accepted'" class="pt-1 flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
                <i class="bi bi-person-check-fill"></i>
                <span>¡Ahora son aliados de batalla!</span>
              </div>
            </div>

            <!-- Botón Eliminar Notificación -->
            <button
              type="button"
              @click.stop="deleteNotification(notif.id)"
              class="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
              title="Eliminar notificación"
            >
              <i class="bi bi-x-lg text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Pie del Dropdown -->
        <div class="p-3 bg-slate-900/90 border-t border-slate-800 text-center">
          <RouterLink
            :to="{ name: 'ranking' }"
            @click="closeDropdown"
            class="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5"
          >
            <i class="bi bi-trophy-fill text-[11px]"></i>
            <span>Ver Tabla de Clasificación Completa</span>
          </RouterLink>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(245, 158, 11, 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.6);
}
</style>
