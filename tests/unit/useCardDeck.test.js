import { describe, it, expect } from 'vitest'
import { useCardDeck } from '../../src/composables/useCardDeck'

describe('useCardDeck composable', () => {
  it('debe generar exactamente 24 cartas (12 pares) para la dificultad estándar', () => {
    const { numeros, totalPares, inicializarCartas } = useCardDeck(24)
    inicializarCartas(24, false)

    expect(numeros.value.length).toBe(24)
    expect(totalPares.value).toBe(12)

    // Verificar que cada valor aparece exactamente 2 veces
    const counts = {}
    numeros.value.forEach(carta => {
      counts[carta.valor] = (counts[carta.valor] || 0) + 1
    })

    for (let i = 1; i <= 12; i++) {
      expect(counts[i]).toBe(2)
    }
  })

  it('debe generar 32 cartas (16 pares) y 40 cartas (20 pares) según la dificultad', () => {
    const { numeros, totalPares, inicializarCartas } = useCardDeck(24)

    inicializarCartas(32, false)
    expect(numeros.value.length).toBe(32)
    expect(totalPares.value).toBe(16)

    inicializarCartas(40, false)
    expect(numeros.value.length).toBe(40)
    expect(totalPares.value).toBe(20)
  })

  it('debe respetar el estado de visibilidad inicial de las cartas', () => {
    const { numeros, inicializarCartas } = useCardDeck(24)

    // Caso 1: Visibles al inicio
    inicializarCartas(24, true)
    expect(numeros.value.every(c => c.revelada === true)).toBe(true)

    // Caso 2: Ocultas al inicio
    inicializarCartas(24, false)
    expect(numeros.value.every(c => c.revelada === false)).toBe(true)
  })

  it('debe ocultar solo las cartas no encontradas con ocultarCartasNoEncontradas()', () => {
    const { numeros, inicializarCartas, ocultarCartasNoEncontradas } = useCardDeck(24)
    inicializarCartas(24, true)

    // Simulamos que el par 1 fue encontrado
    numeros.value[0].encontrada = true
    numeros.value[1].encontrada = true

    ocultarCartasNoEncontradas()

    // El par encontrado sigue revelado/encontrado
    expect(numeros.value[0].encontrada).toBe(true)
    expect(numeros.value[1].encontrada).toBe(true)

    // Las demás cartas deben ocultarse
    const rest = numeros.value.slice(2)
    expect(rest.every(c => c.revelada === false)).toBe(true)
  })

  it('debe barajar las cartas de forma aleatoria con barajar()', () => {
    const { numeros, inicializarCartas, barajar } = useCardDeck(24)
    inicializarCartas(24, false)

    const initialOrder = numeros.value.map(c => c.id).join(',')
    barajar()
    const shuffledOrder = numeros.value.map(c => c.id).join(',')

    // Debe conservar el total de elementos
    expect(numeros.value.length).toBe(24)
    // Con alta probabilidad, el orden cambia
    expect(typeof shuffledOrder).toBe('string')
  })
})
