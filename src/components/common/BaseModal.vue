<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

const props = withDefaults(
  defineProps<{
    isOpen?: boolean
    title?: string
    size?: ModalSize
    showClose?: boolean
    closeOnEscape?: boolean
    closeOnOutsideClick?: boolean
  }>(),
  {
    isOpen: false,
    title: '',
    size: 'lg',
    showClose: true,
    closeOnEscape: true,
    closeOnOutsideClick: true
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleKeyDown(event: KeyboardEvent) {
  if (props.closeOnEscape && props.isOpen && event.key === 'Escape') {
    emit('close')
  }
}

function handleBackdropClick() {
  if (props.closeOnOutsideClick) {
    emit('close')
  }
}

function lockBodyScroll(lock: boolean) {
  if (typeof document !== 'undefined') {
    if (lock) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  }
}

watch(() => props.isOpen, (isOpen) => {
  lockBodyScroll(!!isOpen)
}, { immediate: true })

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  if (props.isOpen) {
    lockBodyScroll(true)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  lockBodyScroll(false)
})

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-6xl'
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden font-['Montserrat']"
    >
      <!-- Backdrop oscurecido y blur -->
      <div 
        class="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        @click="handleBackdropClick"
      ></div>

      <!-- Contenedor del Modal Proporcional -->
      <div
        class="relative w-full max-h-[calc(100dvh-1.25rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10 z-10 transition-all transform animate-fadeIn my-auto overflow-hidden"
        :class="sizeClasses[size] || 'max-w-lg'"
        @click.stop
      >
        <!-- Botón de Cerrar (X) -->
        <button
          v-if="showClose"
          type="button"
          @click="emit('close')"
          class="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-amber-400 p-2 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer z-20"
          title="Cerrar modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Slot Cabecera / Icono -->
        <header 
          v-if="$slots.header || title" 
          class="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-slate-800/60"
        >
          <slot name="header">
            <h2 class="text-lg sm:text-2xl font-black uppercase text-slate-100 tracking-tight pr-8">
              {{ title }}
            </h2>
          </slot>
        </header>

        <!-- Slot Cuerpo Principal Scrollable -->
        <main class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 overscroll-contain custom-scrollbar space-y-4">
          <slot></slot>
        </main>

        <!-- Slot Pie de Modal -->
        <footer 
          v-if="$slots.footer" 
          class="shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800/80 bg-slate-900/95"
        >
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </Transition>
</template>
