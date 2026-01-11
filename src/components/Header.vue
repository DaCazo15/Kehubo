<script setup>
  import { img } from '../helpers/imagenes';
defineProps({
  resetGame: {
    type: Function,
    required: true
  }
})
</script>

<template>
  <header class="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
    <div
      class="mx-auto max-w-6xl py-5 pr-8 flex justify-between items-center border-b border-slate-700"
    >
      <img 
        :src="img.isologo" 
        :alt="img.isologo"
        class=" h-14 w-auto"
      >
      <button
        @click="resetGame"
        class="bg-pink-500 hover:bg-pink-600 active:bg-pink-700
               text-white font-bold text-lg md:text-xl
               py-2 px-6 rounded-xl shadow-md shadow-pink-900
               transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        Reiniciar Juego
      </button>
    </div>
  </header>
</template>