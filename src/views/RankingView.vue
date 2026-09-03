<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { collection, onSnapshot, query, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'

const { isAuthenticated, openAuthModal } = useAuth()

const leaderboard = ref([])
const loading = ref(true)
let unsubscribe = null

function listenToLeaderboard() {
  loading.value = true
  try {
    const scoresRef = collection(db, 'scores')
    const q = query(scoresRef, limit(50))
    
    unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      // Ordenar: Mayor puntuación primero; a igual puntaje, menor tiempo (segundos)
      docs.sort((a, b) => {
        const scoreA = Number(a.score) || 0
        const scoreB = Number(b.score) || 0
        if (scoreB !== scoreA) {
          return scoreB - scoreA
        }
        const secA = Number(a.seconds) || 9999
        const secB = Number(b.seconds) || 9999
        return secA - secB
      })

      leaderboard.value = docs.slice(0, 20).map((item, idx) => ({
        ...item,
        rank: idx + 1
      }))
      loading.value = false
    }, (err) => {
      console.error('Error al escuchar ranking de Firestore:', err)
      leaderboard.value = []
      loading.value = false
    })
  } catch (e) {
    console.error('Error inicializando consulta de ranking:', e)
    leaderboard.value = []
    loading.value = false
  }
}

onMounted(() => {
  listenToLeaderboard()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div class="min-h-screen pt-28 pb-20 bg-slate-950 text-slate-100 font-['Montserrat'] px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto space-y-10">
      
      <!-- Cabecera de la Página -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
          <i class="bi bi-trophy-fill text-amber-300"></i>
          <span class="text-xs font-black uppercase tracking-widest text-amber-300">Salón de la Fama</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
          RANKING GLOBAL DE GUERREROS
        </h1>
        <p class="text-sm text-slate-400 max-w-xl mx-auto">
          Los mejores tiempos y puntajes registrados en Kehubo. ¿Tienes lo necesario para alcanzar el top 1?
        </p>
      </div>

      <!-- Estado: Cargando -->
      <div v-if="loading" class="py-16 text-center space-y-4">
        <div class="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Consultando pergaminos de honor...</p>
      </div>

      <!-- Estado: Con Datos de Clasificación -->
      <div v-else-if="leaderboard.length > 0" class="space-y-10">
        <!-- Podio Top 3 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          <!-- 2do Lugar (Plata) -->
          <div v-if="leaderboard[1]" class="game-card-portal rounded-2xl p-6 text-center border-slate-400/30 flex flex-col justify-between order-2 md:order-1">
            <div>
              <div class="w-16 h-16 rounded-full mx-auto mb-3 bg-slate-800 border-2 border-slate-300 flex items-center justify-center text-3xl shadow-lg">
                <i class="bi bi-award-fill text-slate-300"></i>
              </div>
              <span class="text-xs font-black uppercase text-slate-300 tracking-wider">2do Puesto</span>
              <h3 class="text-lg font-black text-slate-100 mt-1 truncate">{{ leaderboard[1].displayName || leaderboard[1].name }}</h3>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800 flex justify-around text-xs">
              <div>
                <p class="text-slate-400">Puntos</p>
                <p class="font-black text-pink-400 text-base">{{ leaderboard[1].score }} pts</p>
              </div>
              <div>
                <p class="text-slate-400">Tiempo</p>
                <p class="font-black text-amber-300 text-base">{{ leaderboard[1].time || '00:00' }}</p>
              </div>
            </div>
          </div>

          <!-- 1er Lugar (Oro / Corona) -->
          <div v-if="leaderboard[0]" class="game-card-portal rounded-2xl p-8 text-center border-amber-500/60 shadow-xl shadow-amber-500/20 flex flex-col justify-between order-1 md:order-2 md:-translate-y-4 bg-linear-to-b from-amber-950/40 via-slate-900 to-slate-950">
            <div>
              <div class="w-20 h-20 rounded-full mx-auto mb-3 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 animate-pulse-glow text-amber-400">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <span class="text-xs font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Gran Campeón
              </span>
              <h3 class="text-xl font-black text-amber-100 mt-2 truncate">{{ leaderboard[0].displayName || leaderboard[0].name }}</h3>
            </div>
            <div class="mt-6 pt-4 border-t border-amber-500/30 flex justify-around text-xs">
              <div>
                <p class="text-slate-400">Puntos</p>
                <p class="font-black text-pink-400 text-lg">{{ leaderboard[0].score }} pts</p>
              </div>
              <div>
                <p class="text-slate-400">Tiempo</p>
                <p class="font-black text-amber-300 text-lg">{{ leaderboard[0].time || '00:00' }}</p>
              </div>
            </div>
          </div>

          <!-- 3er Lugar (Bronce) -->
          <div v-if="leaderboard[2]" class="game-card-portal rounded-2xl p-6 text-center border-amber-700/40 flex flex-col justify-between order-3">
            <div>
              <div class="w-16 h-16 rounded-full mx-auto mb-3 bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-3xl shadow-lg">
                <i class="bi bi-award-fill text-amber-600"></i>
              </div>
              <span class="text-xs font-black uppercase text-amber-600 tracking-wider">3er Puesto</span>
              <h3 class="text-lg font-black text-slate-100 mt-1 truncate">{{ leaderboard[2].displayName || leaderboard[2].name }}</h3>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800 flex justify-around text-xs">
              <div>
                <p class="text-slate-400">Puntos</p>
                <p class="font-black text-pink-400 text-base">{{ leaderboard[2].score }} pts</p>
              </div>
              <div>
                <p class="text-slate-400">Tiempo</p>
                <p class="font-black text-amber-300 text-base">{{ leaderboard[2].time || '00:00' }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Tabla Completa -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 class="text-sm font-black uppercase tracking-wider text-slate-200">Tabla de Clasificación</h2>
            <span class="text-xs font-semibold text-slate-400">Actualizado en tiempo real</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-950/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th class="py-3.5 px-6">Posición</th>
                  <th class="py-3.5 px-6">Jugador</th>
                  <th class="py-3.5 px-6 text-center">Puntuación</th>
                  <th class="py-3.5 px-6 text-right">Tiempo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-medium">
                <tr 
                  v-for="player in leaderboard" 
                  :key="player.id"
                  class="hover:bg-slate-800/40 transition-colors"
                >
                  <td class="py-4 px-6 font-black">
                    <span 
                      class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs"
                      :class="{
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40': player.rank === 1,
                        'bg-slate-300/20 text-slate-200 border border-slate-400/40': player.rank === 2,
                        'bg-amber-800/20 text-amber-500 border border-amber-700/40': player.rank === 3,
                        'text-slate-400': player.rank > 3
                      }"
                    >
                      #{{ player.rank }}
                    </span>
                  </td>
                  <td class="py-4 px-6 font-bold text-slate-100 flex items-center gap-3">
                    <img 
                      v-if="player.photoURL" 
                      :src="player.photoURL" 
                      alt="Avatar" 
                      referrerpolicy="no-referrer"
                      class="w-7 h-7 rounded-full object-cover border border-amber-400/40 shrink-0"
                    />
                    <div 
                      v-else 
                      class="w-7 h-7 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0"
                    >
                      {{ (player.displayName || 'G').charAt(0).toUpperCase() }}
                    </div>
                    <span>{{ player.displayName || player.name || 'Guerrero Anónimo' }}</span>
                  </td>
                  <td class="py-4 px-6 text-center font-black text-pink-400">
                    {{ player.score }} pts
                  </td>
                  <td class="py-4 px-6 text-right font-mono font-bold text-amber-300">
                    {{ player.time || '00:00' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Estado: Sin Registros Aún -->
      <div v-else class="game-card-portal rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 border border-amber-500/30">
        <div class="w-20 h-20 rounded-full mx-auto bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/10 animate-pulse-glow text-amber-400">
          <i class="bi bi-scroll"></i>
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-black uppercase text-slate-100">
            Aún no hay campeones en el Salón
          </h2>
          <p class="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            El libro de los vencedores está listo para su primera leyenda. Completa el tablero de cartas y registra tu tiempo para reclamar el puesto número 1.
          </p>
        </div>
        <div class="pt-2 flex justify-center gap-4">
          <RouterLink :to="{ name: 'game' }" class="game-btn-pink py-3 px-8 rounded-xl text-white font-black text-xs uppercase tracking-wider">
            Reclamar el Trono Ahora
          </RouterLink>
        </div>
      </div>

      <!-- Barra de Acción Inferior -->
      <div class="text-center pt-6 space-y-4">
        <p class="text-xs text-slate-400">¿Quieres que tu récord aparezca aquí?</p>
        <div class="flex justify-center gap-4">
          <RouterLink :to="{ name: 'game' }" class="game-btn-pink py-3 px-8 rounded-xl text-white font-black text-xs uppercase tracking-wider">
            Jugar Partida
          </RouterLink>
          <button 
            v-if="!isAuthenticated"
            @click="openAuthModal('login')" 
            class="game-btn-gold py-3 px-8 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
