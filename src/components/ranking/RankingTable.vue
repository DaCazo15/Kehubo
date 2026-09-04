<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getCountryName } from '../../helpers/countries'
import type { ScoreRecord } from '../../types'

defineProps<{
  records: ScoreRecord[]
  currentUserId?: string
}>()

function isUserRegistered(record: ScoreRecord): boolean {
  return !!(record.userId && record.userId !== 'anonimo')
}
</script>

<template>
  <div class="game-card-portal rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr class="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            <th class="py-3 px-4 w-14 text-center">Pos</th>
            <th class="py-3 px-4">Guerrero</th>
            <th class="py-3 px-4 hidden sm:table-cell">País</th>
            <th class="py-3 px-4 text-center">Tiempo</th>
            <th class="py-3 px-4 text-right">Puntuación</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr
            v-for="(item, index) in records"
            :key="item.id || index"
            class="hover:bg-slate-800/40 transition-colors"
            :class="{ 'bg-amber-500/5': item.userId && item.userId === currentUserId }"
          >
            <!-- Posición (Comienza en #4) -->
            <td class="py-3.5 px-4 font-black text-center text-slate-400">
              #{{ index + 4 }}
            </td>

            <!-- Guerrero y Avatar -->
            <td class="py-3.5 px-4">
              <component
                :is="isUserRegistered(item) ? RouterLink : 'div'"
                :to="isUserRegistered(item) ? ('/perfil/' + item.userId) : undefined"
                class="flex items-center gap-2.5 group cursor-pointer"
              >
                <img
                  v-if="item.photoURL"
                  :src="item.photoURL"
                  :alt="item.displayName || 'Avatar'"
                  class="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs"
                >
                  {{ (item.displayName || 'G').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <span class="font-bold text-slate-200 truncate group-hover:text-amber-400 transition block">
                    {{ item.displayName || 'Guerrero Anónimo' }}
                  </span>
                  <!-- Mobile country flag -->
                  <span v-if="item.country" class="sm:hidden text-[10px] text-slate-400 flex items-center gap-1">
                    <span :class="'flag:' + item.country.toUpperCase()" class="inline-block rounded-xs"></span>
                    <span>{{ getCountryName(item.country) }}</span>
                  </span>
                </div>
              </component>
            </td>

            <!-- País (Desktop) -->
            <td class="py-3.5 px-4 hidden sm:table-cell text-slate-300">
              <span v-if="item.country" class="flex items-center gap-1.5">
                <span :class="'flag:' + item.country.toUpperCase()" class="inline-block rounded-xs shadow-xs"></span>
                <span>{{ getCountryName(item.country) }}</span>
              </span>
              <span v-else class="text-slate-600">-</span>
            </td>

            <!-- Tiempo -->
            <td class="py-3.5 px-4 font-mono font-bold text-amber-300 text-center">
              {{ item.seconds }}s
            </td>

            <!-- Puntuación -->
            <td class="py-3.5 px-4 text-right font-black text-pink-400">
              {{ item.score }} pts
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
