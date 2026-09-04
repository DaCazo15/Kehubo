<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { img } from '../../helpers/imagenes'

const navLinks = [
  { name: 'Inicio', path: '/', icon: 'bi-house-door-fill' },
  { name: 'Salas Competitivas', path: '/competitivo', icon: 'bi-people-fill' },
  { name: 'Juego Rápido', path: '/juego-rapido', icon: 'bi-play-circle-fill' },
  { name: 'Ranking Global', path: '/ranking', icon: 'bi-trophy-fill' },
  { name: 'Acerca de Kehubo', path: '/about', icon: 'bi-info-circle-fill' }
]

const contactLinks = [
  { label: '+58 414 819 7912', href: 'tel:+584148197912', icon: 'bi-telephone-fill', isExternal: true },
  { label: 'dcazorla.0190@gmail.com', href: 'mailto:dcazorla.0190@gmail.com', icon: 'bi-envelope-fill', isExternal: true },
  { label: 'Portafolio Web', href: 'https://dacazo15.netlify.app/', icon: 'bi-globe2', isExternal: true },
  { label: 'GitHub', href: 'https://github.com/DaCazo15', icon: 'bi-github', isExternal: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/danielcp5150190/', icon: 'bi-linkedin', isExternal: true }
]
</script>

<template>
  <footer class="bg-slate-950 border-t border-slate-900 pt-16 pb-12 font-['Montserrat'] select-none">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
        
        <!-- Columna 1: Logo & Info (5 columnas) -->
        <div class="md:col-span-5 space-y-4">
          <RouterLink to="/" class="inline-flex items-center gap-3 group">
            <img 
              :src="img.isologo" 
              alt="Kehubo Logo" 
              class="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]"
            />
          </RouterLink>
          <p class="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
            Plataforma de juego de memoria táctica de cartas en tiempo real. Entrena tu mente, compite contra otros guerreros en salas privadas y domina la arena.
          </p>
        </div>

        <!-- Columna 2: Navegación (3 columnas) -->
        <div class="md:col-span-3 space-y-4">
          <h4 class="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <i class="bi bi-compass-fill"></i>
            <span>Navegación</span>
          </h4>
          <ul class="space-y-2.5 text-xs font-semibold text-slate-400">
            <li v-for="link in navLinks" :key="link.name">
              <RouterLink 
                :to="link.path" 
                class="hover:text-amber-300 transition-colors flex items-center gap-2 group"
              >
                <i :class="link.icon" class="text-slate-500 group-hover:text-amber-400 text-sm transition-colors"></i>
                <span>{{ link.name }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Contacto (4 columnas) -->
        <div class="md:col-span-4 space-y-4">
          <h4 class="text-xs font-black uppercase tracking-widest text-pink-400 flex items-center gap-2">
            <i class="bi bi-person-lines-fill"></i>
            <span>Contacto</span>
          </h4>
          <ul class="space-y-2.5 text-xs font-semibold text-slate-400">
            <li v-for="contact in contactLinks" :key="contact.label">
              <a 
                :href="contact.href"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-pink-300 transition-colors flex items-center gap-2.5 group"
              >
                <i :class="contact.icon" class="text-slate-500 group-hover:text-pink-400 text-sm transition-colors"></i>
                <span class="truncate">{{ contact.label }}</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      <!-- Copyright -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {{ new Date().getFullYear() }} Kehubo Game. Todos los derechos reservados.</p>
        <p class="text-slate-500">Desarrollado con pasión para los amantes de los desafíos de memoria.</p>
      </div>

    </div>
  </footer>
</template>
