<script setup lang="ts">
import { countries } from '../../helpers/countries'

defineProps<{
  modelValue: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div>
    <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
      Reino / País de Origen
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :required="required"
        class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition appearance-none cursor-pointer"
      >
        <option value="" disabled selected>Selecciona tu país</option>
        <option 
          v-for="c in countries" 
          :key="c.code" 
          :value="c.code"
          class="bg-slate-900 text-slate-100"
        >
          {{ c.flag }} {{ c.name }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  </div>
</template>
