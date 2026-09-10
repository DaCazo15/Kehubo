/**
 * Catálogo de pistas de audio para música de fondo durante las partidas.
 * Servidas directamente desde los assets optimizados para streaming web nativo.
 */
export const GAME_SOUND_TRACKS = [
  new URL('../assets/sounds/1.mp3', import.meta.url).href,
  new URL('../assets/sounds/2.mp3', import.meta.url).href,
  new URL('../assets/sounds/3.mp3', import.meta.url).href,
  new URL('../assets/sounds/4.mp3', import.meta.url).href
]

/**
 * Retorna una pista aleatoria entre las 4 disponibles.
 */
export function getRandomSoundTrack(): { url: string; trackNumber: number } {
  const index = Math.floor(Math.random() * GAME_SOUND_TRACKS.length)
  return {
    url: GAME_SOUND_TRACKS[index],
    trackNumber: index + 1
  }
}
