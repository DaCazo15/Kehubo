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
  let colCount = 5

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
    // Modo Portrait (Vertical - estándar en teléfonos con relleno simétrico)
    if (cardCount === 40) {
      rowCount = 8
      colCount = 7
    } else if (cardCount === 32) {
      rowCount = 8
      colCount = 6
    } else {
      // 24 cartas
      rowCount = 6
      colCount = 5
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
   * Obtiene la altura real medida de los elementos superiores (Header y Tablero)
   */
  const getReservedHeaderHeights = (): { headerHeight: number; tableroHeight: number } => {
    if (typeof window === 'undefined') {
      return { headerHeight: 52, tableroHeight: 48 }
    }

    const headerEl = options.headerRef.value?.$el || options.headerRef.value
    const tableroEl = options.tableroRef.value?.$el || options.tableroRef.value

    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 50
    const tableroHeight = tableroEl ? tableroEl.getBoundingClientRect().height : 46

    return {
      headerHeight: Math.max(headerHeight, 44),
      tableroHeight: Math.max(tableroHeight, 40)
    }
  }

  /**
   * Calcula las dimensiones exactas pixel-perfect para la cuadrícula y cartas en móvil
   */
  const calculateMobileDimensions = () => {
    if (typeof window === 'undefined') return

    // Obtener dimensiones reales del viewport móvil (soporta barra de navegación dinámica)
    const viewportWidth = window.visualViewport?.width || window.innerWidth
    const viewportHeight = window.visualViewport?.height || window.innerHeight

    // Determinar si es móvil (< 640px o altura muy reducida en landscape)
    isMobile.value = viewportWidth < 640 || (viewportWidth < 1024 && viewportHeight < 550)
    isLandscape.value = viewportWidth > viewportHeight && viewportHeight < 600

    const count = options.cardCount.value || 24
    const gridConfig = getMobileGridConfig(count, isLandscape.value)

    rowCount.value = gridConfig.rowCount
    colCount.value = gridConfig.colCount

    const { headerHeight, tableroHeight } = getReservedHeaderHeights()

    // 1. Cálculo de espacio disponible horizontal
    const totalGapsWidth = (colCount.value - 1) * MOBILE_METRICS.gapX
    const availableWidth = viewportWidth - MOBILE_METRICS.mainPaddingX - MOBILE_METRICS.gridPaddingX - totalGapsWidth

    // 2. Cálculo de espacio disponible vertical
    const totalGapsHeight = (rowCount.value - 1) * MOBILE_METRICS.gapY
    const totalReservedHeight = headerHeight + tableroHeight + MOBILE_METRICS.mainPaddingY + MOBILE_METRICS.gridPaddingY + totalGapsHeight
    const availableHeight = viewportHeight - totalReservedHeight

    // 3. Altura calculada por restricción vertical
    const computedHeight = Math.floor(availableHeight / rowCount.value)

    // 4. Altura máxima calculada por restricción horizontal (proporción 3:4 -> alto = ancho / 0.75)
    const maxCardWidth = Math.floor(availableWidth / colCount.value)
    const heightFromWidthLimit = Math.floor(maxCardWidth / MOBILE_METRICS.aspectRatio)

    // 5. Tomar la menor altura para asegurar que quepa 100% tanto en vertical como en horizontal
    let finalHeight = Math.min(computedHeight, heightFromWidthLimit)

    // Aplicar límites mínimos de seguridad
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
