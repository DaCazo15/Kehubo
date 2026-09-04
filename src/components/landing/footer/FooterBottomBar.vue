<script setup lang="ts">
import { FOOTER_LEGAL_LINKS, type LegalDocType } from './footerData'

defineEmits<{
  (e: 'open-legal', doc: LegalDocType): void
}>()

const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="pt-8">
    <!-- Contenedor de 1 sola línea horizontal en pantallas medianas/grandes -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 text-xs text-slate-500 text-center lg:text-left">
      <!-- Izquierda: Copyright -->
      <p class="shrink-0 text-slate-400">
        © {{ currentYear }} Kehubo Game. Todos los derechos reservados.
      </p>

      <!-- Centro: Enlaces Legales con Iconos -->
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-semibold text-slate-400">
        <button
          v-for="item in FOOTER_LEGAL_LINKS"
          :key="item.id"
          type="button"
          @click="$emit('open-legal', item.id)"
          class="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer group"
        >
          <i :class="item.icon" class="text-slate-500 group-hover:text-amber-400 text-xs transition-colors"></i>
          <span class="group-hover:underline underline-offset-4">{{ item.label }}</span>
        </button>
      </div>

      <!-- Derecha: Texto descriptivo / Tagline -->
      <p class="text-slate-500 text-[11px] sm:text-xs shrink-0 lg:text-right">
        Para los amantes de los desafíos de memoria.
      </p>
    </div>
  </div>
</template>
