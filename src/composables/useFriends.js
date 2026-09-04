import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc,
  increment,
  addDoc
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './useAuth'

export function useFriends() {
  const { user, userDisplayName, userAvatar, userCountry } = useAuth()
  const friends = ref([])
  const loading = ref(false)
  let unsubscribe = null

  // Escuchar amigos en tiempo real de un usuario específico
  function listenToUserFriends(userId, callback) {
    if (!userId || userId === 'anonimo') {
      friends.value = []
      if (callback) callback([])
      return () => {}
    }

    loading.value = true
    const friendsRef = collection(db, 'users', userId, 'friends')
    
    return onSnapshot(friendsRef, (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))

      // Ordenar por fecha de amistad desc
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0
        const timeB = b.createdAt?.seconds || 0
        return timeB - timeA
      })

      friends.value = list
      loading.value = false
      if (callback) callback(list)
    }, (err) => {
      console.warn('Error escuchando amigos:', err)
      loading.value = false
    })
  }

  // Comprobar el estado de amistad entre el usuario actual y otro usuario
  async function checkFriendshipStatus(targetUserId) {
    const currentUid = user.value?.uid
    if (!currentUid || currentUid === 'anonimo') return 'unauthenticated'
    if (currentUid === targetUserId) return 'own'

    try {
      // 1. ¿Ya son amigos?
      const friendDocRef = doc(db, 'users', currentUid, 'friends', targetUserId)
      const friendDocSnap = await getDoc(friendDocRef)
      if (friendDocSnap.exists()) {
        return 'friends'
      }

      // 2. ¿Hay una solicitud pendiente enviada por el usuario actual?
      const notifRef = collection(db, 'notifications')
      const qSent = query(
        notifRef,
        where('targetUserId', '==', targetUserId),
        where('senderUserId', '==', currentUid),
        where('type', '==', 'friend_request')
      )
      const snapSent = await getDocs(qSent)
      const pendingSent = snapSent.docs.find(d => d.data().status === 'pending')
      if (pendingSent) {
        return 'pending_sent'
      }

      // 3. ¿Hay una solicitud pendiente recibida del otro usuario?
      const qReceived = query(
        notifRef,
        where('targetUserId', '==', currentUid),
        where('senderUserId', '==', targetUserId),
        where('type', '==', 'friend_request')
      )
      const snapReceived = await getDocs(qReceived)
      const pendingReceived = snapReceived.docs.find(d => d.data().status === 'pending')
      if (pendingReceived) {
        return { status: 'pending_received', notificationId: pendingReceived.id }
      }

      return 'none'
    } catch (err) {
      console.warn('Error comprobando estado de amistad:', err)
      return 'none'
    }
  }

  // Enviar solicitud de amistad
  async function sendFriendRequest(targetUser) {
    const currentUid = user.value?.uid
    if (!currentUid || currentUid === 'anonimo') {
      return { success: false, error: 'Debes iniciar sesión para enviar solicitudes.' }
    }
    if (!targetUser?.uid || targetUser.uid === currentUid) {
      return { success: false, error: 'Usuario no válido.' }
    }

    try {
      // Verificar que no exista una solicitud pendiente previa
      const notifRef = collection(db, 'notifications')
      const q = query(
        notifRef,
        where('targetUserId', '==', targetUser.uid),
        where('senderUserId', '==', currentUid),
        where('type', '==', 'friend_request')
      )
      const existingSnap = await getDocs(q)
      const alreadyPending = existingSnap.docs.some(d => d.data().status === 'pending')
      if (alreadyPending) {
        return { success: true, message: 'Solicitud ya enviada previamente.' }
      }

      const myName = userDisplayName.value || 'Guerrero'
      const myAvatar = userAvatar.value || ''
      const myCountry = userCountry.value || ''

      await addDoc(collection(db, 'notifications'), {
        targetUserId: targetUser.uid,
        senderUserId: currentUid,
        senderName: myName,
        senderAvatar: myAvatar,
        senderCountry: myCountry ? String(myCountry).toUpperCase() : '',
        type: 'friend_request',
        status: 'pending',
        message: `¡${myName} te ha enviado una solicitud de amistad!`,
        read: false,
        createdAt: serverTimestamp()
      })

      return { success: true }
    } catch (err) {
      console.error('Error enviando solicitud de amistad:', err)
      return { success: false, error: 'No se pudo enviar la solicitud.' }
    }
  }

  // Aceptar solicitud de amistad
  async function acceptFriendRequest(notification) {
    const currentUid = user.value?.uid
    if (!currentUid || !notification?.senderUserId) return { success: false }

    const senderUid = notification.senderUserId
    const senderName = notification.senderName || 'Guerrero'
    const senderAvatar = notification.senderAvatar || ''
    const senderCountry = notification.senderCountry || ''

    const myName = userDisplayName.value || 'Guerrero'
    const myAvatar = userAvatar.value || ''
    const myCountry = userCountry.value || ''

    try {
      // 1. Agregar a la subcolección del usuario actual
      const myFriendDoc = doc(db, 'users', currentUid, 'friends', senderUid)
      await setDoc(myFriendDoc, {
        uid: senderUid,
        displayName: senderName,
        photoURL: senderAvatar,
        country: senderCountry ? String(senderCountry).toUpperCase() : '',
        createdAt: serverTimestamp()
      })

      // 2. Agregar a la subcolección del remitente
      const theirFriendDoc = doc(db, 'users', senderUid, 'friends', currentUid)
      await setDoc(theirFriendDoc, {
        uid: currentUid,
        displayName: myName,
        photoURL: myAvatar,
        country: myCountry ? String(myCountry).toUpperCase() : '',
        createdAt: serverTimestamp()
      })

      // 3. Incrementar friendsCount en los documentos de usuario
      try {
        await updateDoc(doc(db, 'users', currentUid), { friendsCount: increment(1) })
      } catch (e) {}
      try {
        await updateDoc(doc(db, 'users', senderUid), { friendsCount: increment(1) })
      } catch (e) {}

      // 4. Actualizar la notificación original a 'accepted'
      if (notification.id) {
        const notifRef = doc(db, 'notifications', notification.id)
        await updateDoc(notifRef, {
          status: 'accepted',
          read: true
        })
      }

      // 5. Emitir notificación de confirmación al remitente
      await addDoc(collection(db, 'notifications'), {
        targetUserId: senderUid,
        senderUserId: currentUid,
        senderName: myName,
        senderAvatar: myAvatar,
        senderCountry: myCountry ? String(myCountry).toUpperCase() : '',
        type: 'friend_accepted',
        message: `¡${myName} ha aceptado tu solicitud de amistad! Ahora son amigos.`,
        read: false,
        createdAt: serverTimestamp()
      })

      return { success: true }
    } catch (err) {
      console.error('Error al aceptar solicitud de amistad:', err)
      return { success: false, error: 'Error al procesar la solicitud.' }
    }
  }

  // Rechazar solicitud de amistad
  async function rejectFriendRequest(notification) {
    if (!notification?.id) return { success: false }
    try {
      const notifRef = doc(db, 'notifications', notification.id)
      await updateDoc(notifRef, {
        status: 'rejected',
        read: true
      })
      return { success: true }
    } catch (err) {
      console.error('Error al rechazar solicitud de amistad:', err)
      return { success: false, error: 'Error al rechazar la solicitud.' }
    }
  }

  // Eliminar amistad
  async function removeFriend(friendId) {
    const currentUid = user.value?.uid
    if (!currentUid || !friendId) return { success: false }

    try {
      // 1. Eliminar de mi subcolección
      const myFriendDoc = doc(db, 'users', currentUid, 'friends', friendId)
      await deleteDoc(myFriendDoc)

      // 2. Eliminar de la subcolección del amigo
      const theirFriendDoc = doc(db, 'users', friendId, 'friends', currentUid)
      await deleteDoc(theirFriendDoc)

      // 3. Decrementar contadores
      try {
        await updateDoc(doc(db, 'users', currentUid), { friendsCount: increment(-1) })
      } catch (e) {}
      try {
        await updateDoc(doc(db, 'users', friendId), { friendsCount: increment(-1) })
      } catch (e) {}

      friends.value = friends.value.filter(f => f.id !== friendId && f.uid !== friendId)

      return { success: true }
    } catch (err) {
      console.error('Error al eliminar amigo:', err)
      return { success: false, error: 'No se pudo eliminar de la lista de amigos.' }
    }
  }

  return {
    friends,
    loading,
    listenToUserFriends,
    checkFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  }
}
