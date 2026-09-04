<script setup lang="ts">
import { img } from '../../../helpers/imagenes'
</script>

<template>
  <div class="flex items-center shrink-0">
    <BaseButton 
      :to="{ name: 'home' }" 
      variant="none" 
      size="none" 
      rounded="none" 
      class="flex items-center gap-2 group cursor-pointer"
      title="Kehubo"
    >
      <img 
        :src="img.isologo" 
        alt="Kehubo Logo" 
        class="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
      />
    </BaseButton>
  </div>
</template>
