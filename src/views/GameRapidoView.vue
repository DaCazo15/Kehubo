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
  <div class="h-screen max-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] select-none overflow-hidden">
    
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

    <!-- Contenedor del Tablero de Cartas (24 cartas: grid 6x4 o 4x6 en movil) -->
    <main class="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-center min-h-0 overflow-hidden">
      <div class="w-full h-full max-h-full grid grid-cols-4 sm:grid-cols-6 grid-rows-6 sm:grid-rows-4 gap-1.5 sm:gap-2.5 md:gap-3 p-2 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-sm">
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
