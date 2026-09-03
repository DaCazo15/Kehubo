<script setup>
const features = [
  {
    icon: 'bi-lightning-charge-fill',
    title: 'Velocidad Mental',
    desc: 'Pon a prueba tus reflejos en partidas contrarreloj donde cada milisegundo cuenta para tu puntuación final.',
    tag: 'Desafío',
    color: 'amber'
  },
  {
    icon: 'bi-stars',
    title: 'Mecánicas Místicas',
    desc: '12 pares de cartas distribuidas aleatoriamente en cada inicio. Ninguna partida es igual a la anterior.',
    tag: 'Estrategia',
    color: 'pink'
  },
  {
    icon: 'bi-trophy-fill',
    title: 'Ranking de Campeones',
    desc: 'Compite contra jugadores de todo el mundo. Sincroniza tus mejores tiempos directamente con Firebase.',
    tag: 'Competitivo',
    color: 'amber'
  },
  {
    icon: 'bi-shield-shaded',
    title: 'Perfil de Guerrero',
    desc: 'Inicia sesión con un solo clic a través de Google o correo para guardar tus récords y desbloquear logros.',
    tag: 'Progresión',
    color: 'pink'
  }
]
</script>

<template>
  <section class="py-24 relative bg-slate-950/70 border-y border-slate-900 font-['Montserrat']">
    <!-- Resplandor central sutil -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      <!-- Cabecera de la sección -->
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 class="text-3xl sm:text-5xl font-black uppercase text-slate-100 tracking-tight">
          ¿POR QUÉ ENTRAR A <span class="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-pink-500">KEHUBO</span>?
        </h2>
        <p class="text-sm sm:text-base text-slate-400">
          Diseñado para partidas dinámicas, entrenamiento de agilidad cognitiva y competencia feroz por los mejores puestos.
        </p>
      </div>

      <!-- Cuadrícula de Cartas / Features -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(item, index) in features"
          :key="index"
          class="game-card-portal rounded-2xl p-6 sm:p-8 flex flex-col justify-between group"
        >
          <div>
            <div class="flex items-center justify-between mb-6">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-900/90 border border-slate-700/60 group-hover:scale-110 transition-all duration-300"
                :class="item.color === 'amber' ? 'text-amber-400 group-hover:border-amber-400/60' : 'text-pink-400 group-hover:border-pink-400/60'"
              >
                <i :class="['bi', item.icon]"></i>
              </div>
              <span 
                class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider border"
                :class="item.color === 'amber' 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                  : 'bg-pink-500/10 text-pink-300 border-pink-500/30'"
              >
                {{ item.tag }}
              </span>
            </div>

            <h3 class="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors uppercase tracking-wide mb-2">
              {{ item.title }}
            </h3>
            
            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {{ item.desc }}
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
            <span>Saber más</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
