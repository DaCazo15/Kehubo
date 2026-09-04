<script setup lang="ts">
defineProps<{
  tiempo: string
  puntaje: number
  totalPares?: number
  paresEncontrados?: number
  cardCount?: number
  tableroBloqueado: boolean
  animatingScore?: string
  animatingTime?: string
}>()
</script>

<template>
  <div class="bg-slate-900/90 border-b border-slate-800 py-2 sm:py-3 px-3 sm:px-6 shadow-xl font-['Montserrat'] shrink-0">
    <div class="mx-auto max-w-6xl flex justify-between items-center gap-2 sm:gap-4">
      
      <!-- Puntos y Pares -->
      <div class="flex items-center gap-2 sm:gap-6">
        <!-- Puntos -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="text-[10px] sm:text-xs font-bold uppercase text-slate-400">Puntos</span>
          <div 
            class="font-black text-xs sm:text-base px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl flex items-center gap-1 shadow-sm transition-all duration-300"
            :class="{
              'bg-amber-500/20 border border-amber-500/40 text-amber-300': !animatingScore,
              'bg-green-500/80 border border-green-400 text-green-100 scale-110 shadow-lg shadow-green-500/40': animatingScore === 'correct',
              'bg-red-500/80 border border-red-400 text-red-100 scale-95 shadow-lg shadow-red-500/40': animatingScore === 'wrong'
            }"
          >
            <i class="bi bi-star-fill text-[10px] sm:text-xs" :class="animatingScore ? 'text-white' : 'text-amber-400'"></i>
            <span>{{ puntaje }}</span>
          </div>
        </div>

        <!-- Pares Encontrados -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="text-[10px] sm:text-xs font-bold uppercase text-slate-400">Pares</span>
          <div class="bg-slate-800/80 border border-slate-700 text-slate-200 font-black text-xs sm:text-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl">
            <span class="text-pink-400">{{ paresEncontrados }}</span>
            <span class="text-slate-500">/</span>
            <span>{{ totalPares }}</span>
          </div>
        </div>
      </div>

      <!-- Dificultad & Tiempo -->
      <div class="flex items-center gap-2 sm:gap-6">
        <!-- Dificultad Badge -->
        <div class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <i class="bi bi-grid-3x3 text-amber-400"></i>
          <span>{{ cardCount }} Cartas</span>
        </div>

        <!-- Cronómetro -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="text-[10px] sm:text-xs font-bold uppercase text-slate-400">Tiempo</span>
          <div 
            class="font-mono font-black text-xs sm:text-base px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl flex items-center gap-1.5 border transition-all duration-300"
            :class="{
              'bg-slate-950/80 border-slate-800 text-slate-500': tableroBloqueado && !animatingTime,
              'bg-pink-500/20 border-pink-500/40 text-pink-300 shadow-sm': !tableroBloqueado && !animatingTime,
              'bg-green-500/80 border-green-400 text-green-100 scale-110 shadow-lg shadow-green-500/40': animatingTime === 'correct',
              'bg-red-500/80 border-red-400 text-red-100 scale-95 shadow-lg shadow-red-500/40': animatingTime === 'wrong'
            }"
          >
            <i class="bi bi-stopwatch text-xs sm:text-sm"></i>
            <span>{{ tiempo }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
