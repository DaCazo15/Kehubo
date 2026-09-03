<script setup>
import { RouterLink } from 'vue-router'
import { img } from '../../helpers/imagenes'
</script>

<template>
  <footer class="bg-slate-950 border-t border-slate-900 pt-16 pb-12 font-['Montserrat']">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
        
        <!-- Columna 1: Logo & Info -->
        <div class="md:col-span-2 space-y-4">
          <RouterLink to="/" class="flex items-center gap-3">
            <img 
              :src="img.isologo" 
              alt="Kehubo Logo" 
              class="h-10 w-auto object-contain"
            />
          </RouterLink>
          <p class="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
            Plataforma de juego de memoria táctica de cartas en tiempo real. Entrena tu mente, compite contra otros jugadores y domina la arena.
          </p>
        </div>

        <!-- Columna 2: Navegación -->
        <div class="space-y-3">
          <h4 class="text-xs font-black uppercase tracking-widest text-amber-400">Navegación</h4>
          <ul class="space-y-2 text-xs font-semibold text-slate-400">
            <li>
              <RouterLink to="/" class="hover:text-amber-300 transition-colors">Inicio</RouterLink>
            </li>
            <li>
              <RouterLink :to="{ name: 'game-rapido' }" class="hover:text-pink-400 transition-colors">Juego Rápido</RouterLink>
            </li>
            <li>
              <RouterLink to="/ranking" class="hover:text-amber-300 transition-colors">Ranking Global</RouterLink>
            </li>
            <li>
              <RouterLink to="/about" class="hover:text-amber-300 transition-colors">Acerca de Kehubo</RouterLink>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Legal & Tecnologías -->
        <div class="space-y-3">
          <h4 class="text-xs font-black uppercase tracking-widest text-pink-400">Tecnologías</h4>
          <ul class="space-y-2 text-xs font-medium text-slate-500">
            <li>Vue 3 + Vite</li>
            <li>Tailwind CSS 4</li>
            <li>Firebase & VueFire</li>
            <li>Pinia State Store</li>
          </ul>
        </div>

      </div>

      <!-- Copyright -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
        <p>© {{ new Date().getFullYear() }} Kehubo Game. Todos los derechos reservados.</p>
        <p class="text-slate-500">Inspirado en la inmersión visual de los grandes MMORPGs.</p>
      </div>

    </div>
  </footer>
</template>
