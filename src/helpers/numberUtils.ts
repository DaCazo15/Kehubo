/**
 * Formatea números grandes en notación compacta (K, M, B)
 * Ejemplos:
 * 1000 -> 1K
 * 1200000 -> 1.2M
 * 1255000 -> 1.2M
 * 1000000000 -> 1B
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0'
  if (num < 0) return '-' + formatCompactNumber(-num)
  if (num < 1000) return num.toString()

  const lookup = [
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' }
  ]

  for (const item of lookup) {
    if (num >= item.value) {
      const val = num / item.value
      const formatted = (Math.floor(val * 10) / 10).toFixed(1).replace(/\.0$/, '')
      return `${formatted}${item.symbol}`
    }
  }

  return num.toString()
}
