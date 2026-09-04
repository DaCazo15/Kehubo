<script setup lang="ts">
import HeroContent from './hero/HeroContent.vue'
import HeroCardPortal from './hero/HeroCardPortal.vue'
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden font-['Montserrat']">
    <!-- Fondos de ambientación gamer con gradientes oscuros y resplandor -->
    <div class="absolute inset-0 bg-[#070a12] -z-20"></div>

    <!-- Fondo de mallas y destellos atmosféricos -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.15),transparent_55%)] -z-10"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.12),transparent_50%)] -z-10"></div>
    
    <!-- Partículas y orbes de energía en el fondo -->
    <div class="absolute top-1/4 left-1/10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-glow -z-10"></div>
    <div class="absolute bottom-1/4 right-1/10 w-120 h-120 bg-pink-600/10 rounded-full blur-3xl animate-pulse-glow -z-10" style="animation-delay: 2s;"></div>

    <!-- Patrón de rejilla sutil para sensación de portal de juego -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Bloque 1: Contenido y CTAs -->
        <HeroContent />

        <!-- Bloque 2: Portal de Cartas Flotantes -->
        <HeroCardPortal />
      </div>
    </div>
  </section>
</template>
