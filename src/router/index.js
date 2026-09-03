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
    path: '/perfil',
    name: 'perfil',
    component: () => import('../views/ProfileView.vue'),
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: () => import('../views/RankingView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
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
