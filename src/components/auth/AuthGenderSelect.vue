<script setup lang="ts">
import { maleAvatars, femaleAvatars } from '../../helpers/avatars'
import type { UserGender } from '../../types'

defineProps<{
  modelValue: UserGender
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UserGender): void
}>()
</script>

<template>
  <div>
    <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
      Identidad de Guerrero (Sexo)
    </label>
    <div class="grid grid-cols-2 gap-2">
      <!-- Opción Hombre -->
      <button
        type="button"
        @click="emit('update:modelValue', 'hombre')"
        class="flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left cursor-pointer"
        :class="modelValue === 'hombre'
          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'"
      >
        <img 
          :src="maleAvatars[0]" 
          alt="Hombre" 
          class="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-amber-400/40 shrink-0"
        />
        <div class="min-w-0">
          <p class="text-[11px] sm:text-xs font-black uppercase truncate">Hombre</p>
          <p class="text-[9px] text-slate-400 truncate">Avatar inicial</p>
        </div>
      </button>

      <!-- Opción Mujer -->
      <button
        type="button"
        @click="emit('update:modelValue', 'mujer')"
        class="flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left cursor-pointer"
        :class="modelValue === 'mujer'
          ? 'bg-pink-500/20 border-pink-400 text-pink-200 shadow-md shadow-pink-500/10 ring-1 ring-pink-400'
          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'"
      >
        <img 
          :src="femaleAvatars[0]" 
          alt="Mujer" 
          class="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-pink-400/40 shrink-0"
        />
        <div class="min-w-0">
          <p class="text-[11px] sm:text-xs font-black uppercase truncate">Mujer</p>
          <p class="text-[9px] text-slate-400 truncate">Avatar inicial</p>
        </div>
      </button>
    </div>
  </div>
</template>
