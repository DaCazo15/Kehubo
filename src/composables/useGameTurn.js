import { ref } from 'vue'

export function useGameTurn(numeros) {
  const seleccionadas = ref([])

  const tableroBloqueado = ref(false)

  const CartasPares = ref([])

  const verificar = (cardId) => {
    const carta = numeros.value.find((c) => c.id === cardId)

    if (
      !carta ||
      tableroBloqueado.value ||
      carta.revelada ||
      carta.encontrada
    ) {
      return
    }

    carta.revelada = true
    seleccionadas.value.push(carta)

    if (seleccionadas.value.length === 2) {
      tableroBloqueado.value = true // Bloquea el tablero.
      const [c1, c2] = seleccionadas.value

      if (c1.valor === c2.valor) {
        c1.encontrada = true
        c2.encontrada = true
        CartasPares.value.push(c1.valor)
        
        seleccionadas.value = [] // Limpia las seleccionadas para el siguiente turno.
        tableroBloqueado.value = false // Desbloquea el tablero.
      } else {
        setTimeout(() => {
          c1.revelada = false
          c2.revelada = false
          seleccionadas.value = [] // Limpia las seleccionadas.
          tableroBloqueado.value = false // Desbloquea el tablero.
        }, 1000)
      }
    }
  }

  /**
   * Reinicia el estado del turno, limpiando selecciones y bloqueando el tablero.
   */
  const resetTurno = () => {
    seleccionadas.value = []
    CartasPares.value = [] // Resetea los pares encontrados.
    tableroBloqueado.value = true // Bloquea el tablero al reiniciar
  }

  return {
    verificar,
    resetTurno,
    tableroBloqueado,
    CartasPares
  }
}
