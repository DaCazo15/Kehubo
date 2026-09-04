<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    @click="emit('click')"
    :disabled="loading"
    class="w-full py-2 px-4 mb-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
    </svg>
    <span>Continuar con Google</span>
  </button>
</template>
