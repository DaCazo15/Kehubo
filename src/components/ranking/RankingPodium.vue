<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getCountryName } from '../../helpers/countries'
import type { ScoreRecord } from '../../types'

defineProps<{
  topThree: ScoreRecord[]
}>()

function isUserRegistered(record: ScoreRecord): boolean {
  return !!(record.userId && record.userId !== 'anonimo')
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
    <!-- Top 2: Plata (Izquierda en desktop) -->
    <div v-if="topThree[1]" class="order-2 md:order-1 flex flex-col items-center">
      <div class="relative w-full max-w-xs game-card-portal rounded-3xl p-6 border-2 border-slate-400/50 text-center space-y-4 shadow-xl">
        <span class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-slate-300 text-slate-950 font-black text-xs uppercase tracking-widest shadow-md">
          #2 Plata
        </span>

        <div class="pt-2">
          <component
            :is="isUserRegistered(topThree[1]) ? RouterLink : 'div'"
            :to="isUserRegistered(topThree[1]) ? ('/perfil/' + topThree[1].userId) : undefined"
            class="group inline-block"
          >
            <div class="w-16 h-16 rounded-full mx-auto p-0.5 bg-slate-400/50 shadow-md">
              <img
                v-if="topThree[1].photoURL"
                :src="topThree[1].photoURL"
                :alt="topThree[1].displayName || 'Jugador'"
                class="w-full h-full rounded-full object-cover"
              />
              <div v-else class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-slate-300">
                {{ (topThree[1].displayName || 'G').charAt(0).toUpperCase() }}
              </div>
            </div>
            <p class="font-black text-sm text-slate-200 mt-2 truncate max-w-40 mx-auto group-hover:text-amber-400 transition">
              {{ topThree[1].displayName || 'Guerrero Anónimo' }}
            </p>
          </component>

          <p v-if="topThree[1].country" class="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
            <span :class="'flag:' + topThree[1].country.toUpperCase()" class="inline-block rounded-xs"></span>
            <span>{{ getCountryName(topThree[1].country) }}</span>
          </p>
        </div>

        <div class="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
          <p class="text-xs uppercase font-bold text-slate-400">Tiempo</p>
          <p class="text-2xl font-black text-amber-300 font-mono">{{ topThree[1].seconds }}s</p>
          <p class="text-xs font-bold text-pink-400">{{ topThree[1].score }} pts</p>
        </div>
      </div>
    </div>

    <!-- Top 1: Oro (Centro, Más Alto) -->
    <div v-if="topThree[0]" class="order-1 md:order-2 flex flex-col items-center -mt-6">
      <div class="relative w-full max-w-sm game-card-portal rounded-3xl p-8 border-2 border-amber-400 text-center space-y-4 shadow-2xl shadow-amber-500/20">
        <div class="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-5 py-1.5 rounded-full bg-linear-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl border border-amber-300 animate-pulse">
          <i class="bi bi-crown-fill text-sm"></i>
          <span>#1 Campeón</span>
        </div>

        <div class="pt-3">
          <component
            :is="isUserRegistered(topThree[0]) ? RouterLink : 'div'"
            :to="isUserRegistered(topThree[0]) ? ('/perfil/' + topThree[0].userId) : undefined"
            class="group inline-block"
          >
            <div class="w-20 h-20 rounded-full mx-auto p-1 bg-linear-to-tr from-amber-400 via-pink-500 to-amber-200 shadow-xl shadow-amber-500/30">
              <img
                v-if="topThree[0].photoURL"
                :src="topThree[0].photoURL"
                :alt="topThree[0].displayName || 'Campeón'"
                class="w-full h-full rounded-full object-cover"
              />
              <div v-else class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-amber-400 text-2xl">
                {{ (topThree[0].displayName || 'C').charAt(0).toUpperCase() }}
              </div>
            </div>
            <p class="font-black text-base text-slate-100 mt-2.5 truncate max-w-48 mx-auto group-hover:text-amber-400 transition">
              {{ topThree[0].displayName || 'Guerrero Leyenda' }}
            </p>
          </component>

          <p v-if="topThree[0].country" class="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
            <span :class="'flag:' + topThree[0].country.toUpperCase()" class="inline-block rounded-xs"></span>
            <span>{{ getCountryName(topThree[0].country) }}</span>
          </p>
        </div>

        <div class="p-4 bg-slate-950/90 rounded-2xl border border-amber-500/30 space-y-1">
          <p class="text-xs uppercase font-bold text-amber-400">Récord Invicto</p>
          <p class="text-3xl font-black text-amber-300 font-mono">{{ topThree[0].seconds }}s</p>
          <p class="text-sm font-black text-pink-400">{{ topThree[0].score }} pts</p>
        </div>
      </div>
    </div>

    <!-- Top 3: Bronce (Derecha en desktop) -->
    <div v-if="topThree[2]" class="order-3 flex flex-col items-center">
      <div class="relative w-full max-w-xs game-card-portal rounded-3xl p-6 border-2 border-amber-700/50 text-center space-y-4 shadow-xl">
        <span class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-700 text-slate-100 font-black text-xs uppercase tracking-widest shadow-md">
          #3 Bronce
        </span>

        <div class="pt-2">
          <component
            :is="isUserRegistered(topThree[2]) ? RouterLink : 'div'"
            :to="isUserRegistered(topThree[2]) ? ('/perfil/' + topThree[2].userId) : undefined"
            class="group inline-block"
          >
            <div class="w-16 h-16 rounded-full mx-auto p-0.5 bg-amber-700/50 shadow-md">
              <img
                v-if="topThree[2].photoURL"
                :src="topThree[2].photoURL"
                :alt="topThree[2].displayName || 'Jugador'"
                class="w-full h-full rounded-full object-cover"
              />
              <div v-else class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-amber-600">
                {{ (topThree[2].displayName || 'G').charAt(0).toUpperCase() }}
              </div>
            </div>
            <p class="font-black text-sm text-slate-200 mt-2 truncate max-w-40 mx-auto group-hover:text-amber-400 transition">
              {{ topThree[2].displayName || 'Guerrero Anónimo' }}
            </p>
          </component>

          <p v-if="topThree[2].country" class="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
            <span :class="'flag:' + topThree[2].country.toUpperCase()" class="inline-block rounded-xs"></span>
            <span>{{ getCountryName(topThree[2].country) }}</span>
          </p>
        </div>

        <div class="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
          <p class="text-xs uppercase font-bold text-slate-400">Tiempo</p>
          <p class="text-2xl font-black text-amber-300 font-mono">{{ topThree[2].seconds }}s</p>
          <p class="text-xs font-bold text-pink-400">{{ topThree[2].score }} pts</p>
        </div>
      </div>
    </div>
  </div>
</template>
