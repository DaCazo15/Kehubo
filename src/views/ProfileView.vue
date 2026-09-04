<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileStatsCard from '../components/profile/ProfileStatsCard.vue'
import ProfileMatchHistory from '../components/profile/ProfileMatchHistory.vue'
import ProfileSettings from '../components/profile/ProfileSettings.vue'
import FriendsList from '../components/profile/FriendsList.vue'

const route = useRoute()
const { user, isAuthenticated, openAuthModal } = useAuth()

const profileId = ref<string>((route.params.id as string) || user.value?.uid || '')
const activeTab = ref<'history' | 'friends' | 'settings'>('history')
const isSettingsModalOpen = ref<boolean>(false)

const {
  loading,
  profileData,
  isOwnProfile,
  displayAvatar,
  displayName,
  displayEmail,
  displayCountry,
  accountAge,
  matchHistory,
  bestMatches,
  globalRank,
  localRank,
  friendshipState,
  friendActionLoading,
  fetchProfile,
  handleSendFriendRequest,
  handleAcceptFriendRequest
} = useUserProfile(profileId)

onMounted(() => {
  fetchProfile()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    profileId.value = newId as string
    fetchProfile()
  }
})

watch(user, () => {
  if (!route.params.id && user.value?.uid) {
    profileId.value = user.value.uid
    fetchProfile()
  }
})

const bestScore = computed(() => {
  if (bestMatches.value.length === 0) return 0
  return bestMatches.value[0].score || 0
})
</script>

<template>
  <div class="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
    <!-- Estado: Cargando -->
    <div v-if="loading" class="max-w-4xl mx-auto py-24 text-center space-y-4">
      <div class="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-black uppercase tracking-wider text-slate-400">
        Invocando datos del guerrero...
      </p>
    </div>

    <!-- Estado: No encontrado -->
    <div v-else-if="!profileData" class="max-w-md mx-auto py-24 text-center space-y-6">
      <div class="w-20 h-20 rounded-full mx-auto bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl text-slate-600">
        <i class="bi bi-person-x"></i>
      </div>
      <h2 class="text-2xl font-black uppercase text-slate-100">Guerrero No Hallado</h2>
      <p class="text-xs text-slate-400">El perfil que buscas no existe o está oculto.</p>
      <BaseButton
        v-if="!isAuthenticated"
        @click="openAuthModal('login')"
        variant="gold"
        size="md"
        rounded="xl"
      >
        Iniciar Sesión
      </BaseButton>
    </div>

    <!-- Perfil Principal -->
    <div v-else class="max-w-5xl mx-auto space-y-8">
      <!-- Cabecera Modular -->
      <ProfileHeader
        :profile="profileData"
        :is-own-profile="isOwnProfile"
        :friendship-state="friendshipState"
        :friend-action-loading="friendActionLoading"
        :display-avatar="displayAvatar"
        :display-name="displayName"
        :display-email="displayEmail"
        :display-country="displayCountry"
        @send-friend-request="handleSendFriendRequest"
        @accept-friend-request="handleAcceptFriendRequest"
        @open-settings="isSettingsModalOpen = true"
      />

      <!-- Estadísticas Resumidas -->
      <ProfileStatsCard
        :account-age="accountAge"
        :total-games="matchHistory.length"
        :best-score="bestScore"
        :global-rank="globalRank"
        :local-rank="localRank"
        :country-name="displayCountry?.name"
      />

      <!-- Pestañas de Contenido (Historial / Amigos) -->
      <div class="space-y-6">
        <div class="flex border-b border-slate-800 gap-4">
          <button
            type="button"
            @click="activeTab = 'history'"
            class="pb-3 px-2 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center gap-2"
            :class="activeTab === 'history' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'"
          >
            <i class="bi bi-clock-history"></i>
            <span>Historial y Récords</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'friends'"
            class="pb-3 px-2 text-xs font-black uppercase tracking-wider transition border-b-2 cursor-pointer flex items-center gap-2"
            :class="activeTab === 'friends' ? 'border-pink-400 text-pink-300' : 'border-transparent text-slate-400 hover:text-slate-200'"
          >
            <i class="bi bi-people-fill"></i>
            <span>Aliados de Batalla</span>
          </button>
        </div>

        <!-- Contenido de Pestaña -->
        <div v-if="activeTab === 'history'">
          <ProfileMatchHistory 
            :match-history="matchHistory" 
            :best-matches="bestMatches" 
          />
        </div>

        <div v-else-if="activeTab === 'friends'">
          <FriendsList 
            :profile-id="profileId" 
            :is-own-profile="isOwnProfile" 
          />
        </div>
      </div>
    </div>

    <!-- Modal de Ajustes -->
    <BaseModal
      :is-open="isSettingsModalOpen"
      size="xl"
      @close="isSettingsModalOpen = false"
    >
      <ProfileSettings 
        @close="isSettingsModalOpen = false" 
        @saved="() => { isSettingsModalOpen = false; fetchProfile(); }" 
      />
    </BaseModal>
  </div>
</template>
