<script setup>
defineProps({
  tiempo: {
    type: String,
    required: true
  },
  puntaje: {
    type: Number,
    required: true
  },
  tableroBloqueado: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <header class="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
    <div
      class="mx-auto max-w-6xl py-4 px-8 flex justify-between items-center border-slate-700"
    >
      <!-- Puntos -->
      <div class="flex items-center gap-4">
        <h3 class="text-3xl max-md:text-2xl font-extrabold text-white tracking-wide honk-custom">
          Puntos
        </h3>
        <p
          class="text-3xl max-md:text-2xl font-bold text-white honk-custom bg-amber-500/80 px-4 py-2 rounded-2xl shadow-md shadow-amber-900"
        >
          {{ puntaje }}
        </p>
      </div>

      <!-- Tiempo -->
      <div class="flex items-center gap-4">
        <h3 class="text-3xl max-md:text-2xl font-extrabold text-white tracking-wide honk-custom">
          Tiempo
        </h3>
        <p
          class="text-3xl max-md:text-2xl font-bold text-white honk-custom bg-pink-500/80 px-4 py-2 rounded-2xl shadow-md shadow-pink-900"
          :class="{'bg-slate-900': tableroBloqueado}"
        >
          {{ tiempo }}
        </p>
      </div>
    </div>
  </header>
</template>