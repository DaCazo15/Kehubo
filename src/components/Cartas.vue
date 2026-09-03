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
    class="relative aspect-3/4 rounded-2xl select-none transition-all duration-300 transform cursor-pointer perspective-1000"
    :class="[
      carta.encontrada 
        ? 'opacity-80 scale-95 pointer-events-none cursor-default' 
        : 'hover:-translate-y-1 hover:shadow-xl',
      tableroBloqueado && !carta.revelada ? 'cursor-not-allowed opacity-75' : ''
    ]"
    @click="handleClick"
  >
    <!-- Carta Cara (Revelada o Encontrada) -->
    <div
      v-if="carta.revelada || carta.encontrada"
      class="w-full h-full rounded-2xl flex flex-col items-center justify-center p-2 sm:p-3 border-2 transition-all duration-300"
      :class="carta.encontrada 
        ? 'bg-linear-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-400/80 text-emerald-300 shadow-lg shadow-emerald-500/20' 
        : 'bg-linear-to-br from-amber-500/20 via-slate-900 to-slate-950 border-amber-400 text-amber-200 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400/40'"
    >
      <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs mb-1"
        :class="carta.encontrada ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'"
      >
        <i v-if="carta.encontrada" class="bi bi-check-lg font-black text-sm"></i>
        <i v-else class="bi bi-star-fill text-[10px]"></i>
      </div>
      <span class="font-mono font-black text-2xl sm:text-3xl md:text-4xl text-transparent bg-clip-text"
        :class="carta.encontrada ? 'bg-linear-to-b from-emerald-200 to-emerald-400' : 'bg-linear-to-b from-amber-200 to-pink-400'"
      >
        {{ carta.valor }}
      </span>
      <span class="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 mt-1">
        {{ carta.encontrada ? 'Par Hallado' : 'Kehubo' }}
      </span>
    </div>

    <!-- Carta Dorso (Oculta) -->
    <div
      v-else
      class="w-full h-full rounded-2xl bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-slate-700/80 hover:border-amber-400/70 flex flex-col items-center justify-center p-2 sm:p-3 shadow-md group transition-all duration-200"
    >
      <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-amber-400/60 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition-all">
        <i class="bi bi-gem text-sm sm:text-base"></i>
      </div>
      <span class="text-[8px] sm:text-[9px] font-black tracking-widest text-slate-500 group-hover:text-slate-300 uppercase mt-2">
        KEHUBO
      </span>
    </div>
  </div>
</template>