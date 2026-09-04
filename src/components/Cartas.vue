<script setup>
const props = defineProps({
  carta: {
    type: Object,
    required: true
  },
  tableroBloqueado: {
    type: Boolean,
    required: true
  },
  cardCount: {
    type: Number,
    default: 24
  }
})

const emit = defineEmits(['verificando'])

function handleClick() {
  if (!props.tableroBloqueado && !props.carta.revelada && !props.carta.encontrada) {
    emit('verificando', props.carta.id)
  }
}
</script>

<template>
  <div
    class="w-full h-full min-h-0 min-w-0 flex items-center justify-center select-none"
  >
    <div
      class="w-full h-full max-h-full max-w-full aspect-3/4 rounded-xl sm:rounded-2xl transition-all duration-300 transform cursor-pointer perspective-1000 flex flex-col justify-center items-center"
      :class="[
        carta.encontrada 
          ? 'opacity-80 scale-95 pointer-events-none cursor-default' 
          : 'hover:-translate-y-1 hover:shadow-xl active:scale-95',
        tableroBloqueado && !carta.revelada ? 'cursor-not-allowed opacity-75' : ''
      ]"
      @click="handleClick"
    >
      <!-- Carta Cara (Revelada o Encontrada) -->
      <div
        v-if="carta.revelada || carta.encontrada"
        class="w-full h-full rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-1 sm:p-2 border sm:border-2 transition-all duration-300"
        :class="carta.encontrada 
          ? 'bg-linear-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-400/80 text-emerald-300 shadow-lg shadow-emerald-500/20' 
          : 'bg-linear-to-br from-amber-500/20 via-slate-900 to-slate-950 border-amber-400 text-amber-200 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400/40'"
      >
        <div 
          class="rounded-full flex items-center justify-center mb-0.5 sm:mb-1 shrink-0"
          :class="[
            cardCount >= 32 ? 'w-4 h-4 sm:w-5 sm:h-5 text-[8px] sm:text-xs' : 'w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs',
            carta.encontrada ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          ]"
        >
          <i v-if="carta.encontrada" class="bi bi-check-lg font-black"></i>
          <i v-else class="bi bi-star-fill text-[8px] sm:text-[10px]"></i>
        </div>
        
        <span 
          class="font-mono font-black text-transparent bg-clip-text leading-none shrink-0"
          :class="[
            cardCount >= 40 ? 'text-base sm:text-2xl md:text-3xl' : (cardCount >= 32 ? 'text-lg sm:text-2xl md:text-3xl' : 'text-xl sm:text-3xl md:text-4xl'),
            carta.encontrada ? 'bg-linear-to-b from-emerald-200 to-emerald-400' : 'bg-linear-to-b from-amber-200 to-pink-400'
          ]"
        >
          {{ carta.valor }}
        </span>

        <span 
          v-if="cardCount <= 24"
          class="hidden sm:inline-block text-[8px] sm:text-[9px] uppercase font-extrabold tracking-widest text-slate-400 mt-1 shrink-0"
        >
          {{ carta.encontrada ? 'Hallado' : 'Kehubo' }}
        </span>
      </div>

      <!-- Carta Dorso (Oculta) -->
      <div
        v-else
        class="w-full h-full rounded-xl sm:rounded-2xl bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 border sm:border-2 border-slate-700/80 hover:border-amber-400/70 flex flex-col items-center justify-center p-1 sm:p-2 shadow-md group transition-all duration-200"
      >
        <div 
          class="rounded-lg sm:rounded-xl bg-slate-900 border border-slate-700 group-hover:border-amber-400/60 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition-all shrink-0"
          :class="cardCount >= 32 ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-6 h-6 sm:w-8 sm:h-8'"
        >
          <i class="bi bi-gem" :class="cardCount >= 32 ? 'text-xs sm:text-sm' : 'text-xs sm:text-base'"></i>
        </div>
        <span 
          v-if="cardCount <= 24"
          class="hidden sm:inline-block text-[7px] sm:text-[9px] font-black tracking-widest text-slate-500 group-hover:text-slate-300 uppercase mt-1 sm:mt-1.5 shrink-0"
        >
          KEHUBO
        </span>
      </div>
    </div>
  </div>
</template>