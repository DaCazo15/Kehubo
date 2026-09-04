<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { NAV_LINKS } from './navData'
import { useAuth } from '../../../composables/useAuth'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { 
  user, 
  isAuthenticated, 
  userDisplayName, 
  userAvatar, 
  openAuthModal, 
  logout 
} = useAuth()

const avatarError = ref<boolean>(false)
const userInitial = computed(() => (userDisplayName.value || 'G').charAt(0).toUpperCase())

watch(userAvatar, () => {
  avatarError.value = false
})

function handleAuthClick(mode: 'login' | 'register') {
  emit('close')
  openAuthModal(mode)
}

function handleLogout() {
  emit('close')
  logout()
}
</script>

<template>
  <div
    v-if="isOpen"
    class="md:hidden bg-slate-950/98 border-b border-amber-500/30 px-4 pt-3 pb-6 space-y-2 animate-fadeIn"
  >
    <!-- Enlaces de navegación móvil -->
    <BaseButton
      v-for="item in NAV_LINKS"
      :key="item.label"
      :to="item.to"
      variant="ghost"
      size="md"
      block
      rounded="lg"
      class="justify-start! text-base font-bold uppercase text-slate-200 hover:text-amber-400 hover:bg-slate-900"
      @click="emit('close')"
    >
      <template #icon-left v-if="item.icon">
        <i :class="item.icon" class="text-amber-400"></i>
      </template>
      <span>{{ item.mobileLabel || item.label }}</span>
      <span v-if="item.ping" class="w-2 h-2 rounded-full bg-amber-400 ml-auto animate-ping"></span>
    </BaseButton>

    <div class="pt-3 border-t border-slate-800 space-y-2">
      <!-- Usuario No Autenticado -->
      <template v-if="!isAuthenticated">
        <BaseButton
          @click="handleAuthClick('login')"
          variant="gold"
          size="md"
          block
          rounded="xl"
        >
          Iniciar Sesión
        </BaseButton>
        <BaseButton
          @click="handleAuthClick('register')"
          variant="slate"
          size="md"
          block
          rounded="xl"
        >
          Registrarse
        </BaseButton>
      </template>

      <!-- Usuario Autenticado -->
      <template v-else>
        <BaseButton
          :to="{ name: 'perfil', params: { id: user?.uid } }"
          variant="none"
          size="none"
          rounded="xl"
          block
          class="justify-start! flex items-center gap-3 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 mb-2 transition"
          @click="emit('close')"
        >
          <img 
            v-if="userAvatar && !avatarError" 
            :src="userAvatar" 
            alt="Avatar" 
            referrerpolicy="no-referrer"
            class="w-8 h-8 rounded-full object-cover border border-amber-400/50 shrink-0"
          />
          <div 
            v-else 
            class="w-8 h-8 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0"
          >
            {{ userInitial }}
          </div>
          <div class="overflow-hidden text-left">
            <span class="text-sm font-bold text-amber-300 block truncate">{{ userDisplayName }}</span>
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Ver Perfil y Ajustes →</span>
          </div>
        </BaseButton>

        <BaseButton
          @click="handleLogout"
          variant="danger"
          size="sm"
          block
          rounded="xl"
        >
          Cerrar Sesión
        </BaseButton>
      </template>
    </div>
  </div>
</template>
