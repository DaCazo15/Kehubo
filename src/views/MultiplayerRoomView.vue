<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMultiplayerRoom } from '../composables/useMultiplayerRoom'
import { useCronometro } from '../composables/useCronometo'
import { useCountdown } from '../composables/useCountdown'
import LiveLeaderboard from '../components/multiplayer/LiveLeaderboard.vue'
import RoomPodiumModal from '../components/multiplayer/RoomPodiumModal.vue'
import CountdownOverlay from '../components/game/CountdownOverlay.vue'
import Cartas from '../components/Cartas.vue'
import Tablero from '../components/Tablero.vue'
import Header from '../components/Header.vue'
import { getCountryName } from '../helpers/countries'

const route = useRoute()
const router = useRouter()
const roomId = ref(route.params.roomId)

const {
  currentRoom,
  roomPlayers,
  loading,
  error,
  joinRoom,
  listenToRoom,
  listenToRoomPlayers,
  updatePlayerProgress,
  updateRoomConfig,
  startRoomGame,
  leaveRoom,
  flipCard,
  getCurrentPlayerData
} = useMultiplayerRoom()

const currentPlayer = ref(getCurrentPlayerData())
const isHost = computed(() => currentRoom.value?.hostId === currentPlayer.value.uid)

// Estado del juego local
const cartas = ref([])
const CartasSeleccionadas = ref([])
const CartasPares = ref([])
const tableroBloqueado = ref(true)
const localScore = ref(0)
const animatingScore = ref('')
const animatingTime = ref('')
const isPodiumOpen = ref(false)
const copiedCode = ref(false)
const copiedLink = ref(false)

const { 
  tiempo, 
  tiempoFormateado, 
  iniciarCronometro, 
  resetCronometro, 
  detenerCronometro 
} = useCronometro()

const { 
  countdown, 
  isCounting, 
  startCountdown, 
  cancelCountdown 
} = useCountdown()

const cardCount = computed(() => currentRoom.value?.config?.cardCount || 24)
const cartasVisiblesAlInicio = computed(() => currentRoom.value?.config?.cartasVisibles || false)
const totalPares = computed(() => Math.floor(cardCount.value / 2))

// Dynamic grid styling for cards
const gridColsClass = computed(() => {
  if (cardCount.value === 40) {
    return 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 grid-rows-8 sm:grid-rows-5 md:grid-rows-4'
  }
  if (cardCount.value === 32) {
    return 'grid-cols-4 sm:grid-cols-8 grid-rows-8 sm:grid-rows-4'
  }
  if (cardCount.value === 16) {
    return 'grid-cols-4 grid-rows-4 max-w-2xl'
  }
  return 'grid-cols-4 sm:grid-cols-6 grid-rows-6 sm:grid-rows-4'
})

let unsubRoom = null
let unsubPlayers = null

// Copiar código de sala
function copyCode() {
  if (currentRoom.value?.code) {
    navigator.clipboard.writeText(currentRoom.value.code)
    copiedCode.value = true
    setTimeout(() => { copiedCode.value = false }, 2000)
  }
}

// Copiar enlace directo de invitación
function copyLink() {
  const url = window.location.origin + '/sala/' + (currentRoom.value?.code || roomId.value)
  navigator.clipboard.writeText(url)
  copiedLink.value = true
  setTimeout(() => { copiedLink.value = false }, 2000)
}

// Iniciar la preparación de la partida sincronizada
function startMultiplayerMatch() {
  const syncDeck = currentRoom.value?.config?.deck || []
  
  // Clonar el mazo sincronizado para el estado local del jugador
  cartas.value = syncDeck.map(c => ({
    id: c.id,
    valor: c.valor,
    revelada: cartasVisiblesAlInicio.value,
    encontrada: false
  }))

  CartasSeleccionadas.value = []
  CartasPares.value = []
  localScore.value = 0
  tableroBloqueado.value = true
  isPodiumOpen.value = false
  resetCronometro()

  // Conteo regresivo (5s)
  startCountdown(5, () => {
    // Si estaban visibles, ocultar las no encontradas
    if (cartasVisiblesAlInicio.value) {
      cartas.value.forEach(c => {
        if (!c.encontrada) c.revelada = false
      })
    }
    tableroBloqueado.value = false
    iniciarCronometro()
  })
}

