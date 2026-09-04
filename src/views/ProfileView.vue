<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useFriends } from '../composables/useFriends'
import ProfileSettings from '../components/profile/ProfileSettings.vue'
import FriendsList from '../components/profile/FriendsList.vue'
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { countries, getCountryByCode } from '../helpers/countries'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, userProfile, openAuthModal } = useAuth()
const { 
  checkFriendshipStatus, 
  sendFriendRequest, 
  acceptFriendRequest, 
  removeFriend 
} = useFriends()

const profileId = ref(route.params.id || user.value?.uid)
const isOwnProfile = computed(() => isAuthenticated.value && user.value?.uid === profileId.value)
const loading = ref(true)

const profileData = ref(null)
const matchHistory = ref([])
const bestMatches = ref([])

const globalRank = ref(null)
const localRank = ref(null)

// Amistad
const friendshipState = ref('none') // 'own' | 'friends' | 'pending_sent' | 'pending_received' | 'none' | 'unauthenticated'
const pendingNotification = ref(null)
const friendActionLoading = ref(false)

const displayAvatar = computed(() => profileData.value?.photoURL || '')
const displayName = computed(() => profileData.value?.displayName || 'Guerrero')
const displayEmail = computed(() => isOwnProfile.value ? (user.value?.email || '') : '')
const displayCountry = computed(() => {
  const code = profileData.value?.country
  if (!code) return null
  return getCountryByCode(code)
})

