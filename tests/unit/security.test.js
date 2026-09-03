import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Security & Anti-Brute-Force System', () => {
  // Simulación de la lógica de bloqueo anti-fuerza bruta
  function createBruteForceGuard() {
    let failedAttempts = 0
    let lockoutUntil = null

    return {
      checkLockout: () => {
        if (lockoutUntil) {
          const now = Date.now()
          if (now < lockoutUntil) {
            const remaining = Math.ceil((lockoutUntil - now) / 1000)
            return { locked: true, remaining }
          }
          lockoutUntil = null
          failedAttempts = 0
        }
        return { locked: false }
      },
      recordFailed: () => {
        failedAttempts += 1
        if (failedAttempts >= 5) {
          lockoutUntil = Date.now() + 60 * 1000
        }
      },
      reset: () => {
        failedAttempts = 0
        lockoutUntil = null
      },
      getAttempts: () => failedAttempts
    }
  }

  function sanitizeInput(text) {
    if (typeof text !== 'string') return ''
    return text.replace(/[<>]/g, '').trim().slice(0, 30)
  }

  it('debe bloquear el acceso tras 5 intentos fallidos consecutivos durante 60 segundos', () => {
    const guard = createBruteForceGuard()

    // 4 intentos fallidos
    for (let i = 0; i < 4; i++) {
      guard.recordFailed()
      expect(guard.checkLockout().locked).toBe(false)
    }

    // 5to intento fallido
    guard.recordFailed()
    const status = guard.checkLockout()
    expect(status.locked).toBe(true)
    expect(status.remaining).toBeGreaterThan(0)
    expect(status.remaining).toBeLessThanOrEqual(60)
  })

  it('debe limpiar los intentos fallidos al iniciar sesión con éxito', () => {
    const guard = createBruteForceGuard()
    guard.recordFailed()
    guard.recordFailed()
    expect(guard.getAttempts()).toBe(2)

    guard.reset()
    expect(guard.getAttempts()).toBe(0)
    expect(guard.checkLockout().locked).toBe(false)
  })

  it('debe sanitizar entradas de texto eliminando etiquetas HTML y caracteres peligrosos', () => {
    const maliciousInput = '<script>alert("hack")</script>Guerrero#1'
    const sanitized = sanitizeInput(maliciousInput)

    expect(sanitized).not.toContain('<')
    expect(sanitized).not.toContain('>')
    expect(sanitized).toBe('scriptalert("hack")/scriptGuer')
  })

  it('debe truncar entradas excesivamente largas para prevenir desbordamientos', () => {
    const longString = 'A'.repeat(100)
    const sanitized = sanitizeInput(longString)

    expect(sanitized.length).toBe(30)
  })
})
