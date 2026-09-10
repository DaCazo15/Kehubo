import { ref, computed, onMounted, onUnmounted, watch, type Ref, type CSSProperties } from 'vue'

export interface MobileBoardOptions {
  cardCount: Ref<number>
  headerRef: Ref<HTMLElement | any | null>
  tableroRef: Ref<HTMLElement | any | null>
}

export interface MobileGridConfig {
  rowCount: number
  colCount: number
  totalSlots: number
}

/**
 * Retorna la configuración óptima de cuadrícula para pantallas móviles
 * según la cantidad de cartas y si el dispositivo está en vertical u horizontal.
 * Incluye el cálculo de slots totales para rellenar con cartas dummy/obstáculo el espacio sobrante.
 */
export function getMobileGridConfig(cardCount: number, isLandscape: boolean = false): MobileGridConfig {
  let rowCount = 6
  let colCount = 4

  if (isLandscape) {
    if (cardCount === 40) {
      rowCount = 5
      colCount = 8
    } else if (cardCount === 32) {
      rowCount = 4
      colCount = 8
    } else {
      // 24 cartas
      rowCount = 4
      colCount = 6
    }
  } else {
    // Modo Portrait (Vertical - estándar en teléfonos)
    if (cardCount === 40) {
      rowCount = 8
      colCount = 5
    } else if (cardCount === 32) {
      rowCount = 8
      colCount = 4
    } else {
      // 24 cartas
      rowCount = 6
      colCount = 4
    }
  }

  return {
    rowCount,
    colCount,
    totalSlots: rowCount * colCount
  }
}

/**
 * Constantes métricas de espaciado para móviles
 */
export const MOBILE_METRICS = {
  // Padding horizontal y vertical del <main> (px-2 = 16px total, py-2 = 16px total)
  mainPaddingX: 16,
  mainPaddingY: 16,
  
  // Padding interior del contenedor grid (p-2 = 16px total)
  gridPaddingX: 16,
  gridPaddingY: 16,
  
  // Brecha entre cartas (gap-1.5 = 6px)
  gapX: 6,
  gapY: 6,

  // Proporción estándar de la carta (Ancho / Alto = 3 / 4 = 0.75)
  aspectRatio: 0.75,

  // Límites de seguridad en px
  minCardHeight: 36,
  minCardWidth: 27
}

/**
 * Composable especializado y aislado para gestionar el cálculo responsive
 * del tablero en dispositivos móviles.
 */
