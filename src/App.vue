<script setup>
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/landing/Navbar.vue'
import ProfileNavbar from './components/profile/ProfileNavbar.vue'
import AuthModal from './components/auth/AuthModal.vue'
import { useAuth } from './composables/useAuth'

const route = useRoute()
const { initAuthListener, isAuthenticated } = useAuth()

onMounted(() => {
  initAuthListener()
})

const isGameView = computed(() => ['game', 'game-rapido'].includes(route.name))

// Si el usuario está en el perfil o en ranking estando autenticado, o navegando autenticado en vistas no-landing,
// mantenemos el ProfileNavbar activo para que nunca pierda el botón de su perfil.
const showProfileNavbar = computed(() => {
  if (isGameView.value) return false
  return route.name === 'perfil' || (route.name === 'ranking' && isAuthenticated.value) || (isAuthenticated.value && route.name !== 'home')
})

const showLandingNavbar = computed(() => {
  if (isGameView.value) return false
  return !showProfileNavbar.value
})
</script>

<template>
  <div class="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] selection:bg-pink-500 selection:text-white">
    <ProfileNavbar v-if="showProfileNavbar" />
    <Navbar v-else-if="showLandingNavbar" />
    <RouterView />
    <AuthModal />
  </div>
</template>
