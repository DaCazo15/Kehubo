<script setup lang="ts">
import { useAuth } from '../../../composables/useAuth'
import NotificationBell from '../../notifications/NotificationBell.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="md:hidden flex items-center gap-2">
    <NotificationBell v-if="isAuthenticated" />
    <BaseButton 
      :to="{ name: 'game-rapido' }" 
      variant="pink"
      size="xs"
      rounded="lg"
    >
      Jugar
    </BaseButton>
    <button
      type="button"
      @click="emit('toggle')"
      class="p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition cursor-pointer"
      :aria-label="isOpen ? 'Cerrar menú' : 'Abrir menú'"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
