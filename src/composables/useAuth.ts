import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const { 
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
    googlePhotoURL
  } = storeToRefs(authStore)

  const {
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
  } = authStore

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
}
