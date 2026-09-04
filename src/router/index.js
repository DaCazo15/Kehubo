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

export default router
