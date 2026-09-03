<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { maleAvatars, femaleAvatars } from '../../helpers/avatars'

const emit = defineEmits(['close', 'saved'])

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

// Estados locales para la edición
const editName = ref('')
const selectedAvatar = ref('')
const selectedGender = ref('hombre')
const activeAvatarTab = ref('system') // 'google' | 'system' | 'upload'
const selectedFile = ref(null)
const customImagePreview = ref(null)
const fileInputRef = ref(null)
const successMessage = ref('')
const errorMessage = ref('')
const saving = ref(false)

function syncFormData() {
  if (user.value) {
    editName.value = userDisplayName.value || ''
    selectedAvatar.value = userAvatar.value || ''
    selectedGender.value = userGender.value || 'hombre'
    selectedFile.value = null
    customImagePreview.value = null
    errorMessage.value = ''
    successMessage.value = ''
    
    if (isGoogleUser.value && selectedAvatar.value === googlePhotoURL.value) {
      activeAvatarTab.value = 'google'
    } else {
      activeAvatarTab.value = 'system'
    }
  }
}

onMounted(() => {
  syncFormData()
})

watch(user, () => {
  syncFormData()
})

watch(userProfile, () => {
  syncFormData()
})

function selectGoogleAvatar() {
  if (googlePhotoURL.value) {
    selectedAvatar.value = googlePhotoURL.value
    selectedFile.value = null
    customImagePreview.value = null
  }
}

function selectSystemAvatar(avatarSrc) {
  selectedAvatar.value = avatarSrc
  selectedFile.value = null
  customImagePreview.value = null
}

