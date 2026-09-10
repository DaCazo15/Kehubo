import { ref, computed, onMounted, onUnmounted, watch, type Ref, type CSSProperties } from 'vue'
import { useMobileBoardResponsive } from './useMobileBoardResponsive'

export interface DynamicBoardOptions {
  cardCount: Ref<number>
  headerRef: Ref<HTMLElement | any | null>
  tableroRef: Ref<HTMLElement | any | null>
}

export interface BoardDimensions {
  rowCount: number
  colCount: number
  totalSlots: number
}

export function getBoardGridDimensions(count: number, screenWidth: number): BoardDimensions {
  let rowCount = 4
  let colCount = 6

  if (count === 40) {
    if (screenWidth >= 1024) {
      rowCount = 4
      colCount = 14
    } else if (screenWidth >= 640) {
      rowCount = 5
      colCount = 8
    } else {
      rowCount = 8
      colCount = 5
    }
  } else if (count === 32) {
    if (screenWidth >= 1024) {
      rowCount = 3
      colCount = 11
    } else if (screenWidth >= 640) {
      rowCount = 4
      colCount = 8
    } else {
      rowCount = 8
      colCount = 4
    }
  } else {
    // 24 cartas
    if (screenWidth >= 1024) {
      rowCount = 3
      colCount = 11
    } else if (screenWidth >= 640) {
      rowCount = 4
      colCount = 6
    } else {
      rowCount = 6
      colCount = 4
    }
  }

  return { rowCount, colCount, totalSlots: rowCount * colCount }
}

export function useDynamicBoardHeight(options: DynamicBoardOptions) {
  const isMobile = ref<boolean>(false)
  const cardHeight = ref<number>(100)
  const cardWidth = ref<number>(75)
  const rowCount = ref<number>(4)
  const colCount = ref<number>(6)

  // Módulo especializado para gestión en pantallas móviles
  const mobileResponsive = useMobileBoardResponsive(options)

  const calculateDimensions = () => {
    if (typeof window === 'undefined') return

    const screenWidth = window.visualViewport?.width || window.innerWidth
    const screenHeight = window.visualViewport?.height || window.innerHeight

    // Si es pantalla móvil, delegar el cálculo al módulo dedicado de móvil
    if (screenWidth < 640 || (screenWidth < 1024 && screenHeight < 550)) {
      isMobile.value = true
      mobileResponsive.calculateMobileDimensions()
      cardHeight.value = mobileResponsive.cardHeight.value
      cardWidth.value = mobileResponsive.cardWidth.value
      rowCount.value = mobileResponsive.rowCount.value
      colCount.value = mobileResponsive.colCount.value
      return
    }

    isMobile.value = false
    const count = options.cardCount.value || 24

    // 1. Determinar filas y columnas según breakpoint y cartas para escritorio / tablet
    const grid = getBoardGridDimensions(count, screenWidth)
    rowCount.value = grid.rowCount
    colCount.value = grid.colCount

    // 2. Obtener altura real de los contenedores superiores
    const headerEl = options.headerRef.value?.$el || options.headerRef.value
    const tableroEl = options.tableroRef.value?.$el || options.tableroRef.value

    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 52
    const tableroHeight = tableroEl ? tableroEl.getBoundingClientRect().height : 48

    // 3. Márgenes, padding y gaps de la cuadrícula en escritorio / tablet
    const mainPaddingY = 24
    const gridPaddingY = 24
    const gapY = 8

    const totalGapsHeight = (rowCount.value - 1) * gapY
    const totalReservedHeight = headerHeight + tableroHeight + mainPaddingY + gridPaddingY + totalGapsHeight

    // 4. Altura neta disponible para dividir entre el número de filas
    const availableHeight = screenHeight - totalReservedHeight
    let computedHeight = Math.floor(availableHeight / rowCount.value)

    // 5. Verificar que el ancho de la cuadrícula resultante tampoco exceda el ancho disponible
    const mainPaddingX = 32
    const gridPaddingX = 32
    const gapX = 8
    const totalGapsWidth = (colCount.value - 1) * gapX
    const availableWidth = screenWidth - mainPaddingX - gridPaddingX - totalGapsWidth

    // Relación de aspecto de la carta 3:4 (ancho = altura * 0.75)
    let maxCardWidth = Math.floor(availableWidth / colCount.value)
    let heightFromWidthLimit = Math.floor(maxCardWidth / 0.75)

    // Tomar la altura que satisfaga ambos límites (vertical y horizontal)
    let finalHeight = Math.min(computedHeight, heightFromWidthLimit)

    // Límite mínimo de seguridad
    finalHeight = Math.max(36, finalHeight)

    cardHeight.value = finalHeight
    cardWidth.value = Math.floor(finalHeight * 0.75)
  }

  const gridStyle = computed<CSSProperties>(() => {
    if (isMobile.value) {
      return mobileResponsive.gridStyle.value
    }
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${colCount.value}, ${cardWidth.value}px)`,
      gridTemplateRows: `repeat(${rowCount.value}, ${cardHeight.value}px)`,
      gap: '8px',
      maxWidth: '100%',
      width: 'fit-content',
      margin: '0 auto'
    }
  })

  const cardStyle = computed<CSSProperties>(() => {
    if (isMobile.value) {
      return mobileResponsive.cardStyle.value
    }
    return {
      width: `${cardWidth.value}px`,
      height: `${cardHeight.value}px`
    }
  })

  onMounted(() => {
    calculateDimensions()
    window.addEventListener('resize', calculateDimensions, { passive: true })
    window.addEventListener('orientationchange', calculateDimensions, { passive: true })
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calculateDimensions, { passive: true })
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', calculateDimensions)
    window.removeEventListener('orientationchange', calculateDimensions)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', calculateDimensions)
    }
  })

  watch(
    () => options.cardCount.value,
    () => {
      setTimeout(calculateDimensions, 0)
    }
  )

  return {
    isMobile,
    cardHeight,
    cardWidth,
    rowCount,
    colCount,
    gridStyle,
    cardStyle,
    calculateDimensions
  }
}
