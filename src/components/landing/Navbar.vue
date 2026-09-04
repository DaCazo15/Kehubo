<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavbarLogo from './navbar/NavbarLogo.vue'
import NavbarDesktopNav from './navbar/NavbarDesktopNav.vue'
import NavbarUserActions from './navbar/NavbarUserActions.vue'
import NavbarMobileToggle from './navbar/NavbarMobileToggle.vue'
import NavbarMobileMenu from './navbar/NavbarMobileMenu.vue'

const isScrolled = ref<boolean>(false)
const isMobileMenuOpen = ref<boolean>(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-['Montserrat']"
    :class="isScrolled 
      ? 'bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 shadow-2xl py-2.5 sm:py-3' 
      : 'bg-linear-to-b from-slate-950/90 via-slate-950/50 to-transparent py-3 sm:py-4'"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-2 sm:gap-4">
        
        <!-- Bloque 1 (Izquierda): Logo -->
        <NavbarLogo />

        <!-- Bloque 2 (Centro): Navegación Principal Desktop -->
        <NavbarDesktopNav />

        <!-- Bloque 3 (Derecha): CTA Juego Rápido + Login / Perfil -->
        <NavbarUserActions />

        <!-- Bloque 4 (Móvil): Botón Jugar + Campana + Toggle Hamburguesa -->
        <NavbarMobileToggle 
          :is-open="isMobileMenuOpen" 
          @toggle="toggleMobileMenu" 
        />

      </div>
    </div>

    <!-- Bloque 5 (Móvil): Menú Móvil Desplegable -->
    <NavbarMobileMenu 
      :is-open="isMobileMenuOpen" 
      @close="closeMobileMenu" 
    />
  </header>
</template>
