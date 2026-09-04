<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import AuthGoogleButton from './AuthGoogleButton.vue'
import AuthLoginForm from './AuthLoginForm.vue'
import AuthRegisterForm from './AuthRegisterForm.vue'
import type { UserGender } from '../../types'

const {
  isAuthModalOpen,
  authMode,
  loading,
  authError,
  closeAuthModal,
  toggleAuthMode,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle
} = useAuth()

const localError = ref<string>('')

watch([isAuthModalOpen, authMode], () => {
  localError.value = ''
})

async function handleLoginSubmit(data: { email: string; password: string }) {
  localError.value = ''
  try {
    await loginWithEmail(data.email, data.password)
  } catch (err: any) {
    localError.value = err?.message || 'Error al iniciar sesión'
  }
}

async function handleRegisterSubmit(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
  genero: UserGender
  country: string
}) {
  localError.value = ''
  if (data.password !== data.confirmPassword) {
    localError.value = 'Las contraseñas no coinciden.'
    return
  }
  if (data.password.length < 6) {
    localError.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (!data.country) {
    localError.value = 'Por favor selecciona tu país de origen.'
    return
  }

  try {
    await registerWithEmail(data.email, data.password, data.name, data.genero, data.country)
  } catch (err: any) {
    localError.value = err?.message || 'Error al crear la cuenta'
  }
}
</script>

<template>
  <BaseModal
    :is-open="isAuthModalOpen"
    :size="authMode === 'register' ? 'xl' : 'md'"
    @close="closeAuthModal"
  >
    <!-- Header Personalizado -->
    <template #header>
      <div class="text-center space-y-1">
        <h2 class="text-2xl sm:text-3xl font-black uppercase text-slate-100 tracking-tight">
          {{ authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta' }}
        </h2>
        <p class="text-xs text-slate-400">
          {{ authMode === 'login' ? 'Accede a tu perfil y reclama tu gloria' : 'Únete al reino de Kehubo y compite' }}
        </p>
      </div>

      <!-- Selector de Modo (Login / Registro) -->
      <div class="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 mt-4">
        <button
          type="button"
          @click="authMode = 'login'"
          class="flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider cursor-pointer"
          :class="authMode === 'login' 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'"
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          @click="authMode = 'register'"
          class="flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider cursor-pointer"
          :class="authMode === 'register' 
            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'"
        >
          Registrarse
        </button>
      </div>
    </template>

    <!-- Mensajes de Error -->
    <div 
      v-if="localError || authError" 
      class="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-shake"
    >
      <svg class="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ localError || authError }}</span>
    </div>

    <!-- Google Login Rápido -->
    <AuthGoogleButton :loading="loading" @click="loginWithGoogle" />

    <!-- Separador -->
    <div class="relative flex items-center justify-center my-2">
      <div class="border-t border-slate-800 w-full"></div>
      <span class="bg-slate-900 px-3 text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500">correo</span>
      <div class="border-t border-slate-800 w-full"></div>
    </div>

    <!-- Formularios según Modo -->
    <AuthLoginForm 
      v-if="authMode === 'login'" 
      :loading="loading" 
      @submit="handleLoginSubmit" 
    />
    <AuthRegisterForm 
      v-else 
      :loading="loading" 
      @submit="handleRegisterSubmit" 
    />

    <!-- Footer: Alternar Modo -->
    <template #footer>
      <div class="text-center text-xs text-slate-400">
        <span v-if="authMode === 'login'">
          ¿Aún no tienes cuenta?
          <button 
            type="button"
            @click="toggleAuthMode" 
            class="text-pink-400 hover:text-pink-300 font-bold ml-1 hover:underline cursor-pointer"
          >
            Regístrate aquí
          </button>
        </span>
        <span v-else>
          ¿Ya estás registrado?
          <button 
            type="button"
            @click="toggleAuthMode" 
            class="text-amber-400 hover:text-amber-300 font-bold ml-1 hover:underline cursor-pointer"
          >
            Inicia sesión
          </button>
        </span>
      </div>
    </template>
  </BaseModal>
</template>
