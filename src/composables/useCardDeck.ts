import { ref, computed } from 'vue'
import type { Card, CardContentType } from '../types'
import { getBoardGridDimensions } from './useDynamicBoardHeight'
import { getMobileGridConfig } from './useMobileBoardResponsive'
import { obtenerAnimalesAleatorios } from '../helpers/animales'

export const LETRAS_ALFABETO = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 
  'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'
]

export function useCardDeck(totalCartasInicial = 24, contentTypeInicial: CardContentType = 'numeros') {
  const totalCartas = ref<number>(totalCartasInicial)
  const contentType = ref<CardContentType>(contentTypeInicial)
  const totalPares = computed(() => Math.floor(totalCartas.value / 2))
  const numeros = ref<Card[]>([])

  /**
   * Genera el mazo de valores duplicados (números, letras o imágenes de animales) según la cantidad seleccionada
   * 24 cartas = 12 pares
   * 32 cartas = 16 pares
   * 40 cartas = 20 pares
   */
  const generarValoresBase = (cantidad: number, tipo: CardContentType = 'numeros'): (number | string)[] => {
    const paresCount = Math.floor(cantidad / 2)
    const base: (number | string)[] = []

    if (tipo === 'letras') {
      const letras = LETRAS_ALFABETO.slice(0, paresCount)
      for (const letra of letras) {
        base.push(letra, letra)
      }
    } else if (tipo === 'imagenes') {
      const animales = obtenerAnimalesAleatorios(paresCount)
      for (const img of animales) {
        base.push(img, img)
      }
    } else {
      for (let i = 1; i <= paresCount; i++) {
        base.push(i, i)
      }
    }
    return base
  }

  /**
   * Inicializa el array de cartas incluyendo cartas de relleno (dummy) si la cuadrícula lo requiere.
   * @param cantidad - Total de cartas reales (24, 32, 40)
   * @param cartasVisibles - Si las cartas nacen reveladas o no
   * @param tipo - 'numeros' o 'letras'
   */
  const inicializarCartas = (
    cantidad = totalCartas.value, 
    cartasVisibles = false, 
    tipo: CardContentType = contentType.value
  ) => {
    totalCartas.value = cantidad
    contentType.value = tipo
    const base = generarValoresBase(cantidad, tipo)

    const screenWidth = typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 1024
    const screenHeight = typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 800
    const isMobile = screenWidth < 640 || (screenWidth < 1024 && screenHeight < 550)
    const isLandscape = screenWidth > screenHeight && screenHeight < 600

    let totalSlots = cantidad
    if (isMobile) {
      const mobileConfig = getMobileGridConfig(cantidad, isLandscape)
      totalSlots = mobileConfig.totalSlots
    } else {
      const { totalSlots: desktopSlots } = getBoardGridDimensions(cantidad, screenWidth)
      totalSlots = desktopSlots
    }

    const dummyCount = Math.max(0, totalSlots - cantidad)
    
    const realCards: Card[] = base.map((valor, index) => ({
      id: index + 1,
      valor,
      revelada: cartasVisibles,
      encontrada: false,
      isDummy: false
    }))

    const dummyCards: Card[] = Array.from({ length: dummyCount }, (_, index) => ({
      id: 1000 + index + 1,
      valor: null,
      revelada: false,
      encontrada: false,
      isDummy: true
    }))

    numeros.value = [...realCards, ...dummyCards]
  }

  /**
   * Algoritmo Fisher-Yates para barajar aleatoriamente cartas reales y dummies
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
   * Oculta todas las cartas que aún no hayan sido encontradas (ignora dummies)
   */
  const ocultarCartasNoEncontradas = () => {
    numeros.value.forEach((carta) => {
      if (!carta.encontrada && !carta.isDummy) {
        carta.revelada = false
      }
    })
  }

  /**
   * Revela temporalmente todas las cartas reales
   */
  const revelarTodasLasCartas = () => {
    numeros.value.forEach((carta) => {
      if (!carta.isDummy) {
        carta.revelada = true
      }
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
