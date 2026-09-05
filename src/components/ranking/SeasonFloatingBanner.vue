<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getSeasonInfo, getTimeRemainingInCurrentSeason, type SeasonInfo, type SeasonTimeRemaining } from '../../helpers/seasonUtils'

const isMinimized = ref<boolean>(false)
const seasonInfo = ref<SeasonInfo>(getSeasonInfo())
const timeRemaining = ref<SeasonTimeRemaining>(getTimeRemainingInCurrentSeason())
let timer: ReturnType<typeof setInterval> | null = null

function updateCountdown() {
  seasonInfo.value = getSeasonInfo()
  timeRemaining.value = getTimeRemainingInCurrentSeason()
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Banner Desplegado -->
    <div
      v-if="!isMinimized"
      class="relative overflow-hidden rounded-2xl bg-slate-950/90 border border-amber-500/40 p-4 sm:p-5 shadow-2xl shadow-amber-500/10 backdrop-blur-xl animate-fadeIn"
    >
      <!-- Glow decorativo superior -->
      <div class="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-amber-400 to-transparent"></div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <!-- Bloque Izquierdo: Información de la Temporada -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <i class="bi bi-calendar2-range-fill text-lg"></i>
          </div>

          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Temporada Activa
              </span>
              <span class="text-xs font-bold text-slate-400">
                (Bimestral)
              </span>
            </div>

            <h3 class="text-sm sm:text-base font-black uppercase tracking-wide text-slate-100">
              {{ seasonInfo.name }}
            </h3>
          </div>
        </div>

        <!-- Bloque Derecho: Contador y Botón Minimizar -->
        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
          <!-- Contador -->
          <div class="text-left sm:text-right space-y-0.5">
            <p class="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center sm:justify-end gap-1">
              <i class="bi bi-hourglass-split text-amber-400"></i>
              <span>Reinicio en:</span>
            </p>
            <div class="font-mono text-sm sm:text-base font-black text-amber-300 tracking-tight bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5 shadow-inner">
              <span class="text-slate-200">{{ timeRemaining.days }}d</span>
              <span class="text-slate-500">:</span>
              <span class="text-slate-200">{{ timeRemaining.hours.toString().padStart(2, '0') }}h</span>
              <span class="text-slate-500">:</span>
              <span class="text-slate-200">{{ timeRemaining.minutes.toString().padStart(2, '0') }}m</span>
              <span class="text-slate-500">:</span>
              <span class="text-amber-400">{{ timeRemaining.seconds.toString().padStart(2, '0') }}s</span>
            </div>
          </div>

          <!-- Botón Minimizar -->
          <button
            type="button"
            @click="isMinimized = true"
            class="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition cursor-pointer"
            title="Minimizar anuncio de temporada"
          >
            <i class="bi bi-chevron-up text-xs"></i>
          </button>
        </div>

      </div>

      <!-- Pie explicativo sutil -->
      <div class="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
        <span class="flex items-center gap-1.5">
          <i class="bi bi-info-circle text-amber-400/80"></i>
          Al finalizar la temporada, los rankings y el historial se reinician para una nueva competencia.
        </span>
        <span class="text-[10px] font-bold text-amber-400/80 hidden sm:inline">
          ¡Asegura tu mejor tiempo antes del corte!
        </span>
      </div>
    </div>

    <!-- Banner Minimizado -->
    <div
      v-else
      class="flex items-center justify-between p-2.5 px-4 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-lg"
    >
      <div class="flex items-center gap-2">
        <i class="bi bi-calendar2-range-fill text-amber-400 text-xs"></i>
        <span class="text-xs font-bold text-slate-300">
          {{ seasonInfo.shortName }} • Reinicio en: <span class="font-mono font-black text-amber-300">{{ timeRemaining.formatted }}</span>
        </span>
      </div>

      <button
        type="button"
        @click="isMinimized = false"
        class="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer hover:underline"
      >
        <span>Detalles</span>
        <i class="bi bi-chevron-down text-[10px]"></i>
      </button>
    </div>
  </div>
</template>
