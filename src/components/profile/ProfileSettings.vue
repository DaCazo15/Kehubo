<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import AvatarPicker from './AvatarPicker.vue'
import AuthGenderSelect from '../auth/AuthGenderSelect.vue'
import AuthCountrySelect from '../auth/AuthCountrySelect.vue'
import type { UserGender } from '../../types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const {
  user,
  userProfile,
  userDisplayName,
  userAvatar,
  userGender,
  isGoogleUser,
  googlePhotoURL,
  updateUserProfileData,
  uploadCustomAvatar
} = useAuth()

const editName = ref<string>('')
const selectedAvatar = ref<string>('')
const selectedGender = ref<UserGender>('hombre')
const selectedCountry = ref<string>('')
const selectedFile = ref<File | null>(null)
const successMessage = ref<string>('')
const errorMessage = ref<string>('')
const saving = ref<boolean>(false)

function syncFormData() {
  if (user.value) {
    editName.value = userDisplayName.value || ''
    selectedAvatar.value = userAvatar.value || ''
    selectedGender.value = (userGender.value as UserGender) || 'hombre'
    selectedCountry.value = (userProfile.value?.country || '').toUpperCase()
    selectedFile.value = null
    errorMessage.value = ''
    successMessage.value = ''
  }
}

onMounted(() => {
  syncFormData()
})

watch([user, userProfile], () => {
  syncFormData()
})

async function handleSave() {
  if (!user.value) return
  errorMessage.value = ''
  successMessage.value = ''
  saving.value = true

  try {
    let finalPhotoURL = selectedAvatar.value

    if (selectedFile.value) {
      const res = await uploadCustomAvatar(selectedFile.value)
      if (res.success && res.url) {
        finalPhotoURL = res.url
      } else if (res.error) {
        errorMessage.value = res.error
        saving.value = false
        return
      }
    }

    await updateUserProfileData({
      displayName: editName.value.trim() || userDisplayName.value || 'Guerrero',
      photoURL: finalPhotoURL,
      genero: selectedGender.value,
      country: selectedCountry.value
    })

    successMessage.value = '¡Ajustes de perfil guardados correctamente!'
    emit('saved')
    setTimeout(() => {
      successMessage.value = ''
    }, 4000)
  } catch (err: any) {
    errorMessage.value = err?.message || 'Error al guardar los ajustes.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="game-card-portal rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/30 shadow-2xl">
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
          <i class="bi bi-person-gear"></i>
        </div>
        <div>
          <h3 class="text-base font-black uppercase text-slate-100">
            Ajustes del Guerrero
          </h3>
          <p class="text-xs text-slate-400">
            Personaliza tu identidad, país y avatar de batalla.
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="emit('close')"
        class="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800/80 transition cursor-pointer"
      >
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Mensajes de Estado -->
    <div v-if="successMessage" class="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
      <i class="bi bi-check-circle-fill text-emerald-400 text-sm"></i>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
      <i class="bi bi-exclamation-triangle-fill text-red-400 text-sm"></i>
      <span>{{ errorMessage }}</span>
    </div>

    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Nombre de Usuario -->
      <div class="space-y-1.5">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-300">
          Nombre de Batalla
        </label>
        <input
          v-model="editName"
          type="text"
          required
          maxlength="24"
          placeholder="Tu apodo de guerrero"
          class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
        />
      </div>

      <!-- Género / Identidad -->
      <AuthGenderSelect v-model="selectedGender" />

      <!-- País de Origen -->
      <AuthCountrySelect v-model="selectedCountry" />

      <!-- Selector de Avatar Modular -->
      <AvatarPicker
        :selected-avatar="selectedAvatar"
        :selected-gender="selectedGender"
        :is-google-user="isGoogleUser"
        :google-photo-u-r-l="googlePhotoURL"
        @update:selected-avatar="selectedAvatar = $event"
        @file-selected="selectedFile = $event"
      />

      <!-- Botón Guardar Cambios -->
      <div class="pt-4 flex justify-end gap-3 border-t border-slate-800">
        <BaseButton
          type="button"
          variant="slate"
          size="md"
          rounded="xl"
          @click="emit('close')"
        >
          Cancelar
        </BaseButton>

        <BaseButton
          type="submit"
          variant="gold"
          size="md"
          rounded="xl"
          :disabled="saving"
          :loading="saving"
        >
          <template #icon-left>
            <i class="bi bi-floppy-fill"></i>
          </template>
          <span>{{ saving ? 'Guardando...' : 'Guardar Ajustes' }}</span>
        </BaseButton>
      </div>
    </form>
  </div>
</template>
