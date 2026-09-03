<script setup>
import { RouterLink } from 'vue-router'
import { img } from '../helpers/imagenes'

defineProps({
  resetGame: {
    type: Function,
    required: true
  },
  volver: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <header class="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700/80 font-['Montserrat']">
    <div
      class="mx-auto max-w-6xl py-4 px-4 sm:px-6 flex justify-between items-center"
    >
      <div class="flex items-center gap-4">
        <RouterLink :to="{ name: 'home' }" v-if="volver" class="flex items-center gap-2 group" title="Volver al Inicio">
          <img 
            :src="img.isologo" 
            :alt="img.isologo"
            class="h-12 w-auto transition-transform group-hover:scale-105"
          />
          <span class="font-black text-xl tracking-wider text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200 flex items-center gap-2">
            <i class="bi bi-arrow-left text-amber-300"></i>
            <span>Volver al Inicio</span>
          </span>
        </RouterLink>
        <img 
          v-else
          :src="img.isologo" 
          :alt="img.isologo"
          class="h-12 w-auto transition-transform group-hover:scale-105"
        />
      </div>

      <div class="flex items-center gap-3">
        <RouterLink
          to="/"
          class="sm:hidden text-xs font-bold text-slate-300 hover:text-amber-400 px-3 py-2 rounded-lg bg-slate-800"
        >
          Inicio
        </RouterLink>
        <button
          @click="resetGame"
          class="bg-pink-500 hover:bg-pink-600 active:bg-pink-700
                 text-white font-bold text-sm sm:text-base
                 py-2.5 px-6 rounded-xl shadow-md shadow-pink-900/50
                 transition-all duration-300 ease-in-out transform hover:scale-105 uppercase tracking-wider"
        >
          Reiniciar Juego
        </button>
      </div>
    </div>
  </header>
</template>
