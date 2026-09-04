export interface CompressionResult {
  file: File | Blob
  isAvif: boolean
}

/**
 * Envía la imagen al backend en Node.js para convertirla y comprimirla a formato AVIF
 */
export async function compressImageToAvif(file: File): Promise<CompressionResult> {
  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const backendUrl = import.meta.env.VITE_COMPRESSION_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')
    const response = await fetch(`${backendUrl}/api/compress-avatar`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`El servidor de compresión respondió con código ${response.status}`)
    }

    const avifBlob = await response.blob()
    const avifFile = new File([avifBlob], `avatar_${Date.now()}.avif`, { type: 'image/avif' })

    console.log(`✅ Imagen convertida y optimizada a AVIF: ${(file.size / 1024).toFixed(1)} KB ➔ ${(avifFile.size / 1024).toFixed(1)} KB`)
    return { file: avifFile, isAvif: true }
  } catch (error: any) {
    console.warn('⚠️ No se pudo conectar con el backend de compresión AVIF (usando archivo original como fallback):', error?.message || error)
    return { file, isAvif: false }
  }
}
