import { ref, computed, watch, onMounted } from 'vue'
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useCronometro } from './useCronometo.js'
import { useCardDeck } from './useCardDeck'
import { useGameTurn } from './useGameTurn'
import { useCountdown } from './useCountdown'
import { useAuth } from './useAuth'
import { useNotificationStore } from '../stores/notifications'

export function useGame(options = {}) {
  const {
    isCompetitive = false,
    defaultCardCount = 24,
    defaultCartasVisibles = false,
    autoStart = false
  } = options

  // Opciones de partida
  const cardCount = ref(defaultCardCount)
  const cartasVisiblesAlInicio = ref(defaultCartasVisibles)

  // Estados de flujo del juego
  const isConfiguring = ref(!autoStart)
  const isGameOver = ref(false)
  const isSavingScore = ref(false)
  const scoreSaved = ref(false)

  // Autenticación & Notificaciones
  const { user, userProfile, userDisplayName, userAvatar, userCountry, isAuthenticated } = useAuth()
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

  const puntajeBase = ref(0)
  const animatingScore = ref('')
  const animatingTime = ref('')

  const triggerScoreAnimation = (type) => {
    animatingScore.value = type
    setTimeout(() => { animatingScore.value = '' }, 500)
  }

  const triggerTimeAnimation = (type) => {
    animatingTime.value = type
    setTimeout(() => { animatingTime.value = '' }, 500)
  }

  const { 
    verificar, 
    resetTurno, 
    tableroBloqueado, 
    CartasPares 
  } = useGameTurn(numeros, {
    onMatch: (isCorrect) => {
      if (isCorrect) {
        puntajeBase.value += 10
        triggerScoreAnimation('correct')
        triggerTimeAnimation('correct')
      } else {
        if (cartasVisiblesAlInicio.value) {
          puntajeBase.value -= 1
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
  const puntaje = computed(() => puntajeBase.value)
  const progresoPorcentaje = computed(() => {
    if (totalPares.value === 0) return 0
    return Math.round((CartasPares.value.length / totalPares.value) * 100)
  })

  /**
   * Prepara el tablero e inicia la cuenta regresiva antes de arrancar la partida
   */
  const iniciarPreparacion = (config = {}) => {
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
      await addDoc(collection(db, 'scores'), {
        userId: uid,
        displayName: name,
        photoURL: photo,
        country: userCountry.value || userProfile.value?.country || '',
        score: matchScore,
        time: matchTime,
        seconds: matchSeconds,
        difficulty: cardCount.value,
        cartasVisibles: cartasVisiblesAlInicio.value,
        createdAt: serverTimestamp()
      })

      // 2. Si el usuario está autenticado, verificar si superó su mejor tiempo
      if (user.value?.uid) {
        const userRef = doc(db, 'users', user.value.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const currentBestSeconds = userSnap.data().bestSeconds || Infinity
          if (matchSeconds < currentBestSeconds) {
            await updateDoc(userRef, {
              bestTime: matchTime,
              bestSeconds: matchSeconds
            })
          }
        } else {
          await updateDoc(userRef, {
            bestTime: matchTime,
            bestSeconds: matchSeconds
          }).catch(() => {})
        }
      }

      // 3. Emitir notificaciones a los jugadores superados
      try {
        const scoresRef = collection(db, 'scores')
        const q = query(
          scoresRef,
          where('difficulty', '==', cardCount.value),
          limit(50)
        )
        const snap = await getDocs(q)
        if (!snap.empty) {
          const rivalScores = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(d => d.userId && d.userId !== 'anonimo' && d.userId !== uid)

          const notifiedUserIds = new Set()
          for (const rival of rivalScores) {
            const rivalScore = Number(rival.score) || 0
            const rivalSeconds = Number(rival.seconds) || 9999

            // Si el jugador actual obtuvo mejor puntaje o a igual puntaje menor tiempo
            const isBetterScore = matchScore > rivalScore
            const isBetterTime = matchScore === rivalScore && matchSeconds < rivalSeconds

            if ((isBetterScore || isBetterTime) && !notifiedUserIds.has(rival.userId)) {
              notifiedUserIds.add(rival.userId)

              // Limitar a máximo 3 rivales directos superados por partida
              if (notifiedUserIds.size <= 3) {
                notificationStore.emitNotification({
                  targetUserId: rival.userId,
                  senderUserId: uid,
                  senderName: name,
                  senderAvatar: photo,
                  senderCountry: userCountry.value || userProfile.value?.country || '',
                  type: 'record_beaten',
                  message: `¡${name} ha superado tu récord de ${cardCount.value} cartas con un tiempo de ${matchTime} y ${matchScore} pts!`,
                  score: matchScore,
                  time: matchTime,
                  seconds: matchSeconds,
                  difficulty: cardCount.value
                }).catch(() => {})
              }
            }
          }
        }
      } catch (notifErr) {
        console.warn('Error verificando rivales superados para notificar:', notifErr)
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
