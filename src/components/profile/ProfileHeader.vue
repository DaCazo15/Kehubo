<script setup lang="ts">
import { computed } from 'vue'
import type { UserProfile } from '../../types'

const props = defineProps<{
  profile: UserProfile | null
  isOwnProfile: boolean
  friendshipState: string
  friendActionLoading: boolean
  displayAvatar: string
  displayName: string
  displayEmail?: string
  displayCountry: { name: string; flag: string; code: string } | null
}>()

const emit = defineEmits<{
  (e: 'sendFriendRequest'): void
  (e: 'acceptFriendRequest'): void
  (e: 'openSettings'): void
}>()
</script>

<template>
  <div class="game-card-portal rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative overflow-hidden">
    <!-- Resplandor decorativo -->
    <div class="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
      <!-- Avatar con borde legendario -->
      <div class="relative shrink-0">
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-linear-to-tr from-amber-500 via-pink-500 to-amber-300 shadow-xl shadow-amber-500/20 animate-pulse-glow">
          <img
            v-if="displayAvatar"
            :src="displayAvatar"
            :alt="displayName"
            referrerpolicy="no-referrer"
            class="w-full h-full rounded-full object-cover bg-slate-900 border-2 border-slate-950"
          />
          <div
            v-else
            class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-amber-400 uppercase"
          >
            {{ displayName.charAt(0) }}
          </div>
        </div>
      </div>

      <!-- Datos del Guerrero -->
      <div class="flex-1 text-center md:text-left space-y-2">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
          <h2 class="text-2xl sm:text-3xl font-black uppercase text-slate-100 tracking-tight">
            {{ displayName }}
          </h2>

          <span
            v-if="displayCountry"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 mx-auto sm:mx-0"
            :title="displayCountry.name"
          >
            <span :class="'flag:' + displayCountry.code.toUpperCase()" class="inline-block rounded-xs shadow-xs"></span>
            <span>{{ displayCountry.name }}</span>
          </span>
        </div>

        <p v-if="displayEmail" class="text-xs text-slate-400 font-medium">
          {{ displayEmail }}
        </p>

        <p class="text-xs text-slate-300 max-w-xl">
          {{ (profile as any)?.bio || 'Guerrero honorable del reino de Kehubo. Forjando su leyenda carta a carta.' }}
        </p>
      </div>

      <!-- Acciones de Cabecera -->
      <div class="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
        <!-- Mi propio perfil: Ajustes -->
        <template v-if="isOwnProfile">
          <BaseButton
            variant="gold"
            size="sm"
            rounded="xl"
            @click="emit('openSettings')"
          >
            <template #icon-left>
              <i class="bi bi-gear-fill"></i>
            </template>
            <span>Editar Perfil</span>
          </BaseButton>
        </template>

        <!-- Perfil ajeno: Amistad -->
        <template v-else>
          <BaseButton
            v-if="friendshipState === 'none' || friendshipState === 'unauthenticated'"
            variant="gold"
            size="sm"
            rounded="xl"
            :disabled="friendActionLoading"
            :loading="friendActionLoading"
            @click="emit('sendFriendRequest')"
          >
            <template #icon-left>
              <i class="bi bi-person-plus-fill"></i>
            </template>
            <span>{{ friendActionLoading ? 'Enviando...' : 'Agregar Amigo' }}</span>
          </BaseButton>

          <BaseButton
            v-else-if="friendshipState === 'pending_sent'"
            variant="slate"
            size="sm"
            rounded="xl"
            disabled
            class="border-amber-500/30 text-amber-400/90"
          >
            <template #icon-left>
              <i class="bi bi-hourglass-split animate-spin"></i>
            </template>
            <span>Solicitud Enviada</span>
          </BaseButton>

          <BaseButton
            v-else-if="friendshipState === 'pending_received'"
            variant="gold"
            size="sm"
            rounded="xl"
            :disabled="friendActionLoading"
            :loading="friendActionLoading"
            @click="emit('acceptFriendRequest')"
          >
            <template #icon-left>
              <i class="bi bi-check-circle-fill text-emerald-700"></i>
            </template>
            <span>{{ friendActionLoading ? 'Aceptando...' : 'Aceptar Solicitud' }}</span>
          </BaseButton>

          <div
            v-else-if="friendshipState === 'friends'"
            class="h-9.5 px-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 box-border shrink-0"
          >
            <i class="bi bi-shield-check text-emerald-400 text-sm"></i>
            <span>Aliados</span>
          </div>
        </template>

        <BaseButton 
          :to="{ name: 'game' }" 
          variant="pink"
          size="sm"
          rounded="xl"
        >
          <template #icon-left>
            <i class="bi bi-play-fill text-base"></i>
          </template>
          <span>Jugar</span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
