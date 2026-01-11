<script setup>
import { computed, watch } from 'vue'
import Header from './components/Header.vue'
import Cartas from './components/Cartas.vue'
import Tablero from './components/Tablero.vue'
import { useGame } from './composables/useGame.js'

const { 
  numeros, verificar, 
  resetGame, CartasPares, 
  tiempoFormateado, tableroBloqueado,
  detener
} = useGame()

const puntaje = computed(() => CartasPares.value.length * 10)

watch(
  () => CartasPares.value.length, (nuevoLength) => {
    console.log(nuevoLength)
    if (nuevoLength === 12) {
      detener()
    }
  }
)

</script>

<template>
  <Header 
    :resetGame="resetGame" 
  />
  <Tablero 
    :tiempo="tiempoFormateado" 
    :puntaje="puntaje" 
    :tableroBloqueado="tableroBloqueado"
  />
  <div
    class="bg-gradient-to-r from-yellow-500 to-pink-500 rounded-3xl mx-auto w-6xl h-127 mt-4 p-3 flex flex-wrap justify-center gap-3"
  >
    <Cartas
      v-for="carta in numeros"
      :key="carta.id"
      :carta="carta"
      :tableroBloqueado="tableroBloqueado"
      @verificando="verificar"
    />
  </div>
</template>