<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '../../../config/firebase'

const userCount = ref<string>('+100')

onMounted(async () => {
  try {
    const coll = collection(db, 'users')
    const snapshot = await getCountFromServer(coll)
    const count = snapshot.data().count
    if (count > 0) {
      userCount.value = count > 10 ? `+${count}` : `${count}`
    }
  } catch (err) {
    console.debug('Usando valor predeterminado de usuarios:', err)
  }
})
</script>

<template>
  <div class="pt-6 grid grid-cols-3 gap-3 border-t border-slate-800/80 max-w-xl mx-auto lg:mx-0">
    <div class="text-center lg:text-left">
      <p class="text-xl sm:text-2xl font-black text-amber-400">{{ userCount }}</p>
      <p class="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Jugadores Registrados</p>
    </div>
    <div class="text-center lg:text-left border-x border-slate-800 px-2">
      <p class="text-xl sm:text-2xl font-black text-pink-400">#1</p>
      <p class="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Ranking Global</p>
    </div>
    <div class="text-center lg:text-left">
      <p class="text-xl sm:text-2xl font-black text-amber-300">4P</p>
      <p class="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Salas Privadas</p>
    </div>
  </div>
</template>
