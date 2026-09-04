<script setup lang="ts">
import { formatRelativeTime } from '../../helpers/dateUtils'
import type { NotificationItem } from '../../types'

const props = defineProps<{
  notification: NotificationItem
  processingId?: string | null
}>()

const emit = defineEmits<{
  (e: 'click', item: NotificationItem): void
  (e: 'accept', item: NotificationItem): void
  (e: 'reject', item: NotificationItem): void
  (e: 'delete', id: string): void
}>()
</script>

<template>
  <div
    class="p-3.5 border-b border-slate-800/80 hover:bg-slate-800/40 transition flex items-start gap-3 cursor-pointer group"
    :class="{ 'bg-amber-500/5': !notification.read }"
    @click="emit('click', notification)"
  >
    <!-- Avatar / Icono -->
    <div class="relative shrink-0">
      <img
        v-if="notification.senderAvatar"
        :src="notification.senderAvatar"
        :alt="notification.senderName || 'Usuario'"
        class="w-10 h-10 rounded-full object-cover border border-amber-400/40"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm"
      >
        {{ (notification.senderName || 'G').charAt(0).toUpperCase() }}
      </div>

      <!-- Icono de tipo de notificación -->
      <span
        class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm text-white"
        :class="{
          'bg-amber-500': notification.type === 'friend_request',
          'bg-emerald-500': notification.type === 'friend_accepted',
          'bg-pink-500': notification.type === 'score_beaten' || notification.type === 'record_beaten',
          'bg-purple-500': notification.type === 'room_invite'
        }"
      >
        <i v-if="notification.type === 'friend_request'" class="bi bi-person-plus-fill"></i>
        <i v-else-if="notification.type === 'friend_accepted'" class="bi bi-check-circle-fill"></i>
        <i v-else-if="notification.type === 'score_beaten' || notification.type === 'record_beaten'" class="bi bi-trophy-fill"></i>
        <i v-else-if="notification.type === 'room_invite'" class="bi bi-controller"></i>
        <i v-else class="bi bi-bell-fill"></i>
      </span>
    </div>

    <!-- Contenido -->
    <div class="flex-1 min-w-0 space-y-1">
      <div class="flex items-center justify-between gap-1">
        <h4 class="text-xs font-black text-slate-200 truncate">
          {{ notification.title || (notification.type === 'record_beaten' || notification.type === 'score_beaten' ? '¡Récord Superado!' : (notification.type === 'friend_request' ? 'Solicitud de Amistad' : 'Aviso del Reino')) }}
        </h4>
        <span class="text-[10px] text-slate-500 shrink-0 font-medium">
          {{ formatRelativeTime(notification.timestamp) }}
        </span>
      </div>

      <p class="text-xs text-slate-400 leading-snug wrap-break-word">
        {{ notification.message }}
      </p>

      <!-- Acciones de Solicitud de Amistad -->
      <div
        v-if="notification.type === 'friend_request' && (!notification.status || notification.status === 'pending')"
        class="flex gap-2 pt-2"
        @click.stop
      >
        <BaseButton
          variant="gold"
          size="xs"
          rounded="lg"
          :disabled="processingId === notification.id"
          :loading="processingId === notification.id"
          @click="emit('accept', notification)"
        >
          Aceptar
        </BaseButton>
        <BaseButton
          variant="slate"
          size="xs"
          rounded="lg"
          :disabled="processingId === notification.id"
          @click="emit('reject', notification)"
        >
          Rechazar
        </BaseButton>
      </div>

      <!-- Estado ya respondido -->
      <div v-else-if="notification.status === 'accepted'" class="text-[10px] text-emerald-400 font-bold flex items-center gap-1 pt-1">
        <i class="bi bi-check-circle"></i>
        <span>Solicitud aceptada</span>
      </div>
      <div v-else-if="notification.status === 'rejected'" class="text-[10px] text-slate-500 font-bold flex items-center gap-1 pt-1">
        <i class="bi bi-x-circle"></i>
        <span>Solicitud rechazada</span>
      </div>
    </div>

    <!-- Botón Eliminar individual -->
    <button
      type="button"
      @click.stop="emit('delete', notification.id)"
      class="opacity-60 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition cursor-pointer shrink-0"
      title="Eliminar notificación"
      aria-label="Eliminar notificación"
    >
      <i class="bi bi-trash3 text-xs"></i>
    </button>
  </div>
</template>