const accountAge = computed(() => {
  const creationTime = profileData.value?.createdAt
  if (!creationTime) return 'Desconocido'
  
  const createdDate = new Date(creationTime)
  const now = new Date()
  const diffTime = Math.abs(now - createdDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return '1 día'
  if (diffDays < 30) return `${diffDays} días`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 mes'
  if (diffMonths < 12) return `${diffMonths} meses`
  const diffYears = Math.floor(diffDays / 365)
  return diffYears === 1 ? '1 año' : `${diffYears} años`
})

async function checkStatus() {
  if (!profileId.value || isOwnProfile.value) {
    friendshipState.value = 'own'
    return
  }
  if (!isAuthenticated.value) {
    friendshipState.value = 'unauthenticated'
    return
  }

  const res = await checkFriendshipStatus(profileId.value)
  if (typeof res === 'object' && res.status === 'pending_received') {
    friendshipState.value = 'pending_received'
    pendingNotification.value = {
      id: res.notificationId,
      senderUserId: profileId.value,
      senderName: displayName.value,
      senderAvatar: displayAvatar.value,
      senderCountry: profileData.value?.country || ''
    }
  } else {
    friendshipState.value = res
  }
}

async function handleSendFriendRequest() {
  if (!isAuthenticated.value) {
    openAuthModal('login')
    return
  }
  friendActionLoading.value = true
  const res = await sendFriendRequest({
    uid: profileId.value,
    displayName: displayName.value,
    photoURL: displayAvatar.value,
    country: profileData.value?.country || ''
  })
  if (res.success) {
    friendshipState.value = 'pending_sent'
  }
  friendActionLoading.value = false
}

async function handleAcceptFriendRequest() {
  if (!pendingNotification.value) return
  friendActionLoading.value = true
  const res = await acceptFriendRequest(pendingNotification.value)
  if (res.success) {
    friendshipState.value = 'friends'
  }
  friendActionLoading.value = false
}

async function fetchProfileData() {
  // Si no hay ID en la ruta, intentamos usar el del usuario autenticado
  if (!profileId.value && user.value?.uid) {
    profileId.value = user.value.uid
  }

  if (!profileId.value) {
    if (!route.params.id) {
      loading.value = false
      return
    }
    router.push({ name: 'not-found' })
    return
  }

  loading.value = true
  try {
    if (isOwnProfile.value && userProfile.value) {
      profileData.value = userProfile.value
    } else {
      const userRef = doc(db, 'users', profileId.value)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        profileData.value = userSnap.data()
      } else {
        router.push({ name: 'not-found' })
        return
      }
    }

    // Verificar estado de amistad si es otro perfil
    await checkStatus()

    const scoresRef = collection(db, 'scores')

    // Fetch all user matches once to avoid composite index (where + orderBy)
    try {
      const allQ = query(scoresRef, where('userId', '==', profileId.value))
      const allSnap = await getDocs(allQ)
      const allMatches = allSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      
      // Historial reciente (ordenado por fecha desc)
      const sortedByDate = [...allMatches].sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0
        const timeB = b.createdAt?.seconds || 0
        return timeB - timeA
      })
      matchHistory.value = sortedByDate.slice(0, 5)

      // Mejores partidas (ordenado por puntaje desc, tiempo asc)
      const sortedByScore = [...allMatches].sort((a, b) => {
        const scoreA = Number(a.score) || 0
        const scoreB = Number(b.score) || 0
        if (scoreB !== scoreA) return scoreB - scoreA
        const secA = Number(a.seconds) || 9999
        const secB = Number(b.seconds) || 9999
        return secA - secB
      })
      bestMatches.value = sortedByScore.slice(0, 5)
    } catch (err) {
      console.warn('No se pudieron obtener las partidas del usuario:', err)
    }

    // Global Rank
    try {
      const globalQ = query(scoresRef, limit(100))
      const globalSnap = await getDocs(globalQ)
      const globalDocs = globalSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      
      globalDocs.sort((a, b) => {
        const scoreA = Number(a.score) || 0
        const scoreB = Number(b.score) || 0
        if (scoreB !== scoreA) return scoreB - scoreA
        const secA = Number(a.seconds) || 9999
        const secB = Number(b.seconds) || 9999
        return secA - secB
      })
      
      const uniqueGlobal = []
      const seenGlobal = new Set()
      for (const doc of globalDocs) {
        const identifier = doc.userId !== 'anonimo' ? doc.userId : doc.displayName
        if (!seenGlobal.has(identifier)) {
          seenGlobal.add(identifier)
          uniqueGlobal.push(doc)
        }
      }
      const gIndex = uniqueGlobal.findIndex(u => u.userId === profileId.value)
      globalRank.value = gIndex !== -1 ? gIndex + 1 : null
    } catch (err) {
      console.warn('No se pudo obtener el Global Rank:', err)
    }

    // Local Rank
    if (profileData.value?.country) {
      try {
        const targetCountry = String(profileData.value.country).toUpperCase()
        const localQ = query(scoresRef, limit(150))
        const localSnap = await getDocs(localQ)
        const localDocs = localSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        localDocs.sort((a, b) => {
          const scoreA = Number(a.score) || 0
          const scoreB = Number(b.score) || 0
          if (scoreB !== scoreA) return scoreB - scoreA
          const secA = Number(a.seconds) || 9999
          const secB = Number(b.seconds) || 9999
          return secA - secB
        })
        
        const uniqueLocal = []
        const seenLocal = new Set()
        for (const doc of localDocs) {
          const identifier = doc.userId !== 'anonimo' ? doc.userId : doc.displayName
          const docCountry = (doc.country ? String(doc.country) : (doc.userId === profileId.value ? targetCountry : '')).toUpperCase()
          if (docCountry === targetCountry && !seenLocal.has(identifier)) {
            seenLocal.add(identifier)
            uniqueLocal.push(doc)
          }
        }
        const lIndex = uniqueLocal.findIndex(u => u.userId === profileId.value)
        localRank.value = lIndex !== -1 ? lIndex + 1 : null
      } catch (err) {
        console.warn('No se pudo obtener el Local Rank:', err)
      }
    }

  } catch (err) {
    console.error('Error fetching profile data:', err)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, (newId) => {
  profileId.value = newId || user.value?.uid
  if (profileId.value) {
    fetchProfileData()
  } else {
    router.push({ name: 'not-found' })
  }
})

