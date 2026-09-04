<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMultiplayerRoom } from '../composables/useMultiplayerRoom'
import { useCronometro } from '../composables/useCronometo'
import { useCountdown } from '../composables/useCountdown'
import LiveLeaderboard from '../components/multiplayer/LiveLeaderboard.vue'
import RoomPodiumModal from '../components/multiplayer/RoomPodiumModal.vue'
import CountdownOverlay from '../components/game/CountdownOverlay.vue'
import RoomHeader from '../components/multiplayer/RoomHeader.vue'
import RoomWaitingLobby from '../components/multiplayer/RoomWaitingLobby.vue'
import Cartas from '../components/Cartas.vue'
import Tablero from '../components/Tablero.vue'
import type { Card } from '../types'
import type { Unsubscribe } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const roomId = ref<string>(route.params.roomId as string)

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
const cartas = ref<Card[]>([])
const CartasSeleccionadas = ref<Card[]>([])
const CartasPares = ref<number[]>([])
const tableroBloqueado = ref<boolean>(true)
const localScore = ref<number>(0)
const animatingScore = ref<string>('')
const animatingTime = ref<string>('')
const isPodiumOpen = ref<boolean>(false)

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

let unsubRoom: Unsubscribe | (() => void) | null = null
let unsubPlayers: Unsubscribe | (() => void) | null = null

function startMultiplayerMatch() {
  const syncDeck = currentRoom.value?.config?.deck || []
  
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

  startCountdown(5, () => {
    if (cartasVisiblesAlInicio.value) {
      cartas.value.forEach(c => {
        if (!c.encontrada) c.revelada = false
      })
    }
    tableroBloqueado.value = false
    iniciarCronometro()
  })
}

async function verificar(cardOrId: Card | number) {
  const cardId = typeof cardOrId === 'number' ? cardOrId : cardOrId.id
  const carta = cartas.value.find(c => c.id === cardId)
  if (!carta || tableroBloqueado.value || carta.revelada || carta.encontrada) return

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

    if (c2.valor === null || c2.valor === undefined) {
      const revealed2 = await flipCard(roomId.value, c2.id)
      if (revealed2 && revealed2.valor !== undefined) {
        c2.valor = revealed2.valor
      }
    }

    if (c1.valor === c2.valor) {
      c1.encontrada = true
      c2.encontrada = true
      CartasPares.value.push(c1.valor!)
      localScore.value += 10

      animatingScore.value = 'correct'
      animatingTime.value = 'correct'
      setTimeout(() => {
        animatingScore.value = ''
        animatingTime.value = ''
      }, 500)

      CartasSeleccionadas.value = []
      tableroBloqueado.value = false

      updatePlayerProgress(roomId.value, {
        score: localScore.value,
        pairsFound: CartasPares.value.length
      })

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

function handleUpdateConfig(config: { cardCount?: number; cartasVisibles?: boolean }) {
  if (!isHost.value) return
  updateRoomConfig(roomId.value, {
    cardCount: config.cardCount ?? cardCount.value,
    cartasVisibles: config.cartasVisibles ?? cartasVisiblesAlInicio.value
  })
}

async function handleStartGame() {
  if (!isHost.value) return
  await startRoomGame(roomId.value)
}

async function handleLeaveRoom() {
  await leaveRoom(roomId.value)
  router.push({ name: 'multiplayer-lobby' })
}

function handlePlayAgain() {
  if (!isHost.value) return
  isPodiumOpen.value = false
  handleStartGame()
}

onMounted(async () => {
  unsubRoom = listenToRoom(roomId.value)
  unsubPlayers = listenToRoomPlayers(roomId.value)

  setTimeout(() => {
    if (!currentRoom.value && !loading.value) {
      joinRoom(roomId.value)
    }
  }, 300)
})

onUnmounted(() => {
  if (unsubRoom) unsubRoom()
  if (unsubPlayers) unsubPlayers()
  cancelCountdown()
  detenerCronometro()
})

// Reaccionar a cambios de estado de la sala
watch(() => currentRoom.value?.status, (newStatus, oldStatus) => {
  if (newStatus === 'playing' && oldStatus !== 'playing') {
    startMultiplayerMatch()
  } else if (newStatus === 'finished') {
    detenerCronometro()
    tableroBloqueado.value = true
    isPodiumOpen.value = true
  } else if (newStatus === 'waiting') {
    isPodiumOpen.value = false
    detenerCronometro()
    resetCronometro()
    cancelCountdown()
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat']">
    
    <!-- Header Multijugador Modular -->
    <RoomHeader
      :current-room="currentRoom"
      :room-players="roomPlayers"
      :card-count="cardCount"
      @leave="handleLeaveRoom"
    />

    <!-- Estado: Sala de Espera (Lobby) -->
    <RoomWaitingLobby
      v-if="currentRoom?.status === 'waiting'"
      :current-room="currentRoom"
      :room-players="roomPlayers"
      :is-host="isHost"
      :card-count="cardCount"
      :cartas-visibles="cartasVisiblesAlInicio"
      @update-config="handleUpdateConfig"
      @start-game="handleStartGame"
    />

    <!-- Estado: Partida en Curso con Leaderboard Lateral en Vivo -->
    <main v-else class="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-4 flex flex-col lg:flex-row gap-4 items-start">
      
      <!-- Panel Izquierdo: Tablero y Cartas de Juego -->
      <div class="flex-1 w-full flex flex-col items-center space-y-4">
        
        <!-- Tablero de Estadísticas de Partida -->
        <Tablero
          :tiempo="tiempoFormateado"
          :puntaje="localScore"
          :total-pares="totalPares"
          :pares-encontrados="CartasPares.length"
          :tablero-bloqueado="tableroBloqueado"
          :card-count="cardCount"
          :animating-score="animatingScore"
          :animating-time="animatingTime"
        />

        <!-- Contenedor Cuadrícula de Cartas -->
        <div class="w-full max-w-4xl mx-auto flex justify-center items-center py-2 relative">
          <div :class="['grid gap-2 sm:gap-3 w-full justify-items-center', gridColsClass]">
            <Cartas
              v-for="carta in cartas"
              :key="carta.id"
              :carta="carta"
              :tablero-bloqueado="tableroBloqueado"
              :card-count="cardCount"
              @verificando="verificar"
            />
          </div>

          <!-- Overlay de cuenta atrás inicial (5s) -->
          <CountdownOverlay
            :is-counting="isCounting"
            :countdown="countdown"
            :cartas-visibles="cartasVisiblesAlInicio"
          />
        </div>

      </div>

      <!-- Panel Derecho: Leaderboard en Vivo -->
      <aside class="w-full lg:w-72 shrink-0">
        <LiveLeaderboard
          :players="roomPlayers"
          :current-user-id="currentPlayer.uid"
          :total-pairs="totalPares"
        />
      </aside>

    </main>

    <!-- Modal de Podio Final de Ronda -->
    <RoomPodiumModal
      :is-open="isPodiumOpen"
      :players="roomPlayers"
      :current-user-id="currentPlayer.uid"
      :is-host="isHost"
      @play-again="handlePlayAgain"
      @leave="handleLeaveRoom"
    />

  </div>
</template>
