import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useGameTurn } from '../../src/composables/useGameTurn'

describe('useGameTurn composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('debe registrar un par correcto y mantener las cartas encontradas', () => {
    const numeros = ref([
      { id: '1a', valor: 1, revelada: false, encontrada: false },
      { id: '1b', valor: 1, revelada: false, encontrada: false },
      { id: '2a', valor: 2, revelada: false, encontrada: false }
    ])

    const { verificar, CartasPares, tableroBloqueado } = useGameTurn(numeros)

    // Voltear primera carta
    verificar('1a')
    expect(numeros.value[0].revelada).toBe(true)
    expect(CartasPares.value.length).toBe(0)

    // Voltear segunda carta (coincide en valor 1)
    verificar('1b')
    expect(numeros.value[0].encontrada).toBe(true)
    expect(numeros.value[1].encontrada).toBe(true)
    expect(CartasPares.value.length).toBe(1)
    expect(tableroBloqueado.value).toBe(false)
  })

  it('debe ocultar las cartas tras 1 segundo si no coinciden', () => {
    const numeros = ref([
      { id: '1a', valor: 1, revelada: false, encontrada: false },
      { id: '2a', valor: 2, revelada: false, encontrada: false }
    ])

    const { verificar, CartasPares, tableroBloqueado } = useGameTurn(numeros)

    verificar('1a')
    verificar('2a')

    // El tablero debe bloquearse mientras se comprueban
    expect(tableroBloqueado.value).toBe(true)
    expect(CartasPares.value.length).toBe(0)

    // Avanzar 1 segundo
    vi.advanceTimersByTime(1000)

    // Deben volver a ocultarse y desbloquearse el tablero
    expect(numeros.value[0].revelada).toBe(false)
    expect(numeros.value[1].revelada).toBe(false)
    expect(tableroBloqueado.value).toBe(false)
  })
})
