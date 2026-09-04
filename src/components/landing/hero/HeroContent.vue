<script setup lang="ts">
import HeroStats from './HeroStats.vue'
</script>

<template>
  <div class="lg:col-span-7 text-center lg:text-left space-y-6">
    <!-- Título Principal con Estética de Videojuego -->
    <h1 class="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-none">
      <span class="block text-slate-100 drop-shadow-md">DOMINA EL</span>
      <span class="block text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200 game-title-glow mt-1">
        REINO DE LAS CARTAS
      </span>
    </h1>

    <!-- Descripción / Lore -->
    <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
      Pon a prueba tu agilidad mental y memoria táctica. Encuentra los pares antes de que el cronómetro se agote, acumula puntuación y forja tu nombre en el ranking de campeones.
    </p>

    <!-- Grupo de Acciones (CTAs) -->
    <div class="pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4">
      <!-- Botón Principal "Jugar Ahora" (Navega a juego rápido) -->
      <BaseButton 
        :to="{ name: 'game-rapido' }" 
        variant="pink"
        size="lg"
        rounded="2xl"
        class="w-full sm:w-auto hover:scale-105"
      >
        <template #icon-left>
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </template>
        <span>Jugar Rápido</span>
      </BaseButton>

      <!-- Botón Salas Competitivas Multijugador -->
      <BaseButton 
        :to="{ name: 'multiplayer-lobby' }" 
        variant="gold"
        size="lg"
        rounded="2xl"
        class="w-full sm:w-auto hover:scale-105"
      >
        <template #icon-left>
          <i class="bi bi-people-fill text-lg"></i>
        </template>
        <span>Salas Multijugador</span>
      </BaseButton>

      <!-- Botón Ranking -->
      <BaseButton
        :to="{ name: 'ranking' }"
        variant="slate"
        size="lg"
        rounded="2xl"
        class="w-full sm:w-auto hover:scale-105"
      >
        <template #icon-left>
          <i class="bi bi-trophy-fill text-amber-400"></i>
        </template>
        <span>Ranking</span>
      </BaseButton>
    </div>

    <!-- Métricas del Hero -->
    <HeroStats />
  </div>
</template>
