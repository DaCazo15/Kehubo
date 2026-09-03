import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCountdown } from '../../src/composables/useCountdown'

describe('useCountdown composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('debe iniciar la cuenta regresiva desde el número especificado', () => {
    const { countdown, isCounting, startCountdown } = useCountdown()
    
    startCountdown(5)
    expect(countdown.value).toBe(5)
    expect(isCounting.value).toBe(true)

    // Avanzar 1 segundo
    vi.advanceTimersByTime(1000)
    expect(countdown.value).toBe(4)

    // Avanzar 4 segundos más
    vi.advanceTimersByTime(4000)
    expect(countdown.value).toBe(0)
    expect(isCounting.value).toBe(false)
  })

  it('debe pausar y reanudar la cuenta regresiva con hover interaction', () => {
    const { countdown, isPaused, startCountdown, pauseCountdown, resumeCountdown } = useCountdown()
    
    startCountdown(5)
    vi.advanceTimersByTime(1000)
    expect(countdown.value).toBe(4)

    // Pausar al hacer hover
    pauseCountdown()
    expect(isPaused.value).toBe(true)

    // Avanzar el tiempo mientras está pausado (el valor no debe cambiar)
    vi.advanceTimersByTime(3000)
    expect(countdown.value).toBe(4)

    // Reanudar al salir del hover
    resumeCountdown()
    expect(isPaused.value).toBe(false)

    // Debe continuar la cuenta
    vi.advanceTimersByTime(1000)
    expect(countdown.value).toBe(3)
  })

  it('debe ejecutar el callback al llegar a cero', () => {
    const { startCountdown } = useCountdown()
    const callbackMock = vi.fn()

    startCountdown(3, callbackMock)
    vi.advanceTimersByTime(3000)

    expect(callbackMock).toHaveBeenCalledTimes(1)
  })
})