// Turno de selección y verificación de cartas (con resolución segura de mazo en servidor)
async function verificar(carta) {
  if (tableroBloqueado.value || carta.revelada || carta.encontrada) return

  // Si el valor no está presente localmente (mazo secreto en servidor), obtenerlo bajo demanda
  if (carta.valor === null || carta.valor === undefined) {
    const revealed = await flipCard(roomId.value, carta.id)
    if (revealed && revealed.valor !== undefined) {
      carta.valor = revealed.valor
    }
  }

  carta.revelada = true
  CartasSeleccionadas.value.push(carta)

  if (CartasSeleccionadas.value.length === 2) {
    tableroBloqueado.value = true
    const [c1, c2] = CartasSeleccionadas.value

    // Asegurar que la segunda carta tenga su valor cargado
    if (c2.valor === null || c2.valor === undefined) {
      const revealed2 = await flipCard(roomId.value, c2.id)
      if (revealed2 && revealed2.valor !== undefined) {
        c2.valor = revealed2.valor
      }
    }

    if (c1.valor === c2.valor) {
      // Acierto
      c1.encontrada = true
      c2.encontrada = true
      CartasPares.value.push(c1.valor)
      localScore.value += 10

      animatingScore.value = 'correct'
      animatingTime.value = 'correct'
      setTimeout(() => {
        animatingScore.value = ''
        animatingTime.value = ''
      }, 500)

      CartasSeleccionadas.value = []
      tableroBloqueado.value = false

      // Sincronizar en tiempo real con Firestore
      updatePlayerProgress(roomId.value, {
        score: localScore.value,
        pairsFound: CartasPares.value.length
      })

      // Verificar si completó todos los pares
      if (CartasPares.value.length === totalPares.value) {
        detenerCronometro()
        tableroBloqueado.value = true
        
        updatePlayerProgress(roomId.value, {
          score: localScore.value,
          pairsFound: CartasPares.value.length,
          isFinished: true,
          finishTime: tiempoFormateado.value,
          finishSeconds: Number(tiempo.value) || 0
        })

        setTimeout(() => {
          isPodiumOpen.value = true
        }, 1200)
      }

    } else {
      // Fallo
      if (cartasVisiblesAlInicio.value) {
        localScore.value = Math.max(0, localScore.value - 1)
        tiempo.value += 2
        animatingScore.value = 'wrong'
        animatingTime.value = 'wrong'
        setTimeout(() => {
          animatingScore.value = ''
          animatingTime.value = ''
        }, 500)
      }

      setTimeout(() => {
        c1.revelada = false
        c2.revelada = false
        CartasSeleccionadas.value = []
        tableroBloqueado.value = false

        updatePlayerProgress(roomId.value, {
          score: localScore.value,
          pairsFound: CartasPares.value.length
        })
      }, 800)
    }
  }
}

// Configuración de la sala por el moderador
function handleConfigChange(count, visible) {
  if (!isHost.value) return
  updateRoomConfig(roomId.value, {
    cardCount: count,
    cartasVisibles: visible
  })
}

// Iniciar juego en la sala
function handleStartGame() {
  if (!isHost.value) return
  startRoomGame(roomId.value)
}

// Salir de la sala
async function handleLeaveRoom() {
  cancelCountdown()
  detenerCronometro()
  await leaveRoom(roomId.value)
  router.push({ name: 'multiplayer-lobby' })
}

// Inicializar conexiones a la sala
onMounted(async () => {
  currentPlayer.value = getCurrentPlayerData()

  // Conectarse a la sala
  const joinRes = await joinRoom(roomId.value)
  if (!joinRes.success) {
    router.push({ name: 'multiplayer-lobby' })
    return
  }

  roomId.value = joinRes.roomId

  // Escuchar estado de la sala
  unsubRoom = listenToRoom(roomId.value, (room) => {
    if (!room) {
      router.push({ name: 'multiplayer-lobby' })
      return
    }

    // Si la sala cambia a playing y el juego local aún no ha arrancado
    if (room.status === 'playing' && !isCounting.value && CartasPares.value.length === 0 && localScore.value === 0) {
      startMultiplayerMatch()
    }
  })

  // Escuchar jugadores
  unsubPlayers = listenToRoomPlayers(roomId.value, (players) => {
    // Si todos terminaron, mostrar podio si aún no se abrió
    const allFinished = players.length > 0 && players.every(p => p.status === 'finished')
    if (allFinished && currentRoom.value?.status === 'playing') {
      isPodiumOpen.value = true
    }
  })
})

