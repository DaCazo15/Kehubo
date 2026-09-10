import { ref, onUnmounted } from 'vue'
import { getRandomSoundTrack } from '../helpers/sounds'

export interface UseGameAudioOptions {
  initialVolume?: number
  loop?: boolean
}

export function useGameAudio(options: UseGameAudioOptions = {}) {
  const { initialVolume = 0.35, loop = true } = options

  let audioElement: HTMLAudioElement | null = null
  let isManuallyStopped = false
  const isPlaying = ref<boolean>(false)
  const isMuted = ref<boolean>(false)
  const currentTrackNumber = ref<number | null>(null)
  const volume = ref<number>(initialVolume)

  // Crear o reutilizar elemento de audio HTML5 nativo con streaming ligero
  const getAudioElement = (): HTMLAudioElement => {
    if (!audioElement && typeof Audio !== 'undefined') {
      audioElement = new Audio()
      audioElement.preload = 'metadata'
      audioElement.loop = false // Permitir que se dispare el evento 'ended' para rotar/reiniciar dinámicamente
      audioElement.volume = isMuted.value ? 0 : volume.value

      audioElement.addEventListener('playing', () => {
        isPlaying.value = true
      })
      audioElement.addEventListener('pause', () => {
        isPlaying.value = false
      })
      audioElement.addEventListener('ended', () => {
        if (loop && !isManuallyStopped) {
          // Si la partida continúa y la música se termina, se reinicia con una pista aleatoria
          playRandomTrack()
        } else {
          isPlaying.value = false
        }
      })
    }
    return audioElement!
  }

  /**
   * Selecciona una pista aleatoria entre las 4 disponibles y comienza su reproducción en streaming
   */
  const playRandomTrack = () => {
    if (typeof window === 'undefined') return

    try {
      isManuallyStopped = false
      const audio = getAudioElement()
      const { url, trackNumber } = getRandomSoundTrack()

      // Si ya estaba sonando, pausar antes de cambiar
      if (!audio.paused) {
        audio.pause()
      }

      currentTrackNumber.value = trackNumber
      audio.src = url
      audio.currentTime = 0
      audio.volume = isMuted.value ? 0 : volume.value

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay prevenido por el navegador hasta que el usuario interactúe
          console.warn('Reproducción de audio en espera de interacción:', err?.message || err)
        })
      }
    } catch (err) {
      console.warn('Error iniciando pista aleatoria:', err)
    }
  }

  /**
   * Pausa la música de fondo
   */
  const pauseAudio = () => {
    if (audioElement && !audioElement.paused) {
      audioElement.pause()
    }
  }

  /**
   * Reanuda la música de fondo
   */
  const resumeAudio = () => {
    isManuallyStopped = false
    if (audioElement && audioElement.paused && audioElement.src) {
      const playPromise = audioElement.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    }
  }

  /**
   * Detiene por completo la reproducción y resetea el tiempo
   */
  const stopAudio = () => {
    isManuallyStopped = true
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      isPlaying.value = false
    }
  }

  /**
   * Alterna el silenciado de la música
   */
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audioElement) {
      audioElement.volume = isMuted.value ? 0 : volume.value
    }
  }

  /**
   * Ajusta el volumen (de 0 a 1)
   */
  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val))
    volume.value = clamped
    if (audioElement && !isMuted.value) {
      audioElement.volume = clamped
    }
  }

  onUnmounted(() => {
    stopAudio()
    if (audioElement) {
      audioElement.src = ''
      audioElement = null
    }
  })

  return {
    isPlaying,
    isMuted,
    currentTrackNumber,
    volume,
    playRandomTrack,
    pauseAudio,
    resumeAudio,
    stopAudio,
    toggleMute,
    setVolume
  }
}
