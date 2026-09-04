<script setup lang="ts">
import { FOOTER_CONTACT_LINKS } from './footerData'
</script>

<template>
  <div class="md:col-span-4 space-y-4">
    <h4 class="text-xs font-black uppercase tracking-widest text-pink-400 flex items-center gap-2">
      <i class="bi bi-person-lines-fill"></i>
      <span>Contacto</span>
    </h4>
    <ul class="space-y-2.5 text-xs font-semibold text-slate-400">
      <li v-for="contact in FOOTER_CONTACT_LINKS" :key="contact.label">
        <a 
          :href="contact.href"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-pink-300 transition-colors flex items-center gap-2.5 group"
        >
          <i :class="contact.icon" class="text-slate-500 group-hover:text-pink-400 text-sm transition-colors"></i>
          <span class="truncate">{{ contact.label }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
