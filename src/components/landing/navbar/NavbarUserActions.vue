<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import NotificationBell from '../../notifications/NotificationBell.vue'

const { 
  user, 
  isAuthenticated, 
  userDisplayName, 
  userAvatar, 
  openAuthModal, 
  logout 
} = useAuth()

const isUserDropdownOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)
const avatarError = ref<boolean>(false)

const userInitial = computed(() => (userDisplayName.value || 'G').charAt(0).toUpperCase())

const userMenuItems = computed(() => [
  { 
    label: 'Mi Perfil', 
    to: { name: 'perfil', params: { id: user.value?.uid } }, 
    icon: 'bi bi-person-gear' 
  },
  { 
    label: 'Ranking', 
    to: { name: 'ranking' }, 
    icon: 'bi bi-trophy-fill' 
  }
])

watch(userAvatar, () => {
  avatarError.value = false
})

function handleLogout() {
  isUserDropdownOpen.value = false
  logout()
}

function handleClickOutside(event: MouseEvent) {
  if (isUserDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isUserDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
    <!-- Botón Juego Rápido -->
    <BaseButton 
      :to="{ name: 'game-rapido' }" 
      variant="pink"
      size="sm"
      rounded="xl"
    >
      <template #icon-left>
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </template>
      <span>Juego Rápido</span>
    </BaseButton>

    <!-- Estado No Autenticado: Botón Iniciar Sesión -->
    <template v-if="!isAuthenticated">
      <BaseButton
        @click="openAuthModal('login')"
        variant="gold"
        size="sm"
        rounded="xl"
      >
        <template #icon-left>
          <svg class="w-3.5 h-3.5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </template>
        <span>Iniciar Sesión</span>
      </BaseButton>
    </template>

    <!-- Estado Autenticado: Dropdown del Usuario -->
    <template v-else>
      <NotificationBell />

      <div class="relative" ref="dropdownRef">
        <button
          type="button"
          @click="isUserDropdownOpen = !isUserDropdownOpen"
          class="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 transition cursor-pointer shadow-sm"
        >
          <img 
            v-if="userAvatar && !avatarError" 
            :src="userAvatar" 
            alt="Avatar" 
            referrerpolicy="no-referrer"
            @error="avatarError = true"
            class="w-7 h-7 rounded-full object-cover border border-amber-400/60 shadow-sm shrink-0"
          />
          <div 
            v-else 
            class="w-7 h-7 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm shrink-0"
          >
            {{ userInitial }}
          </div>
          <span class="text-xs font-bold text-amber-200 max-w-24 truncate">
            {{ userDisplayName }}
          </span>
          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Menú Desplegable -->
        <div
          v-if="isUserDropdownOpen"
          class="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn"
        >
          <div class="px-4 py-2.5 border-b border-slate-800 flex items-center gap-3">
            <img 
              v-if="userAvatar && !avatarError" 
              :src="userAvatar" 
              alt="Avatar" 
              referrerpolicy="no-referrer"
              class="w-9 h-9 rounded-full object-cover border border-amber-400/50"
            />
            <div 
              v-else 
              class="w-9 h-9 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black flex items-center justify-center text-xs"
            >
              {{ userInitial }}
            </div>
            <div class="overflow-hidden">
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Guerrero</p>
              <p class="text-xs font-black text-slate-100 truncate">{{ userDisplayName }}</p>
            </div>
          </div>

          <div class="py-1">
            <BaseButton
              v-for="item in userMenuItems"
              :key="item.label"
              :to="item.to"
              variant="ghost"
              size="sm"
              block
              rounded="none"
              class="justify-start! px-4 py-2 text-xs font-semibold text-slate-300 hover:text-amber-400"
              @click="isUserDropdownOpen = false"
            >
              <template #icon-left>
                <i :class="item.icon" class="text-amber-400"></i>
              </template>
              <span>{{ item.label }}</span>
            </BaseButton>
          </div>

          <div class="pt-1 border-t border-slate-800">
            <BaseButton
              @click="handleLogout"
              variant="ghost"
              size="sm"
              block
              rounded="none"
              class="justify-start! px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40"
            >
              <template #icon-left>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </template>
              <span>Cerrar Sesión</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
