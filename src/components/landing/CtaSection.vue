<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const { isAuthenticated, openAuthModal } = useAuth()
</script>

<template>
  <section class="py-20 relative font-['Montserrat'] overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Contenedor con borde glowing y fondo místico -->
      <div class="relative rounded-3xl overflow-hidden bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 p-8 sm:p-14 shadow-2xl shadow-amber-500/10 text-center">
        
        <!-- Efectos de luz ambiente -->
        <div class="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 class="text-3xl sm:text-5xl font-black uppercase text-slate-100 tracking-tight leading-tight">
            EL TABLERO TE ESPERA, <br/>
            <span class="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
              ¿CUÁL SERÁ TU RÉCORD?
            </span>
          </h2>

          <p class="text-sm sm:text-base text-slate-300">
            Inicia una partida en segundos sin descargas ni registros obligatorios, o ingresa con tu cuenta para asegurar tu puesto entre los líderes del reino.
          </p>

          <div class="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <RouterLink 
              :to="{ name: 'game-rapido' }"
              class="w-full sm:w-auto game-btn-pink py-4 px-10 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-transform"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Entrar al Juego</span>
            </RouterLink>

            <button
              v-if="!isAuthenticated"
              @click="openAuthModal('register')"
              class="w-full sm:w-auto game-btn-gold py-4 px-8 rounded-2xl text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5"
            >
              <span>Registrarse Gratis</span>
            </button>
            <RouterLink
              v-else
              to="/ranking"
              class="w-full sm:w-auto game-btn-gold py-4 px-8 rounded-2xl text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5"
            >
              <span>Explorar Ranking</span>
            </RouterLink>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>
