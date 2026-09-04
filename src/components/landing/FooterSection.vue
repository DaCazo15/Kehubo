<script setup lang="ts">
import { ref } from 'vue'
import FooterBrand from './footer/FooterBrand.vue'
import FooterNav from './footer/FooterNav.vue'
import FooterContact from './footer/FooterContact.vue'
import FooterBottomBar from './footer/FooterBottomBar.vue'
import FooterLegalModal from './footer/FooterLegalModal.vue'
import type { LegalDocType } from './footer/footerData'

const isLegalModalOpen = ref<boolean>(false)
const selectedDoc = ref<LegalDocType>('privacy')

function openLegalDoc(doc: LegalDocType) {
  selectedDoc.value = doc
  isLegalModalOpen.value = true
}
</script>

<template>
  <footer class="bg-slate-950 border-t border-slate-900 pt-16 pb-12 font-['Montserrat'] select-none mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Bloques Superiores: Brand, Nav, Contact -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
        <FooterBrand />
        <FooterNav />
        <FooterContact />
      </div>

      <!-- Barra Inferior: Enlaces Legales & Copyright -->
      <FooterBottomBar @open-legal="openLegalDoc" />

    </div>

    <!-- Modal para Políticas, Términos, Press Kit e Imprint -->
    <BaseModal
      :is-open="isLegalModalOpen"
      size="xl"
      @close="isLegalModalOpen = false"
    >
      <FooterLegalModal
        :initial-doc="selectedDoc"
        @close="isLegalModalOpen = false"
      />
    </BaseModal>
  </footer>
</template>
