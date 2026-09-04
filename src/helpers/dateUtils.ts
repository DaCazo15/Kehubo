/**
 * Utilidades puras para formateo de fechas y tiempos
 */

export function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return 'Reciente'
  
  let date: Date
  if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else if (timestamp instanceof Date) {
    date = timestamp
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp)
  } else {
    return 'Reciente'
  }

  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSeconds < 60) return 'Hace un momento'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 30) return `Hace ${diffDays}d`
  return date.toLocaleDateString()
}

export function formatAccountAge(creationTime: string | number | undefined | null): string {
  if (!creationTime) return 'Desconocido'
  
  const createdDate = new Date(creationTime)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return '1 día'
  if (diffDays < 30) return `${diffDays} días`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return '1 mes'
  if (diffMonths < 12) return `${diffMonths} meses`
  const diffYears = Math.floor(diffDays / 365)
  return diffYears === 1 ? '1 año' : `${diffYears} años`
}

export function formatMatchDate(dateValue: any): string {
  if (!dateValue) return '-'
  try {
    const d = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  } catch {
    return '-'
  }
}

export function formatSecondsToTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

