import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { collection, onSnapshot, query, limit, type Unsubscribe } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './useAuth'
import type { ScoreRecord } from '../types'

export function useRanking() {
  const { user, userCountry, syncUserScoresInFirestore } = useAuth()
  
  const leaderboard = ref<ScoreRecord[]>([])
  const loading = ref<boolean>(true)
  const rankingType = ref<'global' | 'local'>('global')
  const locationError = ref<string>('')
  let unsubscribe: Unsubscribe | (() => void) | null = null

  function listenToLeaderboard() {
    if (unsubscribe) (unsubscribe as any)()
    loading.value = true
    try {
      if (user.value?.uid && userCountry.value) {
        syncUserScoresInFirestore(user.value.uid, { country: userCountry.value }).catch(() => {})
      }

      const scoresRef = collection(db, 'scores')
      const q = query(scoresRef, limit(150))
      
      unsubscribe = onSnapshot(q, (snap) => {
        const rawDocs = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as ScoreRecord[]

        const userCountryMap = new Map<string, string>()
        const currentUid = user.value?.uid
        const currentCountry = userCountry.value ? userCountry.value.toUpperCase() : ''

        if (currentUid && currentCountry) {
          userCountryMap.set(currentUid, currentCountry)
        }

        for (const docItem of rawDocs) {
          const identifier = (docItem.userId && docItem.userId !== 'anonimo') ? docItem.userId : (docItem.displayName || '')
          if (identifier && docItem.country && !userCountryMap.has(identifier)) {
            userCountryMap.set(identifier, String(docItem.country).toUpperCase())
          }
        }

        // Ordenar: Mayor puntuación primero; a igual puntaje, menor tiempo
        rawDocs.sort((a, b) => {
          const scoreA = Number(a.score) || 0
          const scoreB = Number(b.score) || 0
          if (scoreB !== scoreA) {
            return scoreB - scoreA
          }
          const secA = Number(a.seconds) || 9999
          const secB = Number(b.seconds) || 9999
          return secA - secB
        })

        const uniqueDocs: ScoreRecord[] = []
        const seenUsers = new Set<string>()
        const isLocal = rankingType.value === 'local'

        for (const docItem of rawDocs) {
          const identifier = (docItem.userId && docItem.userId !== 'anonimo') ? docItem.userId : (docItem.displayName || '')
          if (identifier && !seenUsers.has(identifier)) {
            let resolvedCountry = docItem.country ? String(docItem.country).toUpperCase() : (userCountryMap.get(identifier) || '')
            if (!resolvedCountry && docItem.userId === currentUid && currentCountry) {
              resolvedCountry = currentCountry
            }

            if (isLocal && currentCountry) {
              if (resolvedCountry !== currentCountry) {
                continue
              }
            }

            seenUsers.add(identifier)
            uniqueDocs.push({
              ...docItem,
              country: resolvedCountry
            })
          }
        }

        leaderboard.value = uniqueDocs
        loading.value = false
      }, (err) => {
        console.error('Error al escuchar el leaderboard:', err)
        loading.value = false
      })
    } catch (err) {
      console.error('Excepción al suscribir leaderboard:', err)
      loading.value = false
    }
  }

  function handleLocalClick() {
    if (!userCountry.value) {
      locationError.value = 'Configura tu país en tu perfil para ver el ranking de tu nación.'
      setTimeout(() => { locationError.value = '' }, 5000)
      return
    }
    rankingType.value = 'local'
  }

  watch(rankingType, () => {
    listenToLeaderboard()
  })

  watch(userCountry, () => {
    if (rankingType.value === 'local') {
      listenToLeaderboard()
    }
  })

  onMounted(() => {
    listenToLeaderboard()
  })

  onUnmounted(() => {
    if (unsubscribe) (unsubscribe as any)()
  })

  const topThree = computed(() => leaderboard.value.slice(0, 3))
  const remainingLeaderboard = computed(() => leaderboard.value.slice(3))

  return {
    leaderboard,
    topThree,
    remainingLeaderboard,
    loading,
    rankingType,
    locationError,
    userCountry,
    handleLocalClick,
    refreshLeaderboard: listenToLeaderboard
  }
}
