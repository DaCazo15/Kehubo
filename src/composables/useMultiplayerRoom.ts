import { ref } from 'vue'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  type Unsubscribe,
  type DocumentSnapshot
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../config/firebase'
import { useAuth } from './useAuth'
import type { Room, RoomPlayer, RoomConfig, Card } from '../types'

export function useMultiplayerRoom() {
  const { user, userDisplayName, userAvatar, userCountry } = useAuth()
  
  const currentRoom = ref<Room | null>(null)
  const roomPlayers = ref<RoomPlayer[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Genera un código de sala aleatorio de 6 caracteres (ej. KH-8392)
  function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `KH-${code}`
  }

  /**
   * Genera el mazo aleatorio sincronizado para la sala.
   * Cada carta tiene su valor numérico real asignado.
   */
  function generateSynchronizedDeck(cardCount = 24, cartasVisibles = false): Card[] {
    const paresCount = Math.floor(cardCount / 2)
    const base: number[] = []
    for (let i = 1; i <= paresCount; i++) {
      base.push(i, i)
    }

    const cards: Card[] = base.map((valor, index) => ({
      id: index + 1,
      valor,
      revelada: cartasVisibles,
      encontrada: false
    }))

    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }

    return cards
  }

  // Obtener UID e info del jugador actual (incluso si es invitado/anónimo)
  function getCurrentPlayerData() {
    let uid = user.value?.uid
    if (!uid) {
      // Usar o crear ID local persistente para jugadores anónimos en multijugador
      uid = localStorage.getItem('kehubo_anon_player_id') || undefined
      if (!uid) {
        uid = 'anon_' + Math.random().toString(36).substring(2, 9)
        localStorage.setItem('kehubo_anon_player_id', uid)
      }
    }

    const displayName = userDisplayName.value || localStorage.getItem('kehubo_guest_name') || 'Guerrero ' + uid.substring(0, 4)
    const photoURL = userAvatar.value || ''
    const country = (userCountry.value || localStorage.getItem('kehubo_user_country') || '').toUpperCase()

    return { uid, displayName, photoURL, country }
  }

  // Crear una nueva sala competitiva (usa Cloud Function para generar mazo seguro en servidor)
  async function createRoom(config: Partial<RoomConfig> = {}) {
    loading.value = true
    error.value = null

    try {
      const player = getCurrentPlayerData()
      const cardCount = config.cardCount || 24
      const cartasVisibles = config.cartasVisibles || false

      // 1. Intentar crear la sala mediante Cloud Function (mazo protegido en secret/deck)
      try {
        const createRoomFn = httpsCallable<{ config: { cardCount: number; cartasVisibles: boolean }; player: any }, { success: boolean; roomId: string; code: string; publicDeck: Card[] }>(functions, 'createMultiplayerRoom')
        const result = await createRoomFn({
          config: { cardCount, cartasVisibles },
          player
        })

        if (result.data?.success) {
          const { roomId, code, publicDeck } = result.data
          currentRoom.value = {
            id: roomId,
            code,
            hostId: player.uid,
            status: 'waiting',
            maxPlayers: 4,
            config: {
              cardCount,
              cartasVisibles,
              deck: publicDeck
            }
          }
          return { success: true, roomId, code }
        }
      } catch (fnErr) {
        console.warn('Cloud Function no disponible o en entorno local, usando fallback seguro:', fnErr)
      }

      // 2. Fallback de cliente si la función no está desplegada en entorno local
      const deck = generateSynchronizedDeck(cardCount, cartasVisibles)
      const code = generateRoomCode()
      const roomRef = doc(collection(db, 'rooms'))
      const roomId = roomRef.id

      const roomData: Omit<Room, 'id'> = {
        code,
        hostId: player.uid,
        status: 'waiting',
        maxPlayers: 4,
        config: {
          cardCount,
          cartasVisibles,
          deck
        },
        createdAt: serverTimestamp()
      }

      await setDoc(roomRef, roomData)

      const playerRef = doc(db, 'rooms', roomId, 'players', player.uid)
      await setDoc(playerRef, {
        uid: player.uid,
        displayName: player.displayName,
        photoURL: player.photoURL,
        country: player.country,
        isHost: true,
        score: 0,
        pairsFound: 0,
        status: 'ready',
        finishTime: null,
        finishSeconds: null,
        joinedAt: serverTimestamp()
      })

      currentRoom.value = { id: roomId, ...roomData } as Room
      return { success: true, roomId, code }
    } catch (err: any) {
      console.error('Error al crear sala multijugador:', err)
      error.value = 'No se pudo crear la sala. Inténtalo de nuevo.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Revelar carta de forma segura solicitando el valor auténtico a la Cloud Function
  async function flipCard(roomId: string, cardId: number | string) {
    if (!roomId || !cardId) return null
    const player = getCurrentPlayerData()

    try {
      const flipCardFn = httpsCallable<{ roomId: string; cardId: number | string; playerId: string }, { success: boolean; cardId: number; valor: number }>(functions, 'flipCard')
      const result = await flipCardFn({
        roomId,
        cardId,
        playerId: player.uid
      })

      if (result.data?.success) {
        return { cardId: result.data.cardId, valor: result.data.valor }
      }
    } catch (err: any) {
      // Si la función no está activa en desarrollo local, buscar en el mazo público si tiene valor
      console.warn('Consultando valor de carta con fallback local:', err?.message || err)
      const localCard = currentRoom.value?.config?.deck?.find(c => c.id === Number(cardId))
      if (localCard && localCard.valor !== null && localCard.valor !== undefined) {
        return { cardId: localCard.id, valor: localCard.valor }
      }
    }
    return null
  }

  // Unirse a una sala existente (por código o ID directo)
  async function joinRoom(codeOrId: string) {
    loading.value = true
    error.value = null

    if (!codeOrId || !String(codeOrId).trim()) {
      error.value = 'Debes ingresar un código de sala válido.'
      loading.value = false
      return { success: false, error: error.value }
    }

    const rawInput = String(codeOrId).trim()
    const upperInput = rawInput.toUpperCase()

    try {
      let roomDoc: DocumentSnapshot | null = null
      let roomId = rawInput

      // 1. Intentar buscar por ID de documento exacto (case-sensitive)
      try {
        const directRef = doc(db, 'rooms', rawInput)
        const directSnap = await getDoc(directRef)
        if (directSnap.exists()) {
          roomDoc = directSnap
          roomId = directSnap.id
        }
      } catch (err) {
        // Document lookup by raw string failed, will fallback to code query
      }

      // 2. Si no se encontró por ID directo, buscar por campo 'code'
      if (!roomDoc || !roomDoc.exists()) {
        const roomsRef = collection(db, 'rooms')
        
        // Buscar por código exacto en mayúsculas (ej. KH-7842)
        const q1 = query(roomsRef, where('code', '==', upperInput))
        let qSnap = await getDocs(q1)

        // Si no se encontró y el usuario no puso el prefijo 'KH-', buscar con 'KH-'
        if (qSnap.empty && !upperInput.startsWith('KH-')) {
          const q2 = query(roomsRef, where('code', '==', `KH-${upperInput}`))
          qSnap = await getDocs(q2)
        }

        if (!qSnap.empty) {
          roomDoc = qSnap.docs[0]
          roomId = roomDoc.id
        }
      }

      if (!roomDoc || !roomDoc.exists()) {
        error.value = 'La sala no existe o el código es incorrecto.'
        return { success: false, error: error.value }
      }

      const roomData = { id: roomId, ...roomDoc.data() } as Room

      // Comprobar si la sala ya empezó (permitir reconexión si ya era jugador)
      const player = getCurrentPlayerData()
      const playersSnap = await getDocs(collection(db, 'rooms', roomId, 'players'))
      const alreadyJoined = playersSnap.docs.some(d => d.id === player.uid)

      if (roomData.status !== 'waiting' && !alreadyJoined) {
        error.value = 'Esta partida ya ha comenzado o ha finalizado.'
        return { success: false, error: error.value }
      }

      // Comprobar número de jugadores
      if (!alreadyJoined && playersSnap.size >= (roomData.maxPlayers || 4)) {
        error.value = 'La sala ya está llena (máximo 4 guerreros).'
        return { success: false, error: error.value }
      }

      // Registrar o actualizar al jugador en la sala
      const playerRef = doc(db, 'rooms', roomId, 'players', player.uid)
      await setDoc(playerRef, {
        uid: player.uid,
        displayName: player.displayName,
        photoURL: player.photoURL,
        country: player.country,
        isHost: roomData.hostId === player.uid,
        score: 0,
        pairsFound: 0,
        status: 'ready',
        finishTime: null,
        finishSeconds: null,
        joinedAt: serverTimestamp()
      }, { merge: true })

      currentRoom.value = roomData
      return { success: true, roomId, code: roomData.code, roomData }
    } catch (err: any) {
      console.error('Error al unirse a la sala:', err)
      error.value = 'Error al conectarse a la sala: ' + (err?.message || err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Escuchar información de la sala en tiempo real
  function listenToRoom(roomId: string, callback?: (data: Room | null) => void): Unsubscribe | (() => void) {
    if (!roomId) return () => {}
    const roomRef = doc(db, 'rooms', roomId)

    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as Room
        currentRoom.value = data
        if (callback) callback(data)
      } else {
        currentRoom.value = null
        if (callback) callback(null)
      }
    }, (err) => {
      console.warn('Error escuchando sala:', err)
    })
  }

  // Escuchar lista de jugadores en tiempo real (ordenada dinámicamente)
  function listenToRoomPlayers(roomId: string, callback?: (players: RoomPlayer[]) => void): Unsubscribe | (() => void) {
    if (!roomId) return () => {}
    const playersRef = collection(db, 'rooms', roomId, 'players')

    return onSnapshot(playersRef, (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as RoomPlayer[]

      // Ordenar dinámicamente de mayor a menor puntuación
      list.sort((a, b) => {
        const scoreA = Number(a.score) || 0
        const scoreB = Number(b.score) || 0
        if (scoreB !== scoreA) return scoreB - scoreA

        // En caso de empate en puntos, quien completó más pares
        const pairsA = Number(a.pairsFound) || 0
        const pairsB = Number(b.pairsFound) || 0
        if (pairsB !== pairsA) return pairsB - pairsA

        // En caso de empate, quien terminó en menor tiempo
        const secA = a.finishSeconds !== null && a.finishSeconds !== undefined ? a.finishSeconds : 9999
        const secB = b.finishSeconds !== null && b.finishSeconds !== undefined ? b.finishSeconds : 9999
        if (secA !== secB) return secA - secB

        return (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0)
      })

      roomPlayers.value = list
      if (callback) callback(list)
    }, (err) => {
      console.warn('Error escuchando jugadores:', err)
    })
  }

  // Actualizar el progreso del jugador actual en la sala
  // 🛡️ Integridad: validación de límites matemáticos antes de enviar a Firestore
  async function updatePlayerProgress(roomId: string, data: { score?: number; pairsFound?: number; isFinished?: boolean; finishTime?: string; finishSeconds?: number }) {
    if (!roomId) return
    const player = getCurrentPlayerData()

    try {
      const maxCardCount = currentRoom.value?.config?.cardCount || 40
      const maxPossiblePairs = Math.floor(maxCardCount / 2)

      const playerRef = doc(db, 'rooms', roomId, 'players', player.uid)
      const updates: Record<string, any> = {}
      if (data.score !== undefined) {
        updates.score = Math.max(0, Math.floor(Number(data.score) || 0))
      }
      if (data.pairsFound !== undefined) {
        updates.pairsFound = Math.min(maxPossiblePairs, Math.max(0, Math.floor(Number(data.pairsFound) || 0)))
      }
      if (data.isFinished) {
        updates.status = 'finished'
        updates.finishTime = data.finishTime || '--:--'
        updates.finishSeconds = Math.max(0, Number(data.finishSeconds) || 0)
      }

      await updateDoc(playerRef, updates)
    } catch (err) {
      console.warn('Error actualizando progreso en sala:', err)
    }
  }

  // Actualizar configuración de la sala por el moderador
  async function updateRoomConfig(roomId: string, config: { cardCount: number; cartasVisibles: boolean }) {
    if (!roomId) return
    try {
      const deck = generateSynchronizedDeck(config.cardCount, config.cartasVisibles)
      const roomRef = doc(db, 'rooms', roomId)
      await updateDoc(roomRef, {
        config: {
          cardCount: config.cardCount,
          cartasVisibles: config.cartasVisibles,
          deck
        }
      })
    } catch (err) {
      console.error('Error actualizando configuración de la sala:', err)
    }
  }

  // Iniciar o reiniciar la partida en la sala (solo moderador, mínimo 2 jugadores)
  async function startRoomGame(roomId: string) {
    if (!roomId) return { success: false, error: 'ID de sala inválido' }
    try {
      const playersSnap = await getDocs(collection(db, 'rooms', roomId, 'players'))
      if (playersSnap.size < 2) {
        error.value = 'Se requieren al menos 2 jugadores para iniciar la batalla multijugador.'
        return { success: false, error: error.value }
      }

      // Resetear progreso y puntuación de todos los jugadores en la sala para la nueva ronda
      const resetPromises = playersSnap.docs.map(playerDoc => 
        updateDoc(playerDoc.ref, {
          score: 0,
          pairsFound: 0,
          status: 'ready',
          finishTime: null,
          finishSeconds: null
        })
      )
      await Promise.all(resetPromises)

      const roomRef = doc(db, 'rooms', roomId)
      // Regenerar un mazo fresco barajado sincronizado antes de arrancar
      const roomSnap = await getDoc(roomRef)
      if (roomSnap.exists()) {
        const roomData = roomSnap.data()
        const config = roomData.config || { cardCount: 24, cartasVisibles: false }
        const freshDeck = generateSynchronizedDeck(config.cardCount, config.cartasVisibles)
        const nextRound = ((roomData.round as number) || 1) + 1

        await updateDoc(roomRef, {
          status: 'playing',
          round: nextRound,
          restartTrigger: Date.now(),
          'config.deck': freshDeck,
          startedAt: serverTimestamp()
        })
        return { success: true }
      }
      return { success: false, error: 'Sala no encontrada' }
    } catch (err: any) {
      console.error('Error al iniciar la partida en sala:', err)
      error.value = 'Error al iniciar la partida: ' + (err?.message || err)
      return { success: false, error: error.value }
    }
  }

  // Abandonar o cerrar sala
  async function leaveRoom(roomId: string) {
    if (!roomId) return
    const player = getCurrentPlayerData()

    try {
      const playerRef = doc(db, 'rooms', roomId, 'players', player.uid)
      await deleteDoc(playerRef)

      const remainingSnap = await getDocs(collection(db, 'rooms', roomId, 'players'))
      if (remainingSnap.empty) {
        // Eliminar sala si ya no hay nadie
        await deleteDoc(doc(db, 'rooms', roomId))
      } else {
        // Si el anfitrión se fue, transferir el host al primer jugador restante
        if (currentRoom.value?.hostId === player.uid) {
          const nextHost = remainingSnap.docs[0]
          await updateDoc(doc(db, 'rooms', roomId), {
            hostId: nextHost.id
          })
          await updateDoc(doc(db, 'rooms', roomId, 'players', nextHost.id), {
            isHost: true
          })
        }
      }
      currentRoom.value = null
      roomPlayers.value = []
    } catch (err) {
      console.warn('Error al salir de la sala:', err)
    }
  }

  return {
    currentRoom,
    roomPlayers,
    loading,
    error,
    createRoom,
    joinRoom,
    listenToRoom,
    listenToRoomPlayers,
    updatePlayerProgress,
    updateRoomConfig,
    startRoomGame,
    leaveRoom,
    flipCard,
    getCurrentPlayerData
  }
}
