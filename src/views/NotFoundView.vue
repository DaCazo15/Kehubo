<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen pt-28 pb-20 bg-slate-950 text-slate-100 font-['Montserrat'] px-4 flex items-center justify-center">
    <div class="text-center space-y-6 max-w-md">
      <div class="w-24 h-24 rounded-full mx-auto bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/10 animate-pulse-glow text-amber-400">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
        Guerrero No Encontrado
      </h1>
      <p class="text-slate-400">
        El perfil que buscas no existe o te has perdido en el vacío. Vuelve a la base.
      </p>
      <div class="pt-4">
        <RouterLink 
          to="/" 
          class="game-btn-pink py-3 px-8 rounded-xl text-white font-black text-sm uppercase tracking-wider inline-block"
        >
          Volver al Inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>
