<script setup>
import { useRouter } from 'vue-router'
import { useNotifications } from '../../composables/useNotifications'
import { getCountryName } from '../../helpers/countries'

const router = useRouter()
const { activeToast, dismissToast, markAsRead } = useNotifications()

function handleToastClick() {
  if (!activeToast.value) return
  markAsRead(activeToast.value.id)
  const senderId = activeToast.value.senderUserId
  dismissToast()
  if (senderId && senderId !== 'anonimo') {
    router.push({ name: 'perfil', params: { id: senderId } })
  } else {
    router.push({ name: 'ranking' })
  }
}
</script>

<template>
  <transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="translate-y-[-20px] opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="activeToast"
      class="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-950/95 backdrop-blur-xl border border-amber-500/60 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 font-['Montserrat'] cursor-pointer animate-pulse-glow"
      @click="handleToastClick"
    >
      <div class="flex items-start gap-3">
        <!-- Avatar y Bandera -->
        <div class="relative w-11 h-11 rounded-full shrink-0">
          <img
            v-if="activeToast.senderAvatar"
            :src="activeToast.senderAvatar"
            alt="Avatar"
            referrerpolicy="no-referrer"
            class="w-full h-full rounded-full object-cover border-2 border-amber-400"
          />
          <div
            v-else
            class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-amber-400"
          >
            {{ (activeToast.senderName || 'G').charAt(0).toUpperCase() }}
          </div>
          <span
            v-if="activeToast.senderCountry"
            :class="'flag:' + activeToast.senderCountry.toUpperCase()"
            class="absolute -bottom-1 -right-1 w-4 h-3 rounded-xs shadow-xs"
          ></span>
        </div>

        <!-- Info del Retador -->
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/30 flex items-center gap-1">
              <i class="bi bi-fire text-amber-400"></i> ¡Récord Superado!
            </span>
            <button
              type="button"
              @click.stop="dismissToast"
              class="text-slate-400 hover:text-slate-100 p-1 text-xs cursor-pointer"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <h4 class="text-xs font-black text-slate-100 truncate">
            {{ activeToast.senderName || 'Un Guerrero' }}
          </h4>

          <p class="text-xs text-slate-300 leading-tight">
            {{ activeToast.message }}
          </p>

          <div class="flex items-center gap-2 pt-1 text-[11px] font-bold">
            <span v-if="activeToast.score" class="text-pink-400 font-black">
              {{ activeToast.score }} pts
            </span>
            <span v-if="activeToast.time" class="text-amber-300 font-mono">
              ⏱️ {{ activeToast.time }}
            </span>
            <span class="text-slate-400 text-[10px] ml-auto underline">
              Ver Reto →
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
