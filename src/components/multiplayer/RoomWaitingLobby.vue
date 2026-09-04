<script setup lang="ts">
import { ref } from 'vue'
import { getCountryName } from '../../helpers/countries'
import type { MultiplayerRoom, RoomPlayer } from '../../types'

const props = defineProps<{
  currentRoom: MultiplayerRoom | null
  roomPlayers: RoomPlayer[]
  isHost: boolean
  cardCount: number
  cartasVisibles: boolean
}>()

const emit = defineEmits<{
  (e: 'updateConfig', config: { cardCount?: number; cartasVisibles?: boolean }): void
  (e: 'startGame'): void
}>()

const copiedCode = ref<boolean>(false)
const copiedLink = ref<boolean>(false)

function copyCode() {
  if (props.currentRoom?.code) {
    navigator.clipboard.writeText(props.currentRoom.code)
    copiedCode.value = true
    setTimeout(() => { copiedCode.value = false }, 2000)
  }
}

function copyLink() {
  const url = window.location.origin + '/sala/' + (props.currentRoom?.code || '')
  navigator.clipboard.writeText(url)
  copiedLink.value = true
  setTimeout(() => { copiedLink.value = false }, 2000)
}
</script>

<template>
  <main class="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex items-center justify-center font-['Montserrat']">
    <div class="w-full game-card-portal rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl space-y-8">
      
      <!-- Código y Botones de Invitación -->
      <div class="text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
          <i class="bi bi-broadcast animate-pulse"></i>
          <span>Sala de Espera Privada</span>
        </div>

        <h2 class="text-2xl sm:text-4xl font-black uppercase text-slate-100 tracking-tight">
          Código de Invitación
        </h2>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <div class="text-3xl sm:text-4xl font-black tracking-widest text-amber-300 bg-slate-950 px-6 py-3 rounded-2xl border border-amber-500/50 shadow-inner font-mono">
            {{ currentRoom?.code }}
          </div>
          
          <div class="flex gap-2">
            <BaseButton
              variant="gold"
              size="sm"
              rounded="xl"
              @click="copyCode"
            >
              <template #icon-left>
                <i :class="copiedCode ? 'bi bi-check-circle-fill text-emerald-800' : 'bi bi-copy'"></i>
              </template>
              <span>{{ copiedCode ? '¡Copiado!' : 'Copiar Código' }}</span>
            </BaseButton>

            <BaseButton
              variant="pink"
              size="sm"
              rounded="xl"
              @click="copyLink"
            >
              <template #icon-left>
                <i :class="copiedLink ? 'bi bi-check-circle-fill' : 'bi bi-link-45deg text-base'"></i>
              </template>
              <span>{{ copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace' }}</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Cuadrícula de Jugadores Conectados (Máximo 4) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-300">
            Guerreros en Sala ({{ roomPlayers.length }}/4)
          </h3>
          <span class="text-[11px] text-slate-500">Mínimo 1 jugador para iniciar</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            v-for="(p, i) in roomPlayers"
            :key="p.uid || p.id"
            class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 relative"
          >
            <!-- Badge de Host -->
            <span
              v-if="p.uid === currentRoom?.hostId"
              class="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm"
            >
              Líder
            </span>

            <div class="relative">
              <img
                v-if="p.photoURL"
                :src="p.photoURL"
                :alt="p.displayName"
                class="w-11 h-11 rounded-full object-cover border border-amber-400/50"
              />
              <div
                v-else
                class="w-11 h-11 rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm"
              >
                {{ (p.displayName || 'G').charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="min-w-0">
              <p class="text-xs font-black text-slate-100 truncate">
                {{ p.displayName || 'Guerrero ' + (i + 1) }}
              </p>
              <p v-if="p.country" class="text-[10px] text-slate-400 flex items-center gap-1">
                <span :class="'flag:' + p.country.toUpperCase()" class="inline-block rounded-xs"></span>
                <span>{{ getCountryName(p.country) }}</span>
              </p>
            </div>
          </div>

          <!-- Slots vacíos -->
          <div
            v-for="idx in (4 - roomPlayers.length)"
            :key="'empty-' + idx"
            class="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/40 border-dashed flex items-center justify-center gap-2 text-slate-600 text-xs font-bold"
          >
            <i class="bi bi-person-plus text-base"></i>
            <span>Esperando...</span>
          </div>
        </div>
      </div>

      <!-- Ajustes de Partida (Moderador) -->
      <div v-if="isHost" class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <h4 class="text-xs font-black uppercase text-amber-400">
          Ajustes de Partida (Solo Líder)
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <!-- Cartas -->
          <div class="space-y-1">
            <label class="text-slate-400 font-bold uppercase text-[10px]">Cantidad de Cartas</label>
            <select
              :value="cardCount"
              @change="emit('updateConfig', { cardCount: Number(($event.target as HTMLSelectElement).value) })"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none cursor-pointer"
            >
              <option :value="16">16 Cartas (8 Pares)</option>
              <option :value="24">24 Cartas (12 Pares)</option>
              <option :value="32">32 Cartas (16 Pares)</option>
              <option :value="40">40 Cartas (20 Pares)</option>
            </select>
          </div>

          <!-- Cartas Visibles -->
          <div class="space-y-1">
            <label class="text-slate-400 font-bold uppercase text-[10px]">Visibilidad de Inicio</label>
            <select
              :value="cartasVisibles ? 'true' : 'false'"
              @change="emit('updateConfig', { cartasVisibles: ($event.target as HTMLSelectElement).value === 'true' })"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none cursor-pointer"
            >
              <option value="false">Cartas Ocultas (A ciegas)</option>
              <option value="true">Cartas Visibles (5s de memorización)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Botón de Inicio / Espera -->
      <div class="pt-2 text-center">
        <BaseButton
          v-if="isHost"
          variant="gold"
          size="lg"
          rounded="2xl"
          block
          @click="emit('startGame')"
        >
          <template #icon-left>
            <i class="bi bi-play-fill text-xl"></i>
          </template>
          <span>Iniciar Partida Multijugador</span>
        </BaseButton>

        <div v-else class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
          <div class="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Esperando a que el moderador inicie la partida...</span>
        </div>
      </div>

    </div>
  </main>
</template>
