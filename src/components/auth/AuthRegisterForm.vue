<script setup lang="ts">
import { ref } from 'vue'
import AuthGenderSelect from './AuthGenderSelect.vue'
import AuthCountrySelect from './AuthCountrySelect.vue'
import type { UserGender } from '../../types'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: {
    name: string
    email: string
    password: string
    confirmPassword: string
    genero: UserGender
    country: string
  }): void
}>()

const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')
const genero = ref<UserGender>('hombre')
const country = ref<string>('')

function handleSubmit() {
  emit('submit', {
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    genero: genero.value,
    country: country.value
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0">
    <!-- Nombre (Col 1) -->
    <div class="sm:col-span-1">
      <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
        Nombre / Nickname
      </label>
      <input
        v-model="name"
        type="text"
        required
        placeholder="Ej. LordKael"
        class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
      />
    </div>

    <!-- Selección de Género (Col 2) -->
    <div class="sm:col-span-1">
      <AuthGenderSelect v-model="genero" />
    </div>

    <!-- Correo (Col 1) -->
    <div class="sm:col-span-1">
      <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
        Correo Electrónico
      </label>
      <input
        v-model="email"
        type="email"
        required
        placeholder="ejemplo@correo.com"
        class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
      />
    </div>

    <!-- País de Origen (Col 2) -->
    <div class="sm:col-span-1">
      <AuthCountrySelect v-model="country" required />
    </div>

    <!-- Contraseña (Col 1) -->
    <div class="sm:col-span-1">
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

    <!-- Confirmar Contraseña (Col 2) -->
    <div class="sm:col-span-1">
      <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
        Confirmar Contraseña
      </label>
      <input
        v-model="confirmPassword"
        type="password"
        required
        placeholder="••••••••"
        class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
      />
    </div>

    <!-- Botón de Envío -->
    <div class="sm:col-span-2 pt-2">
      <BaseButton
        type="submit"
        :disabled="loading"
        :loading="loading"
        variant="pink"
        size="md"
        rounded="xl"
        block
      >
        <span>{{ loading ? 'Conectando...' : 'Crear mi Cuenta' }}</span>
      </BaseButton>
    </div>
  </form>
</template>
