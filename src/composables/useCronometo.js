import { ref, onUnmounted, computed } from 'vue'

export function useCronometro() {
  const tiempo = ref(0)
  let stopCronometro = null

  const iniciarCronometro = () => {
    detenerCronometro()
    const intervalo = setInterval(() => {
      tiempo.value++
    }, 1000)
    stopCronometro = () => clearInterval(intervalo)
  }

  const detenerCronometro = () => {
    if (stopCronometro) {
      stopCronometro()
      stopCronometro = null
    }
  }

  const resetCronometro = () => {
    detenerCronometro()
    tiempo.value = 0
  }

  onUnmounted(() => {
    detenerCronometro()
  })

  const tiempoFormateado = computed(() => {
    const minutos = Math.floor((tiempo.value % 3600) / 60)
    const segundos = tiempo.value % 60

    return [
      minutos.toString().padStart(2, '0'),
      segundos.toString().padStart(2, '0')
    ].join(':')
  })

  return {
    tiempo,
    tiempoFormateado,
    detenerCronometro,
    iniciarCronometro,
    resetCronometro
  }
}