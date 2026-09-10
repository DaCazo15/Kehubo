<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import Header from '../components/Header.vue'
import Tablero from '../components/Tablero.vue'
import Cartas from '../components/Cartas.vue'
import GameConfigModal from '../components/game/GameConfigModal.vue'
import CountdownOverlay from '../components/game/CountdownOverlay.vue'
import VictoryModal from '../components/game/VictoryModal.vue'
import GamePauseModal from '../components/game/GamePauseModal.vue'
import { useGame } from '../composables/useGame'
import { useDynamicBoardHeight } from '../composables/useDynamicBoardHeight'

import type { CardContentType } from '../types'

const router = useRouter()
const headerRef = ref<any>(null)
const tableroRef = ref<any>(null)

const {
  // Configuración
  cardCount,
  cartasVisiblesAlInicio,
  cardContentType,
  isConfiguring,
  isCompetitive,

  // Estado
  numeros,
  tiempoFormateado,
  puntaje,
  animatingScore,
  animatingTime,
  totalPares,
  CartasPares,
  tableroBloqueado,
  isGameOver,
  scoreSaved,
  isGameActive,

  // Countdown
  countdown,
  isCounting,
  isPaused,
  pauseCountdown,
  resumeCountdown,

  // Acciones
  verificar,
  iniciarPreparacion,
  resetGame,
  detener,
  pauseGame,
  resumeGame
} = useGame({
  isCompetitive: true,
  defaultCardCount: 24,
  defaultCartasVisibles: false,
  autoStart: false
})

// Control de altura dinámica de cartas por cálculo exacto del viewport
const {
  cardHeight,
  cardWidth,
  rowCount,
  colCount
} = useDynamicBoardHeight({
  cardCount,
  headerRef,
  tableroRef
})

// Control de Modal de Pausa y confirmación de abandono
const showPauseModal = ref<boolean>(false)
const pendingLeaveTarget = ref<any>(null)
let allowLeave = false

onBeforeRouteLeave((to) => {
  if (allowLeave || !isGameActive.value || isGameOver.value) {
    return true
  }

  pauseGame()
  showPauseModal.value = true
  pendingLeaveTarget.value = to
  return false
})

function onResumeGame() {
  showPauseModal.value = false
  pendingLeaveTarget.value = null
  resumeGame()
}

function onConfirmExit() {
  showPauseModal.value = false
  allowLeave = true
  detener()
  if (pendingLeaveTarget.value) {
    router.push(pendingLeaveTarget.value)
  } else {
    router.push({ name: 'perfil' })
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (isGameActive.value && !isGameOver.value && !allowLeave) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function onStartConfig(config: { cardCount: number; cartasVisibles: boolean; cardContentType: CardContentType }) {
  iniciarPreparacion(config)
}

function onCloseConfig() {
  allowLeave = true
  detener()
  isConfiguring.value = false
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="h-dvh max-h-dvh bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] select-none overflow-hidden">
    
    <!-- Cabecera del Juego con botón Reiniciar y Salir -->
    <Header 
      ref="headerRef"
      :resetGame="() => resetGame(true)" 
      :volver="true"
    />

    <!-- Tablero con Puntos, Pares y Tiempo -->
    <Tablero 
      ref="tableroRef"
      :tiempo="tiempoFormateado" 
      :puntaje="puntaje" 
      :totalPares="totalPares" 
      :paresEncontrados="CartasPares.length"
      :cardCount="cardCount"
      :tableroBloqueado="tableroBloqueado"
      :animatingScore="animatingScore"
      :animatingTime="animatingTime"
    />

    <!-- Contenedor del Tablero de Cartas con dimensiones simétricas calculadas -->
    <main class="flex-1 w-full max-w-full mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-center min-h-0 overflow-hidden">
      <div 
        class="grid gap-1.5 sm:gap-2 md:gap-2.5 p-2 sm:p-3 md:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-sm justify-items-center items-center mx-auto"
        :style="{
          gridTemplateColumns: `repeat(${colCount}, ${cardWidth}px)`,
          gridTemplateRows: `repeat(${rowCount}, ${cardHeight}px)`,
          maxWidth: '100%',
          width: 'fit-content'
        }"
      >
        <Cartas
          v-for="carta in numeros"
          :key="carta.id"
          :carta="carta"
          :cardCount="cardCount"
          :cardHeight="cardHeight"
          :cardWidth="cardWidth"
          :tableroBloqueado="tableroBloqueado"
          @verificando="verificar"
        />
      </div>
    </main>

    <!-- Modal de Configuración Previa de Partida -->
    <GameConfigModal
      :is-open="isConfiguring"
      :initial-card-count="cardCount"
      :initial-cartas-visibles="cartasVisiblesAlInicio"
      :initial-card-content-type="cardContentType"
      :is-competitive="isCompetitive"
      @start="onStartConfig"
      @close="onCloseConfig"
    />

    <!-- Overlay de Cuenta Regresiva Animado -->
    <CountdownOverlay
      :countdown="countdown"
      :is-counting="isCounting"
      :is-paused="isPaused"
      :cartas-visibles="cartasVisiblesAlInicio"
      @pause="pauseCountdown"
      @resume="resumeCountdown"
    />

    <!-- Modal de Victoria y Guardado de Récord -->
    <VictoryModal
      :is-open="isGameOver"
      :tiempo="tiempoFormateado"
      :puntaje="puntaje"
      :card-count="cardCount"
      :is-competitive="isCompetitive"
      :score-saved="scoreSaved"
      @play-again="() => resetGame(true)"
    />

    <!-- Modal de Confirmación de Salida / Pausa -->
    <GamePauseModal
      :is-open="showPauseModal"
      @resume="onResumeGame"
      @exit="onConfirmExit"
    />

  </div>
</template>
