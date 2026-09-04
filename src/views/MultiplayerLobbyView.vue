<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMultiplayerRoom } from '../composables/useMultiplayerRoom'
import CreateRoomCard from '../components/multiplayer/CreateRoomCard.vue'
import JoinRoomCard from '../components/multiplayer/JoinRoomCard.vue'

const router = useRouter()
const { loading, error, createRoom, joinRoom } = useMultiplayerRoom()

const activeTab = ref<'create' | 'join'>('create')
const cardCount = ref<number>(24)
const cartasVisibles = ref<boolean>(false)

async function handleCreateRoom() {
  const res = await createRoom({
    cardCount: cardCount.value,
    cartasVisibles: cartasVisibles.value
  })

  if (res?.success && res.roomId) {
    router.push({ name: 'multiplayer-room', params: { roomId: res.roomId } })
  }
}

async function handleJoinRoom(code: string) {
  const res = await joinRoom(code)
  if (res?.success && res.roomId) {
    router.push({ name: 'multiplayer-room', params: { roomId: res.roomId } })
  }
}
</script>

<template>
  <div class="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
    <div class="max-w-4xl mx-auto space-y-8">
      
      <!-- Cabecera -->
      <div class="text-center space-y-3">
        <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
          SALAS MULTIJUGADOR
        </h1>
        <p class="text-sm text-slate-400 max-w-lg mx-auto">
          Enfréntate a hasta 4 guerreros en la misma sala en tiempo real con tableros idénticos y clasificación en vivo.
        </p>
      </div>

      <!-- Selector de Pestañas (Crear / Unirse) -->
      <div class="flex justify-center">
        <div class="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex gap-1 w-full max-w-md shadow-xl">
          <button
            type="button"
            @click="activeTab = 'create'"
            class="flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            :class="activeTab === 'create' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'"
          >
            <i class="bi bi-plus-circle-fill"></i>
            <span>Crear Sala</span>
          </button>
          
          <button
            type="button"
            @click="activeTab = 'join'"
            class="flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            :class="activeTab === 'join' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
          >
            <i class="bi bi-door-open-fill"></i>
            <span>Unirse a Sala</span>
          </button>
        </div>
      </div>

      <!-- Mensaje de Error -->
      <div v-if="error" class="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
        <i class="bi bi-exclamation-triangle-fill text-red-400 text-sm"></i>
        <span>{{ error }}</span>
      </div>

      <!-- Componentes según Pestaña -->
      <CreateRoomCard
        v-if="activeTab === 'create'"
        v-model:card-count="cardCount"
        v-model:cartas-visibles="cartasVisibles"
        :loading="loading"
        @create="handleCreateRoom"
      />

      <JoinRoomCard
        v-else
        :loading="loading"
        @join="handleJoinRoom"
      />

    </div>
  </div>
</template>
