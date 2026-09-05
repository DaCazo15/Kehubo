<script setup lang="ts">
import type { RankingCategory } from '../../composables/useRanking'

defineProps<{
  selectedCategory: RankingCategory
  categoryCounts?: Record<RankingCategory, number>
}>()

const emit = defineEmits<{
  (e: 'select', category: RankingCategory): void
}>()

const categories: {
  value: RankingCategory
  label: string
  pairs: number
  tag: string
  icon: string
  color: string
}[] = [
  {
    value: 24,
    label: '24 Cartas',
    pairs: 12,
    tag: 'Cadete',
    icon: 'bi-lightning-charge-fill',
    color: 'emerald'
  },
  {
    value: 32,
    label: '32 Cartas',
    pairs: 16,
    tag: 'Guerrero',
    icon: 'bi-fire',
    color: 'amber'
  },
  {
    value: 40,
    label: '40 Cartas',
    pairs: 20,
    tag: 'Kehubo',
    icon: 'bi-trophy-fill',
    color: 'pink'
  }
]
</script>

<template>
  <div class="flex flex-col items-center space-y-3">
    <!-- Selector de Categorías -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-full max-w-2xl shadow-xl">
      <button
        v-for="cat in categories"
        :key="cat.value"
        type="button"
        @click="emit('select', cat.value)"
        class="relative px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 text-center group"
        :class="selectedCategory === cat.value
          ? 'bg-linear-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black ring-1 ring-amber-300'
          : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60 font-bold'"
      >
        <!-- Fila superior: Ícono y Nombre -->
        <div class="flex items-center gap-2">
          <i
            :class="[cat.icon, selectedCategory === cat.value ? 'text-slate-950' : (cat.color === 'emerald' ? 'text-emerald-400' : cat.color === 'amber' ? 'text-amber-400' : 'text-pink-400')]"
            class="text-sm"
          ></i>
          <span class="text-xs sm:text-sm font-black uppercase tracking-wider">
            {{ cat.label }}
          </span>
        </div>

        <!-- Fila inferior: Tag y pares -->
        <div class="flex items-center gap-2 text-[10px] tracking-wide">
          <span
            class="px-1.5 py-0.5 rounded font-bold uppercase text-[9px]"
            :class="selectedCategory === cat.value
              ? 'bg-slate-950/20 text-slate-950'
              : 'bg-slate-800 text-slate-400'"
          >
            {{ cat.tag }} ({{ cat.pairs }} pares)
          </span>

          <!-- Contador de guerreros en la categoría -->
          <span
            v-if="categoryCounts && categoryCounts[cat.value] > 0"
            class="font-mono font-bold"
            :class="selectedCategory === cat.value ? 'text-slate-900' : 'text-slate-500'"
          >
            • {{ categoryCounts[cat.value] }} {{ categoryCounts[cat.value] === 1 ? 'jugador' : 'jugadores' }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
