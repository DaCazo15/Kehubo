<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseModal from '../common/BaseModal.vue'

withDefaults(
  defineProps<{
    isOpen?: boolean
    tiempo: string
    puntaje: number
    cardCount?: number
    isCompetitive?: boolean
    scoreSaved?: boolean
  }>(),
  {
    isOpen: false,
    cardCount: 24,
    isCompetitive: false,
    scoreSaved: false
  }
)

const emit = defineEmits<{
  (e: 'playAgain'): void
}>()
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    size="md"
    :show-close="false"
    :close-on-escape="false"
    :close-on-outside-click="false"
  >
    <!-- Cabecera e Icono de Victoria -->
    <template #header>
      <div class="text-center space-y-2 pt-2">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto bg-linear-to-br from-amber-500/30 to-pink-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-500/30 animate-pulse-glow text-amber-400">
          <i class="bi bi-trophy-fill"></i>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/30">
            ¡Victoria en la Arena!
          </span>
          <h2 class="text-2xl sm:text-3xl font-black uppercase text-slate-100 tracking-tight">
            TABLERO DOMINADO
          </h2>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">
            Has encontrado todos los pares de cartas con destreza y rapidez.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Métricas de la Partida -->
      <div class="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
        <div class="space-y-0.5">
          <p class="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Tiempo</p>
          <p class="text-lg sm:text-2xl font-black text-amber-300 font-mono">{{ tiempo }}</p>
        </div>
        <div class="space-y-0.5">
          <p class="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Puntos</p>
          <p class="text-lg sm:text-2xl font-black text-pink-400">{{ puntaje }}</p>
        </div>
        <div class="space-y-0.5">
          <p class="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Dificultad</p>
          <p class="text-sm sm:text-base font-black text-slate-200">{{ cardCount }} Cartas</p>
        </div>
      </div>

      <!-- Badge de Registro en Ranking -->
      <div 
        v-if="isCompetitive"
        class="p-2.5 sm:p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-2"
      >
        <i class="bi bi-check-circle-fill text-emerald-400 text-sm shrink-0"></i>
        <span class="truncate">¡Récord guardado en el Ranking!</span>
      </div>
    </div>

    <!-- Botones de Acción en Footer -->
    <template #footer>
      <div class="space-y-2.5">
        <BaseButton
          @click="emit('playAgain')"
          variant="gold"
          size="md"
          rounded="2xl"
          block
          class="hover:scale-[1.02]"
        >
          <template #icon-left>
            <i class="bi bi-arrow-repeat text-lg"></i>
          </template>
          <span>Jugar Otra Partida</span>
        </BaseButton>

        <div class="grid grid-cols-2 gap-2.5">
          <BaseButton
            to="/ranking"
            variant="outline"
            size="sm"
            rounded="xl"
          >
            <template #icon-left>
              <i class="bi bi-trophy-fill text-amber-400"></i>
            </template>
            <span>Ver Ranking</span>
          </BaseButton>

          <BaseButton
            to="/"
            variant="outline"
            size="sm"
            rounded="xl"
          >
            <template #icon-left>
              <i class="bi bi-house-door-fill"></i>
            </template>
            <span>Inicio</span>
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
