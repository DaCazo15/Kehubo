<script setup lang="ts">
import { NAV_LINKS } from './navData'
</script>

<template>
  <nav class="hidden md:flex items-center gap-1 lg:gap-1.5">
    <BaseButton
      v-for="item in NAV_LINKS"
      :key="item.label"
      :to="item.to"
      variant="ghost"
      size="xs"
      rounded="lg"
      class="tracking-wider"
    >
      <template #icon-left v-if="item.icon">
        <i :class="item.icon" class="text-amber-400"></i>
      </template>
      <span>{{ item.label }}</span>
      <span v-if="item.ping" class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
    </BaseButton>
  </nav>
</template>
