<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { img } from '../../helpers/imagenes'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { 
  isAuthenticated, 
  userDisplayName, 
  userAvatar, 
  openAuthModal, 
  logout 
} = useAuth()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isUserDropdownOpen = ref(false)
const avatarError = ref(false)

watch(userAvatar, () => {
  avatarError.value = false
})

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function handleNav(path) {
  isMobileMenuOpen.value = false
  router.push(path)
}

function handleLoginClick() {
  isMobileMenuOpen.value = false
  openAuthModal('login')
}

function handleRegisterClick() {
  isMobileMenuOpen.value = false
  openAuthModal('register')
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-['Montserrat']"
    :class="isScrolled 
      ? 'bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 shadow-2xl py-3' 
      : 'bg-linear-to-b from-slate-950/80 via-slate-950/40 to-transparent py-5'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        
        <!-- Bloque 1 (Izquierda): Logo -->
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center gap-3 group">
            <img 
              :src="img.isologo" 
              alt="Kehubo Logo" 
              class="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
          </RouterLink>
        </div>

        <!-- Bloque 2 (Centro): Navegación Principal -->
        <nav class="hidden md:flex items-center gap-1 lg:gap-2">
          <RouterLink 
            to="/" 
            class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-amber-300 hover:bg-slate-800/50 transition-all duration-200"
            active-class="text-amber-400 bg-amber-500/10 border border-amber-500/30"
          >
            Inicio
          </RouterLink>
          <RouterLink 
            to="/ranking" 
            class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-amber-300 hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-1.5"
            active-class="text-amber-400 bg-amber-500/10 border border-amber-500/30"
          >
            <span>Ranking</span>
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          </RouterLink>
          <RouterLink 
            to="/about" 
            class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-amber-300 hover:bg-slate-800/50 transition-all duration-200"
            active-class="text-amber-400 bg-amber-500/10 border border-amber-500/30"
          >
            About
          </RouterLink>
        </nav>

        <!-- Bloque 3 (Derecha): CTA Juego Rápido + Login / Perfil -->
        <div class="hidden md:flex items-center gap-3">
          <!-- Botón Juego Rápido -->
          <RouterLink 
            :to="{ name : 'game-rapido'}" 
            class="game-btn-pink px-5 py-2 rounded-xl text-white text-xs sm:text-sm font-black flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Juego Rápido</span>
          </RouterLink>

          <!-- Estado No Autenticado: Botón Iniciar Sesión -->
          <template v-if="!isAuthenticated">
            <button
              @click="openAuthModal('login')"
              class="game-btn-gold px-5 py-2 rounded-xl text-slate-950 text-xs sm:text-sm font-black flex items-center gap-1.5"
            >
              <svg class="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Iniciar Sesión</span>
            </button>
          </template>

          <!-- Estado Autenticado: Dropdown del Usuario -->
          <template v-else>
            <div class="relative">
              <button
                @click="isUserDropdownOpen = !isUserDropdownOpen"
                class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 transition"
              >
                <img 
                  v-if="userAvatar && !avatarError" 
                  :src="userAvatar" 
                  alt="Avatar" 
                  referrerpolicy="no-referrer"
                  @error="avatarError = true"
                  class="w-8 h-8 rounded-full object-cover border border-amber-400/60 shadow-sm shrink-0"
                />
                <div 
                  v-else 
                  class="w-8 h-8 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm shrink-0"
                >
                  {{ (userDisplayName || 'G').charAt(0).toUpperCase() }}
                </div>
                <span class="text-xs font-bold text-amber-200 max-w-25 truncate">
                  {{ userDisplayName }}
                </span>
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    {{ (userDisplayName || 'G').charAt(0).toUpperCase() }}
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Guerrero</p>
                    <p class="text-xs font-black text-slate-100 truncate">{{ userDisplayName }}</p>
                  </div>
                </div>
                <RouterLink 
                  to="/perfil" 
                  @click="isUserDropdownOpen = false"
                  class="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition flex items-center gap-2"
                >
                  <i class="bi bi-person-gear text-amber-400"></i>
                  <span>Mi Perfil</span>
                </RouterLink>
                <RouterLink 
                  to="/ranking" 
                  @click="isUserDropdownOpen = false"
                  class="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition flex items-center gap-2"
                >
                  <i class="bi bi-trophy-fill text-amber-400"></i>
                  <span>Ranking</span>
                </RouterLink>
                <button
                  @click="() => { logout(); isUserDropdownOpen = false; }"
                  class="w-full text-left px-4 py-2 text-xs font-semibold text-red-400 hover:bg-slate-800 transition flex items-center gap-2"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Botón Móvil (Hamburguesa) -->
        <div class="md:hidden flex items-center gap-2">
          <RouterLink 
            :to="{ name: 'game-rapido' }" 
            class="game-btn-pink px-3 py-1.5 rounded-lg text-white text-xs font-black"
          >
            Jugar
          </RouterLink>
          <button
            @click="toggleMobileMenu"
            class="p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition"
            aria-label="Abrir menú"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Menú Móvil Desplegable -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden bg-slate-950/98 border-b border-amber-500/30 px-4 pt-3 pb-6 space-y-3 animate-fadeIn"
    >
      <RouterLink 
        to="/" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-lg text-base font-bold uppercase text-slate-200 hover:text-amber-400 hover:bg-slate-900"
      >
        Inicio
      </RouterLink>
      <RouterLink 
        to="/ranking" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-lg text-base font-bold uppercase text-slate-200 hover:text-amber-400 hover:bg-slate-900"
      >
        Ranking
      </RouterLink>
      <RouterLink 
        to="/about" 
        @click="isMobileMenuOpen = false"
        class="block px-3 py-2 rounded-lg text-base font-bold uppercase text-slate-200 hover:text-amber-400 hover:bg-slate-900"
      >
        About
      </RouterLink>

      <div class="pt-3 border-t border-slate-800 space-y-2">
        <template v-if="!isAuthenticated">
          <button
            @click="handleLoginClick"
            class="w-full game-btn-gold py-2.5 rounded-xl text-slate-950 font-black text-sm uppercase"
          >
            Iniciar Sesión
          </button>
          <button
            @click="handleRegisterClick"
            class="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-sm uppercase hover:bg-slate-700"
          >
            Registrarse
          </button>
        </template>
        <template v-else>
          <RouterLink
            to="/perfil"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 mb-2 transition"
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
              {{ (userDisplayName || 'G').charAt(0).toUpperCase() }}
            </div>
            <div class="overflow-hidden">
              <span class="text-sm font-bold text-amber-300 block truncate">{{ userDisplayName }}</span>
              <span class="text-[10px] text-slate-400 uppercase font-semibold">Ver Perfil y Ajustes →</span>
            </div>
          </RouterLink>
          <button
            @click="() => { logout(); isMobileMenuOpen = false; }"
            class="w-full py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 font-bold text-sm"
          >
            Cerrar Sesión
          </button>
        </template>
      </div>
    </div>
  </header>
</template>
