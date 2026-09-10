<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '../common/BaseModal.vue'
import BaseButton from '../common/BaseButton.vue'
import type { CardContentType } from '../../types'
import { ICO_ANIMALES } from '../../helpers/animales'

const props = withDefaults(
  defineProps<{
    isOpen?: boolean
    initialCardCount?: number
    initialCartasVisibles?: boolean
    initialCardContentType?: CardContentType
    isCompetitive?: boolean
  }>(),
  {
    isOpen: true,
    initialCardCount: 24,
    initialCartasVisibles: false,
    initialCardContentType: 'numeros',
    isCompetitive: true
  }
)

const emit = defineEmits<{
  (e: 'start', config: { cardCount: number; cartasVisibles: boolean; cardContentType: CardContentType }): void
  (e: 'close'): void
}>()

const selectedCardCount = ref<number>(props.initialCardCount)
const selectedCartasVisibles = ref<boolean>(props.initialCartasVisibles)
const selectedCardContentType = ref<CardContentType>(props.initialCardContentType)

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

function selectCardCount(count: number) {
  selectedCardCount.value = count
  // Si cambia a 32 o 40 y tenía letras seleccionadas, revertir a números
  if (count !== 24 && selectedCardContentType.value === 'letras') {
    selectedCardContentType.value = 'numeros'
  }
}

function handleStart() {
  let finalType = selectedCardContentType.value
  if (selectedCardCount.value !== 24 && finalType === 'letras') {
    finalType = 'numeros'
  }

  emit('start', {
    cardCount: selectedCardCount.value,
    cartasVisibles: selectedCartasVisibles.value,
    cardContentType: finalType
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
          Selecciona la dificultad del tablero, el tipo de cartas y el modo de visibilidad.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Selector de Dificultad (24 / 32 / 40) -->
      <div class="space-y-2.5">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-300">
          Dificultad de la partida
        </label>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            v-for="diff in difficulties"
            :key="diff.count"
            type="button"
            @click="selectCardCount(diff.count)"
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

      <!-- Selector de Tipo de Contenido (Números / Letras / Imágenes) -->
      <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 transition-all">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-black uppercase tracking-wider text-slate-300">
            Tipo de Pares
          </label>
          <span v-if="selectedCardCount === 24" class="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            3 Modos Disponibles
          </span>
          <span v-else class="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            2 Modos Disponibles
          </span>
        </div>
        
        <div 
          class="grid gap-2.5"
          :class="selectedCardCount === 24 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'"
        >
          <!-- Opción Números -->
          <button
            type="button"
            @click="selectedCardContentType = 'numeros'"
            class="p-3 rounded-xl border transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            :class="selectedCardContentType === 'numeros'
              ? 'bg-amber-500/20 border-amber-400 text-slate-100 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'"
          >
            <i class="bi bi-123 text-xl shrink-0" :class="selectedCardContentType === 'numeros' ? 'text-amber-400' : 'text-slate-500'"></i>
            <div class="text-left">
              <p class="font-black text-xs sm:text-sm">Números</p>
            </div>
          </button>

          <!-- Opción Letras (Exclusivo 24 Cartas) -->
          <button
            v-if="selectedCardCount === 24"
            type="button"
            @click="selectedCardContentType = 'letras'"
            class="p-3 rounded-xl border transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            :class="selectedCardContentType === 'letras'
              ? 'bg-pink-500/20 border-pink-400 text-slate-100 ring-1 ring-pink-400/50 shadow-md shadow-pink-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'"
          >
            <i class="bi bi-fonts text-xl shrink-0" :class="selectedCardContentType === 'letras' ? 'text-pink-400' : 'text-slate-500'"></i>
            <div class="text-left">
              <p class="font-black text-xs sm:text-sm">Letras</p>
            </div>
          </button>

          <!-- Opción Imágenes (Animales) -->
          <button
            type="button"
            @click="selectedCardContentType = 'imagenes'"
            class="p-3 rounded-xl border transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            :class="selectedCardContentType === 'imagenes'
              ? 'bg-emerald-500/20 border-emerald-400 text-slate-100 ring-1 ring-emerald-400/50 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'"
          >
            <img 
              :src="ICO_ANIMALES" 
              alt="Icono Animales" 
              class="w-6 h-6 object-contain shrink-0 transition-all duration-200" 
              :class="selectedCardContentType === 'imagenes' ? 'scale-110' : 'opacity-80'"
              :style="selectedCardContentType === 'imagenes'
                ? { filter: 'invert(72%) sepia(40%) saturate(600%) hue-rotate(115deg) brightness(98%) contrast(94%) drop-shadow(0 0 6px rgba(52,211,153,0.6))' }
                : { filter: 'invert(48%) sepia(13%) saturate(640%) hue-rotate(178deg) brightness(93%) contrast(89%)' }"
            />
            <div class="text-left">
              <p class="font-black text-xs sm:text-sm">Imágenes</p>
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
                Primer vistazo
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
