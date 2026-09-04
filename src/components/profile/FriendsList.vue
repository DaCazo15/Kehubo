<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useFriends } from '../../composables/useFriends'
import { getCountryName } from '../../helpers/countries'

const props = defineProps({
  profileId: {
    type: String,
    required: true
  },
  isOwnProfile: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const { listenToUserFriends, removeFriend, loading } = useFriends()

const friendsList = ref([])
const searchQuery = ref('')
const deletingFriendId = ref(null)
let unsubscribe = null

function initListener() {
  if (unsubscribe) unsubscribe()
  if (props.profileId) {
    unsubscribe = listenToUserFriends(props.profileId, (list) => {
      friendsList.value = list
    })
  }
}

onMounted(() => {
  initListener()
})

watch(() => props.profileId, () => {
  initListener()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filteredFriends = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return friendsList.value
  return friendsList.value.filter(f => {
    const name = (f.displayName || '').toLowerCase()
    return name.includes(q)
  })
})

async function handleRemoveFriend(friendId) {
  if (!confirm('¿Estás seguro de que deseas eliminar a este guerrero de tu lista de amigos?')) return
  deletingFriendId.value = friendId
  await removeFriend(friendId)
  deletingFriendId.value = null
}
</script>

<template>
  <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl font-['Montserrat']">
    
    <!-- Cabecera de la Sección de Amigos -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
          <i class="bi bi-people-fill"></i>
        </div>
        <div>
          <h3 class="text-lg font-black uppercase text-slate-100 tracking-wide flex items-center gap-2">
            <span>Escuadrón de Amigos</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black">
              {{ friendsList.length }}
            </span>
          </h3>
          <p class="text-xs text-slate-400">
            {{ isOwnProfile ? 'Tus guerreros aliados y compañeros de batalla.' : 'Amigos de este guerrero.' }}
          </p>
        </div>
      </div>

      <!-- Buscador de Amigos -->
      <div class="relative w-full sm:w-64" v-if="friendsList.length > 0">
        <i class="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar en amigos..."
          class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
        >
          <i class="bi bi-x-circle-fill"></i>
        </button>
      </div>
    </div>

    <!-- Estado: Cargando -->
    <div v-if="loading && friendsList.length === 0" class="py-12 text-center space-y-3">
      <div class="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Consultando alianzas...</p>
    </div>

    <!-- Estado: Sin Amigos -->
    <div v-else-if="friendsList.length === 0" class="py-10 px-4 text-center space-y-4">
      <div class="w-16 h-16 rounded-full mx-auto bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-2xl">
        <i class="bi bi-person-x"></i>
      </div>
      <div class="space-y-1">
        <h4 class="text-sm font-black uppercase text-slate-200">
          Aún no hay amigos en el escuadrón
        </h4>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          {{ isOwnProfile 
            ? 'Explora el Salón de la Fama y visita los perfiles de otros jugadores para enviarles una solicitud de amistad.' 
            : 'Este guerrero aún no ha forjado alianzas de amistad.' }}
        </p>
      </div>
      <div class="pt-2" v-if="isOwnProfile">
        <RouterLink
          :to="{ name: 'ranking' }"
          class="game-btn-gold inline-flex items-center gap-2 py-2 px-6 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider"
        >
          <i class="bi bi-trophy-fill"></i>
          <span>Explorar Ranking</span>
        </RouterLink>
      </div>
    </div>

    <!-- Estado: Sin resultados de búsqueda -->
    <div v-else-if="filteredFriends.length === 0" class="py-8 text-center text-xs text-slate-400">
      No se encontraron amigos que coincidan con "<span class="text-amber-300 font-bold">{{ searchQuery }}</span>".
    </div>

    <!-- Cuadrícula de Amigos -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="friend in filteredFriends"
        :key="friend.id || friend.uid"
        class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group shadow-md"
      >
        <!-- Info del amigo -->
        <RouterLink
          :to="{ name: 'perfil', params: { id: friend.uid || friend.id } }"
          class="flex items-center gap-3 min-w-0 flex-1 group/link"
          title="Ver perfil"
        >
          <!-- Avatar -->
          <div class="relative w-12 h-12 rounded-full shrink-0">
            <img
              v-if="friend.photoURL"
              :src="friend.photoURL"
              alt="Avatar"
              referrerpolicy="no-referrer"
              class="w-full h-full rounded-full object-cover border-2 border-slate-700 group-hover/link:border-amber-400 transition"
            />
            <div
              v-else
              class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-slate-700 group-hover/link:border-amber-400 transition"
            >
              {{ (friend.displayName || 'G').charAt(0).toUpperCase() }}
            </div>
            <!-- Bandera de país -->
            <span
              v-if="friend.country"
              :class="'flag:' + friend.country.toUpperCase()"
              class="absolute -bottom-1 -right-1 w-4 h-3 rounded-xs shadow-xs"
            ></span>
          </div>

          <!-- Nombre y País -->
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-black text-slate-100 group-hover/link:text-amber-300 truncate transition">
              {{ friend.displayName || 'Guerrero' }}
            </h4>
            <div v-if="friend.country" class="flex items-center gap-1 text-[11px] text-slate-400 truncate">
              <span class="truncate">{{ getCountryName(friend.country) }}</span>
            </div>
            <div v-else class="text-[11px] text-slate-500">
              Guerrero Aliado
            </div>
          </div>
        </RouterLink>

        <!-- Acciones: Eliminar (solo si es el propio perfil) -->
        <div v-if="isOwnProfile" class="shrink-0">
          <button
            type="button"
            @click="handleRemoveFriend(friend.uid || friend.id)"
            :disabled="deletingFriendId === (friend.uid || friend.id)"
            class="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 transition cursor-pointer disabled:opacity-50"
            title="Eliminar de mis amigos"
          >
            <i class="bi bi-person-dash text-base"></i>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
