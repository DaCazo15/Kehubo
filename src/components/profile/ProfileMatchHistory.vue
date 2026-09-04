<script setup lang="ts">
import { formatMatchDate } from '../../helpers/dateUtils'
import type { ScoreRecord } from '../../types'

defineProps<{
  matchHistory: ScoreRecord[]
  bestMatches: ScoreRecord[]
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Mejores Récords / Medallas -->
    <div v-if="bestMatches.length > 0" class="game-card-portal rounded-3xl p-6 border border-amber-500/30 space-y-4">
      <div class="flex items-center gap-2.5">
        <i class="bi bi-trophy-fill text-amber-400 text-lg"></i>
        <h3 class="text-sm font-black uppercase text-slate-100 tracking-wider">
          Mejores Hazañas
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          v-for="(rec, idx) in bestMatches"
          :key="rec.id || idx"
          class="p-4 rounded-2xl bg-slate-950/70 border text-center space-y-1"
          :class="idx === 0 ? 'border-amber-400/60 shadow-lg shadow-amber-500/10' : idx === 1 ? 'border-slate-400/40' : 'border-amber-700/40'"
        >
          <span
            class="inline-block text-xs font-black px-2 py-0.5 rounded-md mb-1 uppercase"
            :class="idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-amber-700 text-white'"
          >
            #{{ idx + 1 }}
          </span>
          <p class="text-xl font-black text-amber-300 font-mono">{{ rec.seconds ?? 0 }}s</p>
          <p class="text-[11px] text-pink-400 font-bold">{{ rec.score }} Puntos</p>
          <p class="text-[10px] text-slate-500">{{ formatMatchDate(rec.createdAt || (rec as any).timestamp) }}</p>
        </div>
      </div>
    </div>

    <!-- Historial de Partidas Recientes -->
    <div class="game-card-portal rounded-3xl p-6 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <i class="bi bi-clock-history text-slate-400 text-lg"></i>
          <h3 class="text-sm font-black uppercase text-slate-100 tracking-wider">
            Historial de Duelos
          </h3>
        </div>
        <span class="text-xs text-slate-500 font-bold">{{ matchHistory.length }} registradas</span>
      </div>

      <div v-if="matchHistory.length === 0" class="py-8 text-center text-xs text-slate-500">
        Aún no hay partidas registradas en el historial.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <th class="py-2.5 px-3">Fecha</th>
              <th class="py-2.5 px-3">Cartas</th>
              <th class="py-2.5 px-3">Tiempo</th>
              <th class="py-2.5 px-3 text-right">Puntaje</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40">
            <tr
              v-for="match in matchHistory"
              :key="match.id"
              class="hover:bg-slate-800/30 transition-colors"
            >
              <td class="py-2.5 px-3 text-slate-400">{{ formatMatchDate(match.createdAt || (match as any).timestamp) }}</td>
              <td class="py-2.5 px-3 font-semibold text-slate-300">{{ match.dificultad || match.difficulty || (match as any).cardCount || 24 }} Cartas</td>
              <td class="py-2.5 px-3 font-mono text-amber-300 font-bold">{{ match.seconds ?? 0 }}s</td>
              <td class="py-2.5 px-3 text-right font-black text-pink-400">{{ match.score }} pts</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
