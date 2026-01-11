import { ref } from 'vue'

export function useCardDeck() {
  const numerosBase = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  ]

  const numeros = ref([])

  const inicializarCartas = () => {
    numeros.value = numerosBase.map((valor, index) => ({
      id: index + 1,
      valor,
      revelada: false,
      encontrada: false
    }))
  }

  const barajar = () => {
    for (let i = numeros.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[numeros.value[i], numeros.value[j]] = [
        numeros.value[j],
        numeros.value[i]
      ]
    }
  }

  inicializarCartas()
  barajar()

  return {
    numeros,
    inicializarCartas,
    barajar
  }
}
