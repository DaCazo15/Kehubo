import { ref, computed } from 'vue'

export function useCardDeck(totalCartasInicial = 24) {
  const totalCartas = ref(totalCartasInicial)
  const totalPares = computed(() => Math.floor(totalCartas.value / 2))
  const numeros = ref([])

  /**
   * Genera el mazo de cartas duplicadas según la cantidad seleccionada (24, 32, 40)
   * 24 cartas = 12 pares (1..12)
   * 32 cartas = 16 pares (1..16)
   * 40 cartas = 20 pares (1..20)
   */
  const generarNumerosBase = (cantidad) => {
    const paresCount = Math.floor(cantidad / 2)
    const base = []
    for (let i = 1; i <= paresCount; i++) {
      base.push(i, i)
    }
    return base
  }

  /**
   * Inicializa el array de cartas.
   * @param {number} cantidad - Total de cartas (24, 32, 40)
   * @param {boolean} cartasVisibles - Si las cartas nacen reveladas o no
   */
  const inicializarCartas = (cantidad = totalCartas.value, cartasVisibles = false) => {
    totalCartas.value = cantidad
    const base = generarNumerosBase(cantidad)
    
    numeros.value = base.map((valor, index) => ({
      id: index + 1,
      valor,
      revelada: cartasVisibles,
      encontrada: false
    }))
  }

  /**
   * Algoritmo Fisher-Yates para barajar aleatoriamente
   */
  const barajar = () => {
    for (let i = numeros.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[numeros.value[i], numeros.value[j]] = [
        numeros.value[j],
        numeros.value[i]
      ]
    }
  }

  /**
   * Oculta todas las cartas que aún no hayan sido encontradas
   */
  const ocultarCartasNoEncontradas = () => {
    numeros.value.forEach((carta) => {
      if (!carta.encontrada) {
        carta.revelada = false
      }
    })
  }

  /**
   * Revela temporalmente todas las cartas
   */
  const revelarTodasLasCartas = () => {
    numeros.value.forEach((carta) => {
      carta.revelada = true
    })
  }

  // Inicialización por defecto
  inicializarCartas(totalCartasInicial, false)
  barajar()

  return {
    totalCartas,
    totalPares,
    numeros,
    inicializarCartas,
    barajar,
    ocultarCartasNoEncontradas,
    revelarTodasLasCartas
  }
}
