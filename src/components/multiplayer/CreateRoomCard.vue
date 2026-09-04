<script setup lang="ts">
defineProps<{
  cardCount: number
  cartasVisibles: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:cardCount', val: number): void
  (e: 'update:cartasVisibles', val: boolean): void
  (e: 'create'): void
}>()

const cardOptions = [
  { count: 16, tag: 'Rápido', icon: 'bi-lightning-charge-fill' },
  { count: 24, tag: 'Normal', icon: 'bi-controller' },
  { count: 32, tag: 'Desafío', icon: 'bi-fire' },
  { count: 40, tag: 'Épico', icon: 'bi-trophy-fill' }
]
</script>

<template>
  <div class="game-card-portal rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/30 shadow-2xl">
    <div class="flex items-center gap-3 pb-4 border-b border-slate-800">
      <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
        <i class="bi bi-gear-fill"></i>
      </div>
      <div>
        <h3 class="text-base font-black uppercase text-slate-100">
          Configuración de la Arena
        </h3>
        <p class="text-xs text-slate-400">
          Define las reglas del duelo antes de convocar a los combatientes.
        </p>
      </div>
    </div>

    <!-- Selector de Cantidad de Cartas -->
    <div class="space-y-3">
      <label class="text-xs font-black uppercase tracking-wider text-slate-300">
        Cantidad de Cartas
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="opt in cardOptions"
          :key="opt.count"
          type="button"
          @click="emit('update:cardCount', opt.count)"
          class="p-3.5 rounded-2xl border transition-all text-center space-y-1 cursor-pointer"
          :class="cardCount === opt.count ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'"
        >
          <div class="w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-sm"
               :class="cardCount === opt.count ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'">
            <i :class="['bi', opt.icon]"></i>
          </div>
          <p class="font-black text-sm text-slate-100">{{ opt.count }} Cartas</p>
          <span class="text-[10px] uppercase font-bold text-slate-400">{{ opt.tag }}</span>
        </button>
      </div>
    </div>

    <!-- Toggle Cartas Visibles -->
    <div class="space-y-3">
      <label class="text-xs font-black uppercase tracking-wider text-slate-300">
        Visibilidad Inicial
      </label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          @click="emit('update:cartasVisibles', false)"
          class="p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer"
          :class="!cartasVisibles ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'"
        >
          <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 text-lg shrink-0">
            <i class="bi bi-eye-slash-fill"></i>
          </div>
          <div>
            <h4 class="text-xs font-black uppercase text-slate-100">Cartas Ocultas</h4>
            <p class="text-[11px] text-slate-400">Inicio a ciegas sin vista previa.</p>
          </div>
        </button>

        <button
          type="button"
          @click="emit('update:cartasVisibles', true)"
          class="p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer"
          :class="cartasVisibles ? 'bg-pink-500/20 border-pink-400 ring-2 ring-pink-400/30' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'"
        >
          <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-pink-400 text-lg shrink-0">
            <i class="bi bi-eye-fill"></i>
          </div>
          <div>
            <h4 class="text-xs font-black uppercase text-slate-100">Cartas Viradas</h4>
            <p class="text-[11px] text-slate-400">Visibles durante el conteo de 5s.</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Botón Crear Sala -->
    <div class="pt-4">
      <BaseButton
        variant="gold"
        size="lg"
        rounded="2xl"
        block
        :disabled="loading"
        :loading="loading"
        @click="emit('create')"
      >
        <template #icon-left>
          <i class="bi bi-plus-circle-fill text-lg"></i>
        </template>
        <span>{{ loading ? 'Creando Sala...' : 'Crear Sala y Obtener Código' }}</span>
      </BaseButton>
    </div>
  </div>
</template>
