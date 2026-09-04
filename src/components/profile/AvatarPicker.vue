<script setup lang="ts">
import { ref } from 'vue'
import { maleAvatars, femaleAvatars } from '../../helpers/avatars'
import { compressImageToAvif } from '../../helpers/imageCompressor'
import type { UserGender } from '../../types'

const props = defineProps<{
  selectedAvatar: string
  selectedGender: UserGender
  isGoogleUser?: boolean
  googlePhotoURL?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:selectedAvatar', avatar: string): void
  (e: 'fileSelected', file: File | null): void
}>()

const activeTab = ref<'system' | 'upload' | 'google'>('system')
const customImagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const compressing = ref<boolean>(false)
const compressError = ref<string>('')

function selectSystemAvatar(avatarSrc: string) {
  emit('update:selectedAvatar', avatarSrc)
  emit('fileSelected', null)
  customImagePreview.value = null
}

function selectGoogleAvatar() {
  if (props.googlePhotoURL) {
    emit('update:selectedAvatar', props.googlePhotoURL)
    emit('fileSelected', null)
    customImagePreview.value = null
  }
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  compressError.value = ''
  compressing.value = true

  try {
    const result = await compressImageToAvif(file)
    const processedFile = result.file instanceof File ? result.file : new File([result.file], file.name, { type: result.file.type })
    emit('fileSelected', processedFile)
    
    const previewUrl = URL.createObjectURL(result.file)
    customImagePreview.value = previewUrl
    emit('update:selectedAvatar', previewUrl)
  } catch (err: any) {
    compressError.value = 'Error al procesar la imagen: ' + (err?.message || 'formato inválido')
  } finally {
    compressing.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <label class="block text-xs font-black uppercase tracking-wider text-slate-300">
      Elige tu Avatar de Batalla
    </label>

    <!-- Pestañas de origen de avatar -->
    <div class="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
      <button
        type="button"
        @click="activeTab = 'system'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        :class="activeTab === 'system' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
      >
        <i class="bi bi-collection-fill mr-1"></i> Predefinidos
      </button>

      <button
        type="button"
        @click="activeTab = 'upload'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        :class="activeTab === 'upload' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
      >
        <i class="bi bi-cloud-arrow-up-fill mr-1"></i> Subir Foto
      </button>

      <button
        v-if="isGoogleUser && googlePhotoURL"
        type="button"
        @click="() => { activeTab = 'google'; selectGoogleAvatar(); }"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        :class="activeTab === 'google' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
      >
        <i class="bi bi-google mr-1"></i> Google
      </button>
    </div>

    <!-- Pestaña 1: Sistema (Avatares Predefinidos según Género) -->
    <div v-if="activeTab === 'system'" class="space-y-2">
      <div class="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
        <button
          v-for="(avatarSrc, idx) in (selectedGender === 'mujer' ? femaleAvatars : maleAvatars)"
          :key="idx"
          type="button"
          @click="selectSystemAvatar(avatarSrc)"
          class="aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer relative group p-0.5"
          :class="selectedAvatar === avatarSrc 
            ? (selectedGender === 'mujer' ? 'border-pink-400 ring-2 ring-pink-400/40 shadow-lg' : 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg') 
            : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'"
        >
          <img :src="avatarSrc" :alt="'Avatar ' + idx" class="w-full h-full object-cover rounded-xl" />
        </button>
      </div>
    </div>

    <!-- Pestaña 2: Subir Foto Propia -->
    <div v-else-if="activeTab === 'upload'" class="space-y-3">
      <div class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <div class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-500/50 bg-slate-900 shrink-0 flex items-center justify-center">
          <img 
            v-if="customImagePreview || (selectedAvatar && !selectedAvatar.includes('avatars/'))" 
            :src="customImagePreview || selectedAvatar" 
            alt="Preview" 
            class="w-full h-full object-cover" 
          />
          <i v-else class="bi bi-image text-2xl text-slate-600"></i>
        </div>

        <div class="flex-1 space-y-2 text-center sm:text-left">
          <p class="text-xs text-slate-300 font-bold">Sube tu propia imagen personalizada</p>
          <p class="text-[11px] text-slate-500">Se optimizará y comprimirá automáticamente a formato AVIF ligero.</p>
          
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png, image/jpeg, image/webp, image/avif"
            class="hidden"
            @change="handleFileUpload"
          />

          <BaseButton
            type="button"
            variant="pink"
            size="xs"
            rounded="lg"
            :loading="compressing"
            @click="fileInputRef?.click()"
          >
            <template #icon-left>
              <i class="bi bi-upload"></i>
            </template>
            <span>Seleccionar Imagen</span>
          </BaseButton>
        </div>
      </div>
      <p v-if="compressError" class="text-xs text-red-400">{{ compressError }}</p>
    </div>

    <!-- Pestaña 3: Google -->
    <div v-else-if="activeTab === 'google' && googlePhotoURL" class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
      <img :src="googlePhotoURL" alt="Google Avatar" class="w-14 h-14 rounded-full object-cover border border-blue-400/50" />
      <div>
        <p class="text-xs font-bold text-slate-200">Foto de tu Cuenta de Google</p>
        <p class="text-[11px] text-slate-400">Sincronizada directamente desde tu perfil de Google.</p>
      </div>
    </div>
  </div>
</template>
