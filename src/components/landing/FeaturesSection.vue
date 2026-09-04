<script setup lang="ts">
import { FEATURES_DATA } from './features/featuresData'
import FeatureCard from './features/FeatureCard.vue'
</script>

<template>
  <section class="py-24 relative bg-slate-950/70 border-y border-slate-900 font-['Montserrat']">
    <!-- Resplandor central sutil -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      <!-- Cabecera de la sección -->
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 class="text-3xl sm:text-5xl font-black uppercase text-slate-100 tracking-tight">
          ¿POR QUÉ ENTRAR A <span class="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-pink-500">KEHUBO</span>?
        </h2>
        <p class="text-sm sm:text-base text-slate-400">
          Diseñado para partidas dinámicas, entrenamiento de agilidad cognitiva y competencia feroz por los mejores puestos.
        </p>
      </div>

      <!-- Cuadrícula de Cartas / Features -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          v-for="(item, index) in FEATURES_DATA"
          :key="index"
          :feature="item"
        />
      </div>

    </div>
  </section>
</template>
