<script setup lang="ts">
</script>

<template>
  <div class="lg:col-span-5 flex justify-center items-center relative">
    <div class="relative w-full max-w-md aspect-square flex items-center justify-center">
      
      <!-- Anillo Rúnico de Portal -->
      <div class="absolute inset-0 rounded-full border border-amber-500/30 border-dashed animate-spin" style="animation-duration: 30s;"></div>
      <div class="absolute inset-6 rounded-full border border-pink-500/20 animate-spin" style="animation-duration: 45s; animation-direction: reverse;"></div>
      <div class="absolute inset-12 rounded-full bg-radial from-amber-500/10 via-pink-500/5 to-transparent blur-xl"></div>

      <!-- Cartas Interactivas Flotantes (Muestra del Juego) -->
      <div class="relative z-10 grid grid-cols-2 gap-4 p-4">
        
        <!-- Carta 1 (Dada vuelta - Frente dorado) -->
        <div class="w-32 sm:w-36 h-44 sm:h-48 rounded-2xl bg-linear-to-br from-amber-500 via-amber-600 to-amber-800 p-1 shadow-2xl shadow-amber-500/20 transform -rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer animate-float">
          <div class="w-full h-full bg-slate-950/90 rounded-xl flex flex-col items-center justify-between p-3 border border-amber-400/50">
            <span class="text-xs font-black text-amber-400 uppercase tracking-widest">KHB</span>
            <div class="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-amber-200 to-amber-400">
              7
            </div>
            <span class="text-[10px] font-bold text-amber-300/80 uppercase">Par Mágico</span>
          </div>
        </div>

        <!-- Carta 2 (Dada vuelta - Frente rosa) -->
        <div class="w-32 sm:w-36 h-44 sm:h-48 rounded-2xl bg-linear-to-br from-pink-500 via-pink-600 to-purple-800 p-1 shadow-2xl shadow-pink-500/20 transform rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer animate-float" style="animation-delay: 1.5s;">
          <div class="w-full h-full bg-slate-950/90 rounded-xl flex flex-col items-center justify-between p-3 border border-pink-400/50">
            <span class="text-xs font-black text-pink-400 uppercase tracking-widest">KHB</span>
            <div class="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-pink-200 to-pink-400">
              7
            </div>
            <span class="text-[10px] font-bold text-pink-300/80 uppercase">¡MATCH!</span>
          </div>
        </div>

        <!-- Carta 3 (Dorso Místico) -->
        <div class="w-32 sm:w-36 h-44 sm:h-48 rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 p-1 shadow-xl transform rotate-3 hover:scale-105 transition-transform duration-300 col-span-2 mx-auto -mt-6">
          <div class="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center p-3 border border-slate-700">
            <div class="w-12 h-12 rounded-full border border-amber-500/40 flex items-center justify-center bg-amber-500/10 mb-2">
              <i class="bi bi-gem text-amber-400 text-lg"></i>
            </div>
            <span class="text-xs font-black tracking-widest text-slate-300 uppercase">KEHUBO</span>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
