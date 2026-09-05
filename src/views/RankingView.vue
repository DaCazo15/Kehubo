<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { useRanking } from '../composables/useRanking'
import RankingPodium from '../components/ranking/RankingPodium.vue'
import RankingTable from '../components/ranking/RankingTable.vue'
import RankingCategoryTabs from '../components/ranking/RankingCategoryTabs.vue'
import SeasonFloatingBanner from '../components/ranking/SeasonFloatingBanner.vue'

const { user, isAuthenticated, openAuthModal } = useAuth()
const {
  leaderboard,
  topThree,
  remainingLeaderboard,
  loading,
  selectedCategory,
  categoryCounts,
  setCategory
} = useRanking()
</script>

<template>
  <div class="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
    <div class="max-w-5xl mx-auto space-y-8">
      
      <!-- Cabecera -->
      <div class="text-center space-y-3">
        <h1 class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-pink-400 to-amber-200">
          SALÓN DE LA GLORIA
        </h1>
        <p class="text-sm text-slate-400 max-w-xl mx-auto">
          Los mejores tiempos registrados en Kehubo clasificados por categoría. ¿Tienes lo necesario para alcanzar el top 1?
        </p>
      </div>

      <!-- Anuncio / Contador de Temporada Bimestral -->
      <SeasonFloatingBanner />

      <!-- Selector de Categorías (24, 32 y 40 cartas) -->
      <RankingCategoryTabs
        :selected-category="selectedCategory"
        :category-counts="categoryCounts"
        @select="setCategory"
      />

      <!-- Estado: Cargando -->
      <div v-if="loading" class="py-24 text-center space-y-4">
        <div class="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-black uppercase tracking-wider text-slate-400">
          Consultando los anales de la arena...
        </p>
      </div>

      <!-- Contenido cuando hay registros en la categoría activa -->
      <template v-else-if="leaderboard.length > 0">
        <!-- Podio Top 3 -->
        <RankingPodium :top-three="topThree" />

        <!-- Tabla con Posiciones Restantes (#4 en adelante) -->
        <div v-if="remainingLeaderboard.length > 0" class="space-y-3">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
            Top Guerreros en {{ selectedCategory }} Cartas (4 - {{ leaderboard.length }})
          </h3>
          <RankingTable
            :records="remainingLeaderboard"
            :current-user-id="user?.uid"
          />
        </div>
      </template>

      <!-- Estado: Sin Registros Aún en la Categoría Seleccionada -->
      <div v-else class="game-card-portal rounded-3xl p-10 sm:p-12 text-center max-w-2xl mx-auto space-y-6 border border-amber-500/30">
        <div class="w-20 h-20 rounded-full mx-auto bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-4xl text-amber-400">
          <i class="bi bi-scroll"></i>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl sm:text-2xl font-black uppercase text-slate-100">
            Aún no hay campeones en {{ selectedCategory }} Cartas
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            El libro de los vencedores en la categoría de {{ selectedCategory }} cartas está listo para su primera leyenda. Completa el tablero y sé el primero en reclamar el puesto número 1.
          </p>
        </div>
        <div class="pt-2 flex justify-center gap-4">
          <BaseButton 
            :to="{ name: 'game' }" 
            variant="pink"
            size="md"
            rounded="xl"
          >
            Reclamar el Trono de {{ selectedCategory }} Cartas
          </BaseButton>
        </div>
      </div>

      <!-- Barra de Acción Inferior -->
      <div class="text-center pt-6 space-y-4">
        <p class="text-xs text-slate-400">¿Quieres que tu récord aparezca aquí?</p>
        <div class="flex justify-center gap-4">
          <BaseButton 
            :to="{ name: 'game' }" 
            variant="pink"
            size="md"
            rounded="xl"
          >
            Jugar Partida
          </BaseButton>
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
      </div>

    </div>
  </div>
</template>
