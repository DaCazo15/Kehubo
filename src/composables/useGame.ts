import { ref, computed, watch, onMounted } from 'vue'
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useCronometro } from './useCronometo'
import { useCardDeck } from './useCardDeck'
import { useGameTurn } from './useGameTurn'
import { useCountdown } from './useCountdown'
import { useAuth } from './useAuth'
import { useNotificationStore } from '../stores/notifications'
import { getSeasonInfo, isScoreInCurrentSeason } from '../helpers/seasonUtils'

export interface UseGameOptions {
  isCompetitive?: boolean
  defaultCardCount?: number
  defaultCartasVisibles?: boolean
  autoStart?: boolean
}

export function useGame(options: UseGameOptions = {}) {
  const {
    isCompetitive = false,
    defaultCardCount = 24,
    defaultCartasVisibles = false,
    autoStart = false
  } = options

  // Opciones de partida
  const cardCount = ref<number>(defaultCardCount)
  const cartasVisiblesAlInicio = ref<boolean>(defaultCartasVisibles)

  // Estados de flujo del juego
  const isConfiguring = ref<boolean>(!autoStart)
  const isGameOver = ref<boolean>(false)
  const isSavingScore = ref<boolean>(false)
  const scoreSaved = ref<boolean>(false)

  // Autenticación & Notificaciones
  const { user, userProfile, userDisplayName, userAvatar, userCountry } = useAuth()
  const notificationStore = useNotificationStore()

  // Composables hijos
  const { 
    numeros, 
    inicializarCartas, 
    barajar, 
    ocultarCartasNoEncontradas 
  } = useCardDeck(cardCount.value)

  const { 
    tiempo,
    tiempoFormateado, 
    iniciarCronometro, 
    resetCronometro, 
    detenerCronometro 
  } = useCronometro()

  const puntajeBase = ref<number>(0)
  const animatingScore = ref<string>('')
  const animatingTime = ref<string>('')

  const triggerScoreAnimation = (type: string) => {
    animatingScore.value = type
    setTimeout(() => { animatingScore.value = '' }, 500)
  }

  const triggerTimeAnimation = (type: string) => {
    animatingTime.value = type
    setTimeout(() => { animatingTime.value = '' }, 500)
  }

  const { 
    verificar, 
    resetTurno, 
    tableroBloqueado, 
    CartasPares 
  } = useGameTurn(numeros, {
    onMatch: (isCorrect: boolean) => {
      if (isCorrect) {
        puntajeBase.value += 10
        triggerScoreAnimation('correct')
        triggerTimeAnimation('correct')
      } else {
        if (cartasVisiblesAlInicio.value) {
          puntajeBase.value = Math.max(0, puntajeBase.value - 1)
          tiempo.value += 2
          triggerScoreAnimation('wrong')
          triggerTimeAnimation('wrong')
        }
      }
    }
  })

  const { 
    countdown, 
    isCounting, 
    isPaused, 
    startCountdown, 
    pauseCountdown, 
    resumeCountdown, 
    cancelCountdown 
  } = useCountdown()

  // Cálculos reactivos
  const totalPares = computed(() => Math.floor(cardCount.value / 2))
  const puntaje = computed(() => Math.max(0, puntajeBase.value))
  const progresoPorcentaje = computed(() => {
    if (totalPares.value === 0) return 0
    return Math.round((CartasPares.value.length / totalPares.value) * 100)
  })

  /**
   * Arranca la partida tras finalizar el countdown
   */
  const arrancarPartida = () => {
    // Si las cartas estaban visibles, se ocultan ahora
    if (cartasVisiblesAlInicio.value) {
      ocultarCartasNoEncontradas()
    }

    // Iniciar cronómetro y desbloquear tablero
    iniciarCronometro()
    tableroBloqueado.value = false
  }

  /**
   * Prepara el tablero e inicia la cuenta regresiva antes de arrancar la partida
   */
  const iniciarPreparacion = (config: { cardCount?: number; cartasVisibles?: boolean } = {}) => {
    if (config.cardCount) cardCount.value = config.cardCount
    if (config.cartasVisibles !== undefined) cartasVisiblesAlInicio.value = config.cartasVisibles

    isConfiguring.value = false
    isGameOver.value = false
    scoreSaved.value = false
    isSavingScore.value = false

    // Detener y resetear estados anteriores
    resetCronometro()
    resetTurno()
    puntajeBase.value = 0
    animatingScore.value = ''
    animatingTime.value = ''
    tableroBloqueado.value = true

    // Inicializar cartas según configuración elegida
    inicializarCartas(cardCount.value, cartasVisiblesAlInicio.value)
    barajar()

    // Iniciar cuenta regresiva (5 segundos de preparación)
    startCountdown(5, () => {
      arrancarPartida()
    })
  }

  /**
   * Guarda el resultado competitivo en Firestore si la partida es normal/clasificatoria
   */
  const guardarResultadoEnRanking = async () => {
    if (!isCompetitive) return
    if (scoreSaved.value || isSavingScore.value) return

    // Validación de Integridad de la partida
    const expectedPairs = totalPares.value
    if (CartasPares.value.length !== expectedPairs) {
      console.warn('⚠️ Intento de guardado cancelado: no se han completado todos los pares.')
      return
    }

    const matchSeconds = Number(tiempo.value) || 0
    // Protección contra manipulación o bots instantáneos (mínimo 2 segundos)
    if (matchSeconds < 2) {
      console.warn('⚠️ Tiempo inverosímil detectado.')
      return
    }

    isSavingScore.value = true
    scoreSaved.value = true // Bloqueo de idempotencia inmediato

    try {
      const matchScore = puntaje.value
      const matchTime = tiempoFormateado.value
      const uid = user.value?.uid || 'anonimo'
      const name = userDisplayName.value || 'Guerrero Anónimo'
      const photo = userAvatar.value || ''

      // 1. Registrar partida en colección 'scores'
      const currentSeason = getSeasonInfo()
      const newDocRef = await addDoc(collection(db, 'scores'), {
        userId: uid,
        displayName: name,
        photoURL: photo,
        country: userCountry.value || userProfile.value?.country || '',
        score: matchScore,
        time: matchTime,
        seconds: matchSeconds,
        difficulty: cardCount.value,
        cartasVisibles: cartasVisiblesAlInicio.value,
        seasonId: currentSeason.id,
        seasonName: currentSeason.name,
        seasonNumber: currentSeason.number,
        createdAt: serverTimestamp()
      })

      // 2. Si el usuario está autenticado, verificar si superó su mejor tiempo y mejor temporada
      if (user.value?.uid) {
        const userRef = doc(db, 'users', user.value.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userData = userSnap.data()
          const currentBestSeconds = userData.bestSeconds || Infinity
          if (matchSeconds < currentBestSeconds) {
            await updateDoc(userRef, {
              bestTime: matchTime,
              bestSeconds: matchSeconds,
              bestSeason: {
                seasonName: currentSeason.name,
                seasonId: currentSeason.id,
                bestTime: matchTime,
                bestSeconds: matchSeconds,
                category: cardCount.value,
                score: matchScore,
                date: new Date()
              }
            })
          }
        } else {
          await updateDoc(userRef, {
            bestTime: matchTime,
            bestSeconds: matchSeconds,
            bestSeason: {
              seasonName: currentSeason.name,
              seasonId: currentSeason.id,
              bestTime: matchTime,
              bestSeconds: matchSeconds,
              category: cardCount.value,
              score: matchScore,
              date: new Date()
            }
          }).catch(() => {})
        }
      }

      // 3. Emitir notificaciones a los jugadores superados legítimamente
      if (uid && uid !== 'anonimo') {
        try {
          const scoresRef = collection(db, 'scores')
          const q = query(
            scoresRef,
            limit(150)
          )
          const snap = await getDocs(q)
          if (!snap.empty) {
            const rawDocs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
            
            // Función auxiliar para comparar marcas (Menor tiempo en segundos es mejor; a igual tiempo, mayor puntaje como desempate)
            const isBetter = (secA: number, scoreA: number, secB: number, scoreB: number) => {
              if (secA !== secB) return secA < secB
              return scoreA > scoreB
            }

            // Filtrar únicamente los documentos de la misma categoría de cartas (24, 32 o 40)
            const currentDiff = cardCount.value || 24
            const categoryDocs = rawDocs.filter(d => Number(d.difficulty || d.dificultad || d.cardCount || 24) === currentDiff)

            // 1. Obtener la mejor marca previa del jugador actual en esta categoría (excluyendo este nuevo registro)
            let prevBestSeconds = 999999
            let prevBestScore = -1
            
            for (const docItem of categoryDocs) {
              if (docItem.userId === uid && docItem.id !== newDocRef.id) {
                const sec = Number(docItem.seconds) || 999999
                const s = Number(docItem.score) || 0
                if (isBetter(sec, s, prevBestSeconds, prevBestScore)) {
                  prevBestSeconds = sec
                  prevBestScore = s
                }
              }
            }

            // 2. Solo continuar si el jugador logró un nuevo récord personal en esta categoría
            const hasNewPersonalBest = isBetter(matchSeconds, matchScore, prevBestSeconds, prevBestScore)

            if (hasNewPersonalBest) {
              // 3. Mapear la mejor marca de cada rival único en esta categoría
              const rivalBestMap = new Map<string, { userId: string, score: number, seconds: number, name: string }>()

              for (const docItem of categoryDocs) {
                const rivalUid = docItem.userId
                if (!rivalUid || rivalUid === 'anonimo' || rivalUid === uid) continue

                const sec = Number(docItem.seconds) || 999999
                const s = Number(docItem.score) || 0
                const existing = rivalBestMap.get(rivalUid)

                if (!existing || isBetter(sec, s, existing.seconds, existing.score)) {
                  rivalBestMap.set(rivalUid, {
                    userId: rivalUid,
                    score: s,
                    seconds: sec,
                    name: docItem.displayName || 'Guerrero'
                  })
                }
              }

              // 4. Encontrar rivales legítimamente superados en esta categoría:
              // - Antes de esta partida, el rival tenía un mejor tiempo que el jugador en esta categoría
              // - Con esta nueva partida, el tiempo del jugador superó al rival
              const rivalsSurpassed: { userId: string, score: number, seconds: number }[] = []

              for (const rival of rivalBestMap.values()) {
                const rivalWasAhead = prevBestSeconds >= 999999 || isBetter(rival.seconds, rival.score, prevBestSeconds, prevBestScore)
                const playerNowAhead = isBetter(matchSeconds, matchScore, rival.seconds, rival.score)

                if (rivalWasAhead && playerNowAhead) {
                  rivalsSurpassed.push(rival)
                }
              }

              // Ordenar a los rivales superados por tiempo ascendente (los de mejor tiempo primero)
              rivalsSurpassed.sort((a, b) => {
                if (a.seconds !== b.seconds) return a.seconds - b.seconds
                return b.score - a.score
              })

              // Notificar únicamente a los rivales directos superados (máximo 3)
              const toNotify = rivalsSurpassed.slice(0, 3)
              for (const rival of toNotify) {
                notificationStore.emitNotification({
                  targetUserId: rival.userId,
                  senderUserId: uid,
                  senderName: name,
                  senderAvatar: photo,
                  senderCountry: userCountry.value || userProfile.value?.country || '',
                  type: 'record_beaten',
                  message: `¡${name} ha superado tu récord en la categoría de ${currentDiff} cartas con un tiempo de ${matchTime} y ${matchScore} pts!`,
                  score: matchScore,
                  time: matchTime,
                  seconds: matchSeconds,
                  difficulty: cardCount.value
                }).catch(() => {})
              }
            }
          }
        } catch (notifErr) {
          console.warn('Error verificando rivales superados para notificar:', notifErr)
        }
      }

      scoreSaved.value = true
    } catch (err) {
      console.error('Error al guardar puntaje en ranking:', err)
    } finally {
      isSavingScore.value = false
    }
  }

  /**
   * Detiene manualmente la partida
   */
  const detener = () => {
    detenerCronometro()
    tableroBloqueado.value = true
  }

  /**
   * Reinicia la partida abriendo el selector de configuración o reiniciando directo
   */
  const resetGame = (abrirSelector = false) => {
    cancelCountdown()
    detenerCronometro()
    
    if (abrirSelector || isCompetitive) {
      isConfiguring.value = true
      isGameOver.value = false
    } else {
      iniciarPreparacion({
        cardCount: cardCount.value,
        cartasVisibles: cartasVisiblesAlInicio.value
      })
    }
  }

  // Detectar fin de partida cuando se completan todos los pares
  watch(
    () => CartasPares.value.length,
    async (nuevoTotal) => {
      if (nuevoTotal > 0 && nuevoTotal === totalPares.value) {
        detenerCronometro()
        tableroBloqueado.value = true
        isGameOver.value = true

        if (isCompetitive) {
          await guardarResultadoEnRanking()
        }
      }
    }
  )

  onMounted(() => {
    if (autoStart) {
      iniciarPreparacion()
    }
  })

  return {
    // Configuración
    cardCount,
    cartasVisiblesAlInicio,
    isConfiguring,
    isCompetitive,
    
    // Estado del juego
    numeros,
    tiempo,
    tiempoFormateado,
    puntaje,
    animatingScore,
    animatingTime,
    totalPares,
    CartasPares,
    progresoPorcentaje,
    tableroBloqueado,
    isGameOver,
    isSavingScore,
    scoreSaved,

    // Cuenta regresiva
    countdown,
    isCounting,
    isPaused,
    pauseCountdown,
    resumeCountdown,

    // Acciones
    verificar,
    iniciarPreparacion,
    resetGame,
    detener
  }
}
