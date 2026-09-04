<script setup lang="ts">
import { formatCompactNumber } from '../../helpers/numberUtils'

defineProps<{
  accountAge?: string
  totalGames: number
  bestTime: string
  totalScore: number
  globalRank: number | null
  countryName?: string | null
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <!-- Partidas Jugadas -->
    <div class="game-card-portal rounded-2xl p-4 border border-amber-500/20 text-center space-y-1">
      <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-sm">
        <i class="bi bi-controller"></i>
      </div>
      <p class="text-xl sm:text-2xl font-black text-amber-300">{{ totalGames }}</p>
      <p class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Partidas</p>
    </div>

    <!-- Mejor Tiempo -->
    <div class="game-card-portal rounded-2xl p-4 border border-pink-500/20 text-center space-y-1">
      <div class="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto text-sm">
        <i class="bi bi-stopwatch"></i>
      </div>
      <p class="text-xl sm:text-2xl font-black text-pink-400 font-mono">{{ bestTime }}</p>
      <p class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Mejor Tiempo</p>
    </div>

    <!-- Score Total -->
    <div class="game-card-portal rounded-2xl p-4 border border-amber-500/20 text-center space-y-1">
      <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-sm">
        <i class="bi bi-trophy-fill"></i>
      </div>
      <p class="text-xl sm:text-2xl font-black text-amber-300" :title="totalScore.toLocaleString()">
        {{ formatCompactNumber(totalScore) }}
      </p>
      <p class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Score Total</p>
    </div>

    <!-- Rango Global -->
    <div class="game-card-portal rounded-2xl p-4 border border-pink-500/20 text-center space-y-1">
      <div class="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto text-sm">
        <i class="bi bi-globe2"></i>
      </div>
      <p class="text-xl sm:text-2xl font-black text-pink-400">
        {{ globalRank ? '#' + globalRank : '-' }}
      </p>
      <p class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Ranking Global</p>
    </div>
  </div>
</template>
