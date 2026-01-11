<script setup>
const props = defineProps({
  carta: {
    type: Object,
    required: true
  },
  tableroBloqueado: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['verificando'])
</script>

<template>
  <div
    class="bg-amber-600 hover:bg-pink-600 
           border-4 border-gray-900
           mx-auto aspect-square w-32 rounded-3xl 
           transition-all duration-300 ease-in-out hover:transition-all hover:duration-500 hover:ease-out 
           rotate-0 hover:rotate-6 
           flex items-center justify-center text-2xl font-bold cursor-pointer"
    :class="{
      'text-black opacity-100 ': carta.revelada || carta.encontrada,   // carta visible
      'text-transparent opacity-50': !carta.revelada && !carta.encontrada, // carta oculta
      'bg-slate-900 text-pink-600 hover:text-black': tableroBloqueado
    }"

    @click="emit('verificando', carta.id)"
  >
    {{ carta.revelada || carta.encontrada ? carta.valor : '' }}
  </div>
</template>