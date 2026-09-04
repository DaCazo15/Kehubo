<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: { email: string; password: string }): void
}>()

const email = ref<string>('')
const password = ref<string>('')

function handleSubmit() {
  emit('submit', { email: email.value, password: password.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-3">
    <!-- Correo -->
    <div>
      <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
        Correo Electrónico
      </label>
      <input
        v-model="email"
        type="email"
        required
        placeholder="ejemplo@correo.com"
        class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
      />
    </div>

    <!-- Contraseña -->
    <div>
      <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
        Contraseña
      </label>
      <input
        v-model="password"
        type="password"
        required
        placeholder="••••••••"
        class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
      />
    </div>

    <!-- Botón de Envío -->
    <div class="pt-2">
      <BaseButton
        type="submit"
        :disabled="loading"
        :loading="loading"
        variant="gold"
        size="md"
        rounded="xl"
        block
      >
        <span>{{ loading ? 'Conectando...' : 'Ingresar al Juego' }}</span>
      </BaseButton>
    </div>
  </form>
</template>
