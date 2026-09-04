<script setup>
import Header from '../components/Header.vue'
import Tablero from '../components/Tablero.vue'
import Cartas from '../components/Cartas.vue'
import CountdownOverlay from '../components/game/CountdownOverlay.vue'
import VictoryModal from '../components/game/VictoryModal.vue'
import { useGame } from '../composables/useGame.js'

const {
  // Configuración
  cardCount,
  cartasVisiblesAlInicio,

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
  isCompetitive: false, // Partida Rápida: No se guarda en Firestore
  defaultCardCount: 24, // 24 Cartas fijas
  defaultCartasVisibles: false, // Cartas ocultas al inicio
  autoStart: true // Inicia directamente con la cuenta regresiva
})
</script>

<template>
  <div class="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] select-none">
    
    <!-- Cabecera del Juego con botón Reiniciar y Salir -->
    <Header 
      :resetGame="() => resetGame(false)" 
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

    <!-- Contenedor del Tablero de Cartas (24 cartas: grid 6x4) -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex items-center justify-center">
      <div class="w-full grid grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-sm">
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

    <!-- Overlay de Cuenta Regresiva Animado -->
    <CountdownOverlay
      :countdown="countdown"
      :is-counting="isCounting"
      :is-paused="isPaused"
      :cartas-visibles="cartasVisiblesAlInicio"
      @pause="pauseCountdown"
      @resume="resumeCountdown"
    />

    <!-- Modal de Victoria Rápida (Sin guardar en ranking) -->
    <VictoryModal
      :is-open="isGameOver"
      :tiempo="tiempoFormateado"
      :puntaje="puntaje"
      :card-count="cardCount"
      :is-competitive="false"
      @play-again="() => resetGame(false)"
    />

  </div>
</template>
