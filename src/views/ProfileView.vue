<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import ProfileSettings from '../components/profile/ProfileSettings.vue'

const {
  user,
  userProfile,
  isAuthenticated,
  userDisplayName,
  userAvatar,
  openAuthModal
} = useAuth()

const avatarError = ref => false

// Estadísticas del perfil
const bestTime = computed(() => {
  return userProfile.value?.bestTime || '--:--'
})

const friendsCount = computed(() => {
  return userProfile.value?.friendsCount || 0
})

const accountAge = computed(() => {
  const creationTime = user.value?.metadata?.creationTime || userProfile.value?.createdAt
  if (!creationTime) return 'Hoy'
  
  const createdDate = new Date(creationTime)
  const now = new Date()
  const diffTime = Math.abs(now - createdDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return '1 día'
  if (diffDays < 30) return `${diffDays} días`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 mes'
  if (diffMonths < 12) return `${diffMonths} meses`
  const diffYears = Math.floor(diffDays / 365)
  return diffYears === 1 ? '1 año' : `${diffYears} años`
})
</script>

<template>
  <div class="min-h-screen pt-28 pb-20 bg-slate-950 text-slate-100 font-['Montserrat'] px-4 sm:px-6 lg:px-8">
    
    <!-- Estado: No autenticado -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto text-center py-20 space-y-6">
      <div class="w-20 h-20 rounded-full mx-auto bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10 animate-pulse-glow text-amber-400">
        <i class="bi bi-shield-lock-fill"></i>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black uppercase text-slate-100">
        Acceso Restringido
      </h1>
      <p class="text-sm text-slate-400">
        Debes iniciar sesión para consultar y modificar la información de tu perfil de guerrero.
      </p>
      <button
        @click="openAuthModal('login')"
        class="game-btn-gold py-3 px-8 rounded-xl text-slate-950 font-black text-sm uppercase tracking-wider"
      >
        Iniciar Sesión Ahora
      </button>
    </div>

    <!-- Estado: Autenticado -->
    <div v-else class="max-w-6xl mx-auto space-y-10">
      
      <!-- Cabecera de la Página -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-2">
            <i class="bi bi-shield-fill-check text-amber-300"></i>
            <span class="text-[11px] font-black uppercase tracking-widest text-amber-300">Cuartel General</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
            Perfil de Guerrero
          </h1>
          <p class="text-xs sm:text-sm text-slate-400">
            Gestiona tu identidad, emblema de batalla y datos de tu cuenta.
          </p>
        </div>

        <RouterLink 
          :to="{ name: 'game' }" 
          class="game-btn-pink py-2.5 px-6 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <i class="bi bi-play-fill text-base"></i>
          <span>Jugar</span>
        </RouterLink>
      </div>

      <!-- Cuadrícula Principal de 2 Columnas -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Tarjeta Resumen de Información (4 columnas) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="game-card-portal rounded-3xl p-6 sm:p-8 text-center space-y-6 border border-amber-500/30 shadow-2xl">
            
            <!-- Avatar Actual -->
            <div class="relative w-28 h-28 mx-auto">
              <img
                v-if="userAvatar"
                :src="userAvatar"
                alt="Avatar"
                referrerpolicy="no-referrer"
                class="w-full h-full rounded-full object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/20"
              />
              <div
                v-else
                class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-3xl flex items-center justify-center border-2 border-amber-400 shadow-xl"
              >
                {{ (userDisplayName || 'G').charAt(0).toUpperCase() }}
              </div>
              <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 border border-amber-400 flex items-center justify-center text-xs text-amber-400">
                <i class="bi bi-lightning-charge-fill"></i>
              </div>
            </div>

            <!-- Datos Identificativos -->
            <div class="space-y-1">
              <h2 class="text-xl font-black text-slate-100 uppercase tracking-wide truncate">
                {{ userDisplayName }}
              </h2>
              <p class="text-xs text-slate-400 truncate">{{ user?.email }}</p>
            </div>

            <!-- Estadísticas y Datos del Guerrero -->
            <div class="pt-4 border-t border-slate-800 space-y-3 text-left text-xs">
              <div class="flex justify-between items-center">
                <span class="text-slate-400 font-medium flex items-center gap-1.5">
                  <i class="bi bi-lightning-charge-fill text-amber-400"></i> Mejor Tiempo:
                </span>
                <span class="font-mono font-black text-amber-300 text-sm">
                  {{ bestTime }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-slate-400 font-medium flex items-center gap-1.5">
                  <i class="bi bi-people-fill text-pink-400"></i> Número de Amigos:
                </span>
                <span class="font-black text-pink-400 text-sm">
                  {{ friendsCount }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-slate-400 font-medium flex items-center gap-1.5">
                  <i class="bi bi-hourglass-split text-slate-400"></i> Tiempo de la Cuenta:
                </span>
                <span class="font-bold text-slate-200">
                  {{ accountAge }}
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Panel de Configuraciones y Modificación (8 columnas) -->
        <div class="lg:col-span-8">
          <ProfileSettings />
        </div>

      </div>

    </div>

  </div>
</template>
