<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/landing/Navbar.vue'
import AuthModal from './components/auth/AuthModal.vue'
import NotificationToast from './components/notifications/NotificationToast.vue'
import { useAuth } from './composables/useAuth'
import { useNotifications } from './composables/useNotifications'

const route = useRoute()
const { user, initAuthListener } = useAuth()
const { initNotificationsListener, stopListener } = useNotifications()

onMounted(() => {
  initAuthListener()
})

// Escuchar cambios de autenticación para activar/desactivar notificaciones en tiempo real
watch(user, (currentUser) => {
  if (currentUser?.uid) {
    initNotificationsListener(currentUser.uid)
  } else {
    stopListener()
  }
}, { immediate: true })

const isGameView = computed(() => {
  const name = String(route.name || '')
  return ['game', 'game-rapido', 'multiplayer-room'].includes(name)
})
</script>

<template>
  <div class="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-['Montserrat'] selection:bg-pink-500 selection:text-white">
    <Navbar v-if="!isGameView" />
    <RouterView />
    <AuthModal />
    <NotificationToast />
  </div>
</template>
