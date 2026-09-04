<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

export type ButtonVariant = 
  | 'gold' 
  | 'pink' 
  | 'amber' 
  | 'slate' 
  | 'danger' 
  | 'emerald' 
  | 'outline' 
  | 'ghost' 
  | 'none'
  | 'custom'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none'
export type ButtonRounded = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw | string | null
    href?: string | null
    variant?: ButtonVariant
    size?: ButtonSize
    rounded?: ButtonRounded
    disabled?: boolean
    loading?: boolean
    block?: boolean
    type?: 'button' | 'submit' | 'reset'
    customClass?: string
  }>(),
  {
    to: null,
    href: null,
    variant: 'gold',
    size: 'md',
    rounded: 'xl',
    disabled: false,
    loading: false,
    block: false,
    type: 'button',
    customClass: ''
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isRouterLink = computed(() => !!props.to)
const isAnchor = computed(() => !props.to && !!props.href)

const resolvedTag = computed(() => {
  if (isRouterLink.value) return RouterLink
  if (isAnchor.value) return 'a'
  return 'button'
})

const variantClasses: Record<ButtonVariant, string> = {
  gold: 'game-btn-gold text-slate-950 shadow-xl',
  pink: 'game-btn-pink text-white shadow-xl',
  amber: 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border border-amber-400/50',
  slate: 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 font-black border border-slate-800 shadow-md',
  danger: 'bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-500/40 shadow-md',
  emerald: 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 shadow-md',
  outline: 'bg-transparent border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 font-bold transition-colors',
  ghost: 'bg-transparent text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 font-bold transition-colors',
  none: '',
  custom: ''
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-8 px-3 text-xs leading-none',
  sm: 'h-9.5 px-4 text-xs leading-none',
  md: 'h-11 px-5 text-sm leading-none',
  lg: 'h-13 px-6 sm:px-8 text-sm sm:text-base leading-none',
  xl: 'h-15 px-8 sm:px-10 text-base sm:text-lg leading-none',
  none: ''
}

const roundedClasses: Record<ButtonRounded, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
  none: 'rounded-none'
}

const buttonClasses = computed(() => {
  return [
    'inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider transition-all duration-300 select-none text-center box-border shrink-0',
    variantClasses[props.variant] || '',
    sizeClasses[props.size] || '',
    roundedClasses[props.rounded] || '',
    props.block ? 'w-full' : '',
    props.disabled || props.loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-95',
    props.customClass
  ].filter(Boolean).join(' ')
})

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="resolvedTag"
    v-bind="isRouterLink ? { to: to! } : isAnchor ? { href: href! } : { type, disabled: disabled || loading }"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Slot para estado de carga -->
    <template v-if="loading">
      <slot name="loading" :loading="loading" :disabled="disabled">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </slot>
    </template>

    <!-- Slot de icono a la izquierda -->
    <slot 
      name="icon-left" 
      :loading="loading" 
      :disabled="disabled" 
      :variant="variant" 
      :size="size"
    ></slot>

    <!-- Slot principal que provee props a través de slot-props -->
    <slot 
      :loading="loading" 
      :disabled="disabled" 
      :variant="variant" 
      :size="size"
      :to="to"
    ></slot>

    <!-- Slot de icono a la derecha -->
    <slot 
      name="icon-right" 
      :loading="loading" 
      :disabled="disabled" 
      :variant="variant" 
      :size="size"
    ></slot>
  </component>
</template>
