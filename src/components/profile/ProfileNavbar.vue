<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { img } from '../../helpers/imagenes'
import { useAuth } from '../../composables/useAuth'
import NotificationBell from '../notifications/NotificationBell.vue'

const route = useRoute()
const router = useRouter()
const { 
  user,
  userDisplayName, 
  userAvatar, 
  isAuthenticated,
  openAuthModal,
  logout 
} = useAuth()

const isMobileMenuOpen = ref<boolean>(false)
const avatarError = ref<boolean>(false)

const userInitial = computed(() => (userDisplayName.value || 'G').charAt(0).toUpperCase())
const isProfileActive = computed(() => route.path.startsWith('/perfil'))
const isRankingActive = computed(() => route.path === '/ranking')

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/30 shadow-2xl py-2.5 sm:py-3 font-['Montserrat']">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-2 sm:gap-4">
        
        <!-- Bloque Izquierdo: Volver al Inicio & Logo -->
        <div class="flex items-center gap-3 shrink-0">
          <RouterLink to="/" class="flex items-center gap-2 group" title="Volver al Inicio">
            <img 
              :src="img.isologo" 
              alt="Kehubo Logo" 
              class="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
            />
            <span class="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-300 transition">
              ← Inicio
            </span>
          </RouterLink>
        </div>

        <!-- Bloque Central: Navegación del Usuario -->
        <nav class="hidden md:flex items-center gap-1 lg:gap-2">
          <RouterLink 
            :to="'/perfil/' + (user?.uid || '')" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            :class="isProfileActive 
              ? 'text-amber-300 bg-amber-500/20 border border-amber-500/50 shadow-sm shadow-amber-500/10' 
              : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'"
          >
            <i class="bi bi-person-gear mr-1.5"></i>
            <span>Mi Perfil</span>
          </RouterLink>
          <RouterLink 
            to="/ranking" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            :class="isRankingActive 
              ? 'text-amber-300 bg-amber-500/20 border border-amber-500/50 shadow-sm shadow-amber-500/10' 
              : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'"
          >
            <i class="bi bi-trophy-fill mr-1.5 text-amber-400"></i>
            <span>Ranking</span>
          </RouterLink>
          <RouterLink 
            to="/competitivo" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-amber-300 hover:bg-slate-800/60 transition"
            active-class="text-amber-300 bg-amber-500/20 border border-amber-500/50"
          >
            <i class="bi bi-people-fill mr-1.5 text-amber-400"></i>
            <span>Salas</span>
          </RouterLink>
        </nav>

        <!-- Bloque Derecho: Info del Usuario y Cerrar Sesión / Login -->
        <div class="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          
          <template v-if="isAuthenticated">
            <!-- Campana de Notificaciones -->
            <NotificationBell />

            <!-- Botón / Pill hacia Mi Perfil -->
            <RouterLink 
              :to="'/perfil/' + (user?.uid || '')" 
              title="Ir a Mi Perfil"
              class="h-9.5 flex items-center gap-2 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/80 transition group shadow-sm box-border"
              :class="{ 'ring-1 ring-amber-400 border-amber-400': isProfileActive }"
            >
              <img 
                v-if="userAvatar && !avatarError" 
                :src="userAvatar" 
                alt="Avatar" 
                referrerpolicy="no-referrer"
                @error="avatarError = true"
                class="w-6 h-6 rounded-full object-cover border border-amber-400/60 group-hover:scale-105 transition shrink-0"
              />
              <div 
                v-else 
                class="w-6 h-6 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0"
              >
                {{ userInitial }}
              </div>
              <span class="text-xs font-bold text-amber-200 group-hover:text-amber-100 max-w-24 truncate transition">
                {{ userDisplayName }}
              </span>
            </RouterLink>

            <!-- Botón Cerrar Sesión -->
            <button
              @click="handleLogout"
              class="h-9.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-500/40 hover:border-red-500 text-red-200 hover:text-red-100 text-xs font-bold uppercase tracking-wider flex items-center justify-center transition shadow-sm cursor-pointer box-border"
              title="Cerrar Sesión"
            >
              <i class="bi bi-box-arrow-right text-red-400"></i>
            </button>
          </template>

          <template v-else>
            <BaseButton
              @click="openAuthModal('login')"
              variant="gold"
              size="sm"
              rounded="xl"
            >
              <template #icon-left>
                <i class="bi bi-box-arrow-in-right"></i>
              </template>
              <span>Iniciar Sesión</span>
            </BaseButton>
          </template>

        </div>

        <!-- Botón Móvil -->
        <div class="md:hidden flex items-center gap-2">
          <NotificationBell v-if="isAuthenticated" />
          <RouterLink 
            :to="{ name: 'game' }" 
            class="game-btn-pink px-3 py-1.5 rounded-lg text-white text-xs font-black"
          >
            Jugar
          </RouterLink>
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition cursor-pointer"
          >
            <i v-if="!isMobileMenuOpen" class="bi bi-list text-2xl"></i>
            <i v-else class="bi bi-x-lg text-2xl"></i>
          </button>
        </div>

      </div>
    </div>

    <!-- Menú Móvil -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden bg-slate-950 border-b border-amber-500/30 px-4 pt-3 pb-6 space-y-3 animate-fadeIn"
    >
      <RouterLink 
        to="/" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-lg text-sm font-bold uppercase text-slate-300 hover:text-amber-400 hover:bg-slate-900"
      >
        ← Volver al Inicio
      </RouterLink>
      <RouterLink 
        :to="'/perfil/' + (user?.uid || '')" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-lg text-sm font-bold uppercase"
        :class="isProfileActive ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-900'"
      >
        <i class="bi bi-person-gear mr-2"></i>
        <span>Mi Perfil</span>
      </RouterLink>
      <RouterLink 
        to="/ranking" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-lg text-sm font-bold uppercase"
        :class="isRankingActive ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-900'"
      >
        <i class="bi bi-trophy-fill mr-2 text-amber-400"></i>
        <span>Ranking Global</span>
      </RouterLink>
      <RouterLink 
        to="/competitivo" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-lg text-sm font-bold uppercase text-slate-300 hover:text-amber-400 hover:bg-slate-900"
      >
        <i class="bi bi-people-fill mr-2 text-amber-400"></i>
        <span>Salas Competitivas</span>
      </RouterLink>
      
      <div v-if="isAuthenticated" class="pt-3 border-t border-slate-800">
        <button
          @click="handleLogout"
          class="w-full py-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 font-bold text-xs uppercase flex items-center justify-center gap-2"
        >
          <i class="bi bi-box-arrow-right text-red-400"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
      <div v-else class="pt-3 border-t border-slate-800">
        <button
          @click="openAuthModal('login')"
          class="w-full game-btn-gold py-2.5 rounded-xl text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2"
        >
          <i class="bi bi-box-arrow-in-right"></i>
          <span>Iniciar Sesión</span>
        </button>
      </div>
    </div>
  </header>
</template>
