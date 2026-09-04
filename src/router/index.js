import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/juego-rapido',
    name: 'game-rapido',
    component: () => import('../views/GameRapidoView.vue'),
  },
  {
    path: '/kehubo',
    name: 'game',
    component: () => import('../views/GameView.vue'),
  },
  {
    path: '/perfil/:id?',
    name: 'perfil',
    component: () => import('../views/ProfileView.vue'),
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: () => import('../views/RankingView.vue'),
  },
  {
    path: '/competitivo',
    name: 'multiplayer-lobby',
    component: () => import('../views/MultiplayerLobbyView.vue'),
  },
  {
    path: '/sala/:roomId',
    name: 'multiplayer-room',
    component: () => import('../views/MultiplayerRoomView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

// Recuperación automática de chunks obsoletos en despliegues (Vite/SPA cache busting)
router.onError((error, to) => {
  const isChunkError = 
    error.message?.includes('Failed to fetch dynamically imported module') ||
    error.message?.includes('Importing a module script failed') ||
    error.message?.includes('Expected a JavaScript-or-Wasm module script')

  if (isChunkError) {
    const reloadKey = 'kehubo_chunk_reload_' + to.path
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, 'true')
      window.location.assign(to.fullPath)
    }
  }
})

router.afterEach((to) => {
  sessionStorage.removeItem('kehubo_chunk_reload_' + to.path)
})

export default router
