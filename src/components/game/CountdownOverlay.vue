<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import gsap from 'gsap'

const props = withDefaults(
  defineProps<{
    countdown: number
    isCounting: boolean
    isPaused?: boolean
    cartasVisibles?: boolean
    allowPause?: boolean
  }>(),
  {
    isPaused: false,
    cartasVisibles: false,
    allowPause: true
  }
)

const emit = defineEmits<{
  (e: 'pause'): void
  (e: 'resume'): void
}>()

const numberRef = ref<HTMLElement | null>(null)
const ringRef = ref<SVGElement | null>(null)
const isHovered = ref<boolean>(false)

function handleMouseEnter() {
  if (!props.allowPause) return
  isHovered.value = true
  emit('pause')
}

function handleMouseLeave() {
  if (!props.allowPause) return
  isHovered.value = false
  emit('resume')
}

// Animar el número cuando cambia el countdown con GSAP
watch(
  () => props.countdown,
  (newVal) => {
    if (newVal > 0 && numberRef.value) {
      gsap.fromTo(
        numberRef.value,
        { scale: 0.4, opacity: 0, y: -10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }
      )
    }
  }
)

onMounted(() => {
  if (numberRef.value) {
    gsap.fromTo(
      numberRef.value,
      { scale: 0.3, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' }
    )
  }
})
</script>

<template>
  <div 
    v-if="isCounting"
    class="fixed inset-0 z-40 flex items-center justify-center p-4 font-['Montserrat'] pointer-events-auto"
  >
    <!-- Fondo semi-transparente para ver las cartas si están reveladas -->
    <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"></div>

    <!-- Contenedor Interactivo con Hover -->
    <div
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      class="relative z-10 text-center space-y-5 p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-amber-500/50 shadow-2xl transition-all duration-300 transform cursor-pointer group hover:scale-105 hover:border-pink-500/60 hover:shadow-pink-500/20"
      :class="{ 'ring-2 ring-pink-500/50 bg-slate-900/95': isPaused }"
    >
      <!-- Indicador de Estado / Modo -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
        <i v-if="!isPaused" class="bi bi-stopwatch-fill animate-pulse"></i>
        <i v-else class="bi bi-pause-circle-fill text-pink-400"></i>
        <span>{{ isPaused ? 'Cuenta Pausada' : 'Prepárate para el Combate' }}</span>
      </div>

      <!-- Círculo Central con Cuenta Regresiva -->
      <div class="relative w-36 h-36 mx-auto flex items-center justify-center">
        <!-- Anillo SVG de Progreso -->
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            stroke-width="6"
            class="text-slate-800 fill-transparent"
          />
          <circle
            ref="ringRef"
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            class="text-amber-400 fill-transparent transition-all duration-1000"
            :class="{ 'text-pink-500': isPaused }"
            :stroke-dasharray="264"
            :stroke-dashoffset="264 - (264 * countdown) / 5"
          />
        </svg>

        <!-- Número Animado -->
        <div 
          ref="numberRef"
          class="absolute inset-0 flex items-center justify-center font-black text-5xl sm:text-6xl text-transparent bg-clip-text bg-linear-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        >
          {{ countdown }}
        </div>
      </div>

      <!-- Mensaje Contextual -->
      <div class="space-y-1 max-w-xs mx-auto">
        <p v-if="cartasVisibles" class="text-xs font-bold text-amber-300 uppercase tracking-wide">
          👁️ ¡Memoriza las posiciones de las cartas!
        </p>
        <p v-else class="text-xs font-bold text-slate-300 uppercase tracking-wide">
          ⚔️ El tablero se desbloqueará en breve
        </p>
        
        <!-- Indicador de Interacción Hover -->
        <p class="text-[11px] text-slate-400 pt-2 transition-colors group-hover:text-pink-300">
          <template v-if="allowPause">
            <span v-if="!isPaused">Pasa el ratón aquí para pausar el temporizador</span>
            <span v-else class="text-pink-300 font-semibold">Aparta el ratón para reanudar la cuenta</span>
          </template>
          <template v-else>
            <span class="text-amber-400/90 font-medium">⚡ Partida multijugador en vivo</span>
          </template>
        </p>
      </div>

    </div>
  </div>
</template>
