<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '../common/BaseModal.vue'

const props = withDefaults(
  defineProps<{
    isOpen?: boolean
    initialCardCount?: number
    initialCartasVisibles?: boolean
    isCompetitive?: boolean
  }>(),
  {
    isOpen: true,
    initialCardCount: 24,
    initialCartasVisibles: false,
    isCompetitive: true
  }
)

const emit = defineEmits<{
  (e: 'start', config: { cardCount: number; cartasVisibles: boolean }): void
  (e: 'close'): void
}>()

const selectedCardCount = ref<number>(props.initialCardCount)
const selectedCartasVisibles = ref<boolean>(props.initialCartasVisibles)

const difficulties = [
  {
    count: 24,
    pares: 12,
    name: 'Estándar',
    tag: 'Fácil',
    color: 'emerald',
    icon: 'bi-lightning-charge-fill',
    desc: '24 cartas (12 pares). Ideal para partidas veloces y reflejos rápidos.'
  },
  {
    count: 32,
    pares: 16,
    name: 'Veterano',
    tag: 'Intermedio',
    color: 'amber',
    icon: 'bi-fire',
    desc: '32 cartas (16 pares). Mayor exigencia de memoria táctica.'
  },
  {
    count: 40,
    pares: 20,
    name: 'Maestro',
    tag: 'Épico',
    color: 'pink',
    icon: 'bi-trophy-fill',
    desc: '40 cartas (20 pares). La prueba definitiva para los campeones.'
  }
]

function handleStart() {
  emit('start', {
    cardCount: selectedCardCount.value,
    cartasVisibles: selectedCartasVisibles.value
  })
}
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    size="xl"
    :show-close="true"
    @close="emit('close')"
  >
    <!-- Cabecera -->
    <template #header>
      <div class="text-center space-y-1.5">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
          <i class="bi bi-controller text-amber-300"></i>
          <span class="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
            {{ isCompetitive ? 'Partida Competitiva' : 'Configuración de Duelo' }}
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-100">
          PREPARA TU DUELO
        </h2>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          Selecciona la dificultad del tablero y el modo de visibilidad antes de iniciar.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Selector de Dificultad (24 / 32 / 40) -->
      <div class="space-y-2.5">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-300">
          1. Número de Cartas (Dificultad)
        </label>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            v-for="diff in difficulties"
            :key="diff.count"
            type="button"
            @click="selectedCardCount = diff.count"
            class="p-3 sm:p-4 rounded-2xl border transition-all text-left flex sm:flex-col justify-between items-center sm:items-stretch gap-2 group relative overflow-hidden cursor-pointer"
            :class="selectedCardCount === diff.count 
              ? 'bg-amber-500/15 border-amber-400 text-slate-100 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10 scale-[1.01]' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'"
          >
            <div class="flex items-center justify-between sm:mb-2 w-full">
              <span 
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm shrink-0"
                :class="selectedCardCount === diff.count ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'"
              >
                <i :class="['bi', diff.icon]"></i>
              </span>
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                {{ diff.tag }}
              </span>
            </div>
            <div class="text-right sm:text-left">
              <p class="font-black text-sm sm:text-base text-slate-100 uppercase">{{ diff.count }} Cartas</p>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium">{{ diff.pares }} Pares</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Toggle: Cartas Visibles al Inicio -->
      <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <i class="bi bi-eye-fill text-amber-400"></i>
              <span class="text-xs font-black uppercase tracking-wider text-slate-200">
                Cartas Visibles al Inicio
              </span>
            </div>
            <p class="text-[11px] text-slate-400 max-w-sm">
              Si se activa, las cartas se revelarán durante el timer regresivo para que puedas memorizarlas.
            </p>
          </div>

          <!-- Switch Toggle -->
          <button
            type="button"
            @click="selectedCartasVisibles = !selectedCartasVisibles"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="selectedCartasVisibles ? 'bg-pink-500 shadow-md shadow-pink-500/30' : 'bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
              :class="selectedCartasVisibles ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Botón de Inicio en Footer -->
    <template #footer>
      <BaseButton
        @click="handleStart"
        variant="gold"
        size="lg"
        rounded="2xl"
        block
        class="hover:scale-[1.02]"
      >
        <template #icon-left>
          <i class="bi bi-play-fill text-xl"></i>
        </template>
        <span>¡Iniciar Batalla!</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
