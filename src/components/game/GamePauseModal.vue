<script setup lang="ts">
import BaseModal from '../common/BaseModal.vue'

withDefaults(
  defineProps<{
    isOpen?: boolean
  }>(),
  {
    isOpen: false
  }
)

const emit = defineEmits<{
  (e: 'resume'): void
  (e: 'exit'): void
}>()
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    size="md"
    :show-close="false"
    :close-on-escape="true"
    :close-on-outside-click="false"
    @close="emit('resume')"
  >
    <!-- Cabecera e Icono de Pausa -->
    <template #header>
      <div class="text-center space-y-2 pt-2">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto bg-linear-to-br from-amber-500/20 to-pink-500/20 border-2 border-amber-400/80 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-500/20 text-amber-400 animate-pulse">
          <i class="bi bi-pause-fill"></i>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/30">
            Juego en Pausa
          </span>
          <h2 class="text-2xl sm:text-3xl font-black uppercase text-slate-100 tracking-tight">
            ¿DESEAS SALIR?
          </h2>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">
            La partida está pausada. Puedes continuar tu enfrentamiento o abandonar el duelo.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Advertencia de abandono -->
      <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
        <div class="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>Advertencia</span>
        </div>
        <p class="text-[11px] sm:text-xs text-slate-400">
          Si sales de la partida, el progreso actual, los pares acumulados y el tiempo se perderán y no se registrarán en las estadísticas.
        </p>
      </div>
    </div>

    <!-- Botones de Acción en Footer -->
    <template #footer>
      <div class="space-y-2.5">
        <BaseButton
          @click="emit('resume')"
          variant="gold"
          size="lg"
          rounded="2xl"
          block
          class="hover:scale-[1.02] shadow-lg shadow-amber-500/20"
        >
          <template #icon-left>
            <i class="bi bi-play-fill text-2xl"></i>
          </template>
          <span>Reanudar Partida</span>
        </BaseButton>

        <BaseButton
          @click="emit('exit')"
          variant="outline"
          size="md"
          rounded="xl"
          block
          class="border-slate-700 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors"
        >
          <template #icon-left>
            <i class="bi bi-box-arrow-left text-lg"></i>
          </template>
          <span>Salir de la Partida</span>
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