function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).'
    return
  }

  if (file.size > 3 * 1024 * 1024) {
    errorMessage.value = 'La imagen es muy pesada. El tamaño máximo permitido es 3MB.'
    return
  }

  selectedFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result
    if (result) {
      customImagePreview.value = result
      selectedAvatar.value = result
      errorMessage.value = ''
    }
  }
  reader.readAsDataURL(file)
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleSave() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!editName.value.trim()) {
    errorMessage.value = 'El nombre de usuario no puede estar vacío.'
    return
  }

  saving.value = true

  try {
    // Si subió un archivo nuevo, subir a Firebase Storage (borra el anterior automáticamente)
    if (activeAvatarTab.value === 'upload' && selectedFile.value) {
      const uploadRes = await uploadCustomAvatar(selectedFile.value)
      if (!uploadRes.success) {
        errorMessage.value = uploadRes.error || 'Error al subir la imagen.'
        saving.value = false
        return
      }
      selectedAvatar.value = uploadRes.url
      selectedFile.value = null
    }

    // Actualizar datos del perfil
    const res = await updateUserProfileData({
      displayName: editName.value.trim(),
      photoURL: selectedAvatar.value,
      genero: selectedGender.value
    })

    if (res.success) {
      successMessage.value = '¡Perfil actualizado con éxito!'
      emit('saved')
      setTimeout(() => {
        successMessage.value = ''
      }, 4000)
    } else {
      errorMessage.value = res.error || 'Error al guardar los cambios.'
    }
  } catch (err) {
    console.error('Error guardando perfil:', err)
    errorMessage.value = 'Ocurrió un error inesperado al guardar los cambios.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl font-['Montserrat'] animate-fadeIn">
    
    <!-- Cabecera de Ajustes -->
    <div class="pb-4 border-b border-slate-800">
      <h3 class="text-lg font-black uppercase text-slate-100 tracking-wide flex items-center gap-2">
        <i class="bi bi-gear-fill text-amber-400"></i>
        <span>Ajustes de la Cuenta</span>
      </h3>
      <p class="text-xs text-slate-400 mt-1">
        Personaliza tu nombre de guerrero y el emblema visual que verán otros jugadores.
      </p>
    </div>

    <!-- Alertas de éxito y error -->
    <div 
      v-if="successMessage" 
      class="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn"
    >
      <i class="bi bi-check-circle-fill text-emerald-400 text-sm"></i>
      <span>{{ successMessage }}</span>
    </div>

    <div 
      v-if="errorMessage" 
      class="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-2 animate-fadeIn"
    >
      <i class="bi bi-exclamation-triangle-fill text-red-400 text-sm"></i>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Sección 1: Modificar Nombre -->
    <div class="space-y-3">
      <label class="block text-xs font-black uppercase tracking-wider text-slate-300">
        Nombre de Guerrero (Nickname)
      </label>
      <div class="relative">
        <input
          v-model="editName"
          type="text"
          placeholder="Tu nombre de leyenda"
          class="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
        />
      </div>
    </div>

    <!-- Sección 2: Selector de Foto de Perfil -->
    <div class="space-y-4 pt-2 border-t border-slate-800">
      <div class="flex items-center justify-between">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-300">
          Seleccionar Foto de Perfil
        </label>
      </div>

      <!-- Pestañas de Selección de Avatar -->
      <div class="flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
        <!-- Pestaña Foto Google (Sólo si inició con Google) -->
        <button
          v-if="isGoogleUser && googlePhotoURL"
          type="button"
          @click="activeAvatarTab = 'google'"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-2"
          :class="activeAvatarTab === 'google' 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'"
        >
          <span>Google</span>
        </button>

        <!-- Pestaña Avatares del Sistema -->
        <button
          type="button"
          @click="activeAvatarTab = 'system'"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider"
          :class="activeAvatarTab === 'system' 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'"
        >
          Avatares del Sistema
        </button>

        <!-- Pestaña Subir Foto -->
        <button
          type="button"
          @click="activeAvatarTab = 'upload'"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition uppercase tracking-wider"
          :class="activeAvatarTab === 'upload' 
            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'"
        >
          Subir Foto
        </button>
      </div>

      <!-- Contenido: Opción Google -->
      <div v-if="activeAvatarTab === 'google' && isGoogleUser && googlePhotoURL" class="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
        <p class="text-xs text-slate-400">Usa la foto original sincronizada de tu cuenta de Google:</p>
        <div class="flex items-center gap-4">
          <img
            :src="googlePhotoURL"
            alt="Google Avatar"
            referrerpolicy="no-referrer"
            class="w-16 h-16 rounded-full object-cover border-2 transition cursor-pointer hover:scale-105"
            :class="selectedAvatar === googlePhotoURL ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg' : 'border-slate-700 opacity-70'"
            @click="selectGoogleAvatar"
          />
          <div>
            <button
              type="button"
              @click="selectGoogleAvatar"
              class="px-4 py-2 rounded-xl text-xs font-bold uppercase transition"
              :class="selectedAvatar === googlePhotoURL ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'"
            >
              {{ selectedAvatar === googlePhotoURL ? '✓ Seleccionada' : 'Usar Foto de Google' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido: Avatares del Sistema (perfil-user) -->
      <div v-if="activeAvatarTab === 'system'" class="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-5">
        <!-- Avatares Masculinos -->
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Avatares de Guerreros (Masculinos)</p>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <button
              v-for="(avatarSrc, idx) in maleAvatars"
              :key="'male-' + idx"
              type="button"
              @click="selectSystemAvatar(avatarSrc)"
              class="relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 bg-slate-900"
              :class="selectedAvatar === avatarSrc 
                ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 scale-105' 
                : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'"
            >
              <img :src="avatarSrc" alt="Avatar Male" class="w-full h-full object-cover" />
              <span v-if="selectedAvatar === avatarSrc" class="absolute bottom-1 right-1 bg-amber-400 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                ✓
              </span>
            </button>
          </div>
        </div>

        <!-- Avatares Femeninos -->
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-pink-400">Avatares de Guerreras (Femeninos)</p>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <button
              v-for="(avatarSrc, idx) in femaleAvatars"
              :key="'female-' + idx"
              type="button"
              @click="selectSystemAvatar(avatarSrc)"
              class="relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 bg-slate-900"
              :class="selectedAvatar === avatarSrc 
                ? 'border-pink-400 ring-2 ring-pink-400/50 shadow-lg shadow-pink-500/20 scale-105' 
                : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'"
            >
              <img :src="avatarSrc" alt="Avatar Female" class="w-full h-full object-cover" />
              <span v-if="selectedAvatar === avatarSrc" class="absolute bottom-1 right-1 bg-pink-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                ✓
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido: Subir Foto Propia -->
      <div v-if="activeAvatarTab === 'upload'" class="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4 text-center">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="hidden"
          @change="handleFileUpload"
        />

        <div 
          @click="triggerFileInput"
          class="border-2 border-dashed border-slate-700 hover:border-pink-500 rounded-2xl p-6 cursor-pointer transition hover:bg-slate-900/50 flex flex-col items-center justify-center gap-3"
        >
          <div class="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-2xl">
            <i class="bi bi-camera-fill"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-200">Haz clic para subir tu imagen</p>
            <p class="text-xs text-slate-400 mt-1">PNG, JPG o WEBP (Máx. 3MB)</p>
          </div>
        </div>

        <div v-if="customImagePreview" class="flex items-center justify-center gap-3 pt-2">
          <img :src="customImagePreview" alt="Preview" class="w-14 h-14 rounded-full object-cover border-2 border-pink-400" />
          <span class="text-xs font-bold text-pink-300">¡Imagen cargada y lista para guardar!</span>
        </div>
      </div>

    </div>

    <!-- Botón Guardar Cambios -->
    <div class="pt-6 border-t border-slate-800 flex justify-end">
      <button
        type="button"
        @click="handleSave"
        :disabled="saving"
        class="game-btn-gold py-3 px-8 rounded-xl text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
      >
        <svg 
          v-if="saving" 
          class="animate-spin h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ saving ? 'Guardando...' : 'Guardar Cambios' }}</span>
      </button>
    </div>

  </div>
</template>
