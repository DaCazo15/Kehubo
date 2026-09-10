/**
 * Helper para gestión de imágenes y nombres de animales en el juego Kehubo
 */

// Cargar todas las imágenes de animales dinámicamente usando import.meta.glob
const animalModules = import.meta.glob<{ default: string }>(
  '../assets/animales/*.avif',
  { eager: true }
)

const urlToNameMap = new Map<string, string>()

export const ANIMALES_IMAGENES: string[] = Object.entries(animalModules).map(([path, mod]) => {
  const fileName = path.split('/').pop()?.replace(/\.avif$/i, '') || ''
  const resolvedUrl = mod.default || (mod as unknown as string)
  if (resolvedUrl && fileName) {
    urlToNameMap.set(resolvedUrl, fileName)
  }
  return resolvedUrl
})

export const ICO_ANIMALES = new URL('../assets/animales/ico/ico.avif', import.meta.url).href

/**
 * Obtiene el nombre del animal a partir de la URL de su imagen (removiendo .png y hash)
 */
export function obtenerNombreAnimal(valor: string | number | null): string {
  if (typeof valor !== 'string') return ''
  
  if (urlToNameMap.has(valor)) {
    return urlToNameMap.get(valor)!
  }

  // Fallback si la URL viene alterada o es un path directo
  const rawFile = valor.split('/').pop()?.split('?')[0]?.replace(/\.[^/.]+$/, '') || ''
  // Si contiene un hash generado por Vite tipo 'águila-CJ0nURld', extraer solo el nombre
  const cleaned = rawFile.replace(/-[A-Za-z0-9_-]{8}$/, '')
  return decodeURIComponent(cleaned || rawFile)
}

/**
 * Obtiene una lista aleatoria de animales para formar los pares
 * @param cantidadPares - Número de pares requeridos (12, 16 o 20)
 */
export function obtenerAnimalesAleatorios(cantidadPares: number): string[] {
  const pool = [...ANIMALES_IMAGENES]
  
  // Barajar pool con Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  
  return pool.slice(0, cantidadPares)
}