// Wait until auth is resolved to decide if we are authenticated
watch(userProfile, (newVal) => {
  if (newVal) {
    if (isOwnProfile.value || (!route.params.id && profileId.value === newVal.uid)) {
      profileData.value = {
        ...profileData.value,
        ...newVal,
        country: newVal.country || profileData.value?.country || ''
      }
    }
  }
  // Si acabamos de loguearnos y estábamos en /perfil sin ID
  if (newVal && !route.params.id && !profileId.value) {
    profileId.value = newVal.uid
    fetchProfileData()
  }
})

onMounted(() => {
  fetchProfileData()
})
</script>

<template>
  <div class="min-h-screen pt-28 pb-20 bg-slate-950 text-slate-100 font-['Montserrat'] px-4 sm:px-6 lg:px-8">
    
    <div v-if="loading" class="py-16 text-center space-y-4">
      <div class="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Consultando pergaminos...</p>
    </div>

    <!-- No Authenticated and not viewing a profile -->
    <div v-else-if="!profileData" class="max-w-md mx-auto text-center py-20 space-y-6">
      <div class="w-20 h-20 rounded-full mx-auto bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10 animate-pulse-glow text-amber-400">
        <i class="bi bi-shield-lock-fill"></i>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black uppercase text-slate-100">
        Acceso Restringido
      </h1>
      <p class="text-sm text-slate-400">
        Perfil no encontrado.
      </p>
      <button
        v-if="!isAuthenticated"
        @click="openAuthModal('login')"
        class="game-btn-gold py-3 px-8 rounded-xl text-slate-950 font-black text-sm uppercase tracking-wider"
      >
        Iniciar Sesión
      </button>
    </div>

    <!-- Con datos de Perfil -->
    <div v-else class="max-w-6xl mx-auto space-y-10">
      
      <!-- Cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
            {{ isOwnProfile ? 'Mi Cuartel General' : 'Perfil de Guerrero' }}
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <!-- Botón de Acción de Amistad (cuando no es mi propio perfil) -->
          <template v-if="!isOwnProfile">
            <button
              v-if="friendshipState === 'none' || friendshipState === 'unauthenticated'"
              @click="handleSendFriendRequest"
              :disabled="friendActionLoading"
              class="game-btn-gold py-2.5 px-5 rounded-xl text-slate-50 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <i class="bi bi-person-plus-fill text-sm"></i>
              <span>{{ friendActionLoading ? 'Enviando...' : 'Agregar Amigo' }}</span>
            </button>

            <button
              v-else-if="friendshipState === 'pending_sent'"
              disabled
              class="py-2.5 px-5 rounded-xl bg-slate-800 text-amber-400/90 border border-amber-500/30 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-default"
            >
              <i class="bi bi-hourglass-split animate-spin text-sm"></i>
              <span>Solicitud Enviada</span>
            </button>

            <button
              v-else-if="friendshipState === 'pending_received'"
              @click="handleAcceptFriendRequest"
              :disabled="friendActionLoading"
              class="game-btn-gold py-2.5 px-5 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <i class="bi bi-check-circle-fill text-sm text-emerald-700"></i>
              <span>{{ friendActionLoading ? 'Aceptando...' : 'Aceptar Solicitud' }}</span>
            </button>

            <div
              v-else-if="friendshipState === 'friends'"
              class="py-2.5 px-5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <i class="bi bi-shield-check text-emerald-400 text-sm"></i>
              <span>Aliados de Batalla</span>
            </div>
          </template>

          <RouterLink 
            :to="{ name: 'game' }" 
            class="game-btn-pink py-2.5 px-6 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <i class="bi bi-play-fill text-base"></i>
            <span>Jugar</span>
          </RouterLink>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Tarjeta Perfil -->
        <div class="lg:col-span-4 space-y-6">
          <div class="game-card-portal rounded-3xl p-6 sm:p-8 text-center space-y-6 border border-amber-500/30 shadow-2xl">
            <!-- Avatar -->
            <div class="relative w-28 h-28 mx-auto">
              <img
                v-if="displayAvatar"
                :src="displayAvatar"
                alt="Avatar"
                referrerpolicy="no-referrer"
                class="w-full h-full rounded-full object-cover border-2 border-amber-400 shadow-xl"
              />
              <div
                v-else
                class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-3xl flex items-center justify-center border-2 border-amber-400"
              >
                {{ displayName.charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="space-y-1">
              <h2 class="text-xl font-black text-slate-100 uppercase tracking-wide truncate">
                {{ displayName }}
              </h2>
              <p class="text-xs text-slate-400 truncate" v-if="displayEmail">{{ displayEmail }}</p>
              
              <div class="flex justify-center items-center gap-2 mt-2" v-if="displayCountry">
                <span :class="'flag:' + displayCountry.code.toUpperCase()" class="w-5 h-3.5 inline-block rounded-xs shadow-xs shrink-0"></span>
                <span class="text-xs font-bold text-slate-300 uppercase">{{ displayCountry.name }}</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="pt-4 border-t border-slate-800 space-y-3 text-left text-xs">
              <div class="flex justify-between items-center">
                <span class="text-slate-400 font-medium">Ranking Global:</span>
                <span class="font-black text-amber-300 text-sm">
                  {{ globalRank ? '#' + globalRank : 'No clasificado' }}
                </span>
              </div>
              <div class="flex justify-between items-center" v-if="displayCountry">
                <span class="text-slate-400 font-medium">Ranking Local:</span>
                <span class="font-black text-pink-400 text-sm">
                  {{ localRank ? '#' + localRank : 'No clasificado' }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-400 font-medium">Tiempo Cuenta:</span>
                <span class="font-bold text-slate-200">{{ accountAge }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Central / Derecha -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- Lista de Amigos / Escuadrón -->
          <FriendsList :profileId="profileId" :isOwnProfile="isOwnProfile" />

          <!-- Historial Reciente -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 class="text-lg font-black uppercase text-slate-100 mb-4 flex items-center gap-2">
              <i class="bi bi-clock-history text-amber-400"></i> Historial Reciente
            </h3>
            <div v-if="matchHistory.length === 0" class="text-sm text-slate-400">No hay partidas recientes.</div>
            <div v-else class="space-y-3">
              <div v-for="m in matchHistory" :key="m.id" class="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div class="text-xs text-slate-400">{{ m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente' }}</div>
                  <div class="text-sm font-bold text-slate-200">Dificultad: {{ m.difficulty }} cartas</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-black text-pink-400">{{ m.score }} pts</div>
                  <div class="text-xs font-mono text-amber-300">{{ m.time }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mejores 5 Partidas -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 class="text-lg font-black uppercase text-slate-100 mb-4 flex items-center gap-2">
              <i class="bi bi-star-fill text-amber-400"></i> Mejores Récords (Top 5)
            </h3>
            <div v-if="bestMatches.length === 0" class="text-sm text-slate-400">Aún no hay récords.</div>
            <div v-else class="space-y-3">
              <div v-for="(m, idx) in bestMatches" :key="m.id" class="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div class="flex items-center gap-3">
                  <span class="font-black text-amber-500 text-lg">#{{ idx + 1 }}</span>
                  <div>
                    <div class="text-xs text-slate-400">{{ m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente' }}</div>
                    <div class="text-sm font-bold text-slate-200">Cartas: {{ m.difficulty }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-black text-pink-400">{{ m.score }} pts</div>
                  <div class="text-xs font-mono text-amber-300">{{ m.time }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ajustes (Sólo si es propio) -->
          <ProfileSettings v-if="isOwnProfile" />

        </div>

      </div>

    </div>
  </div>
</template>
