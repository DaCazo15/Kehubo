<script setup lang="ts">
import { computed } from 'vue'
import { getCategoryLabel } from '../../helpers/seasonUtils'
import { formatMatchDate } from '../../helpers/dateUtils'

export interface BestSeasonData {
  seasonName?: string
  seasonId?: string
  bestTime?: string
  bestSeconds?: number | null
  category?: number
  rank?: number | null
  score?: number
  date?: any
}

const props = defineProps<{
  bestSeason: BestSeasonData | null
  isOwnProfile?: boolean
  displayName?: string
}>()

const categoryInfo = computed(() => {
  return getCategoryLabel(props.bestSeason?.category)
})

const rankDisplay = computed(() => {
  const r = props.bestSeason?.rank
  if (!r) return { text: 'Clasificado', tag: 'Guerrero Destacado', color: 'slate' }
  if (r === 1) return { text: '#1 Oro', tag: 'Campeón Absoluto', color: 'gold' }
  if (r === 2) return { text: '#2 Plata', tag: 'Subcampeón', color: 'silver' }
  if (r === 3) return { text: '#3 Bronce', tag: 'Tercer Puesto', color: 'bronze' }
  return { text: `#${r}`, tag: 'Top Global', color: 'amber' }
})
</script>

<template>
  <div class="space-y-6 font-['Montserrat']">
    <!-- Tarjeta Principal de Mejor Temporada -->
    <div
      v-if="bestSeason && (bestSeason.bestSeconds !== undefined || bestSeason.bestTime)"
      class="relative overflow-hidden rounded-3xl game-card-portal p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl space-y-6"
    >
      <!-- Glow de fondo -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Cabecera de la Sección -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <i class="bi bi-trophy-fill"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-wider text-amber-400">
                Salón de la Fama Personal
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider text-amber-300">
                Récord Histórico
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black uppercase text-slate-100 tracking-tight">
              Mejor Temporada
            </h2>
          </div>
        </div>

        <!-- Temporada en la que se logró -->
        <div class="text-left sm:text-right">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Edición</span>
          <span class="text-xs sm:text-sm font-black text-slate-200">
            {{ bestSeason.seasonName || 'Temporada Bimestral' }}
          </span>
        </div>
      </div>

      <!-- Grid de 3 Métricas Clave (Tiempo, Categoría, Puesto Global) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- 1. Mejor Tiempo -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-center group hover:border-amber-500/50 transition shadow-inner">
          <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Mejor Tiempo Registrado
          </p>
          <p class="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">
            {{ bestSeason.bestSeconds ? `${bestSeason.bestSeconds}s` : (bestSeason.bestTime || '--:--') }}
          </p>
          <p class="text-[11px] font-bold text-pink-400">
            {{ bestSeason.score || 0 }} Puntos
          </p>
        </div>

        <!-- 2. Categoría -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-center group hover:border-amber-500/50 transition shadow-inner">
          <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Categoría del Récord
          </p>
          <div class="pt-1">
            <span class="inline-block px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm uppercase tracking-wider border border-amber-500/40">
              {{ categoryInfo.name }}
            </span>
          </div>
          <p class="text-[11px] font-bold text-slate-400 pt-1">
            Modo {{ categoryInfo.tag }} ({{ categoryInfo.pairs }} pares)
          </p>
        </div>

        <!-- 3. Puesto en Ranking Global -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-center group hover:border-amber-500/50 transition shadow-inner">
          <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Puesto en Ranking Global
          </p>
          <div class="pt-1">
            <span
              class="inline-block px-3.5 py-1 rounded-xl font-black text-lg uppercase tracking-wider shadow-md"
              :class="{
                'bg-linear-to-r from-amber-400 to-amber-500 text-slate-950': rankDisplay.color === 'gold',
                'bg-linear-to-r from-slate-200 to-slate-400 text-slate-950': rankDisplay.color === 'silver',
                'bg-linear-to-r from-amber-700 to-amber-800 text-white': rankDisplay.color === 'bronze',
                'bg-slate-800 text-amber-300 border border-amber-500/40': rankDisplay.color === 'amber' || rankDisplay.color === 'slate'
              }"
            >
              {{ rankDisplay.text }}
            </span>
          </div>
          <p class="text-[11px] font-bold text-slate-400 pt-0.5">
            {{ rankDisplay.tag }}
          </p>
        </div>

      </div>

      <!-- Pie informativo -->
      <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span class="flex items-center gap-2">
          <i class="bi bi-shield-check text-amber-400 text-sm"></i>
          <span>Este récord inmortaliza la hazaña más rápida del guerrero en la historia del juego.</span>
        </span>
        <span v-if="bestSeason.date" class="text-slate-500 text-[11px] font-medium hidden sm:inline">
          Registrado el {{ formatMatchDate(bestSeason.date) }}
        </span>
      </div>

    </div>

    <!-- Estado Vacío: Sin Récord Aún -->
    <div
      v-else
      class="game-card-portal rounded-3xl p-8 sm:p-12 text-center border border-slate-800 space-y-4 max-w-2xl mx-auto"
    >
      <div class="w-16 h-16 rounded-full mx-auto bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl text-amber-400">
        <i class="bi bi-trophy"></i>
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-black uppercase text-slate-200">
          Sin Hazañas Inmortales Aún
        </h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {{ isOwnProfile
            ? 'Completa una partida clasificatoria en la temporada actual para fijar tu mejor tiempo, categoría y posición en el Salón de la Fama.'
            : `${displayName || 'El guerrero'} aún no ha registrado un récord de temporada.`
          }}
        </p>
      </div>

      <div v-if="isOwnProfile" class="pt-2">
        <BaseButton
          :to="{ name: 'game' }"
          variant="gold"
          size="sm"
          rounded="xl"
        >
          <template #icon-left>
            <i class="bi bi-play-fill text-base"></i>
          </template>
          <span>Conquistar Temporada Actual</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
