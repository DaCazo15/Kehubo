<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '../types'
import { obtenerNombreAnimal } from '../helpers/animales'

const props = withDefaults(
  defineProps<{
    carta: Card
    tableroBloqueado: boolean
    cardCount?: number
    cardHeight?: number
    cardWidth?: number
  }>(),
  {
    cardCount: 24,
    cardHeight: 0,
    cardWidth: 0
  }
)

const emit = defineEmits<{
  (e: 'verificando', id: number): void
}>()

const isShaking = ref<boolean>(false)

function handleClick() {
  if (props.carta.isDummy) {
    // Animación de sacudida (shake) al intentar voltear una carta obstáculo
    if (!isShaking.value) {
      isShaking.value = true
      setTimeout(() => {
        isShaking.value = false
      }, 400)
    }
    return
  }

  if (!props.tableroBloqueado && !props.carta.revelada && !props.carta.encontrada) {
    emit('verificando', props.carta.id)
  }
}

function isImageValue(val: number | string | null): boolean {
  if (typeof val !== 'string') return false
  return val.startsWith('data:') || val.includes('/') || val.includes('.png') || val.includes('.webp') || val.includes('.avif') || val.includes('.svg')
}
</script>

<template>
  <div
    class="w-full h-full min-h-0 min-w-0 flex items-center justify-center select-none"
    :style="{
      ...(cardHeight ? { height: `${cardHeight}px` } : {}),
      ...(cardWidth ? { width: `${cardWidth}px` } : {})
    }"
  >
    <!-- Carta Dummy (Obstáculo/Bloqueo) -->
    <div
      v-if="carta.isDummy"
      class="h-full max-h-full aspect-3/4 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-200 transform cursor-not-allowed perspective-1000 flex flex-col justify-center items-center overflow-hidden"
      :class="{ 'animate-shake': isShaking }"
      @click="handleClick"
    >
      <div
        class="w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 border sm:border-2 border-slate-800/80 hover:border-red-500/40 flex flex-col items-center justify-center p-0.5 sm:p-1 shadow-inner opacity-65 hover:opacity-85 transition-all duration-200 overflow-hidden group"
      >
        <div 
          class="rounded-md sm:rounded-lg bg-slate-900/80 border border-slate-800 group-hover:border-red-500/30 flex items-center justify-center text-slate-600 group-hover:text-red-400/80 transition-all shrink-0"
          :class="cardCount >= 32 ? 'w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-xs' : 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-xs sm:text-sm'"
        >
          <i class="bi bi-lock-fill"></i>
        </div>
      </div>
    </div>

    <!-- Carta Regular de Juego -->
    <div
      v-else
      class="h-full max-h-full aspect-3/4 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 transform cursor-pointer perspective-1000 flex flex-col justify-center items-center overflow-hidden"
      :class="[
        carta.encontrada 
          ? 'opacity-80 scale-95 pointer-events-none cursor-default' 
          : 'hover:-translate-y-0.5 hover:shadow-lg active:scale-95',
        tableroBloqueado && !carta.revelada ? 'cursor-not-allowed opacity-75' : ''
      ]"
      @click="handleClick"
    >
      <!-- Carta Cara (Revelada o Encontrada) -->
      <div
        v-if="carta.revelada || carta.encontrada"
        class="w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl flex flex-col items-center justify-between p-1 sm:p-1.5 border sm:border-2 transition-all duration-300 overflow-hidden"
        :class="carta.encontrada 
          ? 'bg-linear-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-400/80 text-emerald-300 shadow-md shadow-emerald-500/20' 
          : 'bg-linear-to-br from-amber-500/20 via-slate-900 to-slate-950 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40'"
      >
        <!-- Badge de Estado (Estrella / Check) -->
        <div 
          class="rounded-full flex items-center justify-center shrink-0 z-10"
          :class="[
            cardCount >= 32 ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-[6.5px] sm:text-[8px]' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-[7.5px] sm:text-[9px]',
            carta.encontrada ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          ]"
        >
          <i v-if="carta.encontrada" class="bi bi-check-lg font-black"></i>
          <i v-else class="bi bi-star-fill"></i>
        </div>
        
        <!-- Renderizado de Animal (Imagen + Nombre) -->
        <template v-if="isImageValue(carta.valor)">
          <div class="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden p-0.5">
            <img
              :src="String(carta.valor)"
              :alt="obtenerNombreAnimal(carta.valor)"
              class="max-w-full max-h-full object-contain select-none pointer-events-none drop-shadow filter transition-transform duration-200"
              :class="carta.encontrada ? 'scale-95 brightness-110' : 'scale-100'"
              draggable="false"
            />
          </div>

          <!-- Nombre del Animal con estilo Kehubo -->
          <div class="w-full flex items-center justify-center shrink-0 px-0.5 pb-0.5">
            <span 
              class="w-full text-center truncate font-black uppercase tracking-wider leading-none py-0.5 px-1 rounded bg-slate-950/80 border backdrop-blur-xs"
              :class="[
                cardCount >= 40 
                  ? 'text-[6.5px] sm:text-[7.5px] md:text-[8.5px]' 
                  : (cardCount >= 32 ? 'text-[7.5px] sm:text-[8.5px] md:text-[9.5px]' : 'text-[8.5px] sm:text-[9.5px] md:text-[11px]'),
                carta.encontrada 
                  ? 'border-emerald-500/40 text-emerald-300 shadow-xs shadow-emerald-500/20' 
                  : 'border-amber-400/40 text-amber-200 shadow-xs shadow-amber-500/20'
              ]"
            >
              {{ obtenerNombreAnimal(carta.valor) }}
            </span>
          </div>
        </template>

        <!-- Renderizado de Números / Letras -->
        <div v-else class="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden">
          <span 
            class="font-mono font-black text-transparent bg-clip-text leading-none shrink-0"
            :class="[
              cardCount >= 40 ? 'text-xs sm:text-lg md:text-xl' : (cardCount >= 32 ? 'text-sm sm:text-xl md:text-2xl' : 'text-base sm:text-2xl md:text-3xl'),
              carta.encontrada ? 'bg-linear-to-b from-emerald-200 to-emerald-400' : 'bg-linear-to-b from-amber-200 to-pink-400'
            ]"
          >
            {{ carta.valor }}
          </span>
        </div>
      </div>

      <!-- Carta Dorso (Oculta) -->
      <div
        v-else
        class="w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 border sm:border-2 border-slate-700/80 hover:border-amber-400/70 flex flex-col items-center justify-center p-0.5 sm:p-1 shadow-sm group transition-all duration-200 overflow-hidden"
      >
        <div 
          class="rounded-md sm:rounded-lg bg-slate-900 border border-slate-700 group-hover:border-amber-400/60 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:scale-105 transition-all shrink-0"
          :class="cardCount >= 32 ? 'w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-xs' : 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-xs sm:text-sm'"
        >
          <i class="bi bi-gem"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes card-shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-4px) rotate(-1.5deg);
  }
  40%, 80% {
    transform: translateX(4px) rotate(1.5deg);
  }
}

.animate-shake {
  animation: card-shake 0.35s ease-in-out;
}
</style>