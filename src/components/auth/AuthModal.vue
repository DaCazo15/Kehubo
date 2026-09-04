<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { maleAvatars, femaleAvatars } from '../../helpers/avatars'
import { countries } from '../../helpers/countries'

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

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const genero = ref('hombre') // 'hombre' | 'mujer'
const country = ref('') // código de país
const localError = ref('')

// Limpiar formulario cuando se abre o cambia de modo
watch([isAuthModalOpen, authMode], () => {
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  genero.value = 'hombre'
  country.value = ''
  localError.value = ''
})

function handleKeydown(e) {
  if (e.key === 'Escape' && isAuthModalOpen.value) {
    closeAuthModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

async function handleSubmit() {
  localError.value = ''
  
  if (!email.value || !password.value) {
    localError.value = 'Por favor completa todos los campos requeridos.'
    return
  }

  if (authMode.value === 'register') {
    if (password.value !== confirmPassword.value) {
      localError.value = 'Las contraseñas no coinciden.'
      return
    }
    if (password.value.length < 6) {
      localError.value = 'La contraseña debe tener al menos 6 caracteres.'
      return
    }
    if (!country.value) {
      localError.value = 'Por favor selecciona tu nacionalidad.'
      return
    }
    await registerWithEmail(name.value, email.value, password.value, genero.value, country.value)
  } else {
    await loginWithEmail(email.value, password.value)
  }
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
      v-if="isAuthModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <!-- Backdrop con desenfoque profundo y tinte oscuro -->
      <div 
        class="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        @click="closeAuthModal"
      ></div>

      <!-- Contenedor del Modal con estética Albion / Gaming Portal -->
      <div
        class="relative w-full bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 p-5 sm:p-7 overflow-hidden z-10 my-auto transition-all duration-300"
        :class="authMode === 'register' ? 'max-w-2xl' : 'max-w-md'"
        @click.stop
      >
        <!-- Decoraciones lumínicas de fondo en el modal -->
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Botón cerrar (X) -->
        <button
          @click="closeAuthModal"
          class="absolute top-3 right-3 text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors z-20"
          aria-label="Cerrar modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Cabecera / Emblema -->
        <div class="text-center mb-3 sm:mb-4">
          <div class="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/30 mb-2 shadow-inner">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-xl sm:text-2xl font-black tracking-wide uppercase text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-amber-100 to-pink-400 font-['Montserrat']">
            {{ authMode === 'login' ? 'Portal del Guerrero' : 'Forja tu Leyenda' }}
          </h3>
          <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {{ authMode === 'login' ? 'Accede para sincronizar tu progreso y ranking' : 'Crea tu cuenta para competir en la tabla global' }}
          </p>
        </div>

        <!-- Selector de pestañas Login / Register dentro del mismo modal -->
        <div class="flex p-1 bg-slate-950/70 border border-slate-800 rounded-xl mb-3 sm:mb-4">
          <button
            type="button"
            @click="authMode = 'login'"
            class="flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider"
            :class="authMode === 'login' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'"
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            @click="authMode = 'register'"
            class="flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider"
            :class="authMode === 'register' 
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'"
          >
            Registrarse
          </button>
        </div>

        <!-- Mensajes de Error -->
        <div 
          v-if="localError || authError" 
          class="mb-3 p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-shake"
        >
          <svg class="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ localError || authError }}</span>
        </div>

        <!-- Botón rápido con Google -->
        <button
          type="button"
          @click="loginWithGoogle"
          :disabled="loading"
          class="w-full py-2 px-4 mb-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <!-- Separador -->
        <div class="relative flex items-center justify-center my-2.5">
          <div class="border-t border-slate-800 w-full"></div>
          <span class="bg-slate-900 px-3 text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500">correo</span>
          <div class="border-t border-slate-800 w-full"></div>
        </div>

        <!-- Formulario: 2 Columnas en Registro, 1 Columna en Login -->
        <form 
          @submit.prevent="handleSubmit" 
          :class="authMode === 'register' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0' : 'space-y-3'"
        >
          <!-- Nombre (sólo en Registro - Col 1) -->
          <div v-if="authMode === 'register'" class="sm:col-span-1">
            <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Nombre / Nickname
            </label>
            <div class="relative">
              <input
                v-model="name"
                type="text"
                required
                placeholder="Ej. LordKael"
                class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <!-- Selección de Género (sólo en Registro - Col 2) -->
          <div v-if="authMode === 'register'" class="sm:col-span-1">
            <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Identidad de Guerrero (Sexo)
            </label>
            <div class="grid grid-cols-2 gap-2">
              <!-- Opción Hombre -->
              <button
                type="button"
                @click="genero = 'hombre'"
                class="flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left"
                :class="genero === 'hombre'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'"
              >
                <img 
                  :src="maleAvatars[0]" 
                  alt="Hombre" 
                  class="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-amber-400/40 shrink-0"
                />
                <div class="min-w-0">
                  <p class="text-[11px] sm:text-xs font-black uppercase truncate">Hombre</p>
                  <p class="text-[9px] text-slate-400 truncate">Avatar inicial</p>
                </div>
              </button>

              <!-- Opción Mujer -->
              <button
                type="button"
                @click="genero = 'mujer'"
                class="flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left"
                :class="genero === 'mujer'
                  ? 'bg-pink-500/20 border-pink-400 text-pink-200 shadow-md shadow-pink-500/10 ring-1 ring-pink-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'"
              >
                <img 
                  :src="femaleAvatars[0]" 
                  alt="Mujer" 
                  class="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-pink-400/40 shrink-0"
                />
                <div class="min-w-0">
                  <p class="text-[11px] sm:text-xs font-black uppercase truncate">Mujer</p>
                  <p class="text-[9px] text-slate-400 truncate">Avatar inicial</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Email (Col 1 en Registro, Full en Login) -->
          <div :class="authMode === 'register' ? 'sm:col-span-1' : ''">
            <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="tu@reino.com"
              class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <!-- Selección de Nacionalidad (sólo en Registro - Col 2) -->
          <div v-if="authMode === 'register'" class="sm:col-span-1">
            <label class="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Nacionalidad
            </label>
            <div class="relative">
              <select
                v-model="country"
                required
                class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 outline-none transition appearance-none"
              >
                <option value="" disabled selected>Selecciona tu país</option>
                <option v-for="c in countries" :key="c.code" :value="c.code">
                  {{ c.flag }} {{ c.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <!-- Contraseña (Col 1 en Registro, Full en Login) -->
          <div :class="authMode === 'register' ? 'sm:col-span-1' : ''">
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

          <!-- Confirmar Contraseña (sólo en Registro - Col 2) -->
          <div v-if="authMode === 'register'" class="sm:col-span-1">
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

          <!-- Botón de Envío (Full Width) -->
          <div :class="authMode === 'register' ? 'sm:col-span-2 pt-1.5' : 'pt-1.5'">
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 sm:py-3 px-6 rounded-xl font-black uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-xs sm:text-sm"
              :class="authMode === 'login' ? 'game-btn-gold text-slate-950' : 'game-btn-pink text-white'"
            >
              <svg 
                v-if="loading" 
                class="animate-spin h-4 w-4 sm:h-5 sm:w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>
                {{ loading ? 'Conectando...' : (authMode === 'login' ? 'Ingresar al Juego' : 'Crear mi Cuenta') }}
              </span>
            </button>
          </div>
        </form>

        <!-- Pie de modal con alternancia rápida -->
        <div class="mt-4 text-center text-xs text-slate-400">
          <span v-if="authMode === 'login'">
            ¿Aún no tienes cuenta?
            <button 
              @click="toggleAuthMode" 
              class="text-pink-400 hover:text-pink-300 font-bold ml-1 hover:underline"
            >
              Regístrate aquí
            </button>
          </span>
          <span v-else>
            ¿Ya estás registrado?
            <button 
              @click="toggleAuthMode" 
              class="text-amber-400 hover:text-amber-300 font-bold ml-1 hover:underline"
            >
              Inicia sesión
            </button>
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>
