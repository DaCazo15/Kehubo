const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

/**
 * Genera un mazo aleatorio sincronizado en memoria del servidor.
 * Utiliza el algoritmo de barajado Fisher-Yates.
 */
function generateServerDeck(cardCount = 24) {
  const paresCount = Math.floor(cardCount / 2)
  const base = []
  for (let i = 1; i <= paresCount; i++) {
    base.push(i, i)
  }

  const cards = base.map((valor, index) => ({
    id: index + 1,
    valor,
    revelada: false,
    encontrada: false
  }))

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  return cards
}

/**
 * Cloud Function: createMultiplayerRoom
 * 
 * Crea una sala multijugador guardando el mazo completo y sus valores reales
 * en la subcolección 'secret/deck' (inaccesible para clientes directos).
 * El documento público de la sala únicamente expone las cartas con `valor: null` (si están ocultas).
 */
exports.createMultiplayerRoom = onCall(async (request) => {
  const { config = {}, player = {} } = request.data || {}
  const cardCount = [16, 24, 32, 40].includes(config.cardCount) ? config.cardCount : 24
  const cartasVisibles = Boolean(config.cartasVisibles)

  // Obtener UID del usuario autenticado o ID anónimo persistente
  const uid = request.auth?.uid || player.uid
  if (!uid) {
    throw new HttpsError('unauthenticated', 'El jugador debe proporcionar un UID válido o estar autenticado.')
  }

  const displayName = player.displayName || 'Guerrero ' + uid.substring(0, 4)
  const photoURL = player.photoURL || ''
  const country = (player.country || '').toUpperCase()

  // Generar código de sala
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KH-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Generar mazo en el servidor
  const serverDeck = generateServerDeck(cardCount)

  // Mazo público sanitizado para el cliente (los valores se ocultan si cartasVisibles es false)
  const publicDeck = serverDeck.map(card => ({
    id: card.id,
    valor: cartasVisibles ? card.valor : null,
    revelada: cartasVisibles,
    encontrada: false
  }))

  const roomRef = db.collection('rooms').doc()
  const roomId = roomRef.id

  const batch = db.batch()

  // 1. Guardar documento público de la sala
  batch.set(roomRef, {
    code,
    hostId: uid,
    status: 'waiting',
    maxPlayers: 4,
    config: {
      cardCount,
      cartasVisibles,
      deck: publicDeck
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })

  // 2. Guardar mazo secreto con los valores reales (inaccesible para clientes en firestore.rules)
  const secretRef = roomRef.collection('secret').doc('deck')
  batch.set(secretRef, {
    cards: serverDeck,
    cardCount,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })

  // 3. Registrar al anfitrión en la subcolección de jugadores
  const playerRef = roomRef.collection('players').doc(uid)
  batch.set(playerRef, {
    uid,
    displayName,
    photoURL,
    country,
    isHost: true,
    score: 0,
    pairsFound: 0,
    status: 'ready',
    finishTime: null,
    finishSeconds: null,
    joinedAt: admin.firestore.FieldValue.serverTimestamp()
  })

  await batch.commit()

  return {
    success: true,
    roomId,
    code,
    publicDeck
  }
})

/**
 * Cloud Function: flipCard
 * 
 * Revela bajo demanda el valor real de una carta específica consultando
 * la subcolección secreta en el servidor, impidiendo la inspección previa en devtools.
 */
exports.flipCard = onCall(async (request) => {
  const { roomId, cardId, playerId } = request.data || {}

  if (!roomId || !cardId) {
    throw new HttpsError('invalid-argument', 'Se requiere roomId y cardId.')
  }

  const callerUid = request.auth?.uid || playerId
  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'Identificador de jugador no proporcionado.')
  }

  const roomRef = db.collection('rooms').doc(roomId)
  const secretRef = roomRef.collection('secret').doc('deck')

  const secretSnap = await secretRef.get()
  if (!secretSnap.exists) {
    throw new HttpsError('not-found', 'Mazo secreto de la sala no encontrado.')
  }

  const secretDeck = secretSnap.data().cards || []
  const card = secretDeck.find(c => c.id === Number(cardId))

  if (!card) {
    throw new HttpsError('not-found', `Carta con ID ${cardId} no encontrada en la sala.`)
  }

  return {
    success: true,
    cardId: card.id,
    valor: card.valor
  }
})

/**
 * Cloud Function: validateMatch
 * 
 * Valida si dos cartas seleccionadas forman un par legítimo en el servidor
 * y actualiza el score y pares del jugador aplicando límites matemáticos server-side.
 */
exports.validateMatch = onCall(async (request) => {
  const { roomId, cardId1, cardId2, playerId, currentScore = 0, currentPairs = 0 } = request.data || {}

  if (!roomId || !cardId1 || !cardId2) {
    throw new HttpsError('invalid-argument', 'Se requieren roomId, cardId1 y cardId2.')
  }

  const callerUid = request.auth?.uid || playerId
  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'Identificador de jugador no proporcionado.')
  }

  const roomRef = db.collection('rooms').doc(roomId)
  const [secretSnap, playerSnap] = await Promise.all([
    roomRef.collection('secret').doc('deck').get(),
    roomRef.collection('players').doc(callerUid).get()
  ])

  if (!secretSnap.exists || !playerSnap.exists) {
    throw new HttpsError('not-found', 'Sala o jugador no encontrado.')
  }

  const secretDeck = secretSnap.data().cards || []
  const maxCardCount = secretSnap.data().cardCount || 24
  const maxPairs = Math.floor(maxCardCount / 2)

  const c1 = secretDeck.find(c => c.id === Number(cardId1))
  const c2 = secretDeck.find(c => c.id === Number(cardId2))

  if (!c1 || !c2 || c1.id === c2.id) {
    throw new HttpsError('invalid-argument', 'Cartas inválidas.')
  }

  const isMatch = (c1.valor === c2.valor)
  let newScore = Math.max(0, Number(currentScore) || 0)
  let newPairsFound = Math.max(0, Number(currentPairs) || 0)

  if (isMatch) {
    newScore += 10
    newPairsFound = Math.min(maxPairs, newPairsFound + 1)

    // Actualizar progreso verificado en Firestore
    await roomRef.collection('players').doc(callerUid).update({
      score: newScore,
      pairsFound: newPairsFound
    })
  } else {
    // Si no coincide, penalización de 2 puntos sin bajar de 0
    newScore = Math.max(0, newScore - 2)
    await roomRef.collection('players').doc(callerUid).update({
      score: newScore
    })
  }

  return {
    success: true,
    isMatch,
    c1Valor: c1.valor,
    c2Valor: c2.valor,
    newScore,
    newPairsFound
  }
})
