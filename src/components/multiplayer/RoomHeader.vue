<script setup lang="ts">
import type { RoomPlayer, MultiplayerRoom } from '../../types'

defineProps<{
  currentRoom: MultiplayerRoom | null
  roomPlayers: RoomPlayer[]
  cardCount: number
}>()

const emit = defineEmits<{
  (e: 'leave'): void
}>()
</script>

<template>
  <header class="w-full bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 font-['Montserrat']">
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="emit('leave')"
        class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        title="Abandonar Sala"
      >
        <i class="bi bi-box-arrow-left text-sm"></i>
        <span class="hidden sm:inline">Salir de Sala</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-black tracking-wider">
          {{ currentRoom?.code || 'SALA' }}
        </span>
        <span class="text-xs text-slate-400 hidden sm:inline font-bold">
          ⚔️ Partida Competitiva ({{ cardCount }} Cartas)
        </span>
      </div>
    </div>

    <!-- Jugadores conectados -->
    <div class="flex items-center gap-2">
      <div class="flex -space-x-2 overflow-hidden">
        <div
          v-for="p in roomPlayers"
          :key="p.uid || p.id"
          class="h-7 w-7 rounded-full ring-2 ring-slate-950 object-cover bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center"
          :title="p.displayName"
        >
          <img v-if="p.photoURL" :src="p.photoURL" class="h-full w-full rounded-full object-cover" />
          <span v-else>{{ (p.displayName || 'G').charAt(0) }}</span>
        </div>
      </div>
      <span class="text-xs font-black text-slate-300">
        {{ roomPlayers.length }}/4
      </span>
    </div>
  </header>
</template>
