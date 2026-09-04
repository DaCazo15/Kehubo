<script setup lang="ts">
import type { FeatureItem } from './featuresData'

defineProps<{
  feature: FeatureItem
}>()
</script>

<template>
  <div class="game-card-portal rounded-2xl p-6 sm:p-8 flex flex-col justify-between group">
    <div>
      <div class="flex items-center justify-between mb-6">
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-900/90 border border-slate-700/60 group-hover:scale-110 transition-all duration-300"
          :class="feature.color === 'amber' ? 'text-amber-400 group-hover:border-amber-400/60' : 'text-pink-400 group-hover:border-pink-400/60'"
        >
          <i :class="['bi', feature.icon]"></i>
        </div>
        <span 
          class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider border"
          :class="feature.color === 'amber' 
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
            : 'bg-pink-500/10 text-pink-300 border-pink-500/30'"
        >
          {{ feature.tag }}
        </span>
      </div>

      <h3 class="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors uppercase tracking-wide mb-2">
        {{ feature.title }}
      </h3>
      
      <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
        {{ feature.desc }}
      </p>
    </div>

    <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
      <span>Saber más</span>
      <span class="group-hover:translate-x-1 transition-transform">→</span>
    </div>
  </div>
</template>