onUnmounted(() => {
  if (unsubRoom) unsubRoom()
  if (unsubPlayers) unsubPlayers()
})
</script>

<template>
  <div 
    class="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] select-none"
    :class="currentRoom?.status === 'playing' ? 'h-screen max-h-screen overflow-hidden' : ''"
  >
    
    <!-- Header Multijugador -->
    <header class="w-full bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      <div class="flex items-center gap-3">
        <button
          @click="handleLeaveRoom"
          class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          title="Abandonar Sala"
        >
          <i class="bi bi-box-arrow-left text-sm"></i>
          <span class="hidden sm:inline">Salir de Sala</span>
        </button>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-black tracking-wider">
            {{ currentRoom?.code || 'SALA' }}
          </span>
          <span class="text-xs text-slate-400 hidden sm:inline font-bold">
            ⚔️ Partida Competitiva ({{ cardCount }} Cartas)
          </span>
        </div>
      </div>

      <!-- Jugadores conectados -->
      <div class="flex items-center gap-2">
        <div class="flex -space-x-2 overflow-hidden">
          <div
            v-for="p in roomPlayers"
            :key="p.uid || p.id"
            class=" h-7 w-7 rounded-full ring-2 ring-slate-950 object-cover bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center"
            :title="p.displayName"
          >
            <img v-if="p.photoURL" :src="p.photoURL" class="h-full w-full rounded-full object-cover" />
            <span v-else>{{ (p.displayName || 'G').charAt(0) }}</span>
          </div>
        </div>
        <span class="text-xs font-black text-slate-300">
          {{ roomPlayers.length }}/4
        </span>
      </div>
    </header>

    <!-- ESTADO 1: Sala de Espera (Lobby de Sala) -->
    <main v-if="currentRoom?.status === 'waiting'" class="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex items-center justify-center">
      <div class="w-full game-card-portal rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl space-y-8">
        
        <!-- Código y Botones de Invitación -->
        <div class="text-center space-y-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <i class="bi bi-broadcast animate-pulse"></i>
            <span>Sala de Espera Privada</span>
          </div>

          <h2 class="text-2xl sm:text-4xl font-black uppercase text-slate-100 tracking-tight">
            Código de Invitación
          </h2>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div class="text-3xl sm:text-4xl font-black tracking-widest text-amber-300 bg-slate-950 px-6 py-3 rounded-2xl border border-amber-500/50 shadow-inner font-mono">
              {{ currentRoom?.code }}
            </div>
            
            <div class="flex gap-2">
              <button
                @click="copyCode"
                class="game-btn-gold py-3 px-4 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
              >
                <i :class="copiedCode ? 'bi bi-check-circle-fill text-emerald-800' : 'bi bi-copy'"></i>
                <span>{{ copiedCode ? '¡Copiado!' : 'Copiar Código' }}</span>
              </button>

              <button
                @click="copyLink"
                class="game-btn-pink py-3 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
              >
                <i :class="copiedLink ? 'bi bi-check-circle-fill' : 'bi bi-link-45deg text-base'"></i>
                <span>{{ copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de Guerreros Conectados (1 a 4) -->
        <div class="space-y-3">
          <div class="flex justify-between items-center px-1">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-300">
              Guerreros Unidos ({{ roomPlayers.length }}/4)
            </h3>
            <span class="text-xs text-amber-400 font-bold">
              {{ isHost ? 'Eres el Moderador' : 'Esperando al Moderador' }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="p in roomPlayers"
              :key="p.uid || p.id"
              class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="relative w-11 h-11 shrink-0">
                  <img
                    v-if="p.photoURL"
                    :src="p.photoURL"
                    alt="Avatar"
                    class="w-full h-full rounded-full object-cover border border-amber-400/60"
                  />
                  <div
                    v-else
                    class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-sm flex items-center justify-center border border-amber-400/60"
                  >
                    {{ (p.displayName || 'G').charAt(0).toUpperCase() }}
                  </div>
                  <span
                    v-if="p.country"
                    :class="'flag:' + p.country.toUpperCase()"
                    class="absolute -bottom-1 -right-1 w-4 h-3 rounded-2xs shadow-xs"
                  ></span>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h4 class="text-sm font-black text-slate-100 truncate">
                      {{ p.displayName || 'Guerrero' }}
                    </h4>
                    <span v-if="p.uid === currentPlayer.uid" class="text-[9px] font-black uppercase px-1 rounded-xs bg-amber-400 text-slate-950">
                      Tú
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400">
                    {{ p.isHost ? '👑 Moderador de la Sala' : '⚔️ Rival Listo' }}
                  </p>
                </div>
              </div>

              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <!-- Espacios vacíos -->
            <div
              v-for="emptyIdx in (4 - roomPlayers.length)"
              :key="'empty-' + emptyIdx"
              class="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex items-center justify-center text-xs text-slate-600 font-bold uppercase tracking-wider"
            >
              <i class="bi bi-person-plus mr-2 text-sm"></i> Esperando Guerrero...
            </div>
          </div>
        </div>

        <!-- Opciones de Configuración por el Moderador -->
        <div v-if="isHost" class="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
          <h4 class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <i class="bi bi-sliders"></i> Ajustes de Partida (Solo Moderador)
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block text-slate-400 font-bold mb-1">Dificultad:</label>
              <select
                :value="cardCount"
                @change="handleConfigChange(Number($event.target.value), cartasVisiblesAlInicio)"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-amber-400"
              >
                <option :value="16">16 Cartas (8 pares)</option>
                <option :value="24">24 Cartas (12 pares)</option>
                <option :value="32">32 Cartas (16 pares)</option>
                <option :value="40">40 Cartas (20 pares)</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 font-bold mb-1">Cartas al Inicio:</label>
              <select
                :value="cartasVisiblesAlInicio"
                @change="handleConfigChange(cardCount, $event.target.value === 'true')"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold outline-none focus:border-amber-400"
              >
                <option :value="false">Ocultas (Modo Normal)</option>
                <option :value="true">Viradas (Memorización 5s)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Botón de Inicio / Espera -->
        <div class="pt-2 text-center">
          <button
            v-if="isHost"
            @click="handleStartGame"
            class="w-full game-btn-gold py-4 rounded-2xl text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl"
          >
            <i class="bi bi-play-fill text-xl"></i>
            <span>Iniciar Partida Multijugador</span>
          </button>

          <div v-else class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Esperando a que el moderador inicie la partida...</span>
          </div>
        </div>

      </div>
    </main>

    <!-- ESTADO 2: Partida en Curso con Leaderboard Lateral en Vivo -->
    <main v-else class="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-2 sm:py-4 flex flex-col lg:flex-row gap-3 sm:gap-6 items-start min-h-0 overflow-hidden">
      
      <!-- Columna Izquierda: Clasificación en Tiempo Real -->
      <LiveLeaderboard
        :players="roomPlayers"
        :currentUserId="currentPlayer.uid"
        :totalPares="totalPares"
      />

      <!-- Columna Central: Tablero y Cartas -->
      <div class="flex-1 w-full space-y-2 sm:space-y-4 min-h-0 flex flex-col justify-center">
        
        <!-- Tablero con Puntos, Pares y Tiempo -->
        <Tablero
          :tiempo="tiempoFormateado"
          :puntaje="localScore"
          :totalPares="totalPares"
          :paresEncontrados="CartasPares.length"
          :cardCount="cardCount"
          :tableroBloqueado="tableroBloqueado"
          :animatingScore="animatingScore"
          :animatingTime="animatingTime"
        />

        <!-- Tablero de Cartas Sincronizado -->
        <div
          class="w-full grid gap-1.5 sm:gap-3 md:gap-4 p-2 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-sm"
          :class="gridColsClass"
        >
          <Cartas
            v-for="carta in cartas"
            :key="carta.id"
            :carta="carta"
            :cardCount="cardCount"
            :tableroBloqueado="tableroBloqueado"
            @verificando="verificar"
          />
        </div>

      </div>

    </main>

    <!-- Conteo Regresivo Sincronizado (allowPause = false para no detener el reloj en hover) -->
    <CountdownOverlay
      :countdown="countdown"
      :is-counting="isCounting"
      :is-paused="false"
      :cartas-visibles="cartasVisiblesAlInicio"
      :allow-pause="false"
    />

    <!-- Podio Final de la Sala Multijugador -->
    <RoomPodiumModal
      :is-open="isPodiumOpen"
      :players="roomPlayers"
      :currentUserId="currentPlayer.uid"
      :isHost="isHost"
      @play-again="handleStartGame"
      @leave="handleLeaveRoom"
    />

  </div>
</template>
