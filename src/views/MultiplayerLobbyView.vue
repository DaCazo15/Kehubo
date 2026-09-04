<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useMultiplayerRoom } from '../composables/useMultiplayerRoom'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { createRoom, joinRoom, loading, error } = useMultiplayerRoom()
const { isAuthenticated, openAuthModal } = useAuth()

// Configuración para nueva sala
const cardCount = ref<number>(24)
const cartasVisibles = ref<boolean>(false)

// Input de código para unirse
const inputCode = ref<string>('')
const activeTab = ref<'create' | 'join'>('create')

const difficulties = [
  { count: 16, label: '16 Cartas', desc: '8 pares • Rápido', cols: 'Grid 4x4' },
  { count: 24, label: '24 Cartas', desc: '12 pares • Estándar', cols: 'Grid 6x4' },
  { count: 32, label: '32 Cartas', desc: '16 pares • Desafío', cols: 'Grid 8x4' },
  { count: 40, label: '40 Cartas', desc: '20 pares • Experto', cols: 'Grid 10x4' }
]

async function handleCreateRoom() {
  const res = await createRoom({
    cardCount: cardCount.value,
    cartasVisibles: cartasVisibles.value
  })

  if (res.success) {
    router.push({ name: 'multiplayer-room', params: { roomId: res.roomId } })
  }
}

async function handleJoinRoom() {
  if (!inputCode.value.trim()) return
  const res = await joinRoom(inputCode.value)
  if (res.success) {
    router.push({ name: 'multiplayer-room', params: { roomId: res.roomId } })
  }
}
</script>

<template>
  <div class="min-h-screen pt-28 pb-20 bg-slate-950 text-slate-100 font-['Montserrat'] px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto space-y-8">
      
      <!-- Cabecera -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/5">
          <i class="bi bi-people-fill"></i>
          <span>Multijugador Privado</span>
        </div>
        
        <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
          Salas Competitivas
        </h1>
        
        <p class="text-sm text-slate-400 max-w-lg mx-auto">
          Enfréntate a hasta 4 guerreros en la misma sala en tiempo real con tableros idénticos y clasificación en vivo.
        </p>
      </div>

      <!-- Selector de Pestañas (Crear Sala / Unirse a Sala) -->
      <div class="flex justify-center">
        <div class="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex gap-1 w-full max-w-md shadow-xl">
          <button
            @click="activeTab = 'create'"
            class="flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            :class="activeTab === 'create' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'"
          >
            <i class="bi bi-plus-circle-fill"></i>
            <span>Crear Sala</span>
          </button>
          
          <button
            @click="activeTab = 'join'"
            class="flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            :class="activeTab === 'join' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          >
            <i class="bi bi-door-open-fill"></i>
            <span>Unirse a Sala</span>
          </button>
        </div>
      </div>

      <!-- Mensaje de Error si ocurre -->
      <div v-if="error" class="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
        <i class="bi bi-exclamation-triangle-fill text-red-400 text-sm"></i>
        <span>{{ error }}</span>
      </div>

      <!-- Sección 1: Crear Sala (Moderador) -->
      <div v-if="activeTab === 'create'" class="game-card-portal rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/30 shadow-2xl">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
            <i class="bi bi-gear-fill"></i>
          </div>
          <div>
            <h3 class="text-base font-black uppercase text-slate-100">
              Configuración de la Sala
            </h3>
            <p class="text-xs text-slate-400">
              Tú serás el moderador de la sala y definirás las reglas del combate.
            </p>
          </div>
        </div>

        <!-- Selección de Dificultad -->
        <div class="space-y-3">
          <label class="text-xs font-black uppercase tracking-wider text-slate-300">
            Dificultad (Número de Cartas)
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="diff in difficulties"
              :key="diff.count"
              type="button"
              @click="cardCount = diff.count"
              class="p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1"
              :class="cardCount === diff.count ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'"
            >
              <span class="text-sm font-black uppercase" :class="cardCount === diff.count ? 'text-amber-300' : 'text-slate-200'">
                {{ diff.label }}
              </span>
              <span class="text-[10px] text-slate-400">
                {{ diff.desc }}
              </span>
            </button>
          </div>
        </div>

        <!-- Modo de Cartas Viradas -->
        <div class="space-y-3">
          <label class="text-xs font-black uppercase tracking-wider text-slate-300">
            Modo de Inicio de Cartas
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              @click="cartasVisibles = false"
              class="p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3"
              :class="!cartasVisibles ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'"
            >
              <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 text-lg shrink-0">
                <i class="bi bi-eye-slash-fill"></i>
              </div>
              <div>
                <h4 class="text-xs font-black uppercase text-slate-100">Cartas Ocultas</h4>
                <p class="text-[11px] text-slate-400">Todas las cartas inician tapadas (Modo clásico).</p>
              </div>
            </button>

            <button
              type="button"
              @click="cartasVisibles = true"
              class="p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3"
              :class="cartasVisibles ? 'bg-pink-500/20 border-pink-400 ring-2 ring-pink-400/30' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'"
            >
              <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-pink-400 text-lg shrink-0">
                <i class="bi bi-eye-fill"></i>
              </div>
              <div>
                <h4 class="text-xs font-black uppercase text-slate-100">Cartas Viradas</h4>
                <p class="text-[11px] text-slate-400">Visibles durante el conteo regresivo de 5s.</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Botón Crear Sala -->
        <div class="pt-4">
          <button
            @click="handleCreateRoom"
            :disabled="loading"
            class="w-full game-btn-gold py-4 rounded-2xl text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
          >
            <i class="bi bi-plus-circle-fill text-lg"></i>
            <span>{{ loading ? 'Creando Sala...' : 'Crear Sala y Obtener Código' }}</span>
          </button>
        </div>
      </div>

      <!-- Sección 2: Unirse a Sala por Código -->
      <div v-else class="game-card-portal rounded-3xl p-6 sm:p-8 space-y-6 border border-pink-500/30 shadow-2xl">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-lg">
            <i class="bi bi-key-fill"></i>
          </div>
          <div>
            <h3 class="text-base font-black uppercase text-slate-100">
              Ingresar a Sala Privada
            </h3>
            <p class="text-xs text-slate-400">
              Introduce el código de 6 caracteres que te compartió el moderador (ej. KH-7842).
            </p>
          </div>
        </div>

        <form @submit.prevent="handleJoinRoom" class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-wider text-slate-300">
              Código de la Sala
            </label>
            <input
              v-model="inputCode"
              type="text"
              placeholder="KH-XXXX"
              maxlength="10"
              class="w-full uppercase text-center tracking-widest text-2xl font-black bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 rounded-2xl py-4 px-4 text-slate-100 placeholder-slate-600 outline-none transition font-mono"
            />
          </div>

          <button
            type="submit"
            :disabled="loading || !inputCode.trim()"
            class="w-full game-btn-pink py-4 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
          >
            <i class="bi bi-door-open-fill text-lg"></i>
            <span>{{ loading ? 'Conectando...' : 'Unirse a la Partida' }}</span>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>
