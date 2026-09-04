import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, query, limit, type Unsubscribe } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './useAuth'
import type { ScoreRecord } from '../types'

export function useRanking() {
  const { user, userCountry, syncUserScoresInFirestore } = useAuth()
  
  const leaderboard = ref<ScoreRecord[]>([])
  const loading = ref<boolean>(true)
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

        // Ordenar: Menor tiempo primero (quien lo hizo en menos segundos gana el récord); a igual tiempo, mayor puntuación
        rawDocs.sort((a, b) => {
          const secA = Number(a.seconds) || 999999
          const secB = Number(b.seconds) || 999999
          if (secA !== secB) {
            return secA - secB
          }
          const scoreA = Number(a.score) || 0
          const scoreB = Number(b.score) || 0
          return scoreB - scoreA
        })

        const uniqueDocs: ScoreRecord[] = []
        const seenUsers = new Set<string>()

        for (const docItem of rawDocs) {
          const identifier = (docItem.userId && docItem.userId !== 'anonimo') ? docItem.userId : (docItem.displayName || '')
          if (identifier && !seenUsers.has(identifier)) {
            let resolvedCountry = docItem.country ? String(docItem.country).toUpperCase() : (userCountryMap.get(identifier) || '')
            if (!resolvedCountry && docItem.userId === currentUid && currentCountry) {
              resolvedCountry = currentCountry
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
    refreshLeaderboard: listenToLeaderboard
  }
}
