<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getCountryName } from '../../helpers/countries'
import type { RoomPlayer } from '../../types'
import BaseModal from '../common/BaseModal.vue'

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
  <BaseModal
    :is-open="isOpen"
    size="xl"
    :show-close="false"
    :close-on-escape="false"
    :close-on-outside-click="false"
  >
    <!-- Trofeo e Introducción -->
    <template #header>
      <div class="text-center space-y-2">
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto bg-amber-500/10 border-2 border-amber-400/50 flex items-center justify-center text-2xl sm:text-3xl text-amber-400 shadow-xl shadow-amber-500/10">
          <i class="bi bi-trophy-fill"></i>
        </div>
        
        <h2 class="text-xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
          {{ isCurrentWinner ? '¡Victoria Magistral!' : 'Batalla Concluida' }}
        </h2>
        <p class="text-xs text-slate-400">
          Resultados finales del combate en sala multijugador
        </p>
      </div>
    </template>

    <div class="space-y-3 select-none">
      <!-- Podio de Participantes -->
      <div class="space-y-2 text-left">
        <div
          v-for="(player, idx) in players"
          :key="player.uid || player.id"
          class="p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-2.5 sm:gap-3 shadow-md transition-all"
          :class="[
            podiumStyles[idx]?.border || podiumStyles[3].border,
            player.uid === currentUserId ? 'ring-2 ring-amber-400/60' : ''
          ]"
        >
          <!-- Puesto & Info -->
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <!-- Insignia -->
            <span class="text-base shrink-0">{{ podiumStyles[idx]?.crown || '⚔️' }}</span>

            <!-- Avatar -->
            <div class="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
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
                <h4 class="text-xs sm:text-sm font-black truncate text-slate-100">
                  {{ player.displayName || 'Guerrero' }}
                </h4>
                <span 
                  v-if="player.uid === currentUserId"
                  class="text-[9px] font-black uppercase px-1 rounded-xs bg-amber-400 text-slate-950"
                >
                  Tú
                </span>
              </div>
              <div class="text-[11px] sm:text-xs text-slate-400">
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
            <div class="text-base sm:text-lg font-black text-amber-300">
              {{ player.score || 0 }} <span class="text-[10px] sm:text-xs text-slate-400 font-normal">pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nota de Aislamiento de Ranking -->
      <div class="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
        🛡️ <span class="font-bold text-slate-300">Partida de Exhibición:</span> Este resultado es exclusivo de esta sala y no afecta el ranking global.
      </div>
    </div>

    <!-- Botones de Acción en Footer -->
    <template #footer>
      <div class="flex flex-col sm:flex-row gap-2.5">
        <BaseButton
          v-if="isHost"
          @click="emit('play-again')"
          variant="gold"
          size="md"
          rounded="xl"
          class="flex-1"
        >
          <template #icon-left>
            <i class="bi bi-arrow-repeat text-base"></i>
          </template>
          <span>Jugar Otra Ronda</span>
        </BaseButton>

        <BaseButton
          @click="emit('leave')"
          variant="slate"
          size="md"
          rounded="xl"
          class="flex-1"
        >
          <template #icon-left>
            <i class="bi bi-box-arrow-left text-base"></i>
          </template>
          <span>Salir al Menú</span>
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
