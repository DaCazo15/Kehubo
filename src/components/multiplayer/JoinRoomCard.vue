<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'join', code: string): void
}>()

const inputCode = ref<string>('')

function handleJoin() {
  if (inputCode.value.trim()) {
    emit('join', inputCode.value.trim().toUpperCase())
  }
}
</script>

<template>
  <div class="game-card-portal rounded-3xl p-6 sm:p-8 space-y-6 border border-pink-500/30 shadow-2xl">
    <div class="flex items-center gap-3 pb-4 border-b border-slate-800">
      <div class="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-lg">
        <i class="bi bi-key-fill"></i>
      </div>
      <div>
        <h3 class="text-base font-black uppercase text-slate-100">
          Ingresar a Sala Privada
        </h3>
        <p class="text-xs text-slate-400">
          Introduce el código de 6 caracteres que te compartió el moderador (ej. KH-7842).
        </p>
      </div>
    </div>

    <form @submit.prevent="handleJoin" class="space-y-4">
      <div class="space-y-2">
        <label class="text-xs font-black uppercase tracking-wider text-slate-300">
          Código de la Sala
        </label>
        <input
          v-model="inputCode"
          type="text"
          placeholder="KH-XXXX"
          maxlength="10"
          class="w-full uppercase text-center tracking-widest text-2xl font-black bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 rounded-2xl py-4 px-4 text-slate-100 placeholder-slate-600 outline-none transition font-mono"
        />
      </div>

      <BaseButton
        type="submit"
        :disabled="loading || !inputCode.trim()"
        :loading="loading"
        variant="pink"
        size="lg"
        rounded="2xl"
        block
      >
        <template #icon-left>
          <i class="bi bi-door-open-fill text-lg"></i>
        </template>
        <span>{{ loading ? 'Conectando...' : 'Unirse a la Partida' }}</span>
      </BaseButton>
    </form>
  </div>
</template>
