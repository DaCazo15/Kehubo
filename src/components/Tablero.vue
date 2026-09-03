<script setup>
defineProps({
  tiempo: {
    type: String,
    required: true
  },
  puntaje: {
    type: Number,
    required: true
  },
  totalPares: {
    type: Number,
    default: 12
  },
  paresEncontrados: {
    type: Number,
    default: 0
  },
  cardCount: {
    type: Number,
    default: 24
  },
  tableroBloqueado: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div class="bg-slate-900/90 border-b border-slate-800 py-3.5 px-4 sm:px-8 shadow-xl font-['Montserrat']">
    <div class="mx-auto max-w-6xl flex flex-wrap justify-between items-center gap-3">
      
      <!-- Puntos y Pares -->
      <div class="flex items-center gap-3 sm:gap-6">
        <!-- Puntos -->
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm font-bold uppercase text-slate-400">Puntos</span>
          <div class="bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-base sm:text-lg px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
            <i class="bi bi-star-fill text-amber-400 text-xs"></i>
            <span>{{ puntaje }}</span>
          </div>
        </div>

        <!-- Pares Encontrados -->
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm font-bold uppercase text-slate-400">Pares</span>
          <div class="bg-slate-800/80 border border-slate-700 text-slate-200 font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl">
            <span class="text-pink-400">{{ paresEncontrados }}</span>
            <span class="text-slate-500"> / </span>
            <span>{{ totalPares }}</span>
          </div>
        </div>
      </div>

      <!-- Dificultad & Tiempo -->
      <div class="flex items-center gap-3 sm:gap-6">
        <!-- Dificultad Badge -->
        <div class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <i class="bi bi-grid-3x3 text-amber-400"></i>
          <span>{{ cardCount }} Cartas</span>
        </div>

        <!-- Cronómetro -->
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm font-bold uppercase text-slate-400">Tiempo</span>
          <div 
            class="font-mono font-black text-base sm:text-lg px-3.5 py-1 rounded-xl flex items-center gap-2 border transition-colors"
            :class="tableroBloqueado 
              ? 'bg-slate-950/80 border-slate-800 text-slate-500' 
              : 'bg-pink-500/20 border-pink-500/40 text-pink-300 shadow-sm'"
          >
            <i class="bi bi-stopwatch text-sm"></i>
            <span>{{ tiempo }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
