import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { auth, googleProvider, db, storage } from '../config/firebase'
import { getDefaultAvatarByGender } from '../helpers/avatars'
import { compressImageToAvif } from '../helpers/imageCompressor'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(false)
  const authError = ref(null)
  const isAuthModalOpen = ref(false)
  const authMode = ref('login') // 'login' | 'register'
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  
  const userDisplayName = computed(() => {
    if (userProfile.value?.displayName) return userProfile.value.displayName
    if (user.value?.displayName) return user.value.displayName
    return user.value?.email?.split('@')[0] || 'Guerrero'
  })

  const userAvatar = computed(() => {
    if (userProfile.value?.photoURL) return userProfile.value.photoURL
    return user.value?.photoURL || null
  })

  const userGender = computed(() => {
    return userProfile.value?.genero || 'hombre'
  })

  const isGoogleUser = computed(() => {
    if (userProfile.value?.authProvider === 'google') return true
    return user.value?.providerData?.some(p => p.providerId === 'google.com') || false
  })

  const googlePhotoURL = computed(() => {
    if (userProfile.value?.googlePhotoURL) return userProfile.value.googlePhotoURL
    const googleProviderData = user.value?.providerData?.find(p => p.providerId === 'google.com')
    return googleProviderData?.photoURL || null
  })

  function openAuthModal(mode = 'login') {
    authMode.value = mode
    authError.value = null
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
    authError.value = null
  }

  function toggleAuthMode() {
    authMode.value = authMode.value === 'login' ? 'register' : 'login'
    authError.value = null
  }

  function formatFirebaseError(error) {
    const code = error?.code || ''

    // Ignorar si el usuario simplemente cerró o canceló la ventana de Google
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/user-cancelled' ||
      code === 'auth/cancelled-popup-request'
    ) {
      return null
    }

    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciales inválidas. Comprueba tu correo y contraseña.'
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado.'
      case 'auth/invalid-email':
        return 'El formato de correo no es válido.'
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.'
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente de Google. Habilita las ventanas emergentes e inténtalo de nuevo.'
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu conexión a internet.'
      default:
        return null
    }
  }

  // Cargar o crear perfil en Firestore
  async function fetchOrCreateUserProfile(firebaseUser, extraData = {}) {
    if (!firebaseUser) {
      userProfile.value = null
      return null
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(userRef)

      if (snap.exists()) {
        const data = snap.data()
        userProfile.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: data.displayName || firebaseUser.displayName,
          photoURL: data.photoURL || firebaseUser.photoURL,
          genero: data.genero || 'hombre',
          googlePhotoURL: data.googlePhotoURL || (extraData.authProvider === 'google' ? firebaseUser.photoURL : null),
          authProvider: data.authProvider || (firebaseUser.providerData?.some(p => p.providerId === 'google.com') ? 'google' : 'password'),
          createdAt: data.createdAt || new Date().toISOString(),
          bestTime: data.bestTime || '--:--',
          bestSeconds: data.bestSeconds || null,
          friendsCount: data.friendsCount || 0,
          avatarStoragePath: data.avatarStoragePath || null
        }
      } else {
        const isGoogle = extraData.authProvider === 'google' || firebaseUser.providerData?.some(p => p.providerId === 'google.com')
        const initialAvatar = isGoogle 
          ? firebaseUser.photoURL 
          : (extraData.photoURL || getDefaultAvatarByGender(extraData.genero || 'hombre'))

        const newProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: extraData.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: initialAvatar,
          genero: extraData.genero || 'hombre',
          googlePhotoURL: isGoogle ? firebaseUser.photoURL : null,
          authProvider: isGoogle ? 'google' : 'password',
          createdAt: new Date().toISOString(),
          bestTime: '--:--',
          bestSeconds: null,
          friendsCount: 0,
          avatarStoragePath: null
        }

        await setDoc(userRef, newProfile)
        userProfile.value = newProfile

        // Sincronizar con Firebase Auth Profile si es necesario
        if (auth.currentUser && (!auth.currentUser.photoURL || !auth.currentUser.displayName)) {
          await updateProfile(auth.currentUser, {
            displayName: newProfile.displayName,
            photoURL: newProfile.photoURL
          })
        }
      }
      return userProfile.value
    } catch (e) {
      console.warn('Firestore user profile sync error (falling back to Auth profile):', e)
      userProfile.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || extraData.displayName,
        photoURL: firebaseUser.photoURL || extraData.photoURL || getDefaultAvatarByGender(extraData.genero || 'hombre'),
        genero: extraData.genero || 'hombre',
        googlePhotoURL: firebaseUser.providerData?.find(p => p.providerId === 'google.com')?.photoURL || null,
        authProvider: firebaseUser.providerData?.some(p => p.providerId === 'google.com') ? 'google' : 'password',
        createdAt: new Date().toISOString(),
        bestTime: '--:--',
        bestSeconds: null,
        friendsCount: 0,
        avatarStoragePath: null
      }
      return userProfile.value
    }
  }

  // Control de Seguridad Anti-Fuerza Bruta y Prevención de Abusos
  const failedAttempts = ref(0)
  const lockoutUntil = ref(null)

  function checkBruteForceLockout() {
    if (lockoutUntil.value) {
      const now = Date.now()
      if (now < lockoutUntil.value) {
        const remainingSeconds = Math.ceil((lockoutUntil.value - now) / 1000)
        authError.value = `Demasiados intentos fallidos. Acceso bloqueado por seguridad. Reintenta en ${remainingSeconds} segundos.`
        return true
      } else {
        lockoutUntil.value = null
        failedAttempts.value = 0
      }
    }
    return false
  }

  function recordFailedAttempt() {
    failedAttempts.value += 1
    if (failedAttempts.value >= 5) {
      lockoutUntil.value = Date.now() + 60 * 1000
      authError.value = 'Demasiados intentos fallidos consecutivos. Acceso bloqueado por seguridad durante 60 segundos.'
    }
  }

  function resetFailedAttempts() {
    failedAttempts.value = 0
    lockoutUntil.value = null
  }

  function sanitizeInput(text) {
    if (typeof text !== 'string') return ''
    return text.replace(/[<>]/g, '').trim().slice(0, 30)
  }

  async function loginWithEmail(email, password) {
    if (checkBruteForceLockout()) {
      return { success: false, error: authError.value }
    }

    if (loading.value) return { success: false }
    loading.value = true
    authError.value = null

    try {
      const sanitizedEmail = (email || '').trim().toLowerCase()
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password)
      user.value = userCredential.user
      await fetchOrCreateUserProfile(userCredential.user)
      resetFailedAttempts()
      closeAuthModal()
      return { success: true, user: userCredential.user }
    } catch (err) {
      recordFailedAttempt()
      console.error('Error al iniciar sesión:', err)
      if (!authError.value) {
        authError.value = formatFirebaseError(err)
      }
      return { success: false, error: authError.value }
    } finally {
      loading.value = false
    }
  }

  async function registerWithEmail(name, email, password, genero = 'hombre') {
    if (checkBruteForceLockout()) {
      return { success: false, error: authError.value }
    }

    if (loading.value) return { success: false }
    loading.value = true
    authError.value = null

    try {
      const sanitizedName = sanitizeInput(name)
      const sanitizedEmail = (email || '').trim().toLowerCase()
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password)
      const assignedAvatar = getDefaultAvatarByGender(genero)

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: sanitizedName,
          photoURL: assignedAvatar
        })
      }

      user.value = auth.currentUser
      await fetchOrCreateUserProfile(auth.currentUser, {
        displayName: sanitizedName,
        genero,
        photoURL: assignedAvatar,
        authProvider: 'password'
      })

      resetFailedAttempts()
      closeAuthModal()
      return { success: true, user: auth.currentUser }
    } catch (err) {
      recordFailedAttempt()
      console.error('Error al registrar usuario:', err)
      if (!authError.value) {
        authError.value = formatFirebaseError(err)
      }
      return { success: false, error: authError.value }
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    if (checkBruteForceLockout()) {
      return { success: false, error: authError.value }
    }

    if (loading.value) return { success: false }
    loading.value = true
    authError.value = null

    try {
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      await fetchOrCreateUserProfile(result.user, {
        authProvider: 'google',
        googlePhotoURL: result.user.photoURL
      })
      resetFailedAttempts()
      closeAuthModal()
      return { success: true, user: result.user }
    } catch (err) {
      const formatted = formatFirebaseError(err)
      authError.value = formatted
      if (formatted) {
        console.error('Error en Google Sign-in:', err)
        return { success: false, error: formatted }
      }
      return { success: false, cancelled: true }
    } finally {
      loading.value = false
    }
  }

  async function updateUserProfileData({ displayName, photoURL, genero, avatarStoragePath }) {
    if (loading.value) return { success: false }
    loading.value = true
    authError.value = null
    try {
      const sanitizedDisplayName = displayName !== undefined ? sanitizeInput(displayName) : undefined
      const updates = {}
      if (sanitizedDisplayName !== undefined) updates.displayName = sanitizedDisplayName
      if (photoURL !== undefined) updates.photoURL = photoURL
      if (genero !== undefined) updates.genero = genero
      if (avatarStoragePath !== undefined) updates.avatarStoragePath = avatarStoragePath

      // 1. Actualizar Firebase Auth User
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: sanitizedDisplayName !== undefined ? sanitizedDisplayName : auth.currentUser.displayName,
          photoURL: photoURL !== undefined ? photoURL : auth.currentUser.photoURL
        })
      }

      // 2. Actualizar Firestore
      if (user.value?.uid) {
        try {
          const userRef = doc(db, 'users', user.value.uid)
          await updateDoc(userRef, updates)
        } catch (e) {
          console.warn('Could not update Firestore document:', e)
        }
      }

      // 3. Actualizar estado local
      if (userProfile.value) {
        userProfile.value = {
          ...userProfile.value,
          ...updates
        }
      }

      return { success: true }
    } catch (err) {
      console.error('Error al actualizar perfil:', err)
      authError.value = 'No se pudo actualizar el perfil. Intenta nuevamente.'
      return { success: false, error: authError.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sube una foto de perfil personalizada a Firebase Storage y elimina la anterior si existía
   */
  async function uploadCustomAvatar(file) {
    if (!user.value || !file) {
      return { success: false, error: 'Usuario no autenticado o archivo inválido.' }
    }

    loading.value = true
    authError.value = null

    try {
      // 1. Si existe un avatar previo en Storage, eliminarlo
      const oldStoragePath = userProfile.value?.avatarStoragePath
      if (oldStoragePath) {
        try {
          const oldRef = storageRef(storage, oldStoragePath)
          await deleteObject(oldRef)
          console.log('🗑️ Avatar previo eliminado de Firebase Storage:', oldStoragePath)
        } catch (delErr) {
          console.warn('No se pudo eliminar el avatar previo de Storage (puede que no existiera):', delErr)
        }
      }

      // 2. Comprimir y convertir imagen a formato AVIF a través del backend de Node.js
      const { file: processedFile, isAvif } = await compressImageToAvif(file)

      // 3. Subir archivo optimizado a Firebase Storage
      const ext = isAvif ? 'avif' : (processedFile.name?.split('.').pop() || 'png')
      const newStoragePath = `avatars/${user.value.uid}/avatar_${Date.now()}.${ext}`
      const newRef = storageRef(storage, newStoragePath)
      
      const uploadRes = await uploadBytes(newRef, processedFile, {
        contentType: isAvif ? 'image/avif' : processedFile.type
      })
      const downloadURL = await getDownloadURL(uploadRes.ref)

      // 4. Actualizar perfil del usuario con la nueva URL y el nuevo storagePath
      await updateUserProfileData({
        photoURL: downloadURL,
        avatarStoragePath: newStoragePath
      })

      return { success: true, url: downloadURL, storagePath: newStoragePath }
    } catch (err) {
      console.error('Error al subir avatar a Firebase Storage:', err)
      authError.value = 'Error al subir la imagen al almacenamiento.'
      return { success: false, error: authError.value }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await signOut(auth)
      user.value = null
      userProfile.value = null
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    } finally {
      loading.value = false
    }
  }

  function initAuthListener() {
    if (isInitialized.value) return
    isInitialized.value = true
    onAuthStateChanged(auth, async (currentUser) => {
      user.value = currentUser
      if (currentUser) {
        await fetchOrCreateUserProfile(currentUser)
      } else {
        userProfile.value = null
      }
    })
  }

  return {
    user,
    userProfile,
    loading,
    authError,
    isAuthModalOpen,
    authMode,
    isAuthenticated,
    userDisplayName,
    userAvatar,
    userGender,
    isGoogleUser,
    googlePhotoURL,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    updateUserProfileData,
    uploadCustomAvatar,
    logout,
    initAuthListener,
  }
})
