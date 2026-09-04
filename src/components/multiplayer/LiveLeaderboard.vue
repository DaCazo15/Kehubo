<script setup>
import { computed } from 'vue'
import { getCountryName } from '../../helpers/countries'

const props = defineProps({
  players: {
    type: Array,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  },
  totalPares: {
    type: Number,
    default: 12
  }
})

// Estilos de posición (1º, 2º, 3º, 4º)
const rankBadges = [
  { rank: '1º', color: 'from-amber-400 to-yellow-500 text-slate-950 border-amber-300', icon: 'bi-trophy-fill', text: 'text-amber-400' },
  { rank: '2º', color: 'from-slate-300 to-slate-400 text-slate-950 border-slate-200', icon: 'bi-award-fill', text: 'text-slate-300' },
  { rank: '3º', color: 'from-amber-700 to-amber-800 text-amber-100 border-amber-600', icon: 'bi-award', text: 'text-amber-600' },
  { rank: '4º', color: 'from-slate-800 to-slate-900 text-slate-400 border-slate-700', icon: 'bi-dash-circle', text: 'text-slate-500' }
]
</script>

<template>
  <div>
    <!-- Versión Móvil: Barra Compacta Superior Horizontal (< lg) -->
    <div class="lg:hidden w-full bg-slate-900/95 border-b border-amber-500/20 p-2 shadow-lg font-['Montserrat'] select-none">
      <div class="flex items-center justify-between px-1 mb-1.5">
        <span class="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
          <i class="bi bi-trophy-fill"></i> Clasificación en Vivo
        </span>
        <span class="text-[10px] text-slate-400 font-bold">
          {{ players.length }}/4 Guerreros
        </span>
      </div>

      <div class="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
        <div
          v-for="(player, idx) in players"
          :key="player.uid || player.id"
          class="p-1.5 rounded-xl border flex items-center justify-between gap-1.5 transition shadow-xs"
          :class="[
            player.uid === currentUserId 
              ? 'bg-slate-900 border-amber-400/80 ring-1 ring-amber-400/40' 
              : 'bg-slate-950/90 border-slate-800'
          ]"
        >
          <div class="flex items-center gap-1.5 min-w-0">
            <span 
              class="w-5 h-5 rounded-md font-black text-[10px] flex items-center justify-center shrink-0"
              :class="rankBadges[idx]?.color || rankBadges[3].color"
            >
              {{ idx + 1 }}º
            </span>
            <div class="min-w-0">
              <span class="text-[11px] font-black truncate block" :class="player.uid === currentUserId ? 'text-amber-300' : 'text-slate-200'">
                {{ (player.displayName || 'G').split(' ')[0] }}
              </span>
              <span class="text-[9px] text-slate-400 block -mt-0.5">
                {{ player.pairsFound || 0 }}/{{ totalPares }}p
              </span>
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="text-xs font-black" :class="idx === 0 ? 'text-amber-400' : 'text-pink-400'">
              {{ player.score || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Versión Escritorio: Columna Lateral Fija Izquierda (>= lg) -->
    <aside class="hidden lg:block w-72 shrink-0 space-y-4 font-['Montserrat'] select-none">
      
      <!-- Título del Panel Lateral -->
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-sm">
            <i class="bi bi-bar-chart-fill"></i>
          </div>
          <div>
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-100">
              Clasificación en Vivo
            </h3>
            <p class="text-[10px] text-slate-400">
              {{ players.length }}/4 Guerreros en batalla
            </p>
          </div>
        </div>
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="En directo"></span>
      </div>

      <!-- Lista de Participantes con Transición Dinámica -->
      <TransitionGroup
        name="leaderboard-flip"
        tag="div"
        class="space-y-3 relative"
      >
        <div
          v-for="(player, idx) in players"
          :key="player.uid || player.id"
          class="p-3.5 rounded-2xl border transition-all duration-500 shadow-md relative overflow-hidden"
          :class="[
            player.uid === currentUserId 
              ? 'bg-slate-900/95 border-amber-400/70 shadow-amber-500/10 ring-1 ring-amber-400/40' 
              : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
          ]"
        >
          <!-- Barra de progreso de fondo según pares encontrados -->
          <div 
            class="absolute bottom-0 left-0 top-0 bg-linear-to-r from-amber-500/10 to-pink-500/10 transition-all duration-500 z-0 pointer-events-none"
            :style="{ width: Math.min(100, Math.round(((player.pairsFound || 0) / (totalPares || 1)) * 100)) + '%' }"
          ></div>

          <div class="relative z-10 flex items-center justify-between gap-3">
            
            <!-- Puesto y Avatar -->
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Insignia de Ranking -->
              <div 
                class="w-7 h-7 rounded-lg shrink-0 font-black text-xs flex items-center justify-center border shadow-xs bg-linear-to-br"
                :class="rankBadges[idx]?.color || rankBadges[3].color"
              >
                {{ idx + 1 }}º
              </div>

              <!-- Avatar -->
              <div class="relative w-9 h-9 shrink-0">
                <img
                  v-if="player.photoURL"
                  :src="player.photoURL"
                  alt="Avatar"
                  referrerpolicy="no-referrer"
                  class="w-full h-full rounded-full object-cover border border-amber-400/50"
                />
                <div
                  v-else
                  class="w-full h-full rounded-full bg-linear-to-br from-amber-500 to-pink-500 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-400/50"
                >
                  {{ (player.displayName || 'G').charAt(0).toUpperCase() }}
                </div>

                <!-- Bandera de País -->
                <span
                  v-if="player.country"
                  :class="'flag:' + player.country.toUpperCase()"
                  class="absolute -bottom-1 -right-1 w-3.5 h-2.5 rounded-2xs shadow-xs"
                ></span>
              </div>

              <!-- Nombre e Info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span 
                    class="text-xs font-black truncate"
                    :class="player.uid === currentUserId ? 'text-amber-300' : 'text-slate-200'"
                  >
                    {{ player.displayName || 'Guerrero' }}
                  </span>
                  <span 
                    v-if="player.uid === currentUserId"
                    class="text-[9px] font-black uppercase px-1 rounded-xs bg-amber-400 text-slate-950"
                  >
                    Tú
                  </span>
                </div>

                <!-- Pares y Estado -->
                <div class="flex items-center gap-2 text-[10px] text-slate-400">
                  <span v-if="player.status === 'finished'" class="text-emerald-400 font-bold flex items-center gap-1">
                    <i class="bi bi-check2-circle"></i> {{ player.finishTime || 'Completado' }}
                  </span>
                  <span v-else class="text-slate-400">
                    {{ player.pairsFound || 0 }}/{{ totalPares }} pares
                  </span>
                </div>
              </div>
            </div>

            <!-- Puntos -->
            <div class="text-right shrink-0">
              <div 
                class="text-base font-black tracking-tight"
                :class="idx === 0 ? 'text-amber-400' : 'text-pink-400'"
              >
                {{ player.score || 0 }}
              </div>
              <div class="text-[9px] uppercase font-bold text-slate-500">
                pts
              </div>
            </div>

          </div>

        </div>
      </TransitionGroup>

    </aside>
  </div>
</template>

<style scoped>
.leaderboard-flip-move {
  transition: transform 0.5s ease-in-out;
}
</style>
