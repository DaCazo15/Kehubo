<script setup lang="ts">
import { RouterLink } from 'vue-router'

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
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Montserrat'] overflow-y-auto"
  >
    <!-- Fondo Blur Oscuro -->
    <div class="fixed inset-0 bg-slate-950/85 backdrop-blur-md animate-fadeIn"></div>

    <!-- Contenedor Victoria -->
    <div class="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-10 space-y-6 text-center shadow-2xl z-10 animate-fadeIn">
      
      <!-- Icono de Gran Campeón -->
      <div class="w-24 h-24 rounded-full mx-auto bg-linear-to-br from-amber-500/30 to-pink-500/20 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/30 animate-pulse-glow text-amber-400">
        <i class="bi bi-trophy-fill"></i>
      </div>

      <!-- Título de Victoria -->
      <div class="space-y-2">
        <span class="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1 rounded-full border border-amber-500/30">
          ¡Victoria en la Arena!
        </span>
        <h2 class="text-3xl sm:text-4xl font-black uppercase text-slate-100 tracking-tight">
          TABLERO DOMINADO
        </h2>
        <p class="text-xs sm:text-sm text-slate-400">
          Has encontrado todos los pares de cartas con destreza y rapidez.
        </p>
      </div>

      <!-- Métricas de la Partida -->
      <div class="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
        <div class="space-y-1">
          <p class="text-[10px] uppercase font-bold text-slate-400">Tiempo</p>
          <p class="text-xl sm:text-2xl font-black text-amber-300 font-mono">{{ tiempo }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-[10px] uppercase font-bold text-slate-400">Puntos</p>
          <p class="text-xl sm:text-2xl font-black text-pink-400">{{ puntaje }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-[10px] uppercase font-bold text-slate-400">Dificultad</p>
          <p class="text-base sm:text-lg font-black text-slate-200">{{ cardCount }} Cartas</p>
        </div>
      </div>

      <!-- Badge de Registro en Ranking -->
      <div 
        v-if="isCompetitive"
        class="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2"
      >
        <i class="bi bi-check-circle-fill text-emerald-400 text-sm"></i>
        <span>¡Récord guardado en el Ranking Global!</span>
      </div>

      <!-- Botones de Acción -->
      <div class="space-y-3 pt-2">
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

        <div class="grid grid-cols-2 gap-3">
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

    </div>
  </div>
</template>
