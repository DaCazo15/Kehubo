<script setup lang="ts">
import FooterBrand from './footer/FooterBrand.vue'
import FooterNav from './footer/FooterNav.vue'
import FooterContact from './footer/FooterContact.vue'
</script>

<template>
  <footer class="bg-slate-950 border-t border-slate-900 pt-16 pb-12 font-['Montserrat'] select-none">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
        <!-- Columna 1: Logo & Info -->
        <FooterBrand />

        <!-- Columna 2: Navegación -->
        <FooterNav />

        <!-- Columna 3: Contacto -->
        <FooterContact />
      </div>

      <!-- Copyright -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {{ new Date().getFullYear() }} Kehubo Game. Todos los derechos reservados.</p>
        <p class="text-slate-500">Desarrollado con pasión para los amantes de los desafíos de memoria.</p>
      </div>

    </div>
  </footer>
</template>