export function useMobileBoardResponsive(options: MobileBoardOptions) {
  const isMobile = ref<boolean>(false)
  const isLandscape = ref<boolean>(false)
  const cardHeight = ref<number>(80)
  const cardWidth = ref<number>(60)
  const rowCount = ref<number>(6)
  const colCount = ref<number>(4)

  /**
   * Obtiene la altura real medida del div del logo (Header) y del div del puntaje (Tablero)
   */
  const getReservedHeaderHeights = (): { headerHeight: number; tableroHeight: number } => {
    if (typeof window === 'undefined') {
      return { headerHeight: 52, tableroHeight: 48 }
    }

    const headerEl = options.headerRef.value?.$el || options.headerRef.value
    const tableroEl = options.tableroRef.value?.$el || options.tableroRef.value

    const headerHeight = headerEl ? (headerEl.offsetHeight || headerEl.getBoundingClientRect?.().height || 50) : 50
    const tableroHeight = tableroEl ? (tableroEl.offsetHeight || tableroEl.getBoundingClientRect?.().height || 46) : 46

    return {
      headerHeight,
      tableroHeight
    }
  }

  /**
   * Calcula las dimensiones exactas para la cuadrícula y cartas en móvil
   * Tomando el alto total de la pantalla, restando el div del logo y el div del puntaje,
   * y dividiendo el resto entre la cantidad de filas que toquen.
   */
  const calculateMobileDimensions = () => {
    if (typeof window === 'undefined') return

    // 1. Obtener dimensiones reales de pantalla / visual viewport móvil
    const viewportWidth = window.visualViewport?.width || window.innerWidth
    const viewportHeight = window.visualViewport?.height || window.innerHeight

    // Determinar si es móvil (< 640px o altura muy reducida en landscape)
    isMobile.value = viewportWidth < 640 || (viewportWidth < 1024 && viewportHeight < 550)
    isLandscape.value = viewportWidth > viewportHeight && viewportHeight < 600

    const count = options.cardCount.value || 24
    const gridConfig = getMobileGridConfig(count, isLandscape.value)

    rowCount.value = gridConfig.rowCount
    colCount.value = gridConfig.colCount

    // 2. Medir div del logo y div del puntaje
    const { headerHeight, tableroHeight } = getReservedHeaderHeights()

    // 3. Restar del alto total de pantalla el div del logo, el div del puntaje, paddings y gaps
    const totalGapsHeight = (rowCount.value - 1) * MOBILE_METRICS.gapY
    const totalReservedHeight = headerHeight + tableroHeight + MOBILE_METRICS.mainPaddingY + MOBILE_METRICS.gridPaddingY + totalGapsHeight
    const availableHeight = Math.max(0, viewportHeight - totalReservedHeight)

    // 4. Dividir el resto entre la cantidad de filas
    const computedHeight = Math.floor(availableHeight / rowCount.value)

    // 5. Restricción de ancho disponible (para mantener proporción simétrica 3:4)
    const totalGapsWidth = (colCount.value - 1) * MOBILE_METRICS.gapX
    const availableWidth = Math.max(0, viewportWidth - MOBILE_METRICS.mainPaddingX - MOBILE_METRICS.gridPaddingX - totalGapsWidth)
    const maxCardWidth = Math.floor(availableWidth / colCount.value)
    const heightFromWidthLimit = Math.floor(maxCardWidth / MOBILE_METRICS.aspectRatio)

    // 6. Tomar la altura que satisfaga la proporción sin desbordar
    let finalHeight = Math.min(computedHeight, heightFromWidthLimit)
    finalHeight = Math.max(MOBILE_METRICS.minCardHeight, finalHeight)

    cardHeight.value = finalHeight
    cardWidth.value = Math.floor(finalHeight * MOBILE_METRICS.aspectRatio)
  }

  /**
   * Estilo CSS para el contenedor del grid con columnas y filas en píxeles fijos
   */
  const gridStyle = computed<CSSProperties>(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${colCount.value}, ${cardWidth.value}px)`,
    gridTemplateRows: `repeat(${rowCount.value}, ${cardHeight.value}px)`,
    gap: `${MOBILE_METRICS.gapY}px ${MOBILE_METRICS.gapX}px`,
    width: 'fit-content',
    maxWidth: '100%',
    margin: '0 auto'
  }))

  /**
   * Estilo CSS para cada celda / carta
   */
  const cardStyle = computed<CSSProperties>(() => ({
    width: `${cardWidth.value}px`,
    height: `${cardHeight.value}px`
  }))

  onMounted(() => {
    calculateMobileDimensions()
    window.addEventListener('resize', calculateMobileDimensions, { passive: true })
    window.addEventListener('orientationchange', calculateMobileDimensions, { passive: true })
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calculateMobileDimensions, { passive: true })
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', calculateMobileDimensions)
    window.removeEventListener('orientationchange', calculateMobileDimensions)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', calculateMobileDimensions)
    }
  })

  watch(
    () => options.cardCount.value,
    () => {
      setTimeout(calculateMobileDimensions, 0)
    }
  )

  const totalSlots = computed<number>(() => rowCount.value * colCount.value)
  const dummyCount = computed<number>(() => Math.max(0, totalSlots.value - (options.cardCount.value || 24)))

  return {
    isMobile,
    isLandscape,
    cardHeight,
    cardWidth,
    rowCount,
    colCount,
    totalSlots,
    dummyCount,
    gridStyle,
    cardStyle,
    calculateMobileDimensions
  }
}
