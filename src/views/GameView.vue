<script setup>
import { computed } from 'vue'
import Header from '../components/Header.vue'
import Tablero from '../components/Tablero.vue'
import Cartas from '../components/Cartas.vue'
import GameConfigModal from '../components/game/GameConfigModal.vue'
import CountdownOverlay from '../components/game/CountdownOverlay.vue'
import VictoryModal from '../components/game/VictoryModal.vue'
import { useGame } from '../composables/useGame.js'

const {
  // Configuración
  cardCount,
  cartasVisiblesAlInicio,
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

  // Countdown
  countdown,
  isCounting,
  isPaused,
  pauseCountdown,
  resumeCountdown,

  // Acciones
  verificar,
  iniciarPreparacion,
  resetGame
} = useGame({
  isCompetitive: true,
  defaultCardCount: 24,
  defaultCartasVisibles: false,
  autoStart: false
})

// Grid dinámico según la cantidad de cartas seleccionada
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

function onStartConfig(config) {
  iniciarPreparacion(config)
}
</script>

<template>
  <div class="h-screen max-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] select-none overflow-hidden">
    
    <!-- Cabecera del Juego con botón Reiniciar y Salir -->
    <Header 
      :resetGame="() => resetGame(true)" 
      :volver="true"
    />

    <!-- Tablero con Puntos, Pares y Tiempo -->
    <Tablero 
      :tiempo="tiempoFormateado" 
      :puntaje="puntaje" 
      :totalPares="totalPares"
      :paresEncontrados="CartasPares.length"
      :cardCount="cardCount"
      :tableroBloqueado="tableroBloqueado"
      :animatingScore="animatingScore"
      :animatingTime="animatingTime"
    />

    <!-- Contenedor del Tablero de Cartas -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-center min-h-0 overflow-hidden">
      <div 
        class="w-full h-full max-h-full grid gap-1.5 sm:gap-2.5 md:gap-3 p-2 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-sm"
        :class="gridColsClass"
      >
        <Cartas
          v-for="carta in numeros"
          :key="carta.id"
          :carta="carta"
          :cardCount="cardCount"
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
      :is-competitive="isCompetitive"
      @start="onStartConfig"
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

  </div>
</template>
