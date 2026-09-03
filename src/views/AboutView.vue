<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen pt-28 pb-20 bg-slate-950 text-slate-100 font-['Montserrat'] px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto space-y-12">
      
      <!-- Cabecera -->
      <div class="text-center space-y-3">
        <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
          ACERCA DE KEHUBO
        </h1>
        <p class="text-sm text-slate-400 max-w-xl mx-auto">
          Un portal interactivo de cartas concebido para desafiar la velocidad mental de los estrategas.
        </p>
      </div>

      <!-- Secciones de Historia y Reglas -->
      <div class="space-y-8">
        
        <!-- Tarjeta 1: La Misión -->
        <div class="game-card-portal rounded-2xl p-8 space-y-4">
          <h2 class="text-xl font-black uppercase text-amber-300 flex items-center gap-2.5">
            <i class="bi bi-bullseye text-amber-400 text-2xl"></i>
            <span>La Misión del Juego</span>
          </h2>
          <p class="text-sm text-slate-300 leading-relaxed">
            Kehubo nace como un homenaje a los juegos de mesa clásicos combinados con el pulido visual y la adrenalina de los portales RPG. El objetivo es simple pero implacable: desbloquear y emparejar 12 cartas gemelas en el menor tiempo posible, minimizando errores y maximizando la puntuación.
          </p>
        </div>

        <!-- Tarjeta 2: Reglas del Duelo -->
        <div class="game-card-portal rounded-2xl p-8 space-y-4">
          <h2 class="text-xl font-black uppercase text-pink-400 flex items-center gap-2.5">
            <i class="bi bi-journal-text text-pink-400 text-2xl"></i>
            <span>Leyes de la Arena</span>
          </h2>
          <ul class="space-y-3 text-sm text-slate-300">
            <li class="flex items-start gap-3">
              <span class="text-amber-400 font-bold">1.</span>
              <span><strong>El Tablero:</strong> Contiene 12 parejas de cartas barajadas de forma impredecible al iniciar cada duelo.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-amber-400 font-bold">2.</span>
              <span><strong>Cronómetro Implacable:</strong> Cada segundo suma a tu tiempo total. Los mejores estrategas resuelven el tablero en menos de 30 segundos.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-amber-400 font-bold">3.</span>
              <span><strong>Puntuación Progresiva:</strong> Cada par correcto te otorga +10 puntos. Completar los 12 pares te otorga el estatus de Maestro del Tablero con 120 puntos.</span>
            </li>
          </ul>
        </div>

        <!-- Tarjeta 3: Arquitectura Técnica -->
        <div class="game-card-portal rounded-2xl p-8 space-y-4">
          <h2 class="text-xl font-black uppercase text-amber-300 flex items-center gap-2.5">
            <i class="bi bi-shield-shaded text-amber-400 text-2xl"></i>
            <span>Forjado con Tecnologías Modernas</span>
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-center text-xs">
            <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <p class="font-bold text-amber-400">Vue 3</p>
              <p class="text-slate-500">Composition API</p>
            </div>
            <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <p class="font-bold text-pink-400">Tailwind CSS 4</p>
              <p class="text-slate-500">Ultra Fast Styling</p>
            </div>
            <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <p class="font-bold text-amber-300">Pinia</p>
              <p class="text-slate-500">Global State</p>
            </div>
            <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <p class="font-bold text-pink-300">Firebase & Auth</p>
              <p class="text-slate-500">Cloud Sync</p>
            </div>
          </div>
        </div>

      </div>

      <!-- CTA Inferior -->
      <div class="text-center pt-4">
        <RouterLink 
          :to="{ name: 'game-rapido' }" 
          class="inline-flex game-btn-pink py-3.5 px-8 rounded-xl text-white font-black text-sm uppercase tracking-wider items-center gap-2"
        >
          <span>Comenzar a Jugar Ahora</span>
          <span>→</span>
        </RouterLink>
      </div>

    </div>
  </div>
</template>
