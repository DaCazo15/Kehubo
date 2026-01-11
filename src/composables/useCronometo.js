import { ref, onMounted, onUnmounted, computed } from 'vue'

export function useCronometro() {
    const tiempo = ref(0)
    let stopCronometro = null

    const iniciarCronometro = () => {
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
        tiempo.value = 0

        if (stopCronometro) {
            stopCronometro()
            stopCronometro = null
        }
    }

    onMounted(() => {
        iniciarCronometro()
    })

    onUnmounted(() => {
        if (stopCronometro) stopCronometro()
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
        tiempoFormateado,
        detenerCronometro,
        iniciarCronometro,
        resetCronometro
    }
}