<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { img } from '../helpers/imagenes'

defineProps<{
  resetGame: () => void
  volver?: boolean
}>()
</script>

<template>
  <header class="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 shadow-md border-b border-slate-700/80 font-['Montserrat']">
    <div
      class="mx-auto max-w-6xl py-2 sm:py-3 px-3 sm:px-6 flex justify-between items-center"
    >
      <div class="flex items-center gap-2 sm:gap-4">
        <RouterLink :to="{ name: 'home' }" v-if="volver" class="flex items-center gap-1.5 sm:gap-2 group" title="Volver al Inicio">
          <img 
            :src="img.isologo" 
            :alt="img.isologo"
            class="h-8 sm:h-10 w-auto transition-transform group-hover:scale-105"
          />
          <span class="font-black text-xs sm:text-base tracking-wider text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200 flex items-center gap-1">
            <i class="bi bi-arrow-left text-amber-300 text-xs sm:text-sm"></i>
            <span class="hidden xs:inline sm:inline">Inicio</span>
          </span>
        </RouterLink>
        <img 
          v-else
          :src="img.isologo" 
          :alt="img.isologo"
          class="h-8 sm:h-10 w-auto transition-transform group-hover:scale-105"
        />
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <BaseButton
          @click="resetGame"
          variant="pink"
          size="sm"
          rounded="xl"
          class="sm:py-2 sm:px-5 shadow-md shadow-pink-900/40 hover:scale-105"
        >
          <template #icon-left>
            <i class="bi bi-arrow-repeat text-sm"></i>
          </template>
          <span>Reiniciar</span>
        </BaseButton>
      </div>
    </div>
  </header>
</template>
