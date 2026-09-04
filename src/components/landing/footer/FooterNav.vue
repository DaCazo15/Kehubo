<script setup lang="ts">
import { FOOTER_NAV_LINKS } from './footerData'
</script>

<template>
  <div class="md:col-span-3 space-y-4">
    <h4 class="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
      <i class="bi bi-compass-fill"></i>
      <span>Navegación</span>
    </h4>
    <ul class="space-y-2.5 text-xs font-semibold text-slate-400">
      <li v-for="link in FOOTER_NAV_LINKS" :key="link.name">
        <BaseButton
          :to="link.to"
          variant="none"
          size="none"
          rounded="none"
          class="hover:text-amber-300 transition-colors inline-flex items-center gap-2 group font-semibold text-xs text-slate-400 normal-case tracking-normal"
        >
          <i :class="link.icon" class="text-slate-500 group-hover:text-amber-400 text-sm transition-colors"></i>
          <span>{{ link.name }}</span>
        </BaseButton>
      </li>
    </ul>
  </div>
</template>
