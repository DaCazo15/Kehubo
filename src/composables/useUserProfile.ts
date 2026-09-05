import { ref, computed, type Ref } from 'vue'
import { doc, getDoc, collection, query, where, limit, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './useAuth'
import { useFriends } from './useFriends'
import { getCountryByCode } from '../helpers/countries'
import { formatAccountAge, formatSecondsToTime } from '../helpers/dateUtils'
import { getSeasonInfo, isScoreInCurrentSeason } from '../helpers/seasonUtils'
import type { BestSeasonData } from '../components/profile/ProfileBestSeason.vue'
import type { UserProfile, ScoreRecord } from '../types'

export function useUserProfile(profileId: Ref<string>) {
  const { user, isAuthenticated, openAuthModal } = useAuth()
  const { checkFriendshipStatus, sendFriendRequest, acceptFriendRequest } = useFriends()

  const loading = ref<boolean>(true)
  const profileData = ref<UserProfile | null>(null)
  const matchHistory = ref<ScoreRecord[]>([])
  const bestMatches = ref<ScoreRecord[]>([])
  const globalRank = ref<number | null>(null)
  const bestSeason = ref<BestSeasonData | null>(null)
  const friendshipState = ref<string>('none')
  const pendingNotification = ref<any>(null)
  const friendActionLoading = ref<boolean>(false)

  const isOwnProfile = computed(() => isAuthenticated.value && user.value?.uid === profileId.value)
  const displayAvatar = computed(() => profileData.value?.photoURL || '')
  const displayName = computed(() => profileData.value?.displayName || 'Guerrero')
  const displayEmail = computed(() => isOwnProfile.value ? (user.value?.email || '') : '')
  const displayCountry = computed(() => {
    const code = profileData.value?.country
    if (!code) return null
    return getCountryByCode(code)
  })
  const accountAge = computed(() => formatAccountAge(profileData.value?.createdAt))

  const bestTime = computed(() => {
    if (profileData.value?.bestTime !== undefined && profileData.value.bestTime !== null) {
      return typeof profileData.value.bestTime === 'number' 
        ? formatSecondsToTime(profileData.value.bestTime) 
        : String(profileData.value.bestTime)
    }
    if (bestMatches.value.length > 0 && bestMatches.value[0].seconds !== undefined) {
      return formatSecondsToTime(bestMatches.value[0].seconds)
    }
    if (matchHistory.value.length > 0) {
      const minSec = Math.min(...matchHistory.value.map(m => m.seconds ?? 99999))
      if (minSec < 99999) return formatSecondsToTime(minSec)
    }
    return '--:--'
  })

  const totalScore = computed(() => {
    if (typeof profileData.value?.totalScore === 'number') {
      return profileData.value.totalScore
    }
    return matchHistory.value.reduce((acc, m) => acc + (m.score || 0), 0)
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
      friendshipState.value = res as string
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
      displayName: displayName.value
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

  async function fetchProfile() {
    if (!profileId.value) {
      loading.value = false
      return
    }
    loading.value = true
    try {
      // 1. Obtener perfil
      const userRef = doc(db, 'users', profileId.value)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        profileData.value = userSnap.data() as UserProfile
      } else {
        profileData.value = null
        loading.value = false
        return
      }

      // 2. Obtener historial de partidas de la temporada actual y marcas históricas
      const scoresRef = collection(db, 'scores')
      const scoresQuery = query(
        scoresRef, 
        where('userId', '==', profileId.value),
        limit(50)
      )
      const scoresSnap = await getDocs(scoresQuery)
      const allUserScores = scoresSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ScoreRecord[]

      const currentSeason = getSeasonInfo()

      // Filtrar historial únicamente para la temporada actual
      const currentSeasonScores = allUserScores.filter(s => isScoreInCurrentSeason(s, currentSeason))

      // Ordenar por fecha reciente
      currentSeasonScores.sort((a, b) => {
        const timeA = a.createdAt?.seconds || (a as any).timestamp?.seconds || 0
        const timeB = b.createdAt?.seconds || (b as any).timestamp?.seconds || 0
        return timeB - timeA
      })
      matchHistory.value = currentSeasonScores

      // Mejores partidas de la temporada actual (menor tiempo primero)
      const sortedBestCurrentSeason = [...currentSeasonScores].sort((a, b) => {
        const secA = a.seconds ?? 999999
        const secB = b.seconds ?? 999999
        if (secA !== secB) return secA - secB
        return (b.score || 0) - (a.score || 0)
      })
      bestMatches.value = sortedBestCurrentSeason.slice(0, 3)

      // 3. Calcular posición en rankings de la temporada actual
      await computeRankings(currentSeason)

      // 4. Calcular o recuperar los datos de "Mejor Temporada"
      computeBestSeasonData(allUserScores, currentSeason)

      // 5. Verificar estado de amistad
      await checkStatus()

    } catch (err) {
      console.error('Error al cargar perfil de usuario:', err)
    } finally {
      loading.value = false
    }
  }

  async function computeRankings(currentSeason = getSeasonInfo()) {
    try {
      const allScoresRef = collection(db, 'scores')
      const allScoresSnap = await getDocs(query(allScoresRef, limit(200)))
      const rawScores = allScoresSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ScoreRecord[]

      // Filtrar rankings únicamente para la temporada activa
      const currentSeasonScores = rawScores.filter(s => isScoreInCurrentSeason(s, currentSeason))

      currentSeasonScores.sort((a, b) => {
        const secA = a.seconds ?? 999999
        const secB = b.seconds ?? 999999
        if (secA !== secB) return secA - secB
        return (b.score || 0) - (a.score || 0)
      })

      // Global
      const seenGlobal = new Set<string>()
      let rank = 1
      let foundGlobal = false
      for (const s of currentSeasonScores) {
        const uid = s.userId || s.displayName
        if (!seenGlobal.has(uid)) {
          seenGlobal.add(uid)
          if (s.userId === profileId.value) {
            globalRank.value = rank
            foundGlobal = true
            break
          }
          rank++
        }
      }
      if (!foundGlobal) globalRank.value = null

    } catch (err) {
      console.error('Error calculando rankings:', err)
    }
  }

  function computeBestSeasonData(allUserScores: ScoreRecord[], currentSeason = getSeasonInfo()) {
    // Si el usuario ya tiene un registro de mejor temporada guardado en Firestore
    const savedBestSeason = (profileData.value as any)?.bestSeason as BestSeasonData | undefined
    
    // Buscar la mejor partida histórica de todos los tiempos entre sus registros
    const sortedAllTime = [...allUserScores].sort((a, b) => {
      const secA = a.seconds ?? 999999
      const secB = b.seconds ?? 999999
      if (secA !== secB) return secA - secB
      return (b.score || 0) - (a.score || 0)
    })

    const topHistorical = sortedAllTime[0]

    if (topHistorical) {
      const sec = topHistorical.seconds ?? 999999
      const cat = Number(topHistorical.difficulty || (topHistorical as any).dificultad || (topHistorical as any).cardCount || 24)
      const t = topHistorical.time || formatSecondsToTime(sec)
      const rank = globalRank.value || savedBestSeason?.rank || 1
      const seasonName = (topHistorical as any).seasonName || currentSeason.name

      bestSeason.value = {
        seasonName,
        seasonId: (topHistorical as any).seasonId || currentSeason.id,
        bestTime: t,
        bestSeconds: sec < 999999 ? sec : null,
        category: cat,
        rank: rank,
        score: topHistorical.score || 0,
        date: topHistorical.createdAt || (topHistorical as any).timestamp || new Date()
      }
    } else if (savedBestSeason) {
      bestSeason.value = savedBestSeason
    } else {
      bestSeason.value = null
    }
  }

  return {
    loading,
    profileData,
    isOwnProfile,
    displayAvatar,
    displayName,
    displayEmail,
    displayCountry,
    accountAge,
    matchHistory,
    bestMatches,
    bestTime,
    bestSeason,
    totalScore,
    globalRank,
    friendshipState,
    friendActionLoading,
    fetchProfile,
    handleSendFriendRequest,
    handleAcceptFriendRequest
  }
}
