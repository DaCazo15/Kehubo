import { ref, computed } from 'vue'
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
  serverTimestamp
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../config/firebase'
import { useAuth } from './useAuth'

export function useMultiplayerRoom() {
  const { user, userDisplayName, userAvatar, userCountry, isAuthenticated } = useAuth()
  
  const currentRoom = ref(null)
  const roomPlayers = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Genera un código de sala aleatorio de 6 caracteres (ej. KH-8392)
  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `KH-${code}`
  }

  /**
   * Genera el mazo aleatorio sincronizado para la sala.
   * Utilizado como fallback en entornos de desarrollo local.
   */
  function generateSynchronizedDeck(cardCount = 24, cartasVisibles = false) {
    const paresCount = Math.floor(cardCount / 2)
    const base = []
    for (let i = 1; i <= paresCount; i++) {
      base.push(i, i)
    }

    const cards = base.map((valor, index) => ({
      id: index + 1,
      valor: cartasVisibles ? valor : null,
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
      uid = localStorage.getItem('kehubo_anon_player_id')
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
  async function createRoom(config = {}) {
    loading.value = true
    error.value = null

    try {
      const player = getCurrentPlayerData()
      const cardCount = config.cardCount || 24
      const cartasVisibles = config.cartasVisibles || false

      // 1. Intentar crear la sala mediante Cloud Function (mazo protegido en secret/deck)
      try {
        const createRoomFn = httpsCallable(functions, 'createMultiplayerRoom')
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

      const roomData = {
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

      currentRoom.value = { id: roomId, ...roomData }
      return { success: true, roomId, code }
    } catch (err) {
      console.error('Error al crear sala multijugador:', err)
      error.value = 'No se pudo crear la sala. Inténtalo de nuevo.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Revelar carta de forma segura solicitando el valor auténtico a la Cloud Function
  async function flipCard(roomId, cardId) {
    if (!roomId || !cardId) return null
    const player = getCurrentPlayerData()

    try {
      const flipCardFn = httpsCallable(functions, 'flipCard')
      const result = await flipCardFn({
        roomId,
        cardId,
        playerId: player.uid
      })

      if (result.data?.success) {
        return { cardId: result.data.cardId, valor: result.data.valor }
      }
    } catch (err) {
      // Si la función no está activa en desarrollo local, buscar en el mazo público si tiene valor
      console.warn('Consultando valor de carta con fallback local:', err.message)
      const localCard = currentRoom.value?.config?.deck?.find(c => c.id === Number(cardId))
      if (localCard && localCard.valor !== null && localCard.valor !== undefined) {
        return { cardId: localCard.id, valor: localCard.valor }
      }
    }
    return null
  }

  // Unirse a una sala existente (por código o ID directo)
  async function joinRoom(codeOrId) {
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
      let roomDoc = null
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

      const roomData = { id: roomId, ...roomDoc.data() }

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
    } catch (err) {
      console.error('Error al unirse a la sala:', err)
      error.value = 'Error al conectarse a la sala: ' + (err.message || err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Escuchar información de la sala en tiempo real
  function listenToRoom(roomId, callback) {
    if (!roomId) return () => {}
    const roomRef = doc(db, 'rooms', roomId)

    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() }
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
  function listenToRoomPlayers(roomId, callback) {
    if (!roomId) return () => {}
    const playersRef = collection(db, 'rooms', roomId, 'players')

    return onSnapshot(playersRef, (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))

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
  async function updatePlayerProgress(roomId, { score, pairsFound, isFinished, finishTime, finishSeconds }) {
    if (!roomId) return
    const player = getCurrentPlayerData()

    try {
      const maxCardCount = currentRoom.value?.config?.cardCount || 40
      const maxPossiblePairs = Math.floor(maxCardCount / 2)

      const playerRef = doc(db, 'rooms', roomId, 'players', player.uid)
      const updates = {}
      if (score !== undefined) {
        updates.score = Math.max(0, Math.floor(Number(score) || 0))
      }
      if (pairsFound !== undefined) {
        updates.pairsFound = Math.min(maxPossiblePairs, Math.max(0, Math.floor(Number(pairsFound) || 0)))
      }
      if (isFinished) {
        updates.status = 'finished'
        updates.finishTime = finishTime || '--:--'
        updates.finishSeconds = Math.max(0, Number(finishSeconds) || 0)
      }

      await updateDoc(playerRef, updates)
    } catch (err) {
      console.warn('Error actualizando progreso en sala:', err)
    }
  }

  // Actualizar configuración de la sala por el moderador
  async function updateRoomConfig(roomId, { cardCount, cartasVisibles }) {
    if (!roomId) return
    try {
      const deck = generateSynchronizedDeck(cardCount, cartasVisibles)
      const roomRef = doc(db, 'rooms', roomId)
      await updateDoc(roomRef, {
        config: {
          cardCount,
          cartasVisibles,
          deck
        }
      })
    } catch (err) {
      console.error('Error actualizando configuración de la sala:', err)
    }
  }

  // Iniciar la partida en la sala (solo moderador)
  async function startRoomGame(roomId) {
    if (!roomId) return
    try {
      const roomRef = doc(db, 'rooms', roomId)
      // Regenerar un mazo fresco sincronizado antes de arrancar
      const roomSnap = await getDoc(roomRef)
      if (roomSnap.exists()) {
        const config = roomSnap.data().config || { cardCount: 24, cartasVisibles: false }
        const freshDeck = generateSynchronizedDeck(config.cardCount, config.cartasVisibles)

        await updateDoc(roomRef, {
          status: 'playing',
          'config.deck': freshDeck,
          startedAt: serverTimestamp()
        })
      }
    } catch (err) {
      console.error('Error al iniciar la partida en sala:', err)
    }
  }

  // Abandonar o cerrar sala
  async function leaveRoom(roomId) {
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
