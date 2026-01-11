import { onMounted } from 'vue'
import { useCronometro } from './useCronometo.js'
import { useCardDeck } from './useCardDeck'
import { useGameTurn } from './useGameTurn'

export function useGame() {
  const { numeros, inicializarCartas, barajar } = useCardDeck()

  const { tiempoFormateado, iniciarCronometro, resetCronometro, detenerCronometro } = useCronometro()

  const { verificar, resetTurno, tableroBloqueado, CartasPares } = useGameTurn(numeros)

  const detener = () => {
    detenerCronometro()
    tableroBloqueado.value = true
  }

  const resetGame = () => {
    resetCronometro()
    resetTurno()
    inicializarCartas()
    barajar()

    setTimeout(() => {
      iniciarCronometro()
      tableroBloqueado.value = false
    }, 5000)
  }

  onMounted(resetGame)

  return {
    tiempoFormateado,
    numeros,
    verificar,
    resetGame,
    detener,
    tableroBloqueado,
    CartasPares
  }
}

