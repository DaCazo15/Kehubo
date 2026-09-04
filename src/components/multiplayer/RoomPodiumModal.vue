<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getCountryName } from '../../helpers/countries'
import type { RoomPlayer } from '../../types'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    players: RoomPlayer[]
    currentUserId: string
    isHost?: boolean
  }>(),
  {
    isHost: false
  }
)

const emit = defineEmits<{
  (e: 'play-again'): void
  (e: 'leave'): void
}>()

const winner = computed(() => props.players[0] || null)
const isCurrentWinner = computed(() => winner.value?.uid === props.currentUserId)

const podiumStyles = [
  { rank: '1º Lugar', crown: '👑', border: 'border-amber-400 bg-amber-500/10 text-amber-300', badge: 'bg-amber-400 text-slate-950 font-black' },
  { rank: '2º Lugar', crown: '🥈', border: 'border-slate-400 bg-slate-500/10 text-slate-200', badge: 'bg-slate-300 text-slate-950 font-black' },
  { rank: '3º Lugar', crown: '🥉', border: 'border-amber-700 bg-amber-800/10 text-amber-400', badge: 'bg-amber-700 text-white font-black' },
  { rank: '4º Lugar', crown: '⚔️', border: 'border-slate-800 bg-slate-900/50 text-slate-400', badge: 'bg-slate-800 text-slate-400 font-bold' }
]
</script>

<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-['Montserrat'] select-none"
  >
    <div class="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-6 text-center">
      
      <!-- Trofeo e Introducción -->
      <div class="space-y-2">
        <div class="w-16 h-16 rounded-full mx-auto bg-amber-500/10 border-2 border-amber-400/50 flex items-center justify-center text-3xl text-amber-400 shadow-xl shadow-amber-500/10">
          <i class="bi bi-trophy-fill"></i>
        </div>
        
        <h2 class="text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
          {{ isCurrentWinner ? '¡Victoria Magistral!' : 'Batalla Concluida' }}
        </h2>
        <p class="text-xs text-slate-400">
          Resultados finales del combate en sala multijugador
        </p>
      </div>

      <!-- Podio de Participantes -->
      <div class="space-y-2.5 text-left">
        <div
          v-for="(player, idx) in players"
          :key="player.uid || player.id"
          class="p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md"
          :class="[
            podiumStyles[idx]?.border || podiumStyles[3].border,
            player.uid === currentUserId ? 'ring-2 ring-amber-400/60' : ''
          ]"
        >
          <!-- Puesto & Info -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- Insignia -->
            <span class="text-base">{{ podiumStyles[idx]?.crown || '⚔️' }}</span>

            <!-- Avatar -->
            <div class="relative w-10 h-10 shrink-0">
              <img
                v-if="player.photoURL"
                :src="player.photoURL"
                alt="Avatar"
                referrerpolicy="no-referrer"
                class="w-full h-full rounded-full object-cover border border-amber-400/50"
              />
              <div
                v-else
                class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-400/50"
              >
                {{ (player.displayName || 'G').charAt(0).toUpperCase() }}
              </div>
              <span
                v-if="player.country"
                :class="'flag:' + player.country.toUpperCase()"
                class="absolute -bottom-1 -right-1 w-4 h-3 rounded-2xs shadow-xs"
              ></span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <h4 class="text-sm font-black truncate text-slate-100">
                  {{ player.displayName || 'Guerrero' }}
                </h4>
                <span 
                  v-if="player.uid === currentUserId"
                  class="text-[9px] font-black uppercase px-1 rounded-xs bg-amber-400 text-slate-950"
                >
                  Tú
                </span>
              </div>
              <div class="text-xs text-slate-400">
                <span v-if="player.finishTime" class="text-emerald-400 font-semibold">
                  ⏱️ {{ player.finishTime }}
                </span>
                <span v-else>
                  Pares: {{ player.pairsFound || 0 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Puntos -->
          <div class="text-right shrink-0">
            <div class="text-lg font-black text-amber-300">
              {{ player.score || 0 }} <span class="text-xs text-slate-400 font-normal">pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nota de Aislamiento de Ranking -->
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
        🛡️ <span class="font-bold text-slate-300">Partida de Exhibición:</span> Este resultado es exclusivo de esta sala y no afecta el ranking global ni local.
      </div>

      <!-- Botones de Acción -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          v-if="isHost"
          @click="emit('play-again')"
          class="flex-1 game-btn-gold py-3 px-6 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <i class="bi bi-arrow-repeat text-base"></i>
          <span>Jugar Otra Ronda</span>
        </button>

        <button
          @click="emit('leave')"
          class="flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
        >
          <i class="bi bi-box-arrow-left text-base"></i>
          <span>Salir al Menú</span>
        </button>
      </div>

    </div>
  </div>
</template>
