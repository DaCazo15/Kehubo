import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { auth, googleProvider, db, storage } from '../config/firebase'
import { getDefaultAvatarByGender } from '../helpers/avatars'
import { compressImageToAvif } from '../helpers/imageCompressor'
import { detectCountryFromIP } from '../helpers/countries'
import type { UserProfile, UserGender } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<FirebaseUser | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const loading = ref<boolean>(false)
  const authError = ref<string | null>(null)
  const isAuthModalOpen = ref<boolean>(false)
  const authMode = ref<'login' | 'register'>('login')
  const isInitialized = ref<boolean>(false)

  const isAuthenticated = computed(() => !user.value)
  
  const userDisplayName = computed(() => {
    if (userProfile.value?.displayName) return userProfile.value.displayName
    if (user.value?.displayName) return user.value.displayName
    return user.value?.email?.split('@')[0] || 'Guerrero'
  })

  const userAvatar = computed(() => {
    if (userProfile.value?.photoURL) return userProfile.value.photoURL
    return user.value?.photoURL || null
  })

  const userGender = computed<UserGender>(() => {
    return (userProfile.value?.genero as UserGender) || 'hombre'
  })

  const userCountry = computed(() => {
    const fromProfile = userProfile.value?.country
    if (fromProfile) return fromProfile.toUpperCase()
    if (typeof window !== 'undefined') {
      const fromCache = localStorage.getItem('kehubo_user_country')
      if (fromCache) return fromCache.toUpperCase()
    }
    return ''
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

  function openAuthModal(mode: 'login' | 'register' = 'login') {
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

  function formatFirebaseError(error: any): string | null {
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
  async function fetchOrCreateUserProfile(firebaseUser: FirebaseUser | null, extraData: Partial<UserProfile> = {}): Promise<UserProfile | null> {
    if (!firebaseUser) {
      userProfile.value = null
      return null
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const userDocSnap = await getDoc(userRef)
    
      // Auto-detect country if not provided and not in db
      let detectedCountry = extraData.country || ''
      if (!detectedCountry) {
        detectedCountry = await detectCountryFromIP()
      }

      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as Partial<UserProfile>
        const resolvedCountry = (data.country || detectedCountry || '').toUpperCase()

        if (resolvedCountry && typeof window !== 'undefined') {
          localStorage.setItem('kehubo_user_country', resolvedCountry)
        }

        // Si el usuario no tenía país en su documento de Firestore pero lo detectamos, guardarlo para persistencia
        if (!data.country && resolvedCountry) {
          updateDoc(userRef, { country: resolvedCountry }).catch(() => {})
        }

        userProfile.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: data.displayName || firebaseUser.displayName || '',
          photoURL: data.photoURL || firebaseUser.photoURL || null,
          genero: (data.genero as UserGender) || 'hombre',
          country: resolvedCountry,
          googlePhotoURL: data.googlePhotoURL || (extraData.authProvider === 'google' ? firebaseUser.photoURL : null),
          authProvider: (data.authProvider as any) || (firebaseUser.providerData?.some(p => p.providerId === 'google.com') ? 'google' : 'password'),
          createdAt: data.createdAt || new Date().toISOString(),
          bestTime: data.bestTime || '--:--',
          bestSeconds: data.bestSeconds ?? null,
          friendsCount: data.friendsCount || 0,
          avatarStoragePath: data.avatarStoragePath || null
        }
      } else {
        const isGoogle = extraData.authProvider === 'google' || firebaseUser.providerData?.some(p => p.providerId === 'google.com')
        const initialAvatar = isGoogle 
          ? (firebaseUser.photoURL || null)
          : (extraData.photoURL || getDefaultAvatarByGender(extraData.genero || 'hombre'))

        const finalCountry = (detectedCountry || '').toUpperCase()
        if (finalCountry && typeof window !== 'undefined') {
          localStorage.setItem('kehubo_user_country', finalCountry)
        }

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: extraData.displayName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Guerrero'),
          photoURL: initialAvatar,
          genero: (extraData.genero as UserGender) || 'hombre',
          country: finalCountry,
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
      // Sincronizar partidas previas con el país/nombre/avatar actual
      if (firebaseUser.uid && userProfile.value?.country) {
        syncUserScoresInFirestore(firebaseUser.uid, {
          country: userProfile.value.country,
          displayName: userProfile.value.displayName,
          photoURL: userProfile.value.photoURL || ''
        }).catch(() => {})
      }

      return userProfile.value
    } catch (e) {
      console.warn('Firestore user profile sync error (falling back to Auth profile):', e)
      userProfile.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || extraData.displayName || '',
        photoURL: firebaseUser.photoURL || extraData.photoURL || getDefaultAvatarByGender(extraData.genero || 'hombre'),
        genero: (extraData.genero as UserGender) || 'hombre',
        country: (extraData.country || '').toUpperCase(),
        googlePhotoURL: firebaseUser.providerData?.find(p => p.providerId === 'google.com')?.photoURL || null,
        authProvider: (firebaseUser.providerData?.some(p => p.providerId === 'google.com') ? 'google' : 'password'),
        createdAt: new Date().toISOString(),
        bestTime: '--:--',
        bestSeconds: null,
        friendsCount: 0,
        avatarStoragePath: null
      }
      return userProfile.value
    }
  }

  // Sincroniza todas las partidas registradas por el usuario en 'scores'
  async function syncUserScoresInFirestore(uid: string, dataUpdates: { country?: string; displayName?: string; photoURL?: string }) {
    if (!uid || uid === 'anonimo') return
    try {
      const scoresRef = collection(db, 'scores')
      const q = query(scoresRef, where('userId', '==', uid))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const batchPromises = snap.docs.map(docSnap => {
          const data = docSnap.data()
          const needsUpdate = (Boolean(dataUpdates.country) && data.country !== dataUpdates.country) ||
                              (Boolean(dataUpdates.displayName) && data.displayName !== dataUpdates.displayName) ||
                              (Boolean(dataUpdates.photoURL) && data.photoURL !== dataUpdates.photoURL)
          if (needsUpdate) {
            const updates: Record<string, any> = {}
            if (dataUpdates.country) updates.country = dataUpdates.country
            if (dataUpdates.displayName) updates.displayName = dataUpdates.displayName
            if (dataUpdates.photoURL) updates.photoURL = dataUpdates.photoURL
            return updateDoc(docSnap.ref, updates)
          }
          return Promise.resolve()
        })
        await Promise.all(batchPromises)
      }
    } catch (e) {
      console.warn('Error sincronizando partidas en scores:', e)
    }
  }

  // Control de Seguridad Anti-Fuerza Bruta y Prevención de Abusos
  const failedAttempts = ref<number>(0)
  const lockoutUntil = ref<number | null>(null)

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

  function sanitizeInput(text: string): string {
    if (typeof text !== 'string') return ''
    return text.replace(/[<>]/g, '').trim().slice(0, 30)
  }

  async function loginWithEmail(email: string, password: string) {
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
    } catch (err: any) {
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

  async function registerWithEmail(name: string, email: string, password: string, genero: UserGender = 'hombre', country = '') {
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
        country,
        photoURL: assignedAvatar,
        authProvider: 'password'
      })

      resetFailedAttempts()
      closeAuthModal()
      return { success: true, user: auth.currentUser }
    } catch (err: any) {
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
    } catch (err: any) {
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

  async function updateUserProfileData(updates: Partial<UserProfile>) {
    if (loading.value) return { success: false }
    loading.value = true
    authError.value = null
    try {
      const sanitizedDisplayName = updates.displayName !== undefined ? sanitizeInput(updates.displayName) : undefined
      const sanitizedUpdates: Record<string, any> = {}
      if (sanitizedDisplayName !== undefined) sanitizedUpdates.displayName = sanitizedDisplayName
      if (updates.photoURL !== undefined) sanitizedUpdates.photoURL = updates.photoURL
      if (updates.genero !== undefined) sanitizedUpdates.genero = updates.genero
      if (updates.country !== undefined) sanitizedUpdates.country = updates.country
      if (updates.avatarStoragePath !== undefined) sanitizedUpdates.avatarStoragePath = updates.avatarStoragePath

      // 1. Actualizar Firebase Auth User
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: sanitizedDisplayName !== undefined ? sanitizedDisplayName : auth.currentUser.displayName,
          photoURL: updates.photoURL !== undefined ? updates.photoURL : auth.currentUser.photoURL
        })
      }

      // 2. Actualizar Firestore
      if (user.value?.uid) {
        try {
          const userRef = doc(db, 'users', user.value.uid)
          await updateDoc(userRef, sanitizedUpdates)
        } catch (e) {
          console.warn('Could not update Firestore document:', e)
        }
      }

      // 3. Actualizar estado local
      if (userProfile.value) {
        userProfile.value = {
          ...userProfile.value,
          ...sanitizedUpdates
        }
      }

      if (sanitizedUpdates.country && typeof window !== 'undefined') {
        localStorage.setItem('kehubo_user_country', sanitizedUpdates.country.toUpperCase())
      }

      // 4. Sincronizar partidas previas en la colección 'scores'
      if (user.value?.uid) {
        syncUserScoresInFirestore(user.value.uid, {
          country: sanitizedUpdates.country,
          displayName: sanitizedUpdates.displayName,
          photoURL: sanitizedUpdates.photoURL
        }).catch(() => {})
      }

      return { success: true }
    } catch (err: any) {
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
  async function uploadCustomAvatar(file: File) {
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
      const ext = isAvif ? 'avif' : ((processedFile as File).name?.split('.').pop() || 'png')
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
    } catch (err: any) {
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
    userCountry,
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
    syncUserScoresInFirestore,
    logout,
    initAuthListener,
  }
})
