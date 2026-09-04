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
    return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
  }
  if (cardCount.value === 32) {
    return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'
  }
  return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-6'
})

function onStartConfig(config) {
  iniciarPreparacion(config)
}
</script>

<template>
  <div class="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] select-none">
    
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
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 flex items-center justify-center">
      <div 
        class="w-full grid gap-2.5 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-sm"
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
