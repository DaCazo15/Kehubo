<script setup lang="ts">
import { img } from '../../../helpers/imagenes'
</script>

<template>
  <div class="md:col-span-5 space-y-4">
    <BaseButton 
      :to="{ name: 'home' }" 
      variant="none" 
      size="none" 
      rounded="none" 
      class="inline-flex items-center gap-3 group cursor-pointer"
      title="Kehubo"
    >
      <img 
        :src="img.isologo" 
        alt="Kehubo Logo" 
        class="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]"
      />
    </BaseButton>
    <p class="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
      Plataforma de juego de memoria táctica de cartas en tiempo real. Entrena tu mente, compite contra otros guerreros en salas privadas y domina la arena.
    </p>
  </div>
</template>
