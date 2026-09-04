<script setup lang="ts">
defineProps<{
  rankingType: 'global' | 'local'
  userCountry: string
}>()

const emit = defineEmits<{
  (e: 'update:rankingType', type: 'global' | 'local'): void
  (e: 'localClick'): void
}>()
</script>

<template>
  <div class="flex justify-center">
    <div class="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
      <button
        type="button"
        @click="emit('update:rankingType', 'global')"
        class="px-6 py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        :class="rankingType === 'global' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
      >
        <i class="bi bi-globe2"></i> Global
      </button>

      <button
        v-if="userCountry"
        type="button"
        @click="emit('localClick')"
        class="px-6 py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        :class="rankingType === 'local' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
      >
        <span :class="'flag:' + userCountry.toUpperCase()" class="inline-block rounded-xs shadow-xs"></span>
        Local
      </button>

      <button
        v-else
        type="button"
        @click="emit('localClick')"
        class="px-6 py-2 text-xs font-bold rounded-lg duration-200 uppercase tracking-wider flex items-center gap-2 text-slate-500 hover:text-slate-400 transition cursor-pointer"
        title="Configura tu país en tu perfil"
      >
        <i class="bi bi-geo-alt-fill"></i> Local (Sin País)
      </button>
    </div>
  </div>
</template>
