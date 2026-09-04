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
  <header class="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 shadow-md border-b border-slate-700/80 font-['Montserrat']">
    <div
      class="mx-auto max-w-6xl py-2 sm:py-3 px-3 sm:px-6 flex justify-between items-center"
    >
      <div class="flex items-center gap-2 sm:gap-4">
        <RouterLink :to="{ name: 'home' }" v-if="volver" class="flex items-center gap-1.5 sm:gap-2 group" title="Volver al Inicio">
          <img 
            :src="img.isologo" 
            :alt="img.isologo"
            class="h-8 sm:h-10 w-auto transition-transform group-hover:scale-105"
          />
          <span class="font-black text-xs sm:text-base tracking-wider text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200 flex items-center gap-1">
            <i class="bi bi-arrow-left text-amber-300 text-xs sm:text-sm"></i>
            <span class="hidden xs:inline sm:inline">Inicio</span>
          </span>
        </RouterLink>
        <img 
          v-else
          :src="img.isologo" 
          :alt="img.isologo"
          class="h-8 sm:h-10 w-auto transition-transform group-hover:scale-105"
        />
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="resetGame"
          class="bg-pink-500 hover:bg-pink-600 active:bg-pink-700
                 text-white font-bold text-xs sm:text-sm
                 py-1.5 px-3 sm:py-2 sm:px-5 rounded-xl shadow-md shadow-pink-900/40
                 transition-all duration-300 ease-in-out transform hover:scale-105 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <i class="bi bi-arrow-repeat text-sm"></i>
          <span>Reiniciar</span>
        </button>
      </div>
    </div>
  </header>
</template>
