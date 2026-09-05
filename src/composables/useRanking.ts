import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, query, limit, type Unsubscribe } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './useAuth'
import { getSeasonInfo, isScoreInCurrentSeason, type SeasonInfo } from '../helpers/seasonUtils'
import type { ScoreRecord } from '../types'

export type RankingCategory = 24 | 32 | 40

export function useRanking() {
  const { user, userCountry, syncUserScoresInFirestore } = useAuth()
  
  const allRawDocs = ref<ScoreRecord[]>([])
  const selectedCategory = ref<RankingCategory>(24)
  const currentSeason = ref<SeasonInfo>(getSeasonInfo())
  const loading = ref<boolean>(true)
  let unsubscribe: Unsubscribe | (() => void) | null = null

  const availableCategories = [
    { value: 24 as RankingCategory, label: '24 Cartas', pairs: 12, tag: 'Cadete', icon: 'bi-lightning-charge-fill' },
    { value: 32 as RankingCategory, label: '32 Cartas', pairs: 16, tag: 'Guerrero', icon: 'bi-fire' },
    { value: 40 as RankingCategory, label: '40 Cartas', pairs: 20, tag: 'Kehubo', icon: 'bi-trophy-fill' }
  ]

  function listenToLeaderboard() {
    if (unsubscribe) (unsubscribe as any)()
    loading.value = true
    currentSeason.value = getSeasonInfo()
    try {
      if (user.value?.uid && userCountry.value) {
        syncUserScoresInFirestore(user.value.uid, { country: userCountry.value }).catch(() => {})
      }

      const scoresRef = collection(db, 'scores')
      const q = query(scoresRef, limit(200))
      
      unsubscribe = onSnapshot(q, (snap) => {
        const rawDocs = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as ScoreRecord[]

        allRawDocs.value = rawDocs
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

  // Leaderboard dinámico filtrado por la categoría seleccionada y la temporada activa
  const leaderboard = computed(() => {
    const targetDifficulty = Number(selectedCategory.value)
    const activeSeason = currentSeason.value
    
    // Filtrar documentos que correspondan a la categoría seleccionada y a la temporada actual
    const categoryDocs = allRawDocs.value.filter((d) => {
      const docDifficulty = Number(d.difficulty || (d as any).dificultad || (d as any).cardCount || 24)
      const matchesCategory = docDifficulty === targetDifficulty
      const matchesSeason = isScoreInCurrentSeason(d, activeSeason)
      return matchesCategory && matchesSeason
    })

    const userCountryMap = new Map<string, string>()
    const currentUid = user.value?.uid
    const currentCountry = userCountry.value ? userCountry.value.toUpperCase() : ''

    if (currentUid && currentCountry) {
      userCountryMap.set(currentUid, currentCountry)
    }

    for (const docItem of categoryDocs) {
      const identifier = (docItem.userId && docItem.userId !== 'anonimo') ? docItem.userId : (docItem.displayName || '')
      if (identifier && docItem.country && !userCountryMap.has(identifier)) {
        userCountryMap.set(identifier, String(docItem.country).toUpperCase())
      }
    }

    // Ordenar: Menor tiempo primero (quien lo hizo en menos segundos gana el récord); a igual tiempo, mayor puntuación
    const sorted = [...categoryDocs].sort((a, b) => {
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

    for (const docItem of sorted) {
      const identifier = (docItem.userId && docItem.userId !== 'anonimo') ? docItem.userId : (docItem.displayName || '')
      if (identifier && !seenUsers.has(identifier)) {
        let resolvedCountry = docItem.country ? String(docItem.country).toUpperCase() : (userCountryMap.get(identifier) || '')
        if (!resolvedCountry && docItem.userId === currentUid && currentCountry) {
          resolvedCountry = currentCountry
        }

        seenUsers.add(identifier)
        uniqueDocs.push({
          ...docItem,
          country: resolvedCountry,
          difficulty: targetDifficulty
        })
      }
    }

    return uniqueDocs
  })

  // Conteo de participantes únicos en cada categoría
  const categoryCounts = computed(() => {
    const counts: Record<RankingCategory, number> = { 24: 0, 32: 0, 40: 0 }
    const seenPerCat: Record<RankingCategory, Set<string>> = {
      24: new Set(),
      32: new Set(),
      40: new Set()
    }

    for (const d of allRawDocs.value) {
      const diff = (Number(d.difficulty || (d as any).dificultad || (d as any).cardCount || 24)) as RankingCategory
      const identifier = (d.userId && d.userId !== 'anonimo') ? d.userId : (d.displayName || '')
      if (diff in counts && identifier && !seenPerCat[diff].has(identifier)) {
        seenPerCat[diff].add(identifier)
        counts[diff]++
      }
    }

    return counts
  })

  function setCategory(category: RankingCategory) {
    selectedCategory.value = category
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
    selectedCategory,
    categoryCounts,
    availableCategories,
    setCategory,
    refreshLeaderboard: listenToLeaderboard
  }
}
