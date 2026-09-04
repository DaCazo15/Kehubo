<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { collection, onSnapshot, query, limit, type Unsubscribe } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../composables/useAuth'
import { getCountryName } from '../helpers/countries'
import type { ScoreRecord } from '../types'

const { user, userCountry, isAuthenticated, openAuthModal, syncUserScoresInFirestore } = useAuth()
const router = useRouter()

const leaderboard = ref<ScoreRecord[]>([])
const loading = ref<boolean>(true)
const rankingType = ref<'global' | 'local'>('global')
const locationError = ref<string>('')
let unsubscribe: Unsubscribe | (() => void) | null = null

function getPlayerCountry(player: any): string {
  if (!player) return ''
  if (player.country) return String(player.country).toUpperCase()
  if (player.userId && player.userId === user.value?.uid && userCountry.value) {
    return userCountry.value.toUpperCase()
  }
  return ''
}

function listenToLeaderboard() {
  if (unsubscribe) (unsubscribe as any)()
  loading.value = true
  try {
    // Si el usuario está autenticado y tiene país, aseguramos que sus partidas históricas tengan el país asignado
    if (user.value?.uid && userCountry.value) {
      syncUserScoresInFirestore(user.value.uid, { country: userCountry.value }).catch(() => {})
    }

    const scoresRef = collection(db, 'scores')
    const q = query(scoresRef, limit(150))
    
    unsubscribe = onSnapshot(q, (snap) => {
      const rawDocs = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as ScoreRecord[]

      // Mapear países conocidos de los usuarios en la consulta
      const userCountryMap = new Map<string, string>()
      const currentUid = user.value?.uid
      const currentCountry = userCountry.value ? userCountry.value.toUpperCase() : ''

      if (currentUid && currentCountry) {
        userCountryMap.set(currentUid, currentCountry)
      }

      for (const docItem of rawDocs) {
        const identifier = (docItem.userId && docItem.userId !== 'anonimo') ? docItem.userId : (docItem.displayName || '')
        if (identifier && docItem.country && !userCountryMap.has(identifier)) {
          userCountryMap.set(identifier, String(docItem.country).toUpperCase())
        }
      }

      // Ordenar: Mayor puntuación primero; a igual puntaje, menor tiempo (segundos)
      rawDocs.sort((a, b) => {
        const scoreA = Number(a.score) || 0
        const scoreB = Number(b.score) || 0
        if (scoreB !== scoreA) {
          return scoreB - scoreA
        }
        const secA = Number(a.seconds) || 9999
        const secB = Number(b.seconds) || 9999
        return secA - secB
      })

      const uniqueDocs: ScoreRecord[] = []
      const seenUsers = new Set<string>()
      const isLocal = rankingType.value === 'local'

      for (const docItem of rawDocs) {
        const identifier = (docItem.userId && docItem.userId !== 'anonimo') ? docItem.userId : (docItem.displayName || '')
        if (identifier && !seenUsers.has(identifier)) {
          let resolvedCountry = docItem.country ? String(docItem.country).toUpperCase() : (userCountryMap.get(identifier) || '')
          if (!resolvedCountry && docItem.userId === currentUid && currentCountry) {
            resolvedCountry = currentCountry
          }

          // Si es ranking local, filtrar únicamente los que coincidan con el país seleccionado
          if (isLocal && currentCountry) {
            if (resolvedCountry !== currentCountry) {
              continue
            }
          }

          seenUsers.add(identifier)
          uniqueDocs.push({
            ...docItem,
            country: resolvedCountry
          })
        }
      }

      leaderboard.value = uniqueDocs.slice(0, 20).map((item, idx) => ({
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

watch(rankingType, () => {
  listenToLeaderboard()
})

watch(userCountry, (newCountry) => {
  if (rankingType.value === 'local') {
    listenToLeaderboard()
  }
  if (user.value?.uid && newCountry) {
    syncUserScoresInFirestore(user.value.uid, { country: newCountry }).catch(() => {})
  }
})

onMounted(() => {
  listenToLeaderboard()
})

function goToProfile(userId?: string) {
  if (userId && userId !== 'anonimo') {
    router.push({ name: 'perfil', params: { id: userId } })
  }
}

function handleLocalClick() {
  if (userCountry.value) {
    rankingType.value = 'local'
    locationError.value = ''
  } else if (isAuthenticated.value) {
    locationError.value = 'Debes definir tu ubicación en los ajustes de tu perfil para ver el ranking local.'
    setTimeout(() => { locationError.value = '' }, 4000)
  } else {
    openAuthModal('login')
  }
}

onUnmounted(() => {
  if (unsubscribe) (unsubscribe as any)()
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
          RANKING {{ rankingType === 'global' ? 'GLOBAL' : 'LOCAL' }} DE GUERREROS
        </h1>
        <p class="text-sm text-slate-400 max-w-xl mx-auto">
          Los mejores tiempos y puntajes registrados en Kehubo. ¿Tienes lo necesario para alcanzar el top 1?
        </p>

        <!-- Toggle Global / Local -->
        <div class="flex justify-center mt-6">
          <div class="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              @click="rankingType = 'global'"
              class="px-6 py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              :class="rankingType === 'global' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              <i class="bi bi-globe2"></i> Global
            </button>
            <button
              v-if="userCountry"
              @click="handleLocalClick"
              class="px-6 py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              :class="rankingType === 'local' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              <span :class="'flag:' + userCountry.toUpperCase()" class="inline-block rounded-xs shadow-xs"></span>
              Local
            </button>
            <button
              v-else
              @click="handleLocalClick"
              class="px-6 py-2 text-xs font-bold rounded-lg duration-200 uppercase tracking-wider flex items-center gap-2 text-slate-500 hover:text-slate-400 transition cursor-pointer"
              title="Configura tu país en tu perfil"
            >
              <i class="bi bi-geo-alt-fill"></i> Local (Sin País)
            </button>
          </div>
        </div>

        <!-- Alerta de Ubicación Faltante -->
        <div v-if="locationError" class="max-w-md mx-auto mt-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
          <i class="bi bi-exclamation-triangle-fill text-red-400 text-sm"></i>
          <span>{{ locationError }}</span>
        </div>
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
              <div class="w-16 h-16 rounded-full mx-auto mb-3 bg-slate-800 border-2 border-slate-300 flex items-center justify-center text-3xl shadow-lg relative">
                <img 
                  v-if="leaderboard[1].photoURL" 
                  :src="leaderboard[1].photoURL" 
                  class="w-full h-full rounded-full object-cover" 
                  referrerpolicy="no-referrer"
                />
                <i v-else class="bi bi-person-fill text-slate-300"></i>
              </div>
              <span class="text-xs font-black uppercase text-slate-300 tracking-wider">2do Puesto</span>
              <h3 
                class="text-lg font-black text-slate-100 mt-1 truncate cursor-pointer hover:text-amber-300 transition-colors"
                @click="goToProfile(leaderboard[1].userId)"
              >
                {{ leaderboard[1].displayName || leaderboard[1].name || 'Guerrero Anónimo' }}
              </h3>
              <div v-if="getPlayerCountry(leaderboard[1])" class="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-slate-400 font-normal">
                <span :class="'flag:' + getPlayerCountry(leaderboard[1])" class="inline-block rounded-xs shadow-xs shrink-0"></span>
                <span>{{ getCountryName(getPlayerCountry(leaderboard[1])) }}</span>
              </div>
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

          <!-- 1er Lugar (Oro / Corona con icono SVG) -->
          <div v-if="leaderboard[0]" class="game-card-portal rounded-2xl p-8 text-center border-amber-500/60 shadow-xl shadow-amber-500/20 flex flex-col justify-between order-1 md:order-2 md:-translate-y-4 bg-linear-to-b from-amber-950/40 via-slate-900 to-slate-950">
            <div>
              <div class="w-20 h-20 rounded-full mx-auto mb-3 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 animate-pulse-glow text-amber-400 relative">
                <img 
                  v-if="leaderboard[0].photoURL" 
                  :src="leaderboard[0].photoURL" 
                  class="w-full h-full rounded-full object-cover" 
                  referrerpolicy="no-referrer"
                />
                <i v-else class="bi bi-person-fill text-amber-400"></i>
                <!-- Corona como icono SVG (sin emojis) -->
                <div class="absolute -bottom-2 -right-2 bg-slate-900 rounded-full border border-amber-400 w-8 h-8 flex items-center justify-center shadow-lg">
                  <svg class="w-4.5 h-4.5 text-amber-400 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
                  </svg>
                </div>
              </div>
              <span class="text-xs font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Gran Campeón
              </span>
              <h3 
                class="text-xl font-black text-amber-100 mt-2 truncate cursor-pointer hover:text-amber-300 transition-colors"
                @click="goToProfile(leaderboard[0].userId)"
              >
                {{ leaderboard[0].displayName || leaderboard[0].name || 'Guerrero Anónimo' }}
              </h3>
              <div v-if="getPlayerCountry(leaderboard[0])" class="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-amber-200/80 font-normal">
                <span :class="'flag:' + getPlayerCountry(leaderboard[0])" class="inline-block rounded-xs shadow-xs shrink-0"></span>
                <span>{{ getCountryName(getPlayerCountry(leaderboard[0])) }}</span>
              </div>
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
              <div class="w-16 h-16 rounded-full mx-auto mb-3 bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-3xl shadow-lg relative">
                <img 
                  v-if="leaderboard[2].photoURL" 
                  :src="leaderboard[2].photoURL" 
                  class="w-full h-full rounded-full object-cover" 
                  referrerpolicy="no-referrer"
                />
                <i v-else class="bi bi-person-fill text-amber-600"></i>
              </div>
              <span class="text-xs font-black uppercase text-amber-600 tracking-wider">3er Puesto</span>
              <h3 
                class="text-lg font-black text-slate-100 mt-1 truncate cursor-pointer hover:text-amber-300 transition-colors"
                @click="goToProfile(leaderboard[2].userId)"
              >
                {{ leaderboard[2].displayName || leaderboard[2].name || 'Guerrero Anónimo' }}
              </h3>
              <div v-if="getPlayerCountry(leaderboard[2])" class="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-slate-400 font-normal">
                <span :class="'flag:' + getPlayerCountry(leaderboard[2])" class="inline-block rounded-xs shadow-xs shrink-0"></span>
                <span>{{ getCountryName(getPlayerCountry(leaderboard[2])) }}</span>
              </div>
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
            <h2 class="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>Tabla de Clasificación</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-bold flex items-center gap-1.5">
                <template v-if="rankingType === 'global'">
                  <i class="bi bi-globe2 text-[11px]"></i> Global
                </template>
                <template v-else>
                  <span v-if="userCountry" :class="'flag:' + userCountry.toUpperCase()" class="inline-block rounded-xs shadow-xs"></span>
                  <span>{{ getCountryName(userCountry) || 'Local' }}</span>
                </template>
              </span>
            </h2>
            <span class="text-xs font-semibold text-slate-400 hidden sm:inline">Actualizado en tiempo real</span>
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
                  class="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  @click="goToProfile(player.userId)"
                >
                  <td class="py-4 px-6 font-black">
                    <span 
                      class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs"
                      :class="{
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40': (player.rank ?? 0) === 1,
                        'bg-slate-300/20 text-slate-200 border border-slate-400/40': (player.rank ?? 0) === 2,
                        'bg-amber-800/20 text-amber-500 border border-amber-700/40': (player.rank ?? 0) === 3,
                        'text-slate-400': (player.rank ?? 0) > 3
                      }"
                    >
                      #{{ player.rank ?? 0 }}
                    </span>
                  </td>
                  <td class="py-4 px-6 font-bold text-slate-100">
                    <div class="flex items-center gap-3">
                      <img 
                        v-if="player.photoURL" 
                        :src="player.photoURL" 
                        alt="Avatar" 
                        referrerpolicy="no-referrer"
                        class="w-9 h-9 rounded-full object-cover border border-amber-400/40 shrink-0"
                      />
                      <div 
                        v-else 
                        class="w-9 h-9 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0"
                      >
                        {{ (player.displayName || 'G').charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="truncate">{{ player.displayName || player.name || 'Guerrero Anónimo' }}</span>
                        <!-- Bandera y nombre de país debajo del nombre del jugador -->
                        <div v-if="getPlayerCountry(player)" class="flex items-center gap-1.5 text-xs text-slate-400 font-normal">
                          <span :class="'flag:' + getPlayerCountry(player)" class="inline-block rounded-xs shadow-xs shrink-0"></span>
                          <span class="truncate">{{ getCountryName(getPlayerCountry(player)) }}</span>
                        </div>
                        <div v-else class="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
                          <i class="bi bi-globe2 text-[10px]"></i>
                          <span>Sin país</span>
                        </div>
                      </div>
                    </div>
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
            class="game-btn-gold py-3 px-8 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
