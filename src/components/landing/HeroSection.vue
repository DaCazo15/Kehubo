<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../composables/useAuth'

const { isAuthenticated, openAuthModal } = useAuth()

const userCount = ref<string>('+100')

onMounted(async () => {
  try {
    const coll = collection(db, 'users')
    const snapshot = await getCountFromServer(coll)
    const count = snapshot.data().count
    if (count > 0) {
      userCount.value = count > 10 ? `+${count}` : `${count}`
    }
  } catch (err) {
    console.debug('Usando valor predeterminado de usuarios:', err)
  }
})
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden font-['Montserrat']">
    <!-- Fondos de ambientación gamer con gradientes oscuros y resplandor -->
    <div class="absolute inset-0 bg-[#070a12] -z-20"></div>

    <!-- Fondo de mallas y destellos atmosféricos -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.15),transparent_55%)] -z-10"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.12),transparent_50%)] -z-10"></div>
    
    <!-- Partículas y orbes de energía en el fondo -->
    <div class="absolute top-1/4 left-1/10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-glow -z-10"></div>
    <div class="absolute bottom-1/4 right-1/10 w-120 h-120 bg-pink-600/10 rounded-full blur-3xl animate-pulse-glow -z-10" style="animation-delay: 2s;"></div>

    <!-- Patrón de rejilla sutil para sensación de portal de juego -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Columna de Texto / Copy Principal (7 columnas) -->
        <div class="lg:col-span-7 text-center lg:text-left space-y-6">
          <!-- Título Principal con Estética de Videojuego -->
          <h1 class="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-none">
            <span class="block text-slate-100 drop-shadow-md">DOMINA EL</span>
            <span class="block text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200 game-title-glow mt-1">
              REINO DE LAS CARTAS
            </span>
          </h1>

          <!-- Descripción / Lore -->
          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
            Pon a prueba tu agilidad mental y memoria táctica. Encuentra los pares antes de que el cronómetro se agote, acumula puntuación y forja tu nombre en el ranking de campeones.
          </p>

          <!-- Grupo de Acciones (CTAs) -->
          <div class="pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4">
            
            <!-- Botón Principal "Jugar Ahora" (Navega a juego rápido sin login) -->
            <RouterLink 
              :to="{ name: 'game-rapido' }" 
              class="w-full sm:w-auto game-btn-pink py-4 px-8 rounded-2xl text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-transform"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Jugar Rápido</span>
            </RouterLink>

            <!-- Botón Salas Competitivas Multijugador -->
            <RouterLink 
              :to="{ name: 'multiplayer-lobby' }" 
              class="w-full sm:w-auto game-btn-gold py-4 px-8 rounded-2xl text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-2xl hover:scale-105 transition-transform"
            >
              <i class="bi bi-people-fill text-lg"></i>
              <span>Salas Multijugador</span>
            </RouterLink>

            <!-- Botón Ranking -->
            <RouterLink
              to="/ranking"
              class="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 transition"
            >
              <i class="bi bi-trophy-fill text-amber-400"></i>
              <span>Ranking</span>
            </RouterLink>
          </div>

          <!-- Métricas Destacadas (Opción 3) -->
          <div class="pt-6 grid grid-cols-3 gap-3 border-t border-slate-800/80 max-w-xl mx-auto lg:mx-0">
            <div class="text-center lg:text-left">
              <p class="text-xl sm:text-2xl font-black text-amber-400">{{ userCount }}</p>
              <p class="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Jugadores Registrados</p>
            </div>
            <div class="text-center lg:text-left border-x border-slate-800 px-2">
              <p class="text-xl sm:text-2xl font-black text-pink-400">#1</p>
              <p class="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Ranking Global</p>
            </div>
            <div class="text-center lg:text-left">
              <p class="text-xl sm:text-2xl font-black text-amber-300">4P</p>
              <p class="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Salas Privadas</p>
            </div>
          </div>

        </div>

        <!-- Columna Visual / Showcase de Cartas Flotantes estilo Portal Albion (5 columnas) -->
        <div class="lg:col-span-5 flex justify-center items-center relative">
          <div class="relative w-full max-w-md aspect-square flex items-center justify-center">
            
            <!-- Anillo Rúnico de Portal -->
            <div class="absolute inset-0 rounded-full border border-amber-500/30 border-dashed animate-spin" style="animation-duration: 30s;"></div>
            <div class="absolute inset-6 rounded-full border border-pink-500/20 animate-spin" style="animation-duration: 45s; animation-direction: reverse;"></div>
            <div class="absolute inset-12 rounded-full bg-radial from-amber-500/10 via-pink-500/5 to-transparent blur-xl"></div>

            <!-- Cartas Interactivas Flotantes (Muestra del Juego) -->
            <div class="relative z-10 grid grid-cols-2 gap-4 p-4">
              
              <!-- Carta 1 (Dada vuelta - Frente dorado) -->
              <div class="w-32 sm:w-36 h-44 sm:h-48 rounded-2xl bg-linear-to-br from-amber-500 via-amber-600 to-amber-800 p-1 shadow-2xl shadow-amber-500/20 transform -rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer animate-float">
                <div class="w-full h-full bg-slate-950/90 rounded-xl flex flex-col items-center justify-between p-3 border border-amber-400/50">
                  <span class="text-xs font-black text-amber-400 uppercase tracking-widest">KHB</span>
                  <div class="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-amber-200 to-amber-400">
                    7
                  </div>
                  <span class="text-[10px] font-bold text-amber-300/80 uppercase">Par Mágico</span>
                </div>
              </div>

              <!-- Carta 2 (Dada vuelta - Frente rosa) -->
              <div class="w-32 sm:w-36 h-44 sm:h-48 rounded-2xl bg-linear-to-br from-pink-500 via-pink-600 to-purple-800 p-1 shadow-2xl shadow-pink-500/20 transform rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer animate-float" style="animation-delay: 1.5s;">
                <div class="w-full h-full bg-slate-950/90 rounded-xl flex flex-col items-center justify-between p-3 border border-pink-400/50">
                  <span class="text-xs font-black text-pink-400 uppercase tracking-widest">KHB</span>
                  <div class="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-pink-200 to-pink-400">
                    7
                  </div>
                  <span class="text-[10px] font-bold text-pink-300/80 uppercase">¡MATCH!</span>
                </div>
              </div>

              <!-- Carta 3 (Dorso Místico) -->
              <div class="w-32 sm:w-36 h-44 sm:h-48 rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 p-1 shadow-xl transform rotate-3 hover:scale-105 transition-transform duration-300 col-span-2 mx-auto -mt-6">
                <div class="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center p-3 border border-slate-700">
                  <div class="w-12 h-12 rounded-full border border-amber-500/40 flex items-center justify-center bg-amber-500/10 mb-2">
                    <i class="bi bi-gem text-amber-400 text-lg"></i>
                  </div>
                  <span class="text-xs font-black tracking-widest text-slate-300 uppercase">KEHUBO</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>
