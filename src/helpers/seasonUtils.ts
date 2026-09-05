/**
 * Utilidades para el sistema de Temporadas Bimestrales (cada 2 meses)
 * 
 * Distribución anual de temporadas:
 * - Temporada 1: Enero 1 - Febrero 28/29
 * - Temporada 2: Marzo 1 - Abril 30
 * - Temporada 3: Mayo 1 - Junio 30
 * - Temporada 4: Julio 1 - Agosto 31
 * - Temporada 5: Septiembre 1 - Octubre 31
 * - Temporada 6: Noviembre 1 - Diciembre 31
 */

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export interface SeasonInfo {
  id: string
  number: number
  year: number
  name: string
  shortName: string
  startDate: Date
  endDate: Date
}

export interface SeasonTimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  formatted: string
  isEndingSoon: boolean
}

/**
 * Obtiene la información completa de la temporada para una fecha determinada (por defecto hoy)
 */
export function getSeasonInfo(date: Date = new Date()): SeasonInfo {
  const year = date.getFullYear()
  const month = date.getMonth() // 0 a 11
  const seasonIndex = Math.floor(month / 2) // 0 a 5
  const seasonNumber = seasonIndex + 1

  const startMonth = seasonIndex * 2
  const endMonth = startMonth + 1

  const startDate = new Date(year, startMonth, 1, 0, 0, 0, 0)
  // El último día del mes 'endMonth' se obtiene con el día 0 del mes siguiente
  const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59, 999)

  const month1 = MONTH_NAMES[startMonth]
  const month2 = MONTH_NAMES[endMonth]
  const name = `Temporada ${seasonNumber} (${month1} - ${month2} ${year})`
  const shortName = `Temp. ${seasonNumber} (${month1.substring(0, 3)} - ${month2.substring(0, 3)})`
  const id = `${year}-S${seasonNumber}`

  return {
    id,
    number: seasonNumber,
    year,
    name,
    shortName,
    startDate,
    endDate
  }
}

/**
 * Retorna el ID de la temporada actual (ej. '2026-S5')
 */
export function getCurrentSeasonId(date: Date = new Date()): string {
  return getSeasonInfo(date).id
}

/**
 * Retorna el número de temporada del año (1 a 6)
 */
export function getCurrentSeasonNumber(date: Date = new Date()): number {
  return getSeasonInfo(date).number
}

/**
 * Calcula el tiempo restante hasta el reinicio de la temporada actual
 */
export function getTimeRemainingInCurrentSeason(date: Date = new Date()): SeasonTimeRemaining {
  const { endDate } = getSeasonInfo(date)
  const now = date.getTime()
  const diffMs = Math.max(0, endDate.getTime() - now)
  const totalSeconds = Math.floor(diffMs / 1000)

  const days = Math.floor(totalSeconds / (24 * 3600))
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')
  const formatted = days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
    : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`

  const isEndingSoon = days < 3 // Menos de 3 días para el reinicio

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    formatted,
    isEndingSoon
  }
}

/**
 * Determina si un registro de puntuación pertenece a la temporada actual
 */
export function isScoreInCurrentSeason(scoreDoc: any, currentSeason: SeasonInfo = getSeasonInfo()): boolean {
  if (!scoreDoc) return false

  // 1. Si tiene seasonId explícito
  if (scoreDoc.seasonId) {
    return scoreDoc.seasonId === currentSeason.id
  }

  // 2. Si no tiene seasonId, comprobar por fecha de creación (compatibilidad histórica)
  let docDate: Date | null = null
  if (scoreDoc.createdAt?.seconds) {
    docDate = new Date(scoreDoc.createdAt.seconds * 1000)
  } else if (scoreDoc.timestamp?.seconds) {
    docDate = new Date(scoreDoc.timestamp.seconds * 1000)
  } else if (scoreDoc.createdAt instanceof Date) {
    docDate = scoreDoc.createdAt
  }

  if (docDate) {
    return docDate >= currentSeason.startDate && docDate <= currentSeason.endDate
  }

  // Si no tiene fecha, asumimos actual para no descartar recién creados sin resolver timestamp
  return true
}

/**
 * Retorna el nombre formateado de la categoría
 */
export function getCategoryLabel(difficulty: number | string | undefined): { name: string; tag: string; pairs: number } {
  const diff = Number(difficulty) || 24
  if (diff === 40) {
    return { name: '40 Cartas', tag: 'Kehubo', pairs: 20 }
  }
  if (diff === 32) {
    return { name: '32 Cartas', tag: 'Guerrero', pairs: 16 }
  }
  return { name: '24 Cartas', tag: 'Cadete', pairs: 12 }
}
